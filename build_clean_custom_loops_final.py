import os
import shutil
import numpy as np
from PIL import Image
from collections import deque

def clean_frame_alpha(pil_img):
    img = pil_img.convert("RGBA")
    arr = np.array(img)
    h, w, _ = arr.shape
    visited = np.zeros((h, w), dtype=bool)
    bg_mask = np.zeros((h, w), dtype=bool)

    q = deque()
    for x in range(w):
        q.append((0, x))
        q.append((h - 1, x))
    for y in range(h):
        q.append((y, 0))
        q.append((y, w - 1))

    while q:
        y, x = q.popleft()
        if visited[y, x]:
            continue
        visited[y, x] = True
        r, g, b = arr[y, x, :3]
        # Check if off-white / grey background (tolerant threshold)
        if r > 235 and g > 235 and b > 235:
            bg_mask[y, x] = True
            for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                    q.append((ny, nx))

    arr[bg_mask, 3] = 0
    return Image.fromarray(arr)

def load_frames(folder, start, end):
    frames = []
    for i in range(start, end + 1):
        fpath = os.path.join(folder, f"frame_{i:03d}.png")
        if not os.path.exists(fpath):
            print(f"Warning: frame not found: {fpath}")
            continue
        im = Image.open(fpath)
        clean_im = clean_frame_alpha(im)
        frames.append(clean_im)
    return frames

def save_animated_webp(frames, output_path, fps=12, size=None):
    if not frames:
        return
    duration_ms = int(1000 / fps)
    
    resized = []
    for f in frames:
        if size and size != f.size[0]:
            resized.append(f.resize((size, size), Image.Resampling.LANCZOS))
        else:
            resized.append(f)
            
    resized[0].save(
        output_path,
        save_all=True,
        append_images=resized[1:],
        duration=duration_ms,
        loop=0,
        transparency=0,
        disposal=2
    )
    print(f"Saved WebP: {output_path} ({os.path.getsize(output_path) / 1024:.1f} KB)")

# Extract transparent SVG frames from animated SVG
def extract_transparent_svg_loop(source_svg_path, out_traced_svg, out_seamless_svg, start_idx, end_idx, fps=12):
    with open(source_svg_path, 'r', encoding='utf-8') as f:
        svg_content = f.read()

    # Split into frame groups
    raw_parts = svg_content.split('<g id="frame-')
    header = raw_parts[0]
    frame_map = {}
    
    for part in raw_parts[1:]:
        idx_str = part.split('"')[0]
        try:
            f_num = int(idx_str)
            end_tag = part.find('</g>')
            if end_tag != -1:
                inner = part[part.find('>') + 1 : end_tag]
                # Filter out background paths (e.g. M0 0... or fill="#FAFAFA" / white fills covering background)
                filtered_paths = []
                for chunk in inner.split('<path '):
                    if not chunk.strip():
                        continue
                    p = '<path ' + chunk
                    # Check if this path is a full background rect
                    if 'd="M0 0' in p and ('fill="#FA' in p or 'fill="#FB' in p or 'fill="#FC' in p or 'fill="#FD' in p or 'fill="#FE' in p or 'fill="#FF' in p or 'fill="#fff' in p or 'fill="white"' in p):
                        continue
                    filtered_paths.append(p)
                frame_map[f_num] = "".join(filtered_paths)
        except Exception as e:
            pass

    # Build sequence
    valid_keys = [i for i in range(start_idx, end_idx + 1) if i in frame_map]
    if not valid_keys:
        print(f"Error: No valid keys found between {start_idx} and {end_idx}")
        return

    dur = 1.0 / fps
    total_dur = len(valid_keys) * dur

    # 1. Traced Forward SVG
    keyframes_css = []
    frames_xml = []
    pct_step = 100.0 / len(valid_keys)
    
    for i, f_num in enumerate(valid_keys):
        f_id = f"custom-f{i+1}"
        p1 = i * pct_step
        p2 = (i + 1) * pct_step
        if i == len(valid_keys) - 1:
            keyframes_css.append(f"  {p1:.2f}%, 100% {{ opacity: 1; }}")
        else:
            keyframes_css.append(f"  {p1:.2f}%, {p2 - 0.01:.2f}% {{ opacity: 1; }}")
            
        frames_xml.append(f'  <g id="{f_id}" class="anim-frame" style="animation-delay: {i * dur:.3f}s;">\n    {frame_map[f_num]}\n  </g>')

    svg_out = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
<style>
  .anim-frame {{
    opacity: 0;
    animation: cycleFrame {total_dur:.3f}s infinite step-end;
  }}
  @keyframes cycleFrame {{
    0% {{ opacity: 1; }}
    {pct_step:.2f}%, 100% {{ opacity: 0; }}
  }}
</style>
{"".join(frames_xml)}
</svg>"""

    with open(out_traced_svg, 'w', encoding='utf-8') as f:
        f.write(svg_out)
    print(f"Saved SVG: {out_traced_svg} ({os.path.getsize(out_traced_svg) / 1024:.1f} KB)")

    # 2. Seamless Ping-Pong SVG
    ping_pong_keys = valid_keys + list(reversed(valid_keys[1:-1]))
    total_dur_pp = len(ping_pong_keys) * dur
    pct_step_pp = 100.0 / len(ping_pong_keys)
    
    frames_xml_pp = []
    for i, f_num in enumerate(ping_pong_keys):
        f_id = f"pp-f{i+1}"
        frames_xml_pp.append(f'  <g id="{f_id}" class="anim-frame-pp" style="animation-delay: {i * dur:.3f}s;">\n    {frame_map[f_num]}\n  </g>')

    svg_pp_out = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
<style>
  .anim-frame-pp {{
    opacity: 0;
    animation: cycleFramePP {total_dur_pp:.3f}s infinite step-end;
  }}
  @keyframes cycleFramePP {{
    0% {{ opacity: 1; }}
    {pct_step_pp:.2f}%, 100% {{ opacity: 0; }}
  }}
</style>
{"".join(frames_xml_pp)}
</svg>"""

    with open(out_seamless_svg, 'w', encoding='utf-8') as f:
        f.write(svg_pp_out)
    print(f"Saved Seamless SVG: {out_seamless_svg} ({os.path.getsize(out_seamless_svg) / 1024:.1f} KB)")


def main():
    print("=== Generating 100% Transparent Alpha WebPs and SVGs ===")

    # 1. Front Talking #58–#73
    f58_73 = load_frames("web-funnel/frames/front_talking", 58, 73)
    f58_73_pp = f58_73 + list(reversed(f58_73[1:-1]))
    
    for sz in [160, 256, 512]:
        save_animated_webp(f58_73, f"web-funnel/poquito_talk_58_73_{sz}.webp", fps=12, size=sz)
        save_animated_webp(f58_73_pp, f"web-funnel/poquito_talk_58_73_seamless_{sz}.webp", fps=12, size=sz)

    extract_transparent_svg_loop(
        "web-funnel/poquito_front_talking_v2_clean_animated.svg",
        "web-funnel/poquito_talk_58_73_traced.svg",
        "web-funnel/poquito_talk_58_73_seamless.svg",
        58, 73, fps=12
    )

    # 2. Front Talking #34–#51
    f34_51 = load_frames("web-funnel/frames/front_talking", 34, 51)
    f34_51_pp = f34_51 + list(reversed(f34_51[1:-1]))
    
    for sz in [160, 256, 512]:
        save_animated_webp(f34_51, f"web-funnel/poquito_talk_34_51_{sz}.webp", fps=12, size=sz)
        save_animated_webp(f34_51_pp, f"web-funnel/poquito_talk_34_51_seamless_{sz}.webp", fps=12, size=sz)

    extract_transparent_svg_loop(
        "web-funnel/poquito_front_talking_v2_clean_animated.svg",
        "web-funnel/poquito_talk_34_51_traced.svg",
        "web-funnel/poquito_talk_34_51_seamless.svg",
        34, 51, fps=12
    )

    # 3. Listening RX #49–#60
    f49_60 = load_frames("web-funnel/frames/listening_rx", 49, 60)
    f49_60_pp = f49_60 + list(reversed(f49_60[1:-1]))
    
    for sz in [160, 256, 512]:
        save_animated_webp(f49_60, f"web-funnel/poquito_listening_49_60_{sz}.webp", fps=12, size=sz)
        save_animated_webp(f49_60_pp, f"web-funnel/poquito_listening_49_60_seamless_{sz}.webp", fps=12, size=sz)

    extract_transparent_svg_loop(
        "web-funnel/poquito_listening_rx_animated.svg",
        "web-funnel/poquito_listening_49_60_traced.svg",
        "web-funnel/poquito_listening_49_60_seamless.svg",
        49, 60, fps=12
    )

    # Automatic Workspace Copying (User Rule #4)
    print("Copying all generated assets to workspace root...")
    assets = [
        "poquito_talk_58_73_160.webp", "poquito_talk_58_73_256.webp", "poquito_talk_58_73_512.webp",
        "poquito_talk_58_73_seamless_160.webp", "poquito_talk_58_73_seamless_256.webp", "poquito_talk_58_73_seamless_512.webp",
        "poquito_talk_58_73_traced.svg", "poquito_talk_58_73_seamless.svg",
        "poquito_talk_34_51_160.webp", "poquito_talk_34_51_256.webp", "poquito_talk_34_51_512.webp",
        "poquito_talk_34_51_seamless_160.webp", "poquito_talk_34_51_seamless_256.webp", "poquito_talk_34_51_seamless_512.webp",
        "poquito_talk_34_51_traced.svg", "poquito_talk_34_51_seamless.svg",
        "poquito_listening_49_60_160.webp", "poquito_listening_49_60_256.webp", "poquito_listening_49_60_512.webp",
        "poquito_listening_49_60_seamless_160.webp", "poquito_listening_49_60_seamless_256.webp", "poquito_listening_49_60_seamless_512.webp",
        "poquito_listening_49_60_traced.svg", "poquito_listening_49_60_seamless.svg",
    ]
    for a in assets:
        src = os.path.join("web-funnel", a)
        if os.path.exists(src):
            shutil.copy2(src, a)
            print(f"  Copied -> {a}")

    print("=== Complete! ===")

if __name__ == "__main__":
    main()
