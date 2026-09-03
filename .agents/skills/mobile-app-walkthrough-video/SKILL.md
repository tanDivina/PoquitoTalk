---
name: mobile-app-walkthrough-video
description: Generates automated, high-fidelity mobile app video walkthroughs and Before/After showcase cards using headless Chrome emulation, synthetic touch physics, DOM-aware element targeting, and frame-accurate synchronized audio multiplexing via FFmpeg.
---

# Mobile App Walkthrough Video & Showcase Skill

Use this skill whenever asked to:
- Automatically record a realistic video demo or walkthrough of a mobile app (React Native / Expo / Web).
- Simulate natural human touch, scrolling, scenario selection, and tab navigation on mobile viewports.
- Record and synchronize real voice audio clips (ElevenLabs, Google Cloud TTS, or local audio) at the exact millisecond a button is tapped.
- Generate high-resolution "@2x retina" mobile screenshots and Before vs. After comparison social cards.

---

## 🏗️ 1. Architecture Pipeline

```
┌────────────────────────────────────────┐
│  React Native / Expo App               │
└───────────────────┬────────────────────┘
                    │ 1. Expo Web Export (npx expo export -p web)
                    ▼
┌────────────────────────────────────────┐
│  Static Web SPA Bundle (dist/)         │
└───────────────────┬────────────────────┘
                    │ 2. Headless Chrome Launch (Puppeteer-core + CDP)
                    ▼
┌────────────────────────────────────────┐
│  Mobile Viewport Emulation             │  <-- Injects Virtual Touch Pointer & Ripple FX
│  (394 × 852 @2x Retina)                │  <-- Calculates Cubic Bezier Kinetic Paths
└───────────────────┬────────────────────┘
                    │ 3. Page.startScreencast Frame Stream (30 FPS)
                    ▼
┌────────────────────────────────────────┐
│  JPEG Frame Sequence (.temp_frames/)   │  <-- Logs exact Frame # when audio is triggered
└───────────────────┬────────────────────┘
                    │ 4. FFmpeg Timeline Multiplexing (adelay + amix + libx264)
                    ▼
┌────────────────────────────────────────┐
│  Final Mobile MP4 Video with Audio     │  --> walkthrough_demo.mp4
└────────────────────────────────────────┘
```

---

## 🎯 2. Core Technical Rules & Implementation Best Practices

### A. Viewport & Dimensions
- Always use **even pixel dimensions** (e.g. `394 × 852` with `deviceScaleFactor: 2`).
- Include `-vf "pad=ceil(iw/2)*2:ceil(ih/2)*2"` in FFmpeg to ensure H.264 / `yuv420p` encoding compliance.

### B. Synthetic Touch Physics & Visual Ripples
Inject a pointer and radial ripple directly into the page DOM:
```javascript
const style = document.createElement('style');
style.innerHTML = `
  html, body, #root { margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
  #virtual-touch-pointer {
    position: fixed; width: 32px; height: 32px; border-radius: 50%;
    background: rgba(160, 74, 38, 0.55); border: 2.5px solid rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4); pointer-events: none; z-index: 999999;
    transform: translate(-50%, -50%); transition: transform 0.18s ease;
  }
  #virtual-touch-pointer.tapping { transform: translate(-50%, -50%) scale(0.75); background: rgba(160, 74, 38, 0.95); }
  .touch-ripple-effect {
    position: fixed; width: 70px; height: 70px; border-radius: 50%;
    background: radial-gradient(circle, rgba(160, 74, 38, 0.55) 0%, rgba(160, 74, 38, 0) 70%);
    pointer-events: none; z-index: 999998; transform: translate(-50%, -50%) scale(0.2);
    animation: touchRippleAnim 0.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
  }
  @keyframes touchRippleAnim {
    0% { transform: translate(-50%, -50%) scale(0.2); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
  }
`;
document.head.appendChild(style);
```

### C. Kinetic Movement (Cubic Bezier Easing)
Move smoothly between coordinate points using natural acceleration:
$$\text{ease}(t) = \begin{cases} 4t^3 & t < 0.5 \\ 1 - \frac{(-2t + 2)^3}{2} & t \ge 0.5 \end{cases}$$

### D. DOM Leaf-Node Target Resolution
Never match broad container elements. Target the smallest leaf node for accurate button center coordinates:
```javascript
async function tapElementByText(text, durationMs = 600) {
  const pos = await page.evaluate((queryText) => {
    const all = Array.from(document.querySelectorAll('div, span, p, a, button, [role="button"]'));
    const matchingLeaves = all.filter(el => {
      const txt = (el.innerText || el.textContent || '').trim();
      const rect = el.getBoundingClientRect();
      const isVisible = rect.width > 15 && rect.height > 10 && rect.top >= 0 && rect.top <= window.innerHeight;
      return isVisible && (txt === queryText || (txt.includes(queryText) && txt.length <= queryText.length + 15));
    });
    if (matchingLeaves.length === 0) return null;
    matchingLeaves.sort((a, b) => (a.offsetWidth * a.offsetHeight) - (b.offsetWidth * b.offsetHeight));
    const target = matchingLeaves[0];
    const rect = target.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }, text);

  if (pos) {
    await moveTouchSmooth(pos.x, pos.y, durationMs);
    await sleep(200);
    await tapAtCurrent();
    return true;
  }
  return false;
}
```

### E. Static Reading Pauses (Deterministic 30 FPS Lock)
Because Chrome DevTools Protocol screencast only emits frames during viewport changes, static pauses must duplicate the latest frame to ensure video playback stays on screen for the desired reading duration:
```javascript
function recordStaticFrames(durationMs) {
  const count = Math.max(1, Math.round((durationMs / 1000) * 30));
  for (let i = 0; i < count; i++) {
    if (lastFrameData) {
      frameCount++;
      const framePath = path.join(FRAMES_DIR, `frame_${String(frameCount).padStart(5, '0')}.jpg`);
      fs.writeFileSync(framePath, Buffer.from(lastFrameData, 'base64'));
    }
  }
}
```

### F. Frame-Accurate Audio Timeline Synchronization (MANDATORY ON PLAY / SPEAKER TAPS)
- **STRICT REQUIREMENT**: Never leave a play button, speaker icon, or "Listen" tap silent in demo videos. Headless Chrome does not stream browser speech synthesis output by default.
- **Always multiplex real audio**:
  1. Capture the exact `audioCueFrame` when the speaker or play button is tapped.
  2. Hold the screen for the audio clip's complete duration (`await sleep(durationMs)` / `recordStaticFrames(durationMs)`).
  3. Mux the real `.mp3` audio track using FFmpeg `adelay` at `delayMs = Math.round((cue.frameNumber / 30) * 1000)`.
  4. If audio is not needed, cut the video before tapping the sound button.

```javascript
let filterParts = [];
let mixInputs = [];
audioCues.forEach((cue, idx) => {
  const inputIdx = idx + 1;
  const delayMs = Math.round((cue.frameNumber / 30) * 1000);
  filterParts.push(`[${inputIdx}:a]adelay=${delayMs}|${delayMs}[a${inputIdx}]`);
  mixInputs.push(`[a${inputIdx}]`);
});
const filterComplex = `${filterParts.join('; ')}; ${mixInputs.join('')}amix=inputs=${audioCues.length}:dropout_transition=0[aout]`;
```

---

"scripts": {
  "snap": "node scripts/snapshot.js",
  "snap:all": "node scripts/snapshot.js all --rebuild",
  "snap:before": "node scripts/snapshot.js before",
  "snap:after": "node scripts/snapshot.js after",
  "snap:compare": "node scripts/snapshot.js compare",
  "record:demo": "node scripts/record_walkthrough_mvp.js"
}
```

---

## 🛑 4. Mandatory Date-Tagging & Overwrite Prevention Rules

1. **Mandatory Date & Version Suffixes**:
   - **NEVER** use generic, unversioned filenames like `walkthrough_demo.mp4` or overwrite existing video assets.
   - **ALWAYS** include the current date (`YYYY_MM_DD`) or semantic release version in the filename:
     - `walkthrough_demo_2026_08_21.mp4`
     - `walkthrough_demo_v1_5_mvp.mp4`
     - `walkthrough_demo_2026_08_21_diego_voice.mp4`
2. **Preserve Prior Versions**:
   - Never overwrite prior recordings or assets. Always write to a new dated filename so the user has full historical access to all video iterations.

