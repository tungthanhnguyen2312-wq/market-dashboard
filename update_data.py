from __future__ import annotations

import datetime as dt
import html
import json
import os
import re
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import feedparser
import requests
import yfinance as yf

ROOT = Path(__file__).resolve().parent
OUTPUT_PATH = ROOT / "data.json"
TZ = dt.timezone(dt.timedelta(hours=7))

WAR_FEEDS = [
    ("Google News War", "https://news.google.com/rss/search?q=Iran%20OR%20Israel%20OR%20Middle%20East%20when%3A7d&hl=en-US&gl=US&ceid=US:en"),
    ("Al Jazeera", "https://www.aljazeera.com/xml/rss/all.xml"),
]

VN_FEEDS = [
    ("VnExpress Kinh doanh", "https://vnexpress.net/rss/kinh-doanh.rss"),
    ("VnExpress Thời sự", "https://vnexpress.net/rss/thoi-su.rss"),
]

WAR_KEYWORDS = [
    "iran", "israel", "gaza", "middle east", "tehran", "tel aviv", "lebanon",
    "hezbollah", "syria", "yemen", "houthis", "hamas", "red sea"
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

TRANSLATE_EMAIL = os.getenv("TRANSLATE_EMAIL", "").strip()
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; FinanceDashboardBot/1.0; +https://github.com/)"
}


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
        translated = (
            data.get("responseData", {}).get("translatedText", "").strip()
            if isinstance(data, dict)
            else ""
        )
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


def fetch_war_news(limit: int = 2) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    seen = set()

    for source, url in WAR_FEEDS:
        feed = feedparser.parse(url)
        for entry in getattr(feed, "entries", [])[:18]:
            title = strip_html(getattr(entry, "title", ""))
            summary = strip_html(getattr(entry, "summary", ""))[:220]
            link = getattr(entry, "link", "")
            blob = f"{title} {summary}".lower()
            if not title or link in seen:
                continue
            if not any(k in blob for k in WAR_KEYWORDS):
                continue

            when = parse_entry_time(entry)
            items.append(
                {
                    "source": source,
                    "title": title,
                    "title_vi": translate_to_vi(title),
                    "summary": summary,
                    "summary_vi": translate_to_vi(summary) if summary else "",
                    "url": link,
                    "published_iso": when.isoformat(),
                    "published_text": short_time(when),
                }
            )
            seen.add(link)

    items.sort(key=lambda x: x["published_iso"], reverse=True)
    return items[:limit]


def fetch_vn_news(limit: int = 4) -> List[Dict[str, Any]]:
    items: List[Dict[str, Any]] = []
    seen = set()

    for source, url in VN_FEEDS:
        feed = feedparser.parse(url)
        for entry in getattr(feed, "entries", [])[:10]:
            title = strip_html(getattr(entry, "title", ""))
            summary = strip_html(getattr(entry, "summary", ""))[:220]
            link = getattr(entry, "link", "")
            if not title or link in seen:
                continue
            when = parse_entry_time(entry)
            items.append(
                {
                    "source": source,
                    "title": title,
                    "title_vi": title,
                    "summary": summary,
                    "summary_vi": summary,
                    "url": link,
                    "published_iso": when.isoformat(),
                    "published_text": short_time(when),
                }
            )
            seen.add(link)

    items.sort(key=lambda x: x["published_iso"], reverse=True)
    return items[:limit]


def _scalar_from_value(value: Any) -> Optional[float]:
    if value is None:
        return None

    # pandas scalar / numpy scalar / Series / one-cell DataFrame
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
        # fallback thử lấy từ info/fast_info
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
    if hasattr(latest_index, "to_pydatetime"):
        latest_dt = latest_index.to_pydatetime()
    else:
        latest_dt = dt.datetime.now(dt.timezone.utc)

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
        "updated_at_display": now.strftime("%d/%m/%Y %H:%M GMT+7"),
        "war_news": fetch_war_news(limit=2),
        "vn_news": fetch_vn_news(limit=4),
        "markets": fetch_markets(),
    }


def main() -> None:
    payload = build_payload()
    OUTPUT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Updated {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
