import re

with open("web-funnel/poquito_studio.html", "r", encoding="utf-8") as f:
    html = f.read()

# 1. Update Master Nav Buttons
old_nav = """    <!-- Top-Level Master Studio Navigation -->
    <div class="master-nav">
      <button class="master-tab-btn active" onclick="showMasterTab('master-seedance')">🎬 1. AI Motion & WebP Stickers</button>
      <button class="master-tab-btn" onclick="showMasterTab('master-svg')">🦜 2. Interactive SVG Vector Rigs</button>
      <button class="master-tab-btn" onclick="showMasterTab('master-frames')">🎞️ 3. Frame Inspector & Loop Builder</button>
      <button class="master-tab-btn" onclick="showMasterTab('master-voice')">🎙️ 4. Voice Calibration Lab</button>
      <button class="master-tab-btn" onclick="showMasterTab('master-print')">🖨️ 5. Print & QR Launch Deck</button>
    </div>"""

new_nav = """    <!-- Top-Level Master Studio Navigation -->
    <div class="master-nav">
      <button class="master-tab-btn active" onclick="showMasterTab('master-alpha-matrix')">⚡ 1. Alpha WebP Matrix & Audio States</button>
      <button class="master-tab-btn" onclick="showMasterTab('master-seedance')">🎬 2. Full AI Motion Archive</button>
      <button class="master-tab-btn" onclick="showMasterTab('master-svg')">🦜 3. Interactive SVG Vector Rigs</button>
      <button class="master-tab-btn" onclick="showMasterTab('master-frames')">🎞️ 4. Frame Inspector & Loop Builder</button>
      <button class="master-tab-btn" onclick="showMasterTab('master-voice')">🎙️ 5. Voice Calibration Lab</button>
      <button class="master-tab-btn" onclick="showMasterTab('master-print')">🖨️ 6. Print & QR Launch Deck</button>
    </div>"""

html = html.replace(old_nav, new_nav)

# Make master-seedance non-active by default so master-alpha-matrix is the active tab
html = html.replace('<div id="master-seedance" class="master-section active">', '<div id="master-seedance" class="master-section">')

# 2. Build the master-alpha-matrix section HTML
matrix_section = """    <!-- ================= MASTER TAB 0/1: TRANSPARENT ALPHA WEBP MATRIX & AUDIO-REACTIVE ENGINE ================= -->
    <div id="master-alpha-matrix" class="master-section active">

      <!-- Canvas Transparency / Background Toolbar -->
      <div class="theme-toolbar">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.85rem; font-weight: 700; color: #94A3B8;">Canvas Transparency Preview:</span>
          <span style="font-size: 0.78rem; color: #64748B;">(Inspect 100% alpha transparency on dark, light, or checkerboard surfaces)</span>
        </div>
        <div class="theme-btn-group">
          <button class="theme-btn theme-btn-dark active" onclick="setCanvasBg('dark')">🖤 Dark Glass (#0B0E17)</button>
          <button class="theme-btn theme-btn-white" onclick="setCanvasBg('white')">🤍 White Studio (#FFFFFF)</button>
          <button class="theme-btn theme-btn-checker" onclick="setCanvasBg('checker')">🏁 Checkerboard (Alpha)</button>
        </div>
      </div>

      <!-- SECTION 1: LIVE AUDIO-REACTIVE & STATE MACHINE SIMULATOR -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 20px; padding: 24px; margin-bottom: 32px; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <span class="tag" style="background: rgba(16, 185, 129, 0.2); color: #34D399; font-weight: 800; font-size: 0.82rem;">🎙️ LIVE STATE & AUDIO ENGINE</span>
              <span class="tag" style="background: rgba(56, 189, 248, 0.15); color: #38BDF8; font-weight: 700;">Sub-50 KB Alpha WebPs</span>
            </div>
            <h2 style="font-size: 1.4rem; font-weight: 800; margin: 6px 0 2px; color: #F8FAFC;">Poquito State-Switching & Voice-Loudness Reactor</h2>
            <p style="font-size: 0.88rem; color: #94A3B8; margin: 0;">Test how Poquito dynamically transitions between <strong>Idle</strong>, <strong>Listening RX</strong>, <strong>Gentle Speech</strong>, <strong>Loud Speech (Wing Flutter)</strong>, and <strong>Celebration</strong> in real-time apps.</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <button id="btn-toggle-mic" onclick="toggleMicrophoneAudio()" class="btn-primary" style="padding: 9px 16px; font-size: 0.85rem; display: flex; align-items: center; gap: 8px;">
              <span>🎙️ Test Live Microphone</span>
            </button>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 320px 1fr; gap: 24px; align-items: center;" class="audio-sim-grid">
          <!-- Mascot Viewport Stage -->
          <div class="media-box" id="sim-stage-box" style="background: #0B0E17; min-height: 280px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08); position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden;">
            <!-- Glow soundwave rings -->
            <div id="sim-glow-ring" style="position: absolute; width: 140px; height: 140px; border-radius: 50%; background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(16, 185, 129, 0) 70%); opacity: 0; transition: all 0.15s ease; pointer-events: none;"></div>
            
            <img id="sim-avatar-img" src="./poquito_talk_58_73_256.webp" alt="Poquito Simulation" style="max-width: 170px; max-height: 170px; object-fit: contain; transition: transform 0.08s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 2;" />
            
            <!-- Live Active State Pill Badge -->
            <div style="position: absolute; bottom: 12px; z-index: 3; display: flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.12); padding: 4px 12px; border-radius: 20px;">
              <span id="sim-state-dot" style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; box-shadow: 0 0 8px #10B981;"></span>
              <span id="sim-state-name" style="font-size: 0.76rem; font-weight: 700; color: #E2E8F0;">IDLE · Resting Perch</span>
              <span id="sim-state-weight" style="font-size: 0.72rem; color: #94A3B8; border-left: 1px solid rgba(255,255,255,0.15); padding-left: 6px;">26.6 KB</span>
            </div>
          </div>

          <!-- Controls & Loudness Engine -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- State Selectors -->
            <div>
              <div style="font-size: 0.8rem; font-weight: 700; color: #94A3B8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">1. Trigger App State (Instant Alpha WebP Swap)</div>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <button class="btn-state active" onclick="setSimState('idle', this)" style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; color: #34D399; padding: 7px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 700; cursor: pointer;">🟢 Idle Perch (58–73)</button>
                <button class="btn-state" onclick="setSimState('listening', this)" style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); color: #94A3B8; padding: 7px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 700; cursor: pointer;">📻 Listening RX (49–60)</button>
                <button class="btn-state" onclick="setSimState('gentle_talk', this)" style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); color: #94A3B8; padding: 7px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 700; cursor: pointer;">🗣️ Gentle Talk (58–73)</button>
                <button class="btn-state" onclick="setSimState('loud_talk', this)" style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); color: #94A3B8; padding: 7px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 700; cursor: pointer;">🔥 Loud Wing Flutter (34–51)</button>
                <button class="btn-state" onclick="setSimState('wave_greet', this)" style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); color: #94A3B8; padding: 7px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 700; cursor: pointer;">👋 Greet Wave (5–17)</button>
                <button class="btn-state" onclick="setSimState('victory', this)" style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255,255,255,0.1); color: #94A3B8; padding: 7px 14px; border-radius: 10px; font-size: 0.84rem; font-weight: 700; cursor: pointer;">🎉 Victory Leap</button>
              </div>
            </div>

            <!-- Voice Loudness / Decibel Slider -->
            <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 14px 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 0.8rem; font-weight: 700; color: #94A3B8; text-transform: uppercase;">2. Voice Volume & Loudness Reactivity</span>
                <span id="sim-vol-val" style="font-size: 0.82rem; font-weight: 800; color: #34D399;">0% (Whisper / Silent)</span>
              </div>
              <input type="range" id="sim-vol-slider" min="0" max="100" value="0" oninput="handleVolumeSlider(this.value)" style="width: 100%; accent-color: #10B981; cursor: pointer;" />
              
              <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.72rem; color: #64748B;">
                <span>0% Silent</span>
                <span style="color: #38BDF8;">⚡ >50% Auto-Switches to Loud Wing Flutter</span>
                <span style="color: #F87171;">100% Max Loudness</span>
              </div>

              <!-- Volume Decibel Meter Bar -->
              <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; margin-top: 10px; overflow: hidden;">
                <div id="sim-meter-fill" style="width: 0%; height: 100%; background: linear-gradient(90deg, #10B981 0%, #38BDF8 60%, #F59E0B 85%, #EF4444 100%); transition: width 0.06s ease;"></div>
              </div>
            </div>

            <!-- Engineering Architecture Card -->
            <div style="font-size: 0.78rem; color: #94A3B8; line-height: 1.5; background: rgba(30, 41, 59, 0.4); border-left: 3px solid #38BDF8; padding: 10px 14px; border-radius: 0 8px 8px 0;">
              💡 <strong>How Audio Reactivity Works:</strong>
              The Web Audio API (<code style="color: #38BDF8;">AnalyserNode</code>) polls microphone volume. At moderate volume, Poquito uses <strong>Subtle Chat (#58–#73, 26 KB)</strong> with a voice-scale pulse (<code style="color: #34D399;">transform: scale(1 + vol*0.18)</code>). When the speaker raises their voice above 50% volume, the state engine dynamically upgrades to <strong>Expressive Wing Flutter (#34–#51, 35 KB)</strong> with zero lag!
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 2: THE UNIFIED ALL-TRANSPARENT WEBP GALLERY MATRIX -->
      <div style="margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
          <div>
            <div class="tag" style="background: rgba(56, 189, 248, 0.15); color: #38BDF8; font-weight: 800;">📦 PRODUCTION STICKER MATRIX</div>
            <h3 style="font-size: 1.25rem; font-weight: 800; margin: 4px 0 0; color: #F8FAFC;">All Transparent Alpha WebPs (Sub-50 KB & Full Sequences)</h3>
          </div>
          <div style="font-size: 0.8rem; color: #94A3B8;">Click any resolution pill to preview & copy path</div>
        </div>

        <div class="grid-3up">
          <!-- 1. Beak Chat & Talk Only (58-73) -->
          <div class="card" style="border-color: rgba(52, 211, 153, 0.35);">
            <div class="card-header">
              <div class="card-title">
                <span>1. Beak Chat & Talk</span>
                <span class="tag" style="background: rgba(52, 211, 153, 0.2); color: #34D399; font-weight: 800;">⚡ 26.6 KB @ 160px</span>
              </div>
              <div class="card-desc">Frames #58 to #73 (16 frames · 1.33s). Mandible speech articulation on static perch.</div>
              <div class="size-pill-group">
                <button class="size-pill active" onclick="switchWebpSize('webp-matrix-talk-58', 160, 'poquito_talk_58_73', '26.6 KB', this)">160px (26.6 KB)</button>
                <button class="size-pill" onclick="switchWebpSize('webp-matrix-talk-58', 256, 'poquito_talk_58_73', '45.6 KB', this)">256px (45.6 KB)</button>
                <button class="size-pill" onclick="switchWebpSize('webp-matrix-talk-58', 512, 'poquito_talk_58_73', '89.2 KB', this)">512px (89.2 KB)</button>
              </div>
            </div>
            <div class="media-box" style="background: #0B0E17; min-height: 180px;">
              <img id="webp-matrix-talk-58" src="./poquito_talk_58_73_160.webp" alt="Beak Chat 58-73" style="max-width: 140px; max-height: 140px;" />
            </div>
            <div style="padding: 0 1.25rem;">
              <div class="path-box">
                <span id="path-matrix-talk-58" style="color: #34D399;">src/assets/poquito_talk_58_73_160.webp</span>
                <button class="btn-copy" onclick="copyText(document.getElementById('path-matrix-talk-58').textContent, this)">📋 Copy</button>
              </div>
            </div>
            <div class="card-footer">
              <span>Use: <strong>App Chat / Subtle Speech</strong></span>
              <span id="weight-matrix-talk-58" style="color: #34D399;">26.6 KB (100% Alpha)</span>
            </div>
          </div>

          <!-- 2. Expressive Mid-Speech Wing Flutter (34-51) -->
          <div class="card" style="border-color: rgba(56, 189, 248, 0.35);">
            <div class="card-header">
              <div class="card-title">
                <span>2. Expressive Mid-Speech Flutter</span>
                <span class="tag" style="background: rgba(56, 189, 248, 0.2); color: #38BDF8; font-weight: 800;">⚡ 35.8 KB @ 160px</span>
              </div>
              <div class="card-desc">Frames #34 to #51 (18 frames · 1.50s). Lively talking with synchronized wing flutter.</div>
              <div class="size-pill-group">
                <button class="size-pill active" onclick="switchWebpSize('webp-matrix-talk-34', 160, 'poquito_talk_34_51', '35.8 KB', this)">160px (35.8 KB)</button>
                <button class="size-pill" onclick="switchWebpSize('webp-matrix-talk-34', 256, 'poquito_talk_34_51', '59.4 KB', this)">256px (59.4 KB)</button>
                <button class="size-pill" onclick="switchWebpSize('webp-matrix-talk-34', 512, 'poquito_talk_34_51', '108.8 KB', this)">512px (108 KB)</button>
              </div>
            </div>
            <div class="media-box" style="background: #0B0E17; min-height: 180px;">
              <img id="webp-matrix-talk-34" src="./poquito_talk_34_51_160.webp" alt="Expressive Talk 34-51" style="max-width: 140px; max-height: 140px;" />
            </div>
            <div style="padding: 0 1.25rem;">
              <div class="path-box">
                <span id="path-matrix-talk-34" style="color: #38BDF8;">src/assets/poquito_talk_34_51_160.webp</span>
                <button class="btn-copy" onclick="copyText(document.getElementById('path-matrix-talk-34').textContent, this)">📋 Copy</button>
              </div>
            </div>
            <div class="card-footer">
              <span>Use: <strong>Loud Voice / Dynamic Speaking</strong></span>
              <span id="weight-matrix-talk-34" style="color: #38BDF8;">35.8 KB (100% Alpha)</span>
            </div>
          </div>

          <!-- 3. Radio Listening RX Head Nod (49-60) -->
          <div class="card" style="border-color: rgba(245, 158, 11, 0.35);">
            <div class="card-header">
              <div class="card-title">
                <span>3. Radio Listening RX Head Nod</span>
                <span class="tag" style="background: rgba(245, 158, 11, 0.2); color: #F59E0B; font-weight: 800;">⚡ 20.0 KB @ 160px</span>
              </div>
              <div class="card-desc">Frames #49 to #60 (12 frames · 1.00s). Poquito holds walkie-talkie while attentively nodding.</div>
              <div class="size-pill-group">
                <button class="size-pill active" onclick="switchWebpSize('webp-matrix-listen-49', 160, 'poquito_listening_49_60', '20.0 KB', this)">160px (20.0 KB)</button>
                <button class="size-pill" onclick="switchWebpSize('webp-matrix-listen-49', 256, 'poquito_listening_49_60', '38.7 KB', this)">256px (38.7 KB)</button>
                <button class="size-pill" onclick="switchWebpSize('webp-matrix-listen-49', 512, 'poquito_listening_49_60', '75.2 KB', this)">512px (75.2 KB)</button>
              </div>
            </div>
            <div class="media-box" style="background: #0B0E17; min-height: 180px;">
              <img id="webp-matrix-listen-49" src="./poquito_listening_49_60_160.webp" alt="Listening Nod 49-60" style="max-width: 140px; max-height: 140px;" />
            </div>
            <div style="padding: 0 1.25rem;">
              <div class="path-box">
                <span id="path-matrix-listen-49" style="color: #F59E0B;">src/assets/poquito_listening_49_60_160.webp</span>
                <button class="btn-copy" onclick="copyText(document.getElementById('path-matrix-listen-49').textContent, this)">📋 Copy</button>
              </div>
            </div>
            <div class="card-footer">
              <span>Use: <strong>Radio RX / User Speaking State</strong></span>
              <span id="weight-matrix-listen-49" style="color: #F59E0B;">20.0 KB (100% Alpha)</span>
            </div>
          </div>

          <!-- 4. Front Greet Wave (5-17) -->
          <div class="card" style="border-color: rgba(168, 85, 247, 0.35);">
            <div class="card-header">
              <div class="card-title">
                <span>4. Front Greet Wave</span>
                <span class="tag" style="background: rgba(168, 85, 247, 0.2); color: #C084FC; font-weight: 800;">⚡ 18.4 KB @ 160px</span>
              </div>
              <div class="card-desc">Frames #5 to #17 (13 frames · 1.08s). High-energy wing salute greeting wave.</div>
              <div class="size-pill-group">
                <button class="size-pill active" onclick="switchWebpSize('webp-matrix-greet-5', 160, 'poquito_greet_5_17', '18.4 KB', this)">160px (18.4 KB)</button>
                <button class="size-pill" onclick="switchWebpSize('webp-matrix-greet-5', 256, 'poquito_greet_5_17', '32.1 KB', this)">256px (32.1 KB)</button>
                <button class="size-pill" onclick="switchWebpSize('webp-matrix-greet-5', 512, 'poquito_greet_5_17', '64.5 KB', this)">512px (64.5 KB)</button>
              </div>
            </div>
            <div class="media-box" style="background: #0B0E17; min-height: 180px;">
              <img id="webp-matrix-greet-5" src="./poquito_greet_5_17_160.webp" alt="Greet Wave 5-17" style="max-width: 140px; max-height: 140px;" />
            </div>
            <div style="padding: 0 1.25rem;">
              <div class="path-box">
                <span id="path-matrix-greet-5" style="color: #C084FC;">src/assets/poquito_greet_5_17_160.webp</span>
                <button class="btn-copy" onclick="copyText(document.getElementById('path-matrix-greet-5').textContent, this)">📋 Copy</button>
              </div>
            </div>
            <div class="card-footer">
              <span>Use: <strong>App Welcome / Onboarding Salute</strong></span>
              <span id="weight-matrix-greet-5" style="color: #C084FC;">18.4 KB (100% Alpha)</span>
            </div>
          </div>

          <!-- 5. Front Greet & Talk (Full Clean v2) -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span>5. Full Greet & Talk Loop</span>
                <span class="tag" style="background: rgba(16, 185, 129, 0.15); color: #34D399;">292 KB @ 160px</span>
              </div>
              <div class="card-desc">73 frames (6.0s master sequence). Complete salute, speaking cycle, and perch rest.</div>
              <div class="size-pill-group">
                <button class="size-pill active" onclick="switchWebpSize('webp-matrix-full-front', 160, 'poquito_front_talking_v2_clean', '292 KB', this)">160px (292 KB)</button>
                <button class="size-pill" onclick="switchWebpSize('webp-matrix-full-front', 256, 'poquito_front_talking_v2_clean', '475 KB', this)">256px (475 KB)</button>
              </div>
            </div>
            <div class="media-box" style="background: #0B0E17; min-height: 180px;">
              <img id="webp-matrix-full-front" src="./poquito_front_talking_v2_clean_160.webp" alt="Full Front Greet" style="max-width: 140px; max-height: 140px;" />
            </div>
            <div style="padding: 0 1.25rem;">
              <div class="path-box">
                <span id="path-matrix-full-front" style="color: #94A3B8;">src/assets/poquito_front_talking_v2_clean_160.webp</span>
                <button class="btn-copy" onclick="copyText(document.getElementById('path-matrix-full-front').textContent, this)">📋 Copy</button>
              </div>
            </div>
            <div class="card-footer">
              <span>Use: <strong>Hero Landing Page Video</strong></span>
              <span id="weight-matrix-full-front" style="color: #34D399;">292 KB</span>
            </div>
          </div>

          <!-- 6. Victory Leap & Perch (Full Clean) -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <span>6. Victory Leap & Spin</span>
                <span class="tag" style="background: rgba(16, 185, 129, 0.15); color: #34D399;">337 KB @ 160px</span>
              </div>
              <div class="card-desc">85 frames (7.0s master sequence). Celebratory hop, 360 wing spin, and joyful chirp.</div>
              <div class="size-pill-group">
                <button class="size-pill active" onclick="switchWebpSize('webp-matrix-full-vic', 160, 'poquito_victory_jump', '337 KB', this)">160px (337 KB)</button>
                <button class="size-pill" onclick="switchWebpSize('webp-matrix-full-vic', 256, 'poquito_victory_jump', '537 KB', this)">256px (537 KB)</button>
              </div>
            </div>
            <div class="media-box" style="background: #0B0E17; min-height: 180px;">
              <img id="webp-matrix-full-vic" src="./poquito_victory_jump_160.webp" alt="Full Victory Jump" style="max-width: 140px; max-height: 140px;" />
            </div>
            <div style="padding: 0 1.25rem;">
              <div class="path-box">
                <span id="path-matrix-full-vic" style="color: #94A3B8;">src/assets/poquito_victory_jump_160.webp</span>
                <button class="btn-copy" onclick="copyText(document.getElementById('path-matrix-full-vic').textContent, this)">📋 Copy</button>
              </div>
            </div>
            <div class="card-footer">
              <span>Use: <strong>Quiz Success / Streak Reward</strong></span>
              <span id="weight-matrix-full-vic" style="color: #34D399;">337 KB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
"""

# Insert matrix_section right above `<div id="master-seedance"`
html = html.replace('<div id="master-seedance" class="master-section">', matrix_section + '\n    <div id="master-seedance" class="master-section">')

# 3. Add JavaScript handlers for the Simulator
sim_js = """
    // =========================================================================
    // MASTER TAB 1: AUDIO-REACTIVE & STATE MACHINE SIMULATOR LOGIC
    // =========================================================================
    const SIM_STATE_MAP = {
      idle: {
        src: './poquito_talk_58_73_256.webp',
        label: 'IDLE · Resting Perch Stance',
        weight: '26.6 KB',
        color: '#10B981'
      },
      listening: {
        src: './poquito_listening_49_60_256.webp',
        label: 'LISTENING RX · Radio Nod Glance',
        weight: '20.0 KB',
        color: '#F59E0B'
      },
      gentle_talk: {
        src: './poquito_talk_58_73_256.webp',
        label: 'SPEAKING · Mandible Beak Talk',
        weight: '26.6 KB',
        color: '#34D399'
      },
      loud_talk: {
        src: './poquito_talk_34_51_256.webp',
        label: 'SPEAKING LOUD · Dynamic Wing Flutter',
        weight: '35.8 KB',
        color: '#38BDF8'
      },
      wave_greet: {
        src: './poquito_greet_5_17_256.webp',
        label: 'GREETING · Wing Salute Wave',
        weight: '18.4 KB',
        color: '#C084FC'
      },
      victory: {
        src: './poquito_victory_jump_256.webp',
        label: 'CELEBRATION · Victory Leap Jump',
        weight: '537 KB',
        color: '#EC4899'
      }
    };

    let currentSimState = 'idle';
    let isMicActive = false;
    let micAudioContext = null;
    let micAnalyser = null;
    let micStream = null;
    let micRafId = null;

    function setSimState(stateKey, btnEl) {
      currentSimState = stateKey;
      const stateObj = SIM_STATE_MAP[stateKey] || SIM_STATE_MAP.idle;

      // Update button visual styles
      document.querySelectorAll('.btn-state').forEach(btn => {
        btn.style.background = 'rgba(30, 41, 59, 0.8)';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        btn.style.color = '#94A3B8';
      });
      if (btnEl) {
        btnEl.style.background = 'rgba(16, 185, 129, 0.15)';
        btnEl.style.borderColor = stateObj.color;
        btnEl.style.color = stateObj.color;
      }

      // Update avatar image and badge
      const avatarImg = document.getElementById('sim-avatar-img');
      const stateDot = document.getElementById('sim-state-dot');
      const stateName = document.getElementById('sim-state-name');
      const stateWeight = document.getElementById('sim-state-weight');

      if (avatarImg) avatarImg.src = stateObj.src;
      if (stateDot) {
        stateDot.style.background = stateObj.color;
        stateDot.style.boxShadow = `0 0 8px ${stateObj.color}`;
      }
      if (stateName) stateName.textContent = stateObj.label;
      if (stateWeight) stateWeight.textContent = stateObj.weight;
    }

    function handleVolumeSlider(val) {
      const volPct = parseInt(val, 10);
      const volFrac = volPct / 100.0;

      // Update Meter Bar & Label
      const meterFill = document.getElementById('sim-meter-fill');
      const volValLabel = document.getElementById('sim-vol-val');
      if (meterFill) meterFill.style.width = `${volPct}%`;
      if (volValLabel) {
        if (volPct === 0) volValLabel.textContent = '0% (Whisper / Silent)';
        else if (volPct < 50) volValLabel.textContent = `${volPct}% (Moderate Voice)`;
        else volValLabel.textContent = `${volPct}% (🔥 Loud Speech / Threshold Triggered)`;
      }

      // Voice Bounce scaling
      const avatarImg = document.getElementById('sim-avatar-img');
      const glowRing = document.getElementById('sim-glow-ring');
      if (avatarImg) {
        const scale = 1.0 + volFrac * 0.22;
        avatarImg.style.transform = `scale(${scale})`;
      }
      if (glowRing) {
        glowRing.style.opacity = (volFrac * 0.9).toString();
        glowRing.style.transform = `scale(${1.0 + volFrac * 0.6})`;
      }

      // Dynamic Threshold State Upgrade (if currently talking or listening)
      if (currentSimState === 'gentle_talk' || currentSimState === 'loud_talk') {
        const targetState = volPct >= 50 ? 'loud_talk' : 'gentle_talk';
        if (targetState !== currentSimState) {
          const matchingBtn = Array.from(document.querySelectorAll('.btn-state')).find(b => b.getAttribute('onclick')?.includes(targetState));
          setSimState(targetState, matchingBtn);
        }
      }
    }

    async function toggleMicrophoneAudio() {
      const btn = document.getElementById('btn-toggle-mic');
      if (isMicActive) {
        // Stop Mic
        isMicActive = false;
        if (micStream) {
          micStream.getTracks().forEach(track => track.stop());
          micStream = null;
        }
        if (micAudioContext) {
          micAudioContext.close();
          micAudioContext = null;
        }
        if (micRafId) cancelAnimationFrame(micRafId);
        if (btn) {
          btn.innerHTML = '<span>🎙️ Test Live Microphone</span>';
          btn.style.background = '';
        }
        handleVolumeSlider(0);
        return;
      }

      // Start Mic
      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micAudioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = micAudioContext.createMediaStreamSource(micStream);
        micAnalyser = micAudioContext.createAnalyser();
        micAnalyser.fftSize = 256;
        source.connect(micAnalyser);

        isMicActive = true;
        if (btn) {
          btn.innerHTML = '<span>🔴 Stop Live Mic</span>';
          btn.style.background = '#EF4444';
        }

        // Switch to speech state automatically when mic starts
        setSimState('gentle_talk', Array.from(document.querySelectorAll('.btn-state')).find(b => b.getAttribute('onclick')?.includes('gentle_talk')));

        const dataArray = new Uint8Array(micAnalyser.frequencyBinCount);

        function updateMicVolume() {
          if (!isMicActive) return;
          micAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          // Map average volume (0-128) to 0-100%
          const pct = Math.min(100, Math.round((avg / 65) * 100));
          
          const slider = document.getElementById('sim-vol-slider');
          if (slider) slider.value = pct;
          handleVolumeSlider(pct);

          micRafId = requestAnimationFrame(updateMicVolume);
        }

        updateMicVolume();
      } catch (err) {
        alert('Microphone access denied or unavailable: ' + err.message);
      }
    }
"""

# Insert sim_js before `function showMasterTab`
html = html.replace('    function showMasterTab(tabId) {', sim_js + '\n    function showMasterTab(tabId) {')

with open("web-funnel/poquito_studio.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Successfully injected Alpha Matrix tab and state simulator into poquito_studio.html!")
