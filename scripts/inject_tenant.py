#!/usr/bin/env python3
import sys
import pathlib
import re

if len(sys.argv) != 3:
    print("usage: inject_tenant.py <tenant> <index.html>", file=sys.stderr)
    sys.exit(2)

tenant = sys.argv[1]
if not re.fullmatch(r"[A-Za-z0-9_-]{1,64}", tenant):
    raise SystemExit(f"invalid tenant name: {tenant!r}")

def is_relative_to(path: pathlib.Path, base: pathlib.Path) -> bool:
    try:
        path.relative_to(base)
        return True
    except ValueError:
        return False

raw_path = sys.argv[2]
repo_root = pathlib.Path(__file__).resolve().parent.parent
path = pathlib.Path(raw_path).resolve()

if not is_relative_to(path, repo_root):
    raise SystemExit(f"refusing to write outside repo root: {path}")
if path.suffix.lower() != ".html":
    raise SystemExit(f"target file must be .html: {path}")
if not path.is_file():
    raise SystemExit(f"target file not found: {path}")

html = path.read_text()

if 'tenant-resolver.js' not in html:
    def inject_head(match):
        return match.group(0) + '\n  <base href="../" />\n  <script src="../js/tenant-resolver.js"></script>'
    html, _ = re.subn(r'(<head[^>]*>)', inject_head, html, count=1, flags=re.IGNORECASE)

if 'data-tenant' not in html.lower():
    def inject_html(match):
        opening, attrs = match.groups()
        attrs = attrs or ''
        if 'data-tenant' in attrs.lower():
            return match.group(0)
        return f"{opening}{attrs} data-tenant=\"{tenant}\">"
    html, _ = re.subn(r'(<html\\b)([^>]*)>', inject_html, html, count=1, flags=re.IGNORECASE)

path.write_text(html)
