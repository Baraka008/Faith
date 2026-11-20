from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import sys

ROOT = Path(__file__).resolve().parents[1]
ENTRY = ROOT / "index.html"

class AssetParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.assets = []
    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        for attr in ("src", "href", "poster"):
            value = values.get(attr, "")
            if value:
                self.assets.append(value)

if not ENTRY.is_file():
    raise SystemExit("index.html is missing")

parser = AssetParser()
parser.feed(ENTRY.read_text(encoding="utf-8"))
missing = []
for raw in parser.assets:
    url = urlsplit(raw)
    if url.scheme or url.netloc or raw.startswith(("#", "data:", "mailto:", "tel:", "javascript:")):
        continue
    path = unquote(url.path)
    if not path:
        continue
    candidate = (ROOT / path.lstrip("/")).resolve()
    if not candidate.is_relative_to(ROOT.resolve()):
        missing.append((raw, "path escapes repository root"))
    elif not candidate.exists():
        missing.append((raw, "file not found"))

if missing:
    for asset, reason in missing:
        print(f"Missing local asset: {asset} ({reason})")
    raise SystemExit(1)
print(f"Static entry check passed: {len(parser.assets)} local/external references inspected.")
