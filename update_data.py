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
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; MarketDashboard/3.0; +https://github.com/)"}
TRANSLATE_EMAIL = os.getenv("TRANSLATE_EMAIL", "").strip()
ENABLE_TRANSLATION = os.getenv("ENABLE_TRANSLATION", "1").strip() != "0"

WAR_FEEDS = [
    ("Google News War", "https://news.google.com/rss/search?q=Iran%20OR%20Israel%20OR%20Middle%20East%20OR%20Hormuz%20when%3A7d&hl=en-US&gl=US&ceid=US:en"),
    ("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"),
]

GLOBAL_FEEDS = [
    ("Google News Macro", "https://news.google.com/rss/search?q=(Fed%20OR%20inflation%20OR%20tariffs%20OR%20oil%20OR%20treasury%20OR%20dollar%20OR%20China)%20when%3A7d&hl=en-US&gl=US&ceid=US:en"),
    ("Investing News", "https://www.investing.com/rss/news.rss"),
]

VN_RSS_FEEDS = [
    ("VnExpress Kinh doanh", "https://vnexpress.net/rss/kinh-doanh.rss"),
    ("VnExpress Thời sự", "https://vnexpress.net/rss/thoi-su.rss"),
    ("Vietstock News", "https://vietstock.vn/rss/tai-chinh.rss"),
    ("VnBusiness Tài chính", "https://vnbusiness.vn/rss/tai-chinh.rss"),
    ("VnBusiness Chứng khoán", "https://vnbusiness.vn/rss/chung-khoan.rss"),
]

VN_HTML_SOURCES = [
    ("CafeF", "https://cafef.vn/"),
    ("VietnamFinance", "https://vietnamfinance.vn/"),
    ("Thời báo Tài chính VN", "https://thoibaotaichinhvietnam.vn/"),
]

WAR_KEYWORDS = ["iran", "israel", "gaza", "middle east", "tehran", "tel aviv", "hezbollah", "yemen", "red sea", "hormuz"]
GLOBAL_KEYWORDS = ["fed", "treasury", "yield", "oil", "brent", "wti", "gold", "dollar", "tariff", "inflation", "china", "economy", "macro"]

MARKET_CONFIGS: List[Dict[str, Any]] = [
    {"name": "WTI", "symbol": "CL=F", "decimals": 2, "category": "Energy"},
    {"name": "Brent", "symbol": "BZ=F", "decimals": 2, "category": "Energy"},
    {"name": "Natural Gas", "symbol": "NG=F", "decimals": 2, "category": "Energy"},
    {"name": "Gold", "symbol": "GC=F", "decimals": 2, "category": "Metals"},
    {"name": "Silver", "symbol": "SI=F", "decimals": 2, "category": "Metals"},
    {"name": "Copper", "symbol": "HG=F", "decimals": 2, "category": "Metals"},
    {"name": "US 10Y", "symbol": "^TNX", "decimals": 2, "category": "Rates", "transform": "tnx_pct", "suffix": "%"},
    {"name": "DXY", "symbol": "DX-Y.NYB", "decimals": 2, "category": "FX"},
    {"name": "EUR/USD", "symbol": "EURUSD=X", "decimals": 4, "category": "FX"},
    {"name": "BTC/USD", "symbol": "BTC-USD", "decimals": 0, "category": "Crypto"},
    {"name": "S&P 500", "symbol": "^GSPC", "decimals": 2, "category": "US"},
    {"name": "Dow Jones", "symbol": "^DJI", "decimals": 2, "category": "US"},
    {"name": "Nasdaq", "symbol": "^IXIC", "decimals": 2, "category": "US"},
    {"name": "Russell 2000", "symbol": "^RUT", "decimals": 2, "category": "US"},
    {"name": "VIX", "symbol": "^VIX", "decimals": 2, "category": "US"},
    {"name": "FTSE 100", "symbol": "^FTSE", "decimals": 2, "category": "Europe"},
    {"name": "Euro Stoxx 50", "symbol": "^STOXX50E", "decimals": 2, "category": "Europe"},
    {"name": "VN-Index", "symbol": "^VNINDEX.VN", "decimals": 2, "category": "Vietnam"},
    {"name": "Hang Seng", "symbol": "^HSI", "decimals": 2, "category": "Asia"},
    {"name": "Nikkei 225", "symbol": "^N225", "decimals": 2, "category": "Asia"},
    {"name": "KOSPI", "symbol": "^KS11", "decimals": 2, "category": "Asia"},
    {"name": "Shanghai Composite", "symbol": "000001.SS", "decimals": 2, "category": "Asia"},
    {"name": "Shenzhen Component", "symbol": "399001.SZ", "decimals": 2, "category": "Asia"},
    {"name": "Nifty 50", "symbol": "^NSEI", "decimals": 2, "category": "Asia"},
    {"name": "ASX 200", "symbol": "^AXJO", "decimals": 2, "category": "Asia"},
]


def strip_html(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def safe_request(url: str, params: Optional[Dict[str, Any]] = None) -> Optional[requests.Response]:
    try:
        resp = requests.get(url, params=params, headers=HEADERS, timeout=20)
        resp.raise_for_status()
        return resp
    except Exception:
        return None


def translate_to_vi(text: str) -> str:
    text = text.strip()
    if not text or not ENABLE_TRANSLATION:
        return text
    params = {"q": text[:240], "langpair": "en|vi"}
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


def fetch_html_news(source: str, url: str, limit: int = 3) -> List[Dict[str, Any]]:
    resp = safe_request(url)
    if not resp:
        return []
    soup = BeautifulSoup(resp.text, "html.parser")
    selectors = ["article h3 a", "article h2 a", "h3 a", "h2 a", ".title a", ".news-title a", ".story a", ".post-title a"]
    seen, items = set(), []
    for selector in selectors:
        for a in soup.select(selector):
            text = strip_html(a.get_text(" ", strip=True))
            href = (a.get("href") or "").strip()
            if not text or len(text) < 26:
                continue
            href = urljoin(url, href)
            if href in seen or href == url:
                continue
            items.append({
                "source": source,
                "title": text,
                "title_vi": text,
                "summary": "",
                "summary_vi": "",
                "url": href,
                "published_iso": dt.datetime.now(TZ).isoformat(),
                "published_text": short_time(dt.datetime.now(TZ)),
            })
            seen.add(href)
            if len(items) >= limit:
                return items
    return items


def dedupe_articles(items: List[Dict[str, Any]], limit: int) -> List[Dict[str, Any]]:
    items.sort(key=lambda x: x.get("published_iso", ""), reverse=True)
    seen, out = set(), []
    for item in items:
        key = (item.get("title", "")[:120].lower(), item.get("url", ""))
        if key in seen:
            continue
        seen.add(key)
        out.append(item)
        if len(out) >= limit:
            break
    return out


def fetch_war_news(limit: int = 2) -> List[Dict[str, Any]]:
    items = []
    for item in fetch_rss_news(WAR_FEEDS, limit_scan=20):
        blob = f"{item['title']} {item['summary']}".lower()
        if any(k in blob for k in WAR_KEYWORDS):
            item["title_vi"] = translate_to_vi(item["title"])
            items.append(item)
    return dedupe_articles(items, limit)


def fetch_global_news(limit: int = 4) -> List[Dict[str, Any]]:
    items = []
    for item in fetch_rss_news(GLOBAL_FEEDS, limit_scan=26):
        blob = f"{item['title']} {item['summary']}".lower()
        if any(k in blob for k in GLOBAL_KEYWORDS):
            item["title_vi"] = translate_to_vi(item["title"])
            items.append(item)
    return dedupe_articles(items, limit)


def fetch_vn_news(limit: int = 6) -> List[Dict[str, Any]]:
    items = fetch_rss_news(VN_RSS_FEEDS, limit_scan=12)
    for source, url in VN_HTML_SOURCES:
        items.extend(fetch_html_news(source, url, limit=2))
    return dedupe_articles(items, limit)


def _scalar(value: Any) -> Optional[float]:
    if value is None:
        return None
    if hasattr(value, "item"):
        try:
            value = value.item()
        except Exception:
            pass
    try:
        return float(value)
    except Exception:
        return None


def load_previous_payload() -> Dict[str, Any]:
    if not OUTPUT_PATH.exists():
        return {}
    try:
        return json.loads(OUTPUT_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {}


def market_from_previous(previous: Dict[str, Any], symbol: str) -> Optional[Dict[str, Any]]:
    for item in previous.get("markets", []):
        if item.get("symbol") == symbol:
            stale = dict(item)
            stale["note"] = f"Dữ liệu cũ giữ lại • {item.get('note', 'snapshot trước')}"
            return stale
    return None


def transform_value(value: float, mode: Optional[str]) -> float:
    if mode == "tnx_pct":
        return value / 10.0
    return value


def fetch_market(cfg: Dict[str, Any], previous: Dict[str, Any]) -> Dict[str, Any]:
    symbol = cfg["symbol"]
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="10d", interval="1d", auto_adjust=False, actions=False)
        if hist is None or getattr(hist, "empty", True):
            raise ValueError("không có dữ liệu lịch sử")
        closes = hist.get("Close")
        if closes is None or getattr(closes, "empty", True):
            raise ValueError("không có cột Close")
        last_close = _scalar(closes.iloc[-1])
        prev_close = _scalar(closes.iloc[-2] if len(closes) >= 2 else closes.iloc[-1])
        if last_close is None:
            raise ValueError("không xác định được giá gần nhất")
        if prev_close in (None, 0):
            prev_close = last_close
        last_close = transform_value(last_close, cfg.get("transform"))
        prev_close = transform_value(prev_close, cfg.get("transform"))
        change = last_close - prev_close
        change_pct = (change / prev_close) * 100 if prev_close else 0.0
        latest_index = hist.index[-1]
        latest_dt = latest_index.to_pydatetime() if hasattr(latest_index, "to_pydatetime") else dt.datetime.now(dt.timezone.utc)
        if latest_dt.tzinfo is None:
            latest_dt = latest_dt.replace(tzinfo=dt.timezone.utc)
        return {
            "name": cfg["name"],
            "symbol": symbol,
            "category": cfg.get("category", "Market"),
            "price": round(last_close, cfg.get("decimals", 2)),
            "change": round(change, cfg.get("decimals", 2)),
            "change_pct": round(change_pct, 2),
            "decimals": cfg.get("decimals", 2),
            "suffix": cfg.get("suffix", ""),
            "note": f"Dữ liệu gần nhất: {latest_dt.astimezone(TZ).strftime('%d/%m %H:%M')}",
        }
    except Exception as exc:
        stale = market_from_previous(previous, symbol)
        if stale:
            return stale
        return {
            "name": cfg["name"],
            "symbol": symbol,
            "category": cfg.get("category", "Market"),
            "price": None,
            "change": 0,
            "change_pct": 0,
            "decimals": cfg.get("decimals", 2),
            "suffix": cfg.get("suffix", ""),
            "note": f"Lỗi dữ liệu: {exc}",
        }


def fetch_markets(previous: Dict[str, Any]) -> List[Dict[str, Any]]:
    return [fetch_market(cfg, previous) for cfg in MARKET_CONFIGS]


def build_payload() -> Dict[str, Any]:
    previous = load_previous_payload()
    now = dt.datetime.now(TZ)
    war_news = fetch_war_news(limit=2) or previous.get("war_news", [])
    global_news = fetch_global_news(limit=4) or previous.get("global_news", [])
    vn_news = fetch_vn_news(limit=6) or previous.get("vn_news", [])
    markets = fetch_markets(previous)
    return {
        "updated_at": now.isoformat(),
        "updated_at_display": now.strftime("%d/%m/%Y • %H:%M GMT+7"),
        "war_news": war_news,
        "global_news": global_news,
        "vn_news": vn_news,
        "markets": markets,
    }


def main() -> None:
    payload = build_payload()
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Updated {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
