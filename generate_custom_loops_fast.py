import os, sys, re
from PIL import Image

def parse_svg_frames(svg_path):
    with open(svg_path, 'r') as f:
        content = f.read()
    
    frames_dict = {}
    # Split by '<g id="frame-'
    parts = content.split('<g id="frame-')
    for p in parts[1:]:
        frame_num_str = p[:p.find('"')]
        if not frame_num_str.isdigit():
            continue
        frame_num = int(frame_num_str)
        # Find closing tag </g>
        closing_idx = p.find('</g>')
        if closing_idx != -1:
            g_body = p[p.find('>') + 1:closing_idx]
            # Strip background path if present
            # Background paths have fill="#FAFAFA" or fill="#FFFFFF"
            lines = []
            for line in g_body.split('<path '):
                if not line.strip():
                    continue
                if 'fill="#FAFAFA"' in line or 'fill="#FFFFFF"' in line or 'fill="#fafafa"' in line:
                    continue
                lines.append('<path ' + line)
            frames_dict[frame_num] = '\n'.join(lines)
    return frames_dict

def make_animated_svg(frames_dict, start_1idx, end_1idx, out_path, out_seamless_path=None, fps=12, svg_id="poquito-loop"):
    frame_list = []
    for i in range(start_1idx - 1, end_1idx):
        if i in frames_dict:
            frame_list.append(frames_dict[i])
        else:
            print(f"Warning: frame {i} not in frames_dict")

    n = len(frame_list)
    if n == 0:
        return

    def build_svg_string(flist, duration_sec):
        total = len(flist)
        pct_step = 100.0 / total
        css = ["  .anim-frame { opacity: 0; visibility: hidden; }"]
        for i in range(total):
            start_pct = i * pct_step
            end_pct = (i + 1) * pct_step
            anim_name = f"show-frame-{i}"
            css.append(f"    #frame-{i} {{\n      animation: {anim_name} {duration_sec:.2f}s infinite;\n    }}")
            if i == 0:
                rule = f"""    @keyframes {anim_name} {{
      0%, 0.00% {{ visibility: visible; opacity: 1; }}
      0.01%, {end_pct - 0.01:.2f}% {{ visibility: visible; opacity: 1; }}
      {end_pct:.2f}%, 100% {{ visibility: hidden; opacity: 0; }}
    }}"""
            elif i == total - 1:
                rule = f"""    @keyframes {anim_name} {{
      0%, {start_pct:.2f}% {{ visibility: hidden; opacity: 0; }}
      {start_pct + 0.01:.2f}%, 100% {{ visibility: visible; opacity: 1; }}
    }}"""
            else:
                rule = f"""    @keyframes {anim_name} {{
      0%, {start_pct:.2f}% {{ visibility: hidden; opacity: 0; }}
      {start_pct + 0.01:.2f}%, {end_pct - 0.01:.2f}% {{ visibility: visible; opacity: 1; }}
      {end_pct:.2f}%, 100% {{ visibility: hidden; opacity: 0; }}
    }}"""
            css.append(rule)

        svg = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%" id="{svg_id}">',
            '  <style>',
            '\n'.join(css),
            '  </style>'
        ]
        for idx, fcontent in enumerate(flist):
            svg.append(f'  <g id="frame-{idx}" class="anim-frame">')
            svg.append('    ' + fcontent)
            svg.append('  </g>')
        svg.append('</svg>')
        return '\n'.join(svg)

    duration = n / fps
    s = build_svg_string(frame_list, duration)
    with open(out_path, 'w') as f:
        f.write(s)
    print(f"Generated {out_path} ({len(s)/1024:.1f} KB, {n} frames, {duration:.2f}s)")

    if out_seamless_path:
        pingpong = list(frame_list)
        if len(frame_list) > 2:
            pingpong += list(reversed(frame_list[1:-1]))
        dur_seamless = len(pingpong) / fps
        s_seamless = build_svg_string(pingpong, dur_seamless)
        with open(out_seamless_path, 'w') as f:
            f.write(s_seamless)
        print(f"Generated {out_seamless_path} ({len(s_seamless)/1024:.1f} KB, {len(pingpong)} frames, {dur_seamless:.2f}s)")

def make_webps(frame_dir, start_1idx, end_1idx, base_name, fps=12):
    frame_files = [os.path.join(frame_dir, f"frame_{i:03d}.png") for i in range(start_1idx, end_1idx + 1)]
    dur_ms = int(1000 / fps)
    
    imgs = [Image.open(f).convert("RGBA") for f in frame_files]
    imgs_pingpong = list(imgs)
    if len(imgs) > 2:
        imgs_pingpong += list(reversed(imgs[1:-1]))

    for sz in [160, 256, 512]:
        # Standard
        res_std = [im.resize((sz, sz), Image.Resampling.LANCZOS) for im in imgs]
        out_std = f"{base_name}_{sz}.webp"
        res_std[0].save(out_std, save_all=True, append_images=res_std[1:], duration=dur_ms, loop=0, quality=85, method=4)
        print(f"Generated {out_std} ({os.path.getsize(out_std)/1024:.1f} KB)")

        # Seamless Ping-Pong
        res_pp = [im.resize((sz, sz), Image.Resampling.LANCZOS) for im in imgs_pingpong]
        out_pp = f"{base_name}_seamless_{sz}.webp"
        res_pp[0].save(out_pp, save_all=True, append_images=res_pp[1:], duration=dur_ms, loop=0, quality=85, method=4)
        print(f"Generated {out_pp} ({os.path.getsize(out_pp)/1024:.1f} KB)")

print("Parsing Front Talking SVG...")
front_dict = parse_svg_frames('web-funnel/poquito_front_talking_v2_clean_animated.svg')
print(f"Front frames parsed: {len(front_dict)}")

print("Parsing Listening RX SVG...")
rx_dict = parse_svg_frames('web-funnel/poquito_listening_rx_animated.svg')
print(f"Listening frames parsed: {len(rx_dict)}")

print("\n--- LOOP 1: Front Greet & Talk #58 to #73 ---")
make_animated_svg(front_dict, 58, 73, "web-funnel/poquito_talk_58_73_traced.svg", "web-funnel/poquito_talk_58_73_seamless.svg", 12, "poquito-talk-58-73")
make_webps("web-funnel/frames/front_talking", 58, 73, "web-funnel/poquito_talk_58_73", 12)

print("\n--- LOOP 2: Front Greet & Talk #34 to #51 ---")
make_animated_svg(front_dict, 34, 51, "web-funnel/poquito_talk_34_51_traced.svg", "web-funnel/poquito_talk_34_51_seamless.svg", 12, "poquito-talk-34-51")
make_webps("web-funnel/frames/front_talking", 34, 51, "web-funnel/poquito_talk_34_51", 12)

print("\n--- LOOP 3: Radio Listening RX #49 to #60 ---")
make_animated_svg(rx_dict, 49, 60, "web-funnel/poquito_listening_49_60_traced.svg", "web-funnel/poquito_listening_49_60_seamless.svg", 12, "poquito-listening-49-60")
make_webps("web-funnel/frames/listening_rx", 49, 60, "web-funnel/poquito_listening_49_60", 12)

print("\nALL 3 CUSTOM LOOPS GENERATED SUCCESSFULLY!")
