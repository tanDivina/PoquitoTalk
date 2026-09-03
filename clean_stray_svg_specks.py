import re
import os
import shutil

def filter_svg_crumbs(svg_path):
    with open(svg_path, 'r', encoding='utf-8') as f:
        svg = f.read()

    # Pattern to match paths with off-white / light grey / light cyan anti-aliasing crumbs
    # or paths that are tiny speck shapes
    crumbs = [
        'fill="#EFF4F5"', 'fill="#F0F5F6"', 'fill="#FAFAFA"', 'fill="#FDFDFD"',
        'fill="#F8EDC6"', 'fill="#E8E8E8"', 'fill="#D0EFE9"', 'fill="#ECECEC"',
        'fill="#F5F5F5"', 'fill="#EBF8F6"', 'fill="#F2FAF9"'
    ]
    
    # We only want to keep eye whites (which are inside the eye sclera)
    # Eye sclera paths usually have significant d length or specific translate coordinates
    # Let's inspect paths before removing
    
    lines = svg.splitlines()
    cleaned_lines = []
    removed_count = 0
    
    for line in lines:
        # Check if line contains a stray light-colored path that is very short (crumb)
        is_crumb = False
        for c in crumbs:
            if c.lower() in line.lower():
                # If path string length is very short (< 150 chars), it's a floating edge crumb
                if len(line.strip()) < 180 and 'translate' in line:
                    is_crumb = True
                    break
        if is_crumb:
            removed_count += 1
            continue
        cleaned_lines.append(line)

    cleaned_svg = "\n".join(cleaned_lines)
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(cleaned_svg)
    print(f"Cleaned {svg_path}: removed {removed_count} stray speck paths.")

for f in [
    "web-funnel/poquito_talk_58_73_traced.svg",
    "web-funnel/poquito_talk_34_51_traced.svg",
    "web-funnel/poquito_listening_49_60_traced.svg",
    "web-funnel/poquito_talk_58_73_seamless.svg",
    "web-funnel/poquito_talk_34_51_seamless.svg",
    "web-funnel/poquito_listening_49_60_seamless.svg",
]:
    if os.path.exists(f):
        filter_svg_crumbs(f)
        root_f = os.path.basename(f)
        shutil.copy2(f, root_f)
