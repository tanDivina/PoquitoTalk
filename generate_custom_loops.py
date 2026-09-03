import os, sys, re, shutil
from PIL import Image

def extract_traced_svg(source_svg_path, start_frame_1idx, end_frame_1idx, out_svg_path, out_seamless_path=None, fps=12, svg_id_prefix="poquito-loop"):
    with open(source_svg_path, 'r') as f:
        full_svg = f.read()

    # Extract frame groups from start-1 to end-1 (0-indexed)
    frames_content = []
    for f_idx in range(start_frame_1idx - 1, end_frame_1idx):
        pattern = r'(<g id=\"frame-' + str(f_idx) + r'\"[^>]*>.*?</g>)'
        m = re.search(pattern, full_svg, re.DOTALL)
        if not m:
            print(f"Warning: frame-{f_idx} not found in {source_svg_path}")
            continue
        g_raw = m.group(1)
        # Strip white background path if present
        g_clean = re.sub(r'<path d=\"M0 0 C168\.96 0 337\.92 0 512 0 C512 168\.96 512 337\.92 512 512 C343\.04 512 174\.08 512 0 512 Z \" fill=\"#FAFAFA\"[^>]*/>', '', g_raw)
        g_clean = re.sub(r'<path d=\"M0 0 C168\.96 0 337\.92 0 512 0 C512 168\.96 512 337\.92 512 512 C343\.04 512 174\.08 512 0 512 Z \" fill=\"#FFFFFF\"[^>]*/>', '', g_clean)
        g_clean = re.sub(r'<path d=\"M0 0 C168\.96 0 337\.92 0 512 0[^>]*fill=\"#FAFAFA\"[^>]*/>', '', g_clean)
        g_clean = re.sub(r'<path d=\"M0 0 C168\.96 0 337\.92 0 512 0[^>]*fill=\"#FFFFFF\"[^>]*/>', '', g_clean)
        frames_content.append(g_clean)

    num_frames = len(frames_content)
    if num_frames == 0:
        print(f"Error: 0 frames found for {out_svg_path}")
        return

    duration = num_frames / fps

    def build_svg(frame_list, duration_sec, is_seamless=False):
        n = len(frame_list)
        pct_step = 100.0 / n
        css_rules = []
        css_rules.append(f"  .anim-frame {{ opacity: 0; visibility: hidden; }}")
        
        for i in range(n):
            start_pct = i * pct_step
            end_pct = (i + 1) * pct_step
            anim_name = f"show-frame-{i}"
            css_rules.append(f"    #frame-{i} {{\n      animation: {anim_name} {duration_sec:.2f}s infinite;\n    }}")
            
            if i == 0:
                rule = f"""    @{anim_name} {{
      0%, 0.00% {{ visibility: visible; opacity: 1; }}
      0.01%, {end_pct - 0.01:.2f}% {{ visibility: visible; opacity: 1; }}
      {end_pct:.2f}%, 100% {{ visibility: hidden; opacity: 0; }}
    }}"""
            elif i == n - 1:
                rule = f"""    @{anim_name} {{
      0%, {start_pct:.2f}% {{ visibility: hidden; opacity: 0; }}
      {start_pct + 0.01:.2f}%, 100% {{ visibility: visible; opacity: 1; }}
    }}"""
            else:
                rule = f"""    @{anim_name} {{
      0%, {start_pct:.2f}% {{ visibility: hidden; opacity: 0; }}
      {start_pct + 0.01:.2f}%, {end_pct - 0.01:.2f}% {{ visibility: visible; opacity: 1; }}
      {end_pct:.2f}%, 100% {{ visibility: hidden; opacity: 0; }}
    }}"""
            rule = rule.replace('@' + anim_name, f'@keyframes {anim_name}')
            css_rules.append(rule)

        svg_out = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%" id="{svg_id_prefix}">',
            '  <style>',
            '\n'.join(css_rules),
            '  </style>'
        ]
        
        for i, f_str in enumerate(frame_list):
            renamed = re.sub(r'id=\"frame-\d+\"', f'id="frame-{i}"', f_str)
            renamed = re.sub(r'class=\"[^\"]*\"', 'class="anim-frame"', renamed)
            svg_out.append('  ' + renamed)
            
        svg_out.append('</svg>')
        return '\n'.join(svg_out)

    # Standard loop
    svg_str = build_svg(frames_content, duration)
    with open(out_svg_path, 'w') as f:
        f.write(svg_str)
    print(f"Generated {out_svg_path} ({len(svg_str)/1024:.1f} KB, {num_frames} frames, {duration:.2f}s)")

    # Seamless Ping-Pong loop (forward then backward without repeating endpoints)
    if out_seamless_path:
        pingpong = list(frames_content)
        if len(frames_content) > 2:
            pingpong += list(reversed(frames_content[1:-1]))
        duration_seamless = len(pingpong) / fps
        svg_seamless = build_svg(pingpong, duration_seamless, is_seamless=True)
        with open(out_seamless_path, 'w') as f:
            f.write(svg_seamless)
        print(f"Generated {out_seamless_path} ({len(svg_seamless)/1024:.1f} KB, {len(pingpong)} frames, {duration_seamless:.2f}s)")

def generate_webps(frame_dir, start_1idx, end_1idx, base_name, fps=12):
    frame_files = [os.path.join(frame_dir, f"frame_{i:03d}.png") for i in range(start_1idx, end_1idx + 1)]
    for f in frame_files:
        if not os.path.exists(f):
            print(f"Error: frame missing: {f}")
            return

    duration_ms = int(1000 / fps)
    
    # Forward loop
    imgs_orig = [Image.open(f).convert("RGBA") for f in frame_files]
    
    # Ping-Pong loop
    imgs_pingpong = list(imgs_orig)
    if len(imgs_orig) > 2:
        imgs_pingpong += list(reversed(imgs_orig[1:-1]))

    sizes = [160, 256, 512]
    for sz in sizes:
        # Standard WebP
        resized_standard = [img.resize((sz, sz), Image.Resampling.LANCZOS) for img in imgs_orig]
        out_path = f"{base_name}_{sz}.webp"
        resized_standard[0].save(
            out_path,
            save_all=True,
            append_images=resized_standard[1:],
            duration=duration_ms,
            loop=0,
            quality=90,
            method=6,
            lossless=False
        )
        print(f"Generated {out_path} ({os.path.getsize(out_path)/1024:.1f} KB, {sz}x{sz})")

        # Seamless Ping-Pong WebP
        resized_pingpong = [img.resize((sz, sz), Image.Resampling.LANCZOS) for img in imgs_pingpong]
        out_path_seamless = f"{base_name}_seamless_{sz}.webp"
        resized_pingpong[0].save(
            out_path_seamless,
            save_all=True,
            append_images=resized_pingpong[1:],
            duration=duration_ms,
            loop=0,
            quality=90,
            method=6,
            lossless=False
        )
        print(f"Generated {out_path_seamless} ({os.path.getsize(out_path_seamless)/1024:.1f} KB, {sz}x{sz})")

print("--- GENERATING LOOP 1: Front Greet & Talk #58 to #73 ---")
extract_traced_svg(
    source_svg_path="web-funnel/poquito_front_talking_v2_clean_animated.svg",
    start_frame_1idx=58,
    end_frame_1idx=73,
    out_svg_path="web-funnel/poquito_talk_58_73_traced.svg",
    out_seamless_path="web-funnel/poquito_talk_58_73_seamless.svg",
    fps=12,
    svg_id_prefix="poquito-talk-58-73"
)
generate_webps(
    frame_dir="web-funnel/frames/front_talking",
    start_1idx=58,
    end_1idx=73,
    base_name="web-funnel/poquito_talk_58_73",
    fps=12
)

print("\n--- GENERATING LOOP 2: Front Greet & Talk #34 to #51 ---")
extract_traced_svg(
    source_svg_path="web-funnel/poquito_front_talking_v2_clean_animated.svg",
    start_frame_1idx=34,
    end_frame_1idx=51,
    out_svg_path="web-funnel/poquito_talk_34_51_traced.svg",
    out_seamless_path="web-funnel/poquito_talk_34_51_seamless.svg",
    fps=12,
    svg_id_prefix="poquito-talk-34-51"
)
generate_webps(
    frame_dir="web-funnel/frames/front_talking",
    start_1idx=34,
    end_1idx=51,
    base_name="web-funnel/poquito_talk_34_51",
    fps=12
)

print("\n--- GENERATING LOOP 3: Radio Listening RX #49 to #60 ---")
extract_traced_svg(
    source_svg_path="web-funnel/poquito_listening_rx_animated.svg",
    start_frame_1idx=49,
    end_frame_1idx=60,
    out_svg_path="web-funnel/poquito_listening_49_60_traced.svg",
    out_seamless_path="web-funnel/poquito_listening_49_60_seamless.svg",
    fps=12,
    svg_id_prefix="poquito-listening-49-60"
)
generate_webps(
    frame_dir="web-funnel/frames/listening_rx",
    start_1idx=49,
    end_1idx=60,
    base_name="web-funnel/poquito_listening_49_60",
    fps=12
)
