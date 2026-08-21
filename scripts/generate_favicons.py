#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path
from PIL import Image

def generate_favicons():
    web_dir = Path('web-funnel')
    svg_path = web_dir / 'logo.svg'
    
    # We can use Chrome headless to render high-res PNG from logo.svg
    html_content = f"""<!DOCTYPE html>
<html>
<head>
<style>
body {{ margin: 0; padding: 0; background: transparent; display: flex; align-items: center; justify-content: center; width: 512px; height: 512px; }}
img {{ width: 512px; height: 512px; }}
</style>
</head>
<body>
<img src="file://{svg_path.resolve()}" />
</body>
</html>"""
    
    temp_html = web_dir / 'temp_favicon_render.html'
    temp_html.write_text(html_content)
    
    out_512 = web_dir / 'favicon_512.png'
    
    chrome_cmd = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '--headless',
        '--disable-gpu',
        '--window-size=512,512',
        f'--screenshot={out_512.resolve()}',
        '--default-background-color=00000000',
        f'file://{temp_html.resolve()}'
    ]
    
    subprocess.run(chrome_cmd, check=True)
    temp_html.unlink(missing_ok=True)
    
    if out_512.exists():
        im = Image.open(out_512)
        # Create standard sizes
        im.resize((180, 180), Image.Resampling.LANCZOS).save(web_dir / 'apple-touch-icon.png')
        im.resize((64, 64), Image.Resampling.LANCZOS).save(web_dir / 'favicon.png')
        im.resize((32, 32), Image.Resampling.LANCZOS).save(web_dir / 'favicon-32x32.png')
        im.resize((16, 16), Image.Resampling.LANCZOS).save(web_dir / 'favicon-16x16.png')
        im.save(web_dir / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
        
        # Copy to root and assets as well
        im.resize((64, 64), Image.Resampling.LANCZOS).save('assets/favicon.png')
        im.save('favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
        im.resize((64, 64), Image.Resampling.LANCZOS).save('favicon.png')
        
        out_512.unlink(missing_ok=True)
        print("✅ Favicons successfully generated across all resolutions!")

if __name__ == '__main__':
    generate_favicons()
