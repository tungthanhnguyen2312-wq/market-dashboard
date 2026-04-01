from __future__ import annotations

import datetime as dt
import html
import json
import os
import re
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin

import feedparser
import requests
import yfinance as yf
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent
OUTPUT_PATH = ROOT / "data.json"
TZ = dt.timezone(dt.timedelta(hours=7))
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; MarketDashboard/2.0; +https://github.com/)"
}
TRANSLATE_EMAIL = os.getenv("TRANSLATE_EMAIL", "").strip()

WAR_FEEDS = [
    ("Google News War", "https://news.google.com/rss/search?q=Iran%20OR%20Israel%20OR%20Middle%20East%20when%3A7d&hl=en-US&gl=US&ceid=US:en"),
    ("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"),
]

GLOBAL_FEEDS = [
    ("Google News Global Macro", "https://news.google.com/rss/search?q=(Fed%20OR%20inflation%20OR%20tariffs%20OR%20oil%20OR%20treasury%20OR%20dollar)%20when%3A7d&hl=en-US&gl=US&ceid=US:en"),
]

VN_RSS_FEEDS = [
    ("VnExpress Kinh doanh", "https://vnexpress.net/rss/kinh-doanh.rss"),
    ("VnExpress Thời sự", "https://vnexpress.net/rss/thoi-su.rss"),
    ("VnBusiness Tài chính", "https://vnbusiness.vn/rss/tai-chinh.rss"),
    ("VnBusiness Chứng khoán", "https://vnbusiness.vn/rss/chung-khoan.rss"),
]

VN_HTML_SOURCES = [
    ("CafeF", "https://cafef.vn/"),
    ("VietnamFinance", "https://vietnamfinance.vn/"),
    ("Thời báo Tài chính VN", "https://thoibaotaichinhvietnam.vn/"),
]

WAR_KEYWORDS = [
    "iran", "israel", "gaza", "middle east", "tehran", "tel aviv", "lebanon",
    "hezbollah", "syria", "yemen", "houthis", "hamas", "red sea", "strait of hormuz"
]

GLOBAL_KEYWORDS = [
    "fed", "federal reserve", "inflation", "treasury", "tariff", "oil", "brent",
    "wti", "gold", "dollar", "yield", "recession", "economy", "macro", "commodities"
]

MARKET_SYMBOLS = [
    ("WTI", "CL=F", 2),
    ("Brent", "BZ=F", 2),
    ("Gold", "GC=F", 2),
    ("US 10Y", "^TNX", 2),
    ("S&P 500", "^GSPC", 2),
    ("Dow Jones", "^DJI", 2),
    ("Nasdaq", "^IXIC", 2),
    ("VN-Index", "^VNINDEX.VN", 2),
    ("Hang Seng", "^HSI", 2),
    ("Nikkei", "^N225", 2),
    ("KOSPI", "^KS11", 2),
]


def strip_html(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def safe_request(url: str, params: Optional[Dict[str, Any]] = None) -> Optional[requests.Response]:
    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return resp
    except Exception:
        return None


def translate_to_vi(text: str) -> str:
    text = text.strip()
    if not text:
        return text
    if len(text) > 250:
        text = text[:250]
    params = {"q": text, "langpair": "en|vi"}
    if TRANSLATE_EMAIL:
        params["de"] = TRANSLATE_EMAIL
    resp = safe_request("https://api.mymemory.translated.net/get", params=params)
    if not resp:
        return text
    try:
        data = resp.json()
        translated = data.get("responseData", {}).get("translatedText", "").strip()
        return translated or text
    except Exception:
        return text


def parse_entry_time(entry: Any) -> dt.datetime:
    for key in ("published_parsed", "updated_parsed"):
        value = getattr(entry, key, None)
        if value:
            try:
                return dt.datetime(*value[:6], tzinfo=dt.timezone.utc).astimezone(TZ)
            except Exception:
                pass
    for key in ("published", "updated"):
        raw = getattr(entry, key, None)
        if raw:
            try:
                return parsedate_to_datetime(raw).astimezone(TZ)
            except Exception:
                pass
    return dt.datetime.now(TZ)


def short_time(d: dt.datetime) -> str:
    return d.strftime("%d/%m %H:%M")


def article_from_entry(source: str, entry: Any) -> Optional[Dict[str, Any]]:
    title = strip_html(getattr(entry, "title", ""))
    summary = strip_html(getattr(entry, "summary", ""))[:220]
    link = getattr(entry, "link", "")
    if not title or not link:
        return None
    when = parse_entry_time(entry)
    return {
        "source": source,
        "title": title,
        "title_vi": title,
        "summary": summary,
        "summary_vi": summary,
        "url": link,
        "published_iso": when.isoformat(),
        "published_text": short_time(when),
    }


def fetch_rss_news(feeds: List[tuple[str, str]], limit_scan: int = 20) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    seen = set()
    for source, url in feeds:
        feed = feedparser.parse(url)
        for entry in getattr(feed, "entries", [])[:limit_scan]:
            article = article_from_entry(source, entry)
            if not article or article["url"] in seen:
                continue
            items.append(article)
            seen.add(article["url"])
    return items


def fetch_html_news(source: str, url: str, limit: int = 4) -> List[Dict[str, Any]]:
    resp = safe_request(url)
    if not resp:
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    selectors = [
        "article h3 a", "article h2 a", "article h1 a",
        "h3 a", "h2 a", ".title a", ".news-title a", ".story a", ".post-title a",
    ]

    seen = set()
    items: List[Dict[str, Any]] = []
    for selector in selectors:
        for a in soup.select(selector):
            text = strip_html(a.get_text(" ", strip=True))
            href = (a.get("href") or "").strip()
            if not text or len(text) < 24:
                continue
            href = urljoin(url, href)
            if href in seen or href == url:
                continue
            items.append(
                {
                    "source": source,
                    "title": text,
                    "title_vi": text,
                    "summary": "",
                    "summary_vi": "",
                    "url": href,
                    "published_iso": dt.datetime.now(TZ).isoformat(),
                    "published_text": short_time(dt.datetime.now(TZ)),
                }
            )
            seen.add(href)
            if len(items) >= limit:
                return items
    return items


def fetch_war_news(limit: int = 2) -> List[Dict[str, Any]]:
    items = []
    for item in fetch_rss_news(WAR_FEEDS, limit_scan=18):
        blob = f"{item['title']} {item['summary']}".lower()
        if any(k in blob for k in WAR_KEYWORDS):
            item["title_vi"] = translate_to_vi(item["title"])
            if item["summary"]:
                item["summary_vi"] = translate_to_vi(item["summary"])
            items.append(item)
    items.sort(key=lambda x: x["published_iso"], reverse=True)
    dedup = []
    seen = set()
    for item in items:
        if item["url"] in seen:
            continue
        dedup.append(item)
        seen.add(item["url"])
        if len(dedup) >= limit:
            break
    return dedup


def fetch_global_news(limit: int = 4) -> List[Dict[str, Any]]:
    items = []
    for item in fetch_rss_news(GLOBAL_FEEDS, limit_scan=24):
        blob = f"{item['title']} {item['summary']}".lower()
        if any(k in blob for k in GLOBAL_KEYWORDS):
            item["title_vi"] = translate_to_vi(item["title"])
            if item["summary"]:
                item["summary_vi"] = translate_to_vi(item["summary"])
            items.append(item)
    items.sort(key=lambda x: x["published_iso"], reverse=True)
    return items[:limit]


def fetch_vn_news(limit: int = 5) -> List[Dict[str, Any]]:
    items = fetch_rss_news(VN_RSS_FEEDS, limit_scan=12)
    for source, url in VN_HTML_SOURCES:
        items.extend(fetch_html_news(source, url, limit=2))

    items.sort(key=lambda x: x["published_iso"], reverse=True)
    dedup = []
    seen_title = set()
    for item in items:
        key = item["title"].lower()
        if key in seen_title:
            continue
        dedup.append(item)
        seen_title.add(key)
        if len(dedup) >= limit:
            break
    return dedup


def _scalar_from_value(value: Any) -> Optional[float]:
    if value is None:
        return None
    if hasattr(value, "iloc"):
        try:
            if getattr(value, "empty", False):
                return None
            if getattr(value, "ndim", None) == 1:
                value = value.iloc[-1]
            elif getattr(value, "ndim", None) == 2:
                value = value.iloc[-1, -1]
        except Exception:
            pass
    if hasattr(value, "item"):
        try:
            value = value.item()
        except Exception:
            pass
    try:
        return float(value)
    except Exception:
        return None


def fetch_market(symbol: str, name: str, decimals: int = 2) -> Dict[str, Any]:
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period="7d", interval="1d", auto_adjust=False, actions=False)
    if hist is None or getattr(hist, "empty", True):
        raise ValueError("Không có dữ liệu lịch sử")

    closes = hist.get("Close")
    if closes is None or getattr(closes, "empty", True):
        raise ValueError("Không có cột Close")

    last_close = _scalar_from_value(closes)
    prev_close = _scalar_from_value(closes.iloc[-2] if len(closes) >= 2 else None)

    if last_close is None:
        fi = getattr(ticker, "fast_info", {}) or {}
        last_close = _scalar_from_value(fi.get("lastPrice") or fi.get("last_price") or fi.get("regularMarketPrice"))
        prev_close = prev_close or _scalar_from_value(fi.get("previousClose") or fi.get("previous_close"))

    if last_close is None:
        raise ValueError("Không xác định được giá gần nhất")
    if prev_close in (None, 0):
        prev_close = last_close

    change = last_close - prev_close
    change_pct = (change / prev_close) * 100 if prev_close else 0.0
    latest_index = hist.index[-1]
    latest_dt = latest_index.to_pydatetime() if hasattr(latest_index, "to_pydatetime") else dt.datetime.now(dt.timezone.utc)
    if latest_dt.tzinfo is None:
        latest_dt = latest_dt.replace(tzinfo=dt.timezone.utc)

    return {
        "name": name,
        "symbol": symbol,
        "price": round(last_close, decimals),
        "change": round(change, decimals),
        "change_pct": round(change_pct, 2),
        "decimals": decimals,
        "note": f"Dữ liệu gần nhất: {latest_dt.astimezone(TZ).strftime('%d/%m %H:%M')}",
    }


def fetch_markets() -> List[Dict[str, Any]]:
    markets = []
    for name, symbol, decimals in MARKET_SYMBOLS:
        try:
            markets.append(fetch_market(symbol, name, decimals))
        except Exception as exc:
            markets.append(
                {
                    "name": name,
                    "symbol": symbol,
                    "price": None,
                    "change": 0,
                    "change_pct": 0,
                    "decimals": decimals,
                    "note": f"Lỗi dữ liệu: {exc}",
                }
            )
    return markets


def build_payload() -> Dict[str, Any]:
    now = dt.datetime.now(TZ)
    return {
        "updated_at": now.isoformat(),
        "updated_at_display": now.strftime("%d/%m/%Y • %H:%M GMT+7"),
        "war_news": fetch_war_news(limit=2),
        "global_news": fetch_global_news(limit=4),
        "vn_news": fetch_vn_news(limit=5),
        "markets": fetch_markets(),
    }


def main() -> None:
    payload = build_payload()
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Updated {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
