#!/usr/bin/env python3
import sys
import pathlib
import re

if len(sys.argv) != 3:
    print("usage: inject_tenant.py <tenant> <index.html>", file=sys.stderr)
    sys.exit(2)

tenant = sys.argv[1]
path = pathlib.Path(sys.argv[2])
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
