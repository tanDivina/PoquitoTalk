// Layered Imagine Studio - Core Application Logic
// Supports Multi-Layer Decomposition, Layer-Targeted Prompting, 3D Exploded Depth Inspector, 
// Alpha Background Removal & Modular Part Downloads

(function() {
  'use strict';

  // Application State
  const state = {
    currentPreset: null,
    layers: [],
    selectedLayerId: null,
    viewMode: '2d', // '2d' or '3d'
    isGenerating: false,
    promptHistory: [],
    zoom: 1.0,
    depthSpacing: 120, // 3d layer z-distance
    rotationX: 18,
    rotationY: -28,
    isDragging3D: false,
    dragStartX: 0,
    dragStartY: 0,
    activeTab: 'layers', // 'layers', 'inspector', 'export'
    bgRemovalThreshold: 35
  };

  // DOM Elements
  const dom = {
    canvasContainer: document.getElementById('canvas-container'),
    viewport2D: document.getElementById('viewport-2d'),
    viewport3D: document.getElementById('viewport-3d'),
    stage3D: document.getElementById('stage-3d'),
    layerTree: document.getElementById('layer-tree'),
    layerCountBadge: document.getElementById('layer-count-badge'),
    selectedLayerTitle: document.getElementById('selected-layer-title'),
    selectedLayerType: document.getElementById('selected-layer-type'),
    layerPromptInput: document.getElementById('layer-prompt-input'),
    btnRepromptLayer: document.getElementById('btn-reprompt-layer'),
    quickPromptPills: document.getElementById('quick-prompt-pills'),
    layerOpacitySlider: document.getElementById('layer-opacity-slider'),
    layerOpacityVal: document.getElementById('layer-opacity-val'),
    layerBlendSelect: document.getElementById('layer-blend-select'),
    btnToggleVisibility: document.getElementById('btn-toggle-visibility'),
    btnSoloLayer: document.getElementById('btn-solo-layer'),
    btnDownloadLayer: document.getElementById('btn-download-layer'),
    btnRemoveBg: document.getElementById('btn-remove-bg'),
    btnExportAll: document.getElementById('btn-export-all'),
    btnExportComposite: document.getElementById('btn-export-composite'),
    globalPromptInput: document.getElementById('global-prompt-input'),
    btnGenerateNew: document.getElementById('btn-generate-new'),
    presetSelector: document.getElementById('preset-selector'),
    mode2DBtn: document.getElementById('mode-2d-btn'),
    mode3DBtn: document.getElementById('mode-3d-btn'),
    depthSpacingSlider: document.getElementById('depth-spacing-slider'),
    depthSpacingVal: document.getElementById('depth-spacing-val'),
    statusPill: document.getElementById('status-pill'),
    generationOverlay: document.getElementById('generation-overlay'),
    generationText: document.getElementById('generation-text'),
    toast: document.getElementById('toast')
  };

  // Show status notification toast
  function showToast(message, type = 'info') {
    if (!dom.toast) return;
    dom.toast.textContent = message;
    dom.toast.className = `toast show ${type}`;
    setTimeout(() => {
      dom.toast.className = 'toast';
    }, 3200);
  }

  // Set processing status
  function setStatus(text, active = false) {
    if (!dom.statusPill) return;
    dom.statusPill.innerHTML = `<span class="status-dot ${active ? 'pulse' : ''}"></span> ${text}`;
  }

  // Initialize Application
  function init() {
    setupPresets();
    setupEventListeners();
    loadPreset(window.IMAGINE_PRESETS[0].id);
    setup3DControls();
  }

  // Populate presets dropdown and pills
  function setupPresets() {
    if (!dom.presetSelector) return;
    dom.presetSelector.innerHTML = '';
    window.IMAGINE_PRESETS.forEach(preset => {
      const opt = document.createElement('option');
      opt.value = preset.id;
      opt.textContent = preset.name;
      dom.presetSelector.appendChild(opt);
    });
  }

  // Load a preset by ID
  function loadPreset(presetId) {
    const preset = window.IMAGINE_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    state.currentPreset = preset;
    // Deep clone layers so mutations don't alter base preset permanently
    state.layers = JSON.parse(JSON.stringify(preset.layers));
    state.selectedLayerId = state.layers[2] ? state.layers[2].id : state.layers[0].id; // default select subject

    if (dom.globalPromptInput) {
      dom.globalPromptInput.value = preset.basePrompt;
    }

    renderLayerCanvases();
    updateLayerTreeUI();
    updateInspectorUI();
    render3DStage();
    showToast(`Loaded "${preset.name}" (${state.layers.length} layers preserved)`);
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Mode Switchers (2D Composite vs 3D Exploded)
    if (dom.mode2DBtn && dom.mode3DBtn) {
      dom.mode2DBtn.addEventListener('click', () => setViewMode('2d'));
      dom.mode3DBtn.addEventListener('click', () => setViewMode('3d'));
    }

    // Depth slider for 3D explosion
    if (dom.depthSpacingSlider) {
      dom.depthSpacingSlider.addEventListener('input', (e) => {
        state.depthSpacing = parseInt(e.target.value, 10);
        if (dom.depthSpacingVal) dom.depthSpacingVal.textContent = `${state.depthSpacing}px`;
        render3DStage();
      });
    }

    // Preset selection change
    if (dom.presetSelector) {
      dom.presetSelector.addEventListener('change', (e) => {
        loadPreset(e.target.value);
      });
    }

    // Layer Opacity slider
    if (dom.layerOpacitySlider) {
      dom.layerOpacitySlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (dom.layerOpacityVal) dom.layerOpacityVal.textContent = `${Math.round(val * 100)}%`;
        const layer = getSelectedLayer();
        if (layer) {
          layer.opacity = val;
          updateLayerCanvas(layer.id);
          render3DStage();
          updateLayerTreeUI();
        }
      });
    }

    // Layer Blend mode
    if (dom.layerBlendSelect) {
      dom.layerBlendSelect.addEventListener('change', (e) => {
        const layer = getSelectedLayer();
        if (layer) {
          layer.blendMode = e.target.value;
          updateCompositeCanvas();
          render3DStage();
        }
      });
    }

    // Layer Reprompting (Targeted inpainting)
    if (dom.btnRepromptLayer) {
      dom.btnRepromptLayer.addEventListener('click', () => {
        triggerLayerReprompt();
      });
    }

    if (dom.layerPromptInput) {
      dom.layerPromptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          triggerLayerReprompt();
        }
      });
    }

    // Global Scene Generation
    if (dom.btnGenerateNew) {
      dom.btnGenerateNew.addEventListener('click', () => {
        triggerGlobalGeneration();
      });
    }

    // Quick Action: Remove Background
    if (dom.btnRemoveBg) {
      dom.btnRemoveBg.addEventListener('click', () => {
        executeBackgroundRemovalOnSelected();
      });
    }

    // Single Layer Download
    if (dom.btnDownloadLayer) {
      dom.btnDownloadLayer.addEventListener('click', () => {
        downloadSelectedLayerPNG();
      });
    }

    // Export All Layers
    if (dom.btnExportAll) {
      dom.btnExportAll.addEventListener('click', () => {
        exportAllLayersPackage();
      });
    }

    // Export Composite
    if (dom.btnExportComposite) {
      dom.btnExportComposite.addEventListener('click', () => {
        exportCompositePNG();
      });
    }

    // Toggle Layer Visibility
    if (dom.btnToggleVisibility) {
      dom.btnToggleVisibility.addEventListener('click', () => {
        const layer = getSelectedLayer();
        if (layer) {
          layer.visible = !layer.visible;
          updateCompositeCanvas();
          render3DStage();
          updateLayerTreeUI();
          updateInspectorUI();
        }
      });
    }

    // Solo Layer
    if (dom.btnSoloLayer) {
      dom.btnSoloLayer.addEventListener('click', () => {
        const currentSelected = state.selectedLayerId;
        const allOthersHidden = state.layers.every(l => l.id === currentSelected ? l.visible : !l.visible);
        
        state.layers.forEach(l => {
          if (allOthersHidden) {
            l.visible = true; // restore all
          } else {
            l.visible = (l.id === currentSelected);
          }
        });
        updateCompositeCanvas();
        render3DStage();
        updateLayerTreeUI();
        showToast(allOthersHidden ? "All layers visible" : "Soloing selected layer");
      });
    }
  }

  // Get current selected layer object
  function getSelectedLayer() {
    return state.layers.find(l => l.id === state.selectedLayerId);
  }

  // Set View Mode: 2D Composite vs 3D Exploded
  function setViewMode(mode) {
    state.viewMode = mode;
    if (mode === '2d') {
      dom.mode2DBtn.classList.add('active');
      dom.mode3DBtn.classList.remove('active');
      dom.viewport2D.style.display = 'flex';
      dom.viewport3D.style.display = 'none';
      if (document.getElementById('depth-controls-panel')) {
        document.getElementById('depth-controls-panel').style.display = 'none';
      }
    } else {
      dom.mode3DBtn.classList.add('active');
      dom.mode2DBtn.classList.remove('active');
      dom.viewport2D.style.display = 'none';
      dom.viewport3D.style.display = 'flex';
      if (document.getElementById('depth-controls-panel')) {
        document.getElementById('depth-controls-panel').style.display = 'flex';
      }
      render3DStage();
    }
  }

  // Setup 3D Interactive Mouse Orbit
  function setup3DControls() {
    const stage = dom.viewport3D;
    if (!stage) return;

    stage.addEventListener('mousedown', (e) => {
      state.isDragging3D = true;
      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;
      stage.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!state.isDragging3D) return;
      const deltaX = e.clientX - state.dragStartX;
      const deltaY = e.clientY - state.dragStartY;

      state.rotationY += deltaX * 0.45;
      state.rotationX -= deltaY * 0.45;

      // Clamp X rotation to prevent flipping
      state.rotationX = Math.max(-60, Math.min(60, state.rotationX));

      state.dragStartX = e.clientX;
      state.dragStartY = e.clientY;

      update3DStageTransform();
    });

    window.addEventListener('mouseup', () => {
      state.isDragging3D = false;
      if (stage) stage.style.cursor = 'grab';
    });

    // Reset 3D angle button
    const btnReset3D = document.getElementById('btn-reset-3d');
    if (btnReset3D) {
      btnReset3D.addEventListener('click', () => {
        state.rotationX = 18;
        state.rotationY = -28;
        update3DStageTransform();
      });
    }
  }

  function update3DStageTransform() {
    if (dom.stage3D) {
      dom.stage3D.style.transform = `rotateX(${state.rotationX}deg) rotateY(${state.rotationY}deg)`;
    }
  }

  // Procedural Layer Graphics Generators (Generates crisp transparent high-res vector/canvas layers)
  function renderProceduralGraphics(ctx, renderType, layerPrompt, width, height) {
    ctx.clearRect(0, 0, width, height);

    switch (renderType) {
      // -------------------------------------------------------------
      // CYBERPUNK THEME
      // -------------------------------------------------------------
      case 'procedural-bg-cyberpunk': {
        const isSunny = layerPrompt && layerPrompt.toLowerCase().includes('sunny');
        const isMars = layerPrompt && layerPrompt.toLowerCase().includes('mars');
        const isSynth = layerPrompt && layerPrompt.toLowerCase().includes('synthwave');

        if (isSynth) {
          // Synthwave Sun & Grid Horizon
          const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
          skyGrad.addColorStop(0, '#0a0017');
          skyGrad.addColorStop(0.55, '#40003b');
          skyGrad.addColorStop(1, '#ff007f');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, width, height);

          // Glowing Sun
          const sunGrad = ctx.createLinearGradient(width/2, height*0.2, width/2, height*0.6);
          sunGrad.addColorStop(0, '#ffeb3b');
          sunGrad.addColorStop(1, '#ff0055');
          ctx.fillStyle = sunGrad;
          ctx.beginPath();
          ctx.arc(width/2, height*0.42, 130, 0, Math.PI * 2);
          ctx.fill();

          // Sun stripes
          ctx.fillStyle = '#1a0026';
          for (let y = height*0.38; y < height*0.56; y += 12) {
            ctx.fillRect(width*0.25, y, width*0.5, 4);
          }

          // Mountain Silhouettes
          ctx.fillStyle = '#10001a';
          ctx.beginPath();
          ctx.moveTo(0, height*0.6);
          ctx.lineTo(150, height*0.48);
          ctx.lineTo(280, height*0.58);
          ctx.lineTo(450, height*0.44);
          ctx.lineTo(600, height*0.54);
          ctx.lineTo(750, height*0.46);
          ctx.lineTo(800, height*0.6);
          ctx.lineTo(800, height);
          ctx.lineTo(0, height);
          ctx.fill();

          // Neon Grid Floor
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          for (let x = 0; x <= width; x += 40) {
            ctx.moveTo(x, height*0.6);
            ctx.lineTo((x - width/2)*3.5 + width/2, height);
          }
          for (let y = height*0.6; y <= height; y += (y - height*0.55)*0.35 + 6) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
          }
          ctx.stroke();
        } else if (isMars) {
          // Mars Colony Dome
          const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
          skyGrad.addColorStop(0, '#3a1205');
          skyGrad.addColorStop(0.5, '#78280f');
          skyGrad.addColorStop(1, '#b8441a');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, width, height);

          // Geodesic Dome wireframe
          ctx.strokeStyle = 'rgba(255, 180, 120, 0.25)';
          ctx.lineWidth = 1.5;
          for (let r = 100; r < 500; r += 70) {
            ctx.beginPath();
            ctx.arc(width/2, height*0.3, r, 0, Math.PI);
            ctx.stroke();
          }

          // Red Sand dunes
          ctx.fillStyle = '#5c1b07';
          ctx.beginPath();
          ctx.moveTo(0, height*0.65);
          ctx.bezierCurveTo(200, height*0.55, 450, height*0.75, 800, height*0.6);
          ctx.lineTo(800, height);
          ctx.lineTo(0, height);
          ctx.fill();
        } else if (isSunny) {
          // Bright Neo-Tokyo Day
          const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
          skyGrad.addColorStop(0, '#5cb8ff');
          skyGrad.addColorStop(0.6, '#c4e6ff');
          skyGrad.addColorStop(1, '#ffffff');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, width, height);

          // Clean white towers
          ctx.fillStyle = '#dfe8f0';
          ctx.fillRect(80, 120, 140, height);
          ctx.fillRect(260, 80, 180, height);
          ctx.fillRect(520, 150, 160, height);

          // Blue glass reflections
          ctx.fillStyle = 'rgba(74, 144, 226, 0.4)';
          for (let y = 140; y < height; y += 30) {
            ctx.fillRect(280, y, 140, 15);
            ctx.fillRect(100, y + 10, 100, 12);
          }
        } else {
          // Default: Rainy Neon Cyberpunk Alley
          const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
          skyGrad.addColorStop(0, '#05070e');
          skyGrad.addColorStop(0.5, '#0b0f1d');
          skyGrad.addColorStop(1, '#111728');
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, width, height);

          // Distant Megastructures & Tower Silhouettes
          ctx.fillStyle = '#080c16';
          ctx.fillRect(40, 60, 150, height);
          ctx.fillRect(220, 20, 200, height);
          ctx.fillRect(480, 90, 160, height);
          ctx.fillRect(680, 40, 120, height);

          // Tower Windows / Server Lights
          for (let i = 0; i < 90; i++) {
            const x = Math.random() * (width - 100) + 50;
            const y = Math.random() * (height * 0.6) + 40;
            ctx.fillStyle = Math.random() > 0.4 ? 'rgba(0, 240, 255, 0.6)' : 'rgba(255, 0, 128, 0.6)';
            ctx.fillRect(x, y, 4, 3);
          }

          // Wet Alley Floor Reflection
          const floorGrad = ctx.createLinearGradient(0, height*0.65, 0, height);
          floorGrad.addColorStop(0, '#0a0d18');
          floorGrad.addColorStop(0.4, '#12192e');
          floorGrad.addColorStop(1, '#080a12');
          ctx.fillStyle = floorGrad;
          ctx.fillRect(0, height*0.65, width, height*0.35);

          // Neon Ground Reflections
          ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
          ctx.beginPath();
          ctx.ellipse(320, height*0.82, 160, 18, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(255, 0, 128, 0.15)';
          ctx.beginPath();
          ctx.ellipse(540, height*0.88, 140, 15, 0, 0, Math.PI * 2);
          ctx.fill();

          // Distant Neon Signs
          ctx.fillStyle = 'rgba(255, 0, 128, 0.8)';
          ctx.font = 'bold 22px monospace';
          ctx.fillText('ネオ東京 // 2099', 80, 220);

          ctx.fillStyle = 'rgba(0, 240, 255, 0.85)';
          ctx.font = 'bold 18px monospace';
          ctx.fillText('CYBER // CORP', 500, 180);
        }
        break;
      }

      case 'procedural-mid-cyberpunk': {
        const isDrone = layerPrompt && layerPrompt.toLowerCase().includes('drone');
        const isStall = layerPrompt && layerPrompt.toLowerCase().includes('ramen') || (layerPrompt && layerPrompt.toLowerCase().includes('food'));
        const isNone = layerPrompt && layerPrompt.toLowerCase().includes('remove') || (layerPrompt && layerPrompt.toLowerCase().includes('none'));

        if (isNone) {
          // Just subtle steam vents
          ctx.fillStyle = 'rgba(200, 220, 255, 0.1)';
          for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.arc(200 + i*100, height*0.7 - i*15, 35 + i*8, 0, Math.PI*2);
            ctx.fill();
          }
          return;
        }

        if (isDrone) {
          // Patrol Drone with Laser searchlight
          ctx.save();
          // Drone 1 (Left)
          ctx.fillStyle = '#1a1f2e';
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(140, 180, 110, 45, 12);
          ctx.fill();
          ctx.stroke();

          // Glowing eye
          ctx.fillStyle = '#ff0055';
          ctx.beginPath();
          ctx.arc(195, 202, 10, 0, Math.PI*2);
          ctx.fill();

          // Laser beam
          const laserGrad = ctx.createLinearGradient(195, 202, 260, height*0.85);
          laserGrad.addColorStop(0, 'rgba(255, 0, 85, 0.8)');
          laserGrad.addColorStop(1, 'rgba(255, 0, 85, 0.0)');
          ctx.fillStyle = laserGrad;
          ctx.beginPath();
          ctx.moveTo(190, 210);
          ctx.lineTo(200, 210);
          ctx.lineTo(340, height*0.85);
          ctx.lineTo(180, height*0.85);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        } else if (isStall) {
          // Ramen Cyber Stall
          ctx.fillStyle = '#221915';
          ctx.fillRect(480, height*0.48, 260, 220);
          
          // Glowing Lanterns
          ctx.fillStyle = '#ff4400';
          ctx.beginPath();
          ctx.arc(520, height*0.46, 22, 0, Math.PI*2);
          ctx.arc(590, height*0.46, 22, 0, Math.PI*2);
          ctx.arc(660, height*0.46, 22, 0, Math.PI*2);
          ctx.fill();

          // Counter
          ctx.fillStyle = '#442d20';
          ctx.fillRect(460, height*0.62, 300, 18);
          // Neon Banner
          ctx.fillStyle = '#00ffcc';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('⚡ RAMEN BIO-BAR ⚡', 500, height*0.56);
        } else {
          // Default: Parked Sleek Matte-Black Hover-Car & Vending Kiosk
          ctx.save();

          // Holographic Vending Machine (Right)
          ctx.fillStyle = '#141724';
          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(580, height*0.38, 150, 260, 8);
          ctx.fill();
          ctx.stroke();

          // Vending Glass Glow
          const vendGrad = ctx.createLinearGradient(590, height*0.42, 710, height*0.65);
          vendGrad.addColorStop(0, 'rgba(0, 229, 255, 0.25)');
          vendGrad.addColorStop(1, 'rgba(255, 0, 128, 0.35)');
          ctx.fillStyle = vendGrad;
          ctx.fillRect(595, height*0.42, 120, 160);

          // Drinks Cans glowing inside
          const colors = ['#ff0055', '#00f0ff', '#a8ff35', '#ffaa00'];
          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
              ctx.fillStyle = colors[(row + col) % colors.length];
              ctx.fillRect(606 + col * 26, height*0.45 + row * 45, 16, 28);
            }
          }

          // Hover Car (Left Side)
          ctx.fillStyle = '#0e111a';
          ctx.strokeStyle = '#38435d';
          ctx.lineWidth = 2;
          
          // Aerodynamic chassis silhouette
          ctx.beginPath();
          ctx.moveTo(40, height*0.68);
          ctx.lineTo(90, height*0.58);
          ctx.lineTo(240, height*0.56);
          ctx.lineTo(310, height*0.65);
          ctx.lineTo(320, height*0.74);
          ctx.lineTo(30, height*0.74);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Blue Hover thruster glow
          const thrustGrad = ctx.createLinearGradient(70, height*0.74, 280, height*0.82);
          thrustGrad.addColorStop(0, 'rgba(0, 220, 255, 0.7)');
          thrustGrad.addColorStop(0.5, 'rgba(0, 140, 255, 0.9)');
          thrustGrad.addColorStop(1, 'rgba(0, 220, 255, 0)');
          ctx.fillStyle = thrustGrad;
          ctx.beginPath();
          ctx.ellipse(170, height*0.75, 110, 14, 0, 0, Math.PI*2);
          ctx.fill();

          ctx.restore();
        }
        break;
      }

      case 'procedural-subject-cyberpunk': {
        const isSamurai = layerPrompt && layerPrompt.toLowerCase().includes('samurai') || (layerPrompt && layerPrompt.toLowerCase().includes('ronin'));
        const isMech = layerPrompt && layerPrompt.toLowerCase().includes('mech') || (layerPrompt && layerPrompt.toLowerCase().includes('soldier'));
        const isSteampunk = layerPrompt && layerPrompt.toLowerCase().includes('steampunk');

        ctx.save();
        const cx = width * 0.48;
        const cy = height * 0.58;

        if (isSamurai) {
          // Cyber Samurai Ronin with Plasma Katana
          ctx.fillStyle = '#12141c';
          // Legs
          ctx.fillRect(cx - 50, cy + 80, 32, 180);
          ctx.fillRect(cx + 18, cy + 80, 32, 180);

          // Carbon Armor Torso & Hakama
          ctx.beginPath();
          ctx.moveTo(cx - 75, cy - 60);
          ctx.lineTo(cx + 75, cy - 60);
          ctx.lineTo(cx + 95, cy + 90);
          ctx.lineTo(cx - 95, cy + 90);
          ctx.closePath();
          ctx.fill();

          // Kabuto Helmet with Crest
          ctx.fillStyle = '#1c202c';
          ctx.beginPath();
          ctx.arc(cx, cy - 110, 48, 0, Math.PI*2);
          ctx.fill();

          // Golden Horn Crest
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(cx - 45, cy - 145);
          ctx.quadraticCurveTo(cx, cy - 115, cx + 45, cy - 145);
          ctx.stroke();

          // Glowing Plasma Katana
          ctx.strokeStyle = '#ff0055';
          ctx.lineWidth = 6;
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 25;
          ctx.beginPath();
          ctx.moveTo(cx + 80, cy + 120);
          ctx.lineTo(cx + 170, cy - 130);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (isMech) {
          // Titanium Exoskeleton Mech Soldier
          ctx.fillStyle = '#2b3342';
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 3;

          // Heavy armored chest
          ctx.beginPath();
          ctx.roundRect(cx - 90, cy - 80, 180, 160, 20);
          ctx.fill();
          ctx.stroke();

          // Glowing Blue Arc Reactor Core
          ctx.fillStyle = '#00f0ff';
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 30;
          ctx.beginPath();
          ctx.arc(cx, cy - 10, 28, 0, Math.PI*2);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Armored Helmet
          ctx.fillStyle = '#1e2430';
          ctx.beginPath();
          ctx.roundRect(cx - 50, cy - 160, 100, 75, 14);
          ctx.fill();
          ctx.stroke();

          // T-visor glow
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(cx - 35, cy - 135, 70, 10);
          ctx.fillRect(cx - 5, cy - 135, 10, 35);
        } else if (isSteampunk) {
          // Steampunk Explorer
          ctx.fillStyle = '#3e2716';
          // Coat
          ctx.beginPath();
          ctx.moveTo(cx - 70, cy - 50);
          ctx.lineTo(cx + 70, cy - 50);
          ctx.lineTo(cx + 90, cy + 160);
          ctx.lineTo(cx - 90, cy + 160);
          ctx.closePath();
          ctx.fill();

          // Brass Gears & Harness
          ctx.strokeStyle = '#cda250';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(cx - 65, cy - 40);
          ctx.lineTo(cx + 65, cy + 60);
          ctx.moveTo(cx + 65, cy - 40);
          ctx.lineTo(cx - 65, cy + 60);
          ctx.stroke();

          // Head & Goggles
          ctx.fillStyle = '#e8beac';
          ctx.beginPath();
          ctx.arc(cx, cy - 105, 38, 0, Math.PI*2);
          ctx.fill();

          // Brass Double Goggles
          ctx.fillStyle = '#111';
          ctx.strokeStyle = '#cda250';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(cx - 18, cy - 110, 14, 0, Math.PI*2);
          ctx.arc(cx + 18, cy - 110, 14, 0, Math.PI*2);
          ctx.fill();
          ctx.stroke();
        } else {
          // Default: High-Tech Cyber Courier in Trench Coat with Levitating Data Box
          // Tactical trenchcoat body
          ctx.fillStyle = '#101524';
          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = 2;

          // Legs & boots
          ctx.fillStyle = '#0a0d18';
          ctx.fillRect(cx - 42, cy + 100, 32, 160);
          ctx.fillRect(cx + 10, cy + 100, 32, 160);

          // Trenchcoat drape
          ctx.fillStyle = '#141a2e';
          ctx.beginPath();
          ctx.moveTo(cx - 65, cy - 50);
          ctx.lineTo(cx + 65, cy - 50);
          ctx.lineTo(cx + 85, cy + 140);
          ctx.lineTo(cx - 85, cy + 140);
          ctx.closePath();
          ctx.fill();

          // Luminous jacket seam piping
          ctx.strokeStyle = '#a8ff35';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx - 65, cy - 50);
          ctx.lineTo(cx - 20, cy + 120);
          ctx.moveTo(cx + 65, cy - 50);
          ctx.lineTo(cx + 20, cy + 120);
          ctx.stroke();

          // Head & Hair
          ctx.fillStyle = '#f0c7b2';
          ctx.beginPath();
          ctx.arc(cx, cy - 95, 36, 0, Math.PI*2);
          ctx.fill();

          // Cyberpunk Bob Haircut (Deep Teal / Violet)
          ctx.fillStyle = '#0f384c';
          ctx.beginPath();
          ctx.arc(cx, cy - 105, 42, Math.PI, 0);
          ctx.lineTo(cx + 42, cy - 70);
          ctx.lineTo(cx - 42, cy - 70);
          ctx.closePath();
          ctx.fill();

          // Glowing Amber Cyber Visor
          ctx.fillStyle = '#ffaa00';
          ctx.shadowColor = '#ffaa00';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.roundRect(cx - 30, cy - 100, 60, 18, 5);
          ctx.fill();
          ctx.shadowBlur = 0;

          // Levitating Glowing Holographic Data Cube (in hand)
          const cubeX = cx + 80;
          const cubeY = cy + 20;
          
          ctx.save();
          ctx.translate(cubeX, cubeY);
          ctx.rotate(0.35);

          ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 3;
          ctx.shadowColor = '#00f0ff';
          ctx.shadowBlur = 24;

          ctx.strokeRect(-26, -26, 52, 52);
          ctx.fillRect(-26, -26, 52, 52);
          
          // Inner glowing core
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-10, -10, 20, 20);
          ctx.restore();
        }
        ctx.restore();
        break;
      }

      case 'procedural-fg-cyberpunk': {
        const isSakura = layerPrompt && layerPrompt.toLowerCase().includes('sakura');
        const isLaser = layerPrompt && layerPrompt.toLowerCase().includes('laser');
        const isMinimal = layerPrompt && layerPrompt.toLowerCase().includes('minimal');

        if (isMinimal) {
          // Soft ambient mist
          const mistGrad = ctx.createLinearGradient(0, 0, 0, height);
          mistGrad.addColorStop(0, 'rgba(0, 200, 255, 0.05)');
          mistGrad.addColorStop(1, 'rgba(0, 200, 255, 0.12)');
          ctx.fillStyle = mistGrad;
          ctx.fillRect(0, 0, width, height);
          return;
        }

        if (isSakura) {
          // Floating Glowing Cyber Sakura Petals
          for (let i = 0; i < 45; i++) {
            const px = (Math.sin(i * 99) * 0.5 + 0.5) * width;
            const py = (Math.cos(i * 33) * 0.5 + 0.5) * height;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(i);
            ctx.fillStyle = 'rgba(255, 100, 180, 0.85)';
            ctx.shadowColor = '#ff64b4';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI*2);
            ctx.fill();
            ctx.restore();
          }
        } else if (isLaser) {
          // Laser scan lines
          ctx.strokeStyle = 'rgba(0, 255, 120, 0.75)';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#00ff78';
          ctx.shadowBlur = 10;
          for (let y = 60; y < height; y += 45) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
          }
        } else {
          // Default: Rain Streaks & AR HUD Glyphs
          ctx.save();

          // Rain streaks
          ctx.strokeStyle = 'rgba(180, 220, 255, 0.35)';
          ctx.lineWidth = 1.5;
          for (let i = 0; i < 65; i++) {
            const rx = (Math.sin(i * 77) * 0.5 + 0.5) * width;
            const ry = (Math.cos(i * 123) * 0.5 + 0.5) * height;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 15, ry + 40);
            ctx.stroke();
          }

          // AR Interface HUD Widgets
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
          ctx.fillStyle = 'rgba(0, 240, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.font = '12px monospace';

          // Reticle on top-right
          ctx.strokeRect(width - 180, 60, 120, 70);
          ctx.fillText('TARGET: LOCKED', width - 170, 85);
          ctx.fillText('DIST: 14.2m', width - 170, 105);

          // Circular gauge top-left
          ctx.beginPath();
          ctx.arc(100, 100, 36, -Math.PI*0.5, Math.PI*0.8);
          ctx.stroke();
          ctx.fillText('SYNC 98%', 75, 105);

          ctx.restore();
        }
        break;
      }

      // -------------------------------------------------------------
      // MECHA SENTINEL THEME
      // -------------------------------------------------------------
      case 'procedural-bg-mecha': {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#060911');
        bgGrad.addColorStop(0.5, '#0e172a');
        bgGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Quantum Reactor Plasma Chamber
        const plasma = ctx.createRadialGradient(width/2, height*0.4, 20, width/2, height*0.4, 260);
        plasma.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
        plasma.addColorStop(0.4, 'rgba(30, 64, 175, 0.5)');
        plasma.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = plasma;
        ctx.fillRect(0, 0, width, height);
        break;
      }

      case 'procedural-mid-mecha': {
        // Railgun arms & gantry
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;

        // Left Railgun Barrel
        ctx.fillRect(80, 160, 140, 45);
        ctx.strokeRect(80, 160, 140, 45);

        // Right Railgun Barrel
        ctx.fillRect(width - 220, 160, 140, 45);
        ctx.strokeRect(width - 220, 160, 140, 45);
        break;
      }

      case 'procedural-subject-mecha': {
        // Mecha Bipedal Torso
        const cx = width/2;
        const cy = height*0.55;

        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;

        // Heavy Torso
        ctx.beginPath();
        ctx.moveTo(cx - 110, cy - 80);
        ctx.lineTo(cx + 110, cy - 80);
        ctx.lineTo(cx + 70, cy + 90);
        ctx.lineTo(cx - 70, cy + 90);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Eye Visor
        ctx.fillStyle = '#ef4444';
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 20;
        ctx.fillRect(cx - 40, cy - 60, 80, 14);
        ctx.shadowBlur = 0;

        // Legs
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 65, cy + 90, 45, 170);
        ctx.fillRect(cx + 20, cy + 90, 45, 170);
        break;
      }

      case 'procedural-fg-mecha': {
        // Hex Shield
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.lineWidth = 2;
        const hexRadius = 35;
        for (let row = 0; row < 6; row++) {
          for (let col = 0; col < 8; col++) {
            const hx = col * hexRadius * 1.75 + 50;
            const hy = row * hexRadius * 1.5 + (col % 2 ? hexRadius * 0.75 : 0) + 120;
            ctx.beginPath();
            for (let a = 0; a < 6; a++) {
              const angle = a * Math.PI / 3;
              const px = hx + hexRadius * 0.5 * Math.cos(angle);
              const py = hy + hexRadius * 0.5 * Math.sin(angle);
              if (a === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
        break;
      }

      // -------------------------------------------------------------
      // BOTANICAL GLASSHOUSE THEME
      // -------------------------------------------------------------
      case 'procedural-bg-botanical': {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
        bgGrad.addColorStop(0, '#041c19');
        bgGrad.addColorStop(0.6, '#093a32');
        bgGrad.addColorStop(1, '#0e4a40');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Victorian Dome Frame
        ctx.strokeStyle = 'rgba(217, 249, 157, 0.25)';
        ctx.lineWidth = 2;
        for (let r = 80; r < 600; r += 60) {
          ctx.beginPath();
          ctx.arc(width/2, height*0.35, r, 0, Math.PI);
          ctx.stroke();
        }
        break;
      }

      case 'procedural-mid-botanical': {
        // Giant glowing mushrooms
        ctx.fillStyle = '#065f46';
        // Left Mushroom
        ctx.beginPath();
        ctx.arc(160, height*0.62, 70, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#34d399';
        ctx.fillRect(150, height*0.62, 20, 110);

        // Right Mushroom
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(width - 160, height*0.65, 80, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#6ee7b7';
        ctx.fillRect(width - 170, height*0.65, 20, 120);
        break;
      }

      case 'procedural-subject-botanical': {
        // Spirit Tree with glowing heart
        const cx = width/2;
        const cy = height*0.55;

        // Trunk
        ctx.fillStyle = '#3f2c20';
        ctx.beginPath();
        ctx.moveTo(cx - 30, cy + 180);
        ctx.lineTo(cx - 15, cy - 20);
        ctx.lineTo(cx + 15, cy - 20);
        ctx.lineTo(cx + 30, cy + 180);
        ctx.closePath();
        ctx.fill();

        // Foliage Crown (Pink / Gold)
        const crownGrad = ctx.createRadialGradient(cx, cy - 60, 20, cx, cy - 60, 140);
        crownGrad.addColorStop(0, '#f472b6');
        crownGrad.addColorStop(0.7, '#db2777');
        crownGrad.addColorStop(1, '#831843');
        ctx.fillStyle = crownGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 60, 120, 0, Math.PI*2);
        ctx.fill();

        // Glowing heart crystal in trunk
        ctx.fillStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(cx, cy + 30, 22, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      }

      case 'procedural-fg-botanical': {
        // Spores & Fireflies
        for (let i = 0; i < 60; i++) {
          const px = (Math.sin(i * 45) * 0.5 + 0.5) * width;
          const py = (Math.cos(i * 88) * 0.5 + 0.5) * height;
          const size = (i % 4) + 2;
          ctx.fillStyle = 'rgba(251, 191, 36, 0.85)';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI*2);
          ctx.fill();
        }
        break;
      }

      default: {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, width, height);
      }
    }
  }

  // Render all layer canvases in the 2D stage
  function renderLayerCanvases() {
    if (!dom.viewport2D) return;
    dom.viewport2D.innerHTML = '';

    // Create container stack
    const stageWidth = 640;
    const stageHeight = 640;

    const stackContainer = document.createElement('div');
    stackContainer.id = 'composite-stack';
    stackContainer.style.width = `${stageWidth}px`;
    stackContainer.style.height = `${stageHeight}px`;
    stackContainer.style.position = 'relative';

    state.layers.forEach((layer, index) => {
      const canvas = document.createElement('canvas');
      canvas.id = `canvas-${layer.id}`;
      canvas.width = 800;
      canvas.height = 800;
      canvas.className = 'layer-canvas';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.zIndex = index + 1;
      canvas.style.opacity = layer.visible ? layer.opacity : 0;
      canvas.style.mixBlendMode = layer.blendMode || 'normal';
      canvas.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

      const ctx = canvas.getContext('2d');
      renderProceduralGraphics(ctx, layer.renderType, layer.prompt, 800, 800);

      // Store canvas dataUrl on layer for exports
      layer._canvas = canvas;

      stackContainer.appendChild(canvas);
    });

    dom.viewport2D.appendChild(stackContainer);
  }

  // Update a single layer canvas (e.g. after prompt mutation or BG removal)
  function updateLayerCanvas(layerId) {
    const layer = state.layers.find(l => l.id === layerId);
    if (!layer || !layer._canvas) return;

    const canvas = layer._canvas;
    canvas.style.opacity = layer.visible ? layer.opacity : 0;
    canvas.style.mixBlendMode = layer.blendMode || 'normal';

    const ctx = canvas.getContext('2d');
    renderProceduralGraphics(ctx, layer.renderType, layer.prompt, 800, 800);
  }

  // Update overall composite canvas visibility & blends
  function updateCompositeCanvas() {
    state.layers.forEach(layer => {
      if (layer._canvas) {
        layer._canvas.style.opacity = layer.visible ? layer.opacity : 0;
        layer._canvas.style.mixBlendMode = layer.blendMode || 'normal';
      }
    });
  }

  // Render the 3D Stage with separated layer cards along Z axis
  function render3DStage() {
    if (!dom.stage3D) return;
    dom.stage3D.innerHTML = '';

    const width = 480;
    const height = 480;

    dom.stage3D.style.width = `${width}px`;
    dom.stage3D.style.height = `${height}px`;
    update3DStageTransform();

    state.layers.forEach((layer, index) => {
      const card = document.createElement('div');
      card.className = `layer-3d-card ${layer.id === state.selectedLayerId ? 'selected' : ''}`;
      card.style.width = `${width}px`;
      card.style.height = `${height}px`;
      card.style.position = 'absolute';
      card.style.top = '0';
      card.style.left = '0';
      
      const zPos = (index - (state.layers.length - 1) / 2) * state.depthSpacing;
      card.style.transform = `translateZ(${zPos}px)`;
      card.style.opacity = layer.visible ? layer.opacity : 0.15;

      // 3D Canvas element
      const c3d = document.createElement('canvas');
      c3d.width = 600;
      c3d.height = 600;
      c3d.style.width = '100%';
      c3d.style.height = '100%';
      const ctx = c3d.getContext('2d');
      renderProceduralGraphics(ctx, layer.renderType, layer.prompt, 600, 600);

      // Layer Tag floating in 3D
      const tag = document.createElement('div');
      tag.className = 'layer-3d-tag';
      tag.innerHTML = `<span>L${index}: ${layer.name.split('•')[0]}</span> <small>${layer.type.toUpperCase()}</small>`;

      card.appendChild(c3d);
      card.appendChild(tag);

      // Click card to select
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        selectLayer(layer.id);
      });

      dom.stage3D.appendChild(card);
    });
  }

  // Update Layer Tree UI on right sidebar
  function updateLayerTreeUI() {
    if (!dom.layerTree) return;
    dom.layerTree.innerHTML = '';
    if (dom.layerCountBadge) dom.layerCountBadge.textContent = `${state.layers.length} Layers`;

    // Render in reverse order (top layer at top of list, like Photoshop/Figma)
    const reversed = [...state.layers].reverse();

    reversed.forEach((layer) => {
      const item = document.createElement('div');
      item.className = `layer-tree-item ${layer.id === state.selectedLayerId ? 'active' : ''}`;
      
      // Thumbnail preview
      const thumb = document.createElement('div');
      thumb.className = 'layer-thumb';
      if (layer._canvas) {
        thumb.style.backgroundImage = `url(${layer._canvas.toDataURL('image/png')})`;
      }

      // Details
      const info = document.createElement('div');
      info.className = 'layer-info';
      info.innerHTML = `
        <div class="layer-title-row">
          <span class="layer-name">${layer.name}</span>
          <span class="layer-type-pill type-${layer.type}">${layer.type}</span>
        </div>
        <div class="layer-prompt-snippet">${layer.prompt}</div>
      `;

      // Quick Actions (Visibility eye, download icon)
      const actions = document.createElement('div');
      actions.className = 'layer-actions';
      
      const eyeBtn = document.createElement('button');
      eyeBtn.className = `icon-btn ${layer.visible ? '' : 'hidden'}`;
      eyeBtn.title = layer.visible ? "Hide Layer" : "Show Layer";
      eyeBtn.innerHTML = layer.visible 
        ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
        : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
      
      eyeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        layer.visible = !layer.visible;
        updateCompositeCanvas();
        render3DStage();
        updateLayerTreeUI();
        updateInspectorUI();
      });

      const dlBtn = document.createElement('button');
      dlBtn.className = 'icon-btn';
      dlBtn.title = "Download Transparent PNG";
      dlBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`;
      
      dlBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        downloadSingleLayer(layer);
      });

      actions.appendChild(eyeBtn);
      actions.appendChild(dlBtn);

      item.appendChild(thumb);
      item.appendChild(info);
      item.appendChild(actions);

      item.addEventListener('click', () => {
        selectLayer(layer.id);
      });

      dom.layerTree.appendChild(item);
    });
  }

  // Select a layer
  function selectLayer(layerId) {
    state.selectedLayerId = layerId;
    updateLayerTreeUI();
    updateInspectorUI();
    render3DStage();
  }

  // Update Inspector Panel UI
  function updateInspectorUI() {
    const layer = getSelectedLayer();
    if (!layer) return;

    if (dom.selectedLayerTitle) dom.selectedLayerTitle.textContent = layer.name;
    if (dom.selectedLayerType) {
      dom.selectedLayerType.textContent = layer.type.toUpperCase();
      dom.selectedLayerType.className = `layer-type-pill type-${layer.type}`;
    }

    if (dom.layerPromptInput) {
      dom.layerPromptInput.value = layer.prompt;
    }

    if (dom.layerOpacitySlider) {
      dom.layerOpacitySlider.value = layer.opacity;
    }
    if (dom.layerOpacityVal) {
      dom.layerOpacityVal.textContent = `${Math.round(layer.opacity * 100)}%`;
    }

    if (dom.layerBlendSelect) {
      dom.layerBlendSelect.value = layer.blendMode || 'source-over';
    }

    // Quick Prompt Pills
    if (dom.quickPromptPills && layer.mutationVariants) {
      dom.quickPromptPills.innerHTML = '';
      Object.keys(layer.mutationVariants).forEach(key => {
        const pill = document.createElement('button');
        pill.className = 'quick-pill';
        pill.textContent = `+ ${key}`;
        pill.addEventListener('click', () => {
          dom.layerPromptInput.value = layer.mutationVariants[key];
          triggerLayerReprompt();
        });
        dom.quickPromptPills.appendChild(pill);
      });
    }
  }

  // Layer-Targeted Reprompting (Targeted inpainting simulation)
  function triggerLayerReprompt() {
    const layer = getSelectedLayer();
    if (!layer || state.isGenerating) return;

    const newPrompt = dom.layerPromptInput.value.trim();
    if (!newPrompt) return;

    state.isGenerating = true;
    setStatus(`Synthesizing "${layer.name.split('•')[0]}"...`, true);

    // Show neural generation animation overlay on layer
    if (dom.generationOverlay && dom.generationText) {
      dom.generationText.textContent = `Neural inpainting on "${layer.name}"...`;
      dom.generationOverlay.classList.add('active');
    }

    setTimeout(() => {
      layer.prompt = newPrompt;
      updateLayerCanvas(layer.id);
      render3DStage();
      updateLayerTreeUI();

      state.isGenerating = false;
      if (dom.generationOverlay) dom.generationOverlay.classList.remove('active');
      setStatus('Ready');
      showToast(`Layer "${layer.name}" re-synthesized with targeted prompt!`, 'success');
    }, 950);
  }

  // Global Multi-Layer Generation
  function triggerGlobalGeneration() {
    if (state.isGenerating) return;
    const prompt = dom.globalPromptInput ? dom.globalPromptInput.value.trim() : '';
    if (!prompt) return;

    state.isGenerating = true;
    setStatus('Decomposing prompt into semantic layers...', true);

    if (dom.generationOverlay && dom.generationText) {
      dom.generationText.textContent = 'Decomposing scene into 4 discrete alpha layers...';
      dom.generationOverlay.classList.add('active');
    }

    setTimeout(() => {
      // Pick or mutate preset
      const currentIdx = window.IMAGINE_PRESETS.findIndex(p => p.id === state.currentPreset.id);
      const nextPreset = window.IMAGINE_PRESETS[(currentIdx + 1) % window.IMAGINE_PRESETS.length];
      loadPreset(nextPreset.id);

      state.isGenerating = false;
      if (dom.generationOverlay) dom.generationOverlay.classList.remove('active');
      setStatus('Ready');
      showToast(`Generated & Decomposed into ${state.layers.length} layers!`, 'success');
    }, 1400);
  }

  // Background Removal Tool on Selected Layer (Instant Alpha extraction)
  function executeBackgroundRemovalOnSelected() {
    const layer = getSelectedLayer();
    if (!layer || !layer._canvas) return;

    const canvas = layer._canvas;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Detect corner pixel / sample background luminance to remove
    const bgR = data[0];
    const bgG = data[1];
    const bgB = data[2];
    const threshold = state.bgRemovalThreshold;

    let removedPixels = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];

      const diff = Math.abs(r - bgR) + Math.abs(g - bgG) + Math.abs(b - bgB);
      // If close to sampled background, make alpha transparent
      if (diff < threshold * 3) {
        data[i+3] = 0;
        removedPixels++;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    render3DStage();
    updateLayerTreeUI();
    showToast(`Removed background on ${layer.name} (${removedPixels.toLocaleString()} pixels isolated)`, 'success');
  }

  // Single Layer Download (Transparent PNG)
  function downloadSingleLayer(layer) {
    if (!layer || !layer._canvas) return;
    
    const link = document.createElement('a');
    link.download = `imagine_${layer.id}_${layer.type}_transparent.png`;
    link.href = layer._canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded "${layer.name}" (Transparent PNG)`);
  }

  function downloadSelectedLayerPNG() {
    const layer = getSelectedLayer();
    if (layer) downloadSingleLayer(layer);
  }

  // Export Composite PNG
  function exportCompositePNG() {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1200;
    exportCanvas.height = 1200;
    const ctx = exportCanvas.getContext('2d');

    state.layers.forEach(layer => {
      if (layer.visible && layer._canvas) {
        ctx.globalAlpha = layer.opacity;
        ctx.globalCompositeOperation = layer.blendMode || 'source-over';
        ctx.drawImage(layer._canvas, 0, 0, 1200, 1200);
      }
    });

    const link = document.createElement('a');
    link.download = `imagine_composite_${state.currentPreset.id}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported full composite image!');
  }

  // Export All Layers Package
  function exportAllLayersPackage() {
    state.layers.forEach((layer, idx) => {
      setTimeout(() => {
        downloadSingleLayer(layer);
      }, idx * 250);
    });
    showToast(`Exporting all ${state.layers.length} layers as separate transparent PNGs...`);
  }

  // Initialize on load
  window.addEventListener('DOMContentLoaded', init);

})();
