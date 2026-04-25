#!/usr/bin/env python3
"""
Concatenates all Phoenix Research design files into a single self-contained HTML file
that runs the full portfolio SPA in the browser via React + Babel CDN.

Run from any directory:
  python3 scripts/build-portfolio-html.py
"""
import pathlib

ROOT = pathlib.Path(__file__).parent.parent
DESIGNS = ROOT / "src" / "designs"
OUT = ROOT / "public" / "portfolio-app.html"

ORDER = [
    "data.js",
    "ui.jsx",
    "layout.jsx",
    "dashboard.jsx",
    "portfolio-analysis.jsx",
    "compare.jsx",
    "reports.jsx",
    "watchlist.jsx",
    "journal.jsx",
    "tools.jsx",
    "review.jsx",
    "app.jsx",
]

HTML_HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Phoenix Research — Portfolio</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
    :root {
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      --font-mono: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
    /* scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.3); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: rgba(128,128,128,0.5); }
  </style>
</head>
<body>
  <div id="root" style="height:100vh;"></div>

  <!-- React 18 + ReactDOM from CDN -->
  <script crossorigin src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
  <!-- Babel standalone for JSX transpilation -->
  <script src="https://unpkg.com/@babel/standalone@7.24.7/babel.min.js"></script>

"""

HTML_FOOT = """
</body>
</html>
"""

def wrap_script(filename: str, content: str) -> str:
    return f"\n  <!-- ─── {filename} ─────────────────────────────────── -->\n  <script type=\"text/babel\">\n{content}\n  </script>\n"

parts = [HTML_HEAD]

for fname in ORDER:
    fpath = DESIGNS / fname
    content = fpath.read_text(encoding="utf-8")
    parts.append(wrap_script(fname, content))

parts.append(HTML_FOOT)

OUT.write_text("".join(parts), encoding="utf-8")
print(f"Written: {OUT}  ({OUT.stat().st_size // 1024} KB)")
