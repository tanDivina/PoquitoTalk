#!/usr/bin/env python3
import re
from pathlib import Path

def inject_favicons():
    web_dir = Path('web-funnel')
    
    # Root HTML files
    root_files = list(web_dir.glob('*.html'))
    es_files = list((web_dir / 'es').glob('*.html'))
    
    root_tags = """  <link rel="icon" type="image/svg+xml" href="logo.svg" />
  <link rel="alternate icon" type="image/png" href="favicon.png" />
  <link rel="apple-touch-icon" href="apple-touch-icon.png" />"""

    es_tags = """  <link rel="icon" type="image/svg+xml" href="../logo.svg" />
  <link rel="alternate icon" type="image/png" href="../favicon.png" />
  <link rel="apple-touch-icon" href="../apple-touch-icon.png" />"""

    for f in root_files:
        content = f.read_text()
        # Remove any existing icon links
        content = re.sub(r'\s*<link rel="[^"]*icon"[^>]*>', '', content)
        # Inject right after <head>
        content = content.replace('<head>', '<head>\n' + root_tags)
        f.write_text(content)
        print(f"Updated favicons in {f.name}")
        
    for f in es_files:
        content = f.read_text()
        content = re.sub(r'\s*<link rel="[^"]*icon"[^>]*>', '', content)
        content = content.replace('<head>', '<head>\n' + es_tags)
        f.write_text(content)
        print(f"Updated favicons in es/{f.name}")

if __name__ == '__main__':
    inject_favicons()
