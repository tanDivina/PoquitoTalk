// PoquitoTalk Web Funnel Logic & Studio Audio Demo Engine

const POQUITO_PRESETS = {
  'ac_leaking_water': {
    id: 'ac_leaking_water',
    title: 'A/C Leaking Water',
    input: 'Hi! My air conditioning is leaking water inside the bedroom.',
    levels: {
      1: 'Buenas, el aire acondicionado está botando agua en el cuarto. ¿Puede revisarlo?',
      2: '¡Buenas! El aire acondicionado está botando agua dentro del cuarto. ¿Podría venir a revisarlo?',
      3: '¡Qué xopa maestro! El split está botando buco agua en la recámara. ¿A qué hora puede pasar a chequearlo?',
      poquito: '¡Buenas! El aire acondicionado está botando agua dentro del cuarto. ¿Podría venir a revisarlo?',
      full_panameno: '¡Qué xopa maestro! El split está botando buco agua en la recámara. ¿A qué hora puede pasar a chequearlo?'
    },
    audio: 'diego_ac_leaking_water'
  },
  'boat_motor_wont_start': {
    id: 'boat_motor_wont_start',
    title: 'Boat Engine',
    input: "Hi! The outboard motor on my boat won't start at the dock.",
    levels: {
      1: 'Buenas, el motor de la lancha no arranca en el muelle. ¿Hace mecánica marina?',
      2: '¡Buenas Capitán! El motor fuera de borda no quiere arrancar en el muelle. ¿Hace trabajos de mecánica marina?',
      3: '¡Qué xopa Capitán! La panga se me quedó en el muelle y el motor no quiere prender. ¿Tiene chance de pasar hoy?',
      poquito: '¡Buenas Capitán! El motor fuera de borda no quiere arrancar en el muelle. ¿Hace trabajos de mecánica marina?',
      full_panameno: '¡Qué xopa Capitán! La panga se me quedó en el muelle y el motor no quiere prender. ¿Tiene chance de pasar hoy?'
    },
    audio: 'diego_boat_motor_wont_start'
  },
  'water_cistern_truck': {
    id: 'water_cistern_truck',
    title: 'Water Delivery Truck',
    input: 'Hello, we need an emergency water truck delivery for our 1,500-gallon cistern.',
    levels: {
      1: 'Buenas, necesitamos agua en camión para tanque de mil quinientos galones.',
      2: '¡Buenas! Necesitamos un viaje de agua en camión cisterna para un tanque de reserva de mil quinientos galones.',
      3: '¡Buenas compa! Estamos secos acá, necesitamos un viaje de agua de camión cisterna urgente para el tanque de 1,500 galones.',
      poquito: '¡Buenas! Necesitamos un viaje de agua en camión cisterna para un tanque de reserva de mil quinientos galones.',
      full_panameno: '¡Buenas compa! Estamos secos acá, necesitamos un viaje de agua de camión cisterna urgente para el tanque de 1,500 galones.'
    },
    audio: 'diego_water_cistern_truck'
  },
  'banking_atm_banconal': {
    id: 'banking_atm_banconal',
    title: 'Banco Nacional ATM',
    input: 'Hi! Does anyone know if the Banco Nacional ATM has cash today?',
    levels: {
      1: 'Buenas, ¿el cajero del Banco Nacional tiene dinero hoy?',
      2: '¡Buenas! ¿Alguien sabe si el cajero del Banco Nacional tiene plata disponible ahora mismo?',
      3: '¡Qué xopa gente! ¿Alguien sabe si el cajero de Banconal tiene plata o está sin efectivo hoy?',
      poquito: '¡Buenas! ¿Alguien sabe si el cajero del Banco Nacional tiene plata disponible ahora mismo?',
      full_panameno: '¡Qué xopa gente! ¿Alguien sabe si el cajero de Banconal tiene plata o está sin efectivo hoy?'
    },
    audio: 'diego_banking_atm_banconal'
  },
  'power_blackout_status': {
    id: 'power_blackout_status',
    title: 'Power Outage',
    input: 'Hi! Did the power go out in the whole area, or does anyone know when it comes back?',
    levels: {
      1: 'Buenas, ¿alguien sabe si hay luz por su sector?',
      2: '¡Buenas! ¿Se fue la luz en todo el sector o se sabe a qué hora regresará el servicio eléctrico?',
      3: '¡Qué xopa vecinos! ¿Se fue la luz en toda la isla o solo por acá? ¿Se sabe a qué hora regresa?',
      poquito: '¡Buenas! ¿Se fue la luz en todo el sector o se sabe a qué hora regresará el servicio eléctrico?',
      full_panameno: '¡Qué xopa vecinos! ¿Se fue la luz en toda la isla o solo por acá? ¿Se sabe a qué hora regresa?'
    },
    audio: 'diego_power_blackout_status'
  },
  'starlink_dish_offline': {
    id: 'starlink_dish_offline',
    title: 'Starlink Tech Support',
    input: 'Hello! My Starlink dish lost signal connection and shows offline.',
    levels: {
      1: 'Hola, la antena de Starlink no tiene señal. ¿Tiene servicio técnico?',
      2: '¡Hola! La antena de Starlink se quedó sin señal y no conecta. ¿Tiene servicio técnico disponible?',
      3: '¡Buenas amigo! El plato de Starlink se cayó y está offline total. ¿Hace instalaciones y chequeo de señal?',
      poquito: '¡Hola! La antena de Starlink se quedó sin señal y no conecta. ¿Tiene servicio técnico disponible?',
      full_panameno: '¡Buenas amigo! El plato de Starlink se cayó y está offline total. ¿Hace instalaciones y chequeo de señal?'
    },
    audio: 'diego_starlink_dish_offline'
  }
};

let currentPresetKey = 'ac_leaking_water';
let currentDemoLevel = 1;
let currentPoquitoTone = 'poquito'; // legacy fallback: 'poquito' | 'full_panameno'
let currentDemoVoice = 'Diego';
let activeDemoAudio = null;

const POQUITO_LABELS_EN = {
  1: 'Level 1: Casual & Friendly',
  2: 'Level 2: Direct & Clear',
  3: 'Level 3: Urgent / Panameño',
  poquito: 'Poquito: Friendly & Natural',
  full_panameno: 'Full Panameño: Local Dialect'
};

const POQUITO_LABELS_ES = {
  1: 'Nivel 1: Casual y Amable',
  2: 'Nivel 2: Directo y Claro',
  3: 'Nivel 3: Urgente / Panameño',
  poquito: 'Poquito: Amable y Natural',
  full_panameno: 'Full Panameño: Dialecto Local'
};

const MASCOT_DIALECT_TIPS_EN = {
  1: "<strong>Level 1 (Casual):</strong> Relaxed, polite, and friendly for routine island inquiries.",
  2: "<strong>Level 2 (Direct):</strong> Clear, respectful, and focused for scheduled services and bookings.",
  3: "<strong>Level 3 (Urgent):</strong> High priority Panamanian street dialect (¡Qué xopa!) for time-sensitive situations.",
  poquito: "<strong>Poquito:</strong> Natural Panamanian warmth - friendly, polite, and respectful.",
  full_panameno: "<strong>Poquito:</strong> ¡Qué xopa! Full Panameño with authentic local Panama phrasing."
};

const MASCOT_DIALECT_TIPS_ES = {
  1: "<strong>Nivel 1 (Casual):</strong> Relajado, educado y amable para consultas cotidianas en la isla.",
  2: "<strong>Nivel 2 (Directo):</strong> Claro, respetuoso y enfocado para contrataciones y citas.",
  3: "<strong>Nivel 3 (Urgente):</strong> Prioridad alta en dialecto panameño (¡Qué xopa!) para emergencias.",
  poquito: "<strong>Poquito:</strong> Calidez panameña natural - amable, educado y respetuoso.",
  full_panameno: "<strong>Poquito:</strong> ¡Qué xopa! Full Panameño con modismos y dialecto local de Panamá."
};

function getDisplayTranslation(presetKey, levelOrTone) {
  const preset = POQUITO_PRESETS[presetKey];
  if (!preset) return '';
  
  if (preset.levels) {
    if (levelOrTone === 1 || levelOrTone === '1' || levelOrTone === 'lvl1') {
      return preset.levels[1] || preset.levels.poquito;
    }
    if (levelOrTone === 2 || levelOrTone === '2' || levelOrTone === 'lvl2' || levelOrTone === 'poquito') {
      return preset.levels[2] || preset.levels.poquito;
    }
    if (levelOrTone === 3 || levelOrTone === '3' || levelOrTone === 'lvl3' || levelOrTone === 'full_panameno') {
      return preset.levels[3] || preset.levels.full_panameno;
    }
    if (preset.levels[levelOrTone]) {
      return preset.levels[levelOrTone];
    }
  }
  
  // Custom typed input fallback
  const customInput = document.getElementById('demo-input')?.value.trim() || '';
  return applyCustomPoquitoTone(customInput, levelOrTone);
}

function applyCustomPoquitoTone(rawText, levelOrTone) {
  if (!rawText) return '¡Buenas! ¿Cómo está?';
  const clean = rawText.replace(/^(¡Buenas!|Hola,|Buenas,|¡Buenas Capitán!|Buenas tardes,)/i, '').trim();
  const rest = clean.length > 0 ? (clean.charAt(0).toLowerCase() + clean.slice(1)) : '';
  
  if (levelOrTone === 1 || levelOrTone === '1') {
    return 'Buenas, ' + rest + '. ¿Tiene disponibilidad?';
  }
  if (levelOrTone === 2 || levelOrTone === '2' || levelOrTone === 'poquito') {
    return '¡Buenas! ' + rest + '. ¿Podría apoyarme con esto?';
  }
  if (levelOrTone === 3 || levelOrTone === '3' || levelOrTone === 'full_panameno') {
    return '¡Qué xopa compa! ' + rest + ', es urgente, quedo al pendiente.';
  }
  return rawText;
}

function setDemoLevel(level, btnElement) {
  currentDemoLevel = parseInt(level) || 1;
  currentPoquitoTone = currentDemoLevel === 3 ? 'full_panameno' : 'poquito';
  
  // 1. Sync Urgency buttons
  document.querySelectorAll('.urgency-btn, .urgency-level-btn, .segmented-btn').forEach(btn => {
    const btnLvl = btn.getAttribute('data-level');
    const btnTone = btn.getAttribute('data-tone');
    if ((btnLvl && parseInt(btnLvl) === currentDemoLevel) || (btnTone && btnTone === currentPoquitoTone)) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Track event
  if (window.PoquitoTracker) {
    window.PoquitoTracker.track('toggle_urgency_level', {
      level: currentDemoLevel,
      preset: typeof currentPresetKey !== 'undefined' ? currentPresetKey : 'custom'
    });
  }

  // 2. Corner mascot reaction animation
  cheerPoquito();

  // 3. Update Result Text with animation
  const resultEl = document.getElementById('result-text');
  if (resultEl) {
    const updatedText = getDisplayTranslation(currentPresetKey, currentDemoLevel);
    resultEl.style.opacity = '0.4';
    setTimeout(() => {
      resultEl.innerText = updatedText;
      resultEl.style.opacity = '1';
    }, 80);
  }

  // 4. Stop audio if playing
  if (activeDemoAudio) {
    activeDemoAudio.pause();
    activeDemoAudio.currentTime = 0;
    activeDemoAudio = null;
    updatePlayButtonState(false);
  }
}

function setPoquitoTone(tone) {
  const lvl = (tone === 'full_panameno') ? 3 : 2;
  setDemoLevel(lvl);
}

// Backward compatibility alias
function setPoquitoSlider(val) {
  setDemoLevel(parseInt(val) || 1);
}

function scrollToPlayStoreWaitlist(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
  const target = document.getElementById('playstore');
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => {
      const emailInput = document.getElementById('playstore-email-en') || document.querySelector('.playstore-input');
      if (emailInput) {
        emailInput.focus();
      }
    }, 550);
  }
}

function cheerPoquito() {
  const cornerMascot = document.getElementById('poquito-corner-mascot-wrapper') || document.querySelector('.poquito-corner-mascot-wrapper') || document.querySelector('.poquito-mascot-svg');
  if (cornerMascot) {
    cornerMascot.classList.remove('cheer-active');
    void cornerMascot.offsetWidth;
    cornerMascot.classList.add('cheer-active');
  }
}

function setDemoPreset(presetKey, btnElement) {
  currentPresetKey = presetKey;
  
  // Highlight active preset button
  document.querySelectorAll('.presets-pills .pill-btn').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const preset = POQUITO_PRESETS[presetKey];
  if (!preset) return;

  const inputEl = document.getElementById('demo-input');
  if (inputEl) inputEl.value = preset.input;

  const resultEl = document.getElementById('result-text');
  if (resultEl) resultEl.innerText = getDisplayTranslation(presetKey, currentDemoLevel);

  const resultBox = document.getElementById('result-box');
  if (resultBox) resultBox.style.display = 'block';

  // Stop any playing audio
  if (activeDemoAudio) {
    activeDemoAudio.pause();
    activeDemoAudio.currentTime = 0;
    activeDemoAudio = null;
  }
  updatePlayButtonState(false);
}

let demoInputTimer = null;
function handleDemoInput(val) {
  clearTimeout(demoInputTimer);
  demoInputTimer = setTimeout(() => {
    const input = val.trim();
    if (!input) return;

    let matchedKey = null;
    const lowerInput = input.toLowerCase();

    for (const [key, preset] of Object.entries(POQUITO_PRESETS)) {
      if (preset.input.toLowerCase() === lowerInput) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      currentPresetKey = matchedKey;
      document.querySelectorAll('.presets-pills .pill-btn').forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(matchedKey)) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    const resultText = getDisplayTranslation(currentPresetKey, currentDemoLevel);
    const resultEl = document.getElementById('result-text');
    if (resultEl) resultEl.innerText = resultText;
    
    if (activeDemoAudio) {
      activeDemoAudio.pause();
      activeDemoAudio.currentTime = 0;
      activeDemoAudio = null;
      updatePlayButtonState(false);
    }
  }, 180);
}

function selectDemoVoice(name, btnElement) {
  currentDemoVoice = name;
  document.querySelectorAll('.voice-chip-btn, .voice-pill-btn').forEach(btn => {
    const v = btn.getAttribute('data-voice') || '';
    if (v.toLowerCase() === name.toLowerCase()) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  if (activeDemoAudio) {
    activeDemoAudio.pause();
    activeDemoAudio.currentTime = 0;
    activeDemoAudio = null;
  }
  updatePlayButtonState(false);

  if (window.PoquitoTracker) {
    window.PoquitoTracker.track('select_demo_voice', { voice: name });
  }
}

function runDemoTranslation() {
  const input = document.getElementById('demo-input').value.trim();
  if (!input) return;

  let matchedKey = currentPresetKey;
  const lowerInput = input.toLowerCase();

  for (const [key, preset] of Object.entries(POQUITO_PRESETS)) {
    if (preset.input.toLowerCase() === lowerInput) {
      matchedKey = key;
      break;
    }
  }

  currentPresetKey = matchedKey;
  const resultText = getDisplayTranslation(matchedKey, currentDemoLevel);

  const resultEl = document.getElementById('result-text');
  if (resultEl) resultEl.innerText = resultText;
  const resultBox = document.getElementById('result-box');
  if (resultBox) resultBox.style.display = 'block';

  if (activeDemoAudio) {
    activeDemoAudio.pause();
    activeDemoAudio.currentTime = 0;
    activeDemoAudio = null;
    updatePlayButtonState(false);
  }
}

function playDemoAudio() {
  const isSpanish = window.location.pathname.includes('/es/');
  const voice = (currentDemoVoice || 'Diego').toLowerCase();
  
  // Resolve relative audio path for web-funnel or es/ subfolder
  const basePath = isSpanish ? '../audio/presets/' : 'audio/presets/';
  
  // Exact level suffix: _lvl1, _lvl2, or _lvl3
  const levelSuffix = `_lvl${currentDemoLevel || 1}`;
  const cacheBust = Date.now();
  const audioSrc = `${basePath}${voice}_${currentPresetKey}${levelSuffix}.mp3?v=${cacheBust}`;
  const fallbackSrc = `${basePath}${voice}_${currentPresetKey}.mp3?v=${cacheBust}`;
  const defaultFallback = `${basePath}diego_${currentPresetKey}${levelSuffix}.mp3?v=${cacheBust}`;

  if (activeDemoAudio && !activeDemoAudio.paused) {
    activeDemoAudio.pause();
    activeDemoAudio.currentTime = 0;
    activeDemoAudio = null;
    updatePlayButtonState(false);
    return;
  }

  updatePlayButtonState(true);

  if (window.PoquitoTracker) {
    window.PoquitoTracker.track('play_voice_demo', {
      voice: currentDemoVoice,
      preset: currentPresetKey,
      level: currentDemoLevel,
      src: audioSrc
    });
  }

  activeDemoAudio = new Audio(audioSrc);
  activeDemoAudio.play().catch(err => {
    console.warn(`Specific audio ${audioSrc} not found, trying fallback:`, err);
    activeDemoAudio = new Audio(fallbackSrc);
    activeDemoAudio.play().catch(err2 => {
      activeDemoAudio = new Audio(defaultFallback);
      activeDemoAudio.play().catch(err3 => {
        console.error("Audio playback error:", err3);
        updatePlayButtonState(false);
      });
    });
  });

  activeDemoAudio.onended = () => {
    updatePlayButtonState(false);
  };
}

function updatePlayButtonState(isPlaying) {
  const isSpanish = window.location.pathname.includes('/es/');
  const playBtn = document.getElementById('play-audio-btn');
  const playBtnEs = document.getElementById('play-audio-btn-es');

  // Toggle transmitting radio waves & LED on corner mascot
  const cornerMascot = document.getElementById('poquito-corner-mascot-wrapper') || document.querySelector('.poquito-corner-mascot-wrapper');
  if (cornerMascot) {
    if (isPlaying) {
      cornerMascot.classList.add('transmitting');
    } else {
      cornerMascot.classList.remove('transmitting');
    }
  }

  if (playBtn) {
    if (isPlaying) {
      playBtn.classList.add('playing');
      playBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: text-bottom;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Playing Voice Note...`;
    } else {
      playBtn.classList.remove('playing');
      playBtn.innerHTML = `<svg class="play-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: text-bottom;"><polygon points="5 3 19 12 5 21 5 3"/></svg> Listen to Voice Note`;
    }
  }

  if (playBtnEs) {
    if (isPlaying) {
      playBtnEs.classList.add('playing');
      playBtnEs.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: text-bottom;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Reproduciendo Nota de Voz...`;
    } else {
      playBtnEs.classList.remove('playing');
      playBtnEs.innerHTML = `<svg class="play-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px; vertical-align: text-bottom;"><polygon points="5 3 19 12 5 21 5 3"/></svg> Escuchar Nota de Voz`;
    }
  }
}

function sendDemoWhatsApp() {
  const text = document.getElementById('result-text').innerText;
  if (!text) return;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function initiateStripeCheckout(plan) {
  const planNames = {
    'annual_pass': {
      name: 'PoquitoTalk Annual Explorer Pass',
      price: '$39.99/year ($3.33/mo)',
      stripeUrl: 'https://buy.stripe.com/test_3cIaEXcXX4Ka31k0534sE01',
      isDirectPay: true
    },
    'monthly_pass': {
      name: 'PoquitoTalk Monthly Resident Pass',
      price: '$9.99/month',
      stripeUrl: 'https://buy.stripe.com/test_28EaEX5vv7WmcBUdVT4sE02',
      isDirectPay: true
    },
    'tourist_weekly': { 
      name: '7-Day Travel Pass', 
      price: '$4.99 (7 Days Access • 100 Notes / 20 Live Sessions)', 
      stripeUrl: 'https://buy.stripe.com/test_8x24gz3nn7WmgSa8Bz4sE03',
      isDirectPay: true 
    },
    'credits_50': { 
      name: '50 Poquito Credits Pack (Never Expires)', 
      price: '$3.74 (Reg. $4.99 • 25% Off Web Promo)', 
      stripeUrl: 'https://buy.stripe.com/8x214n3nngsS6dw8Bz4sE0b',
      isDirectPay: true 
    }
  };
  const selected = planNames[plan] || planNames['credits_50'];

  // Direct Pay for all plans (Zero friction - goes straight to Stripe Checkout)
  if (selected.isDirectPay && selected.stripeUrl) {
    window.location.href = selected.stripeUrl;
    return;
  }
}

// Feedback Drawer Logic & FormSubmit.co Email Dispatch
let selectedCategory = 'Feature Request';
let selectedRating = 5;

function openFeedbackDrawer() {
  document.getElementById('feedback-drawer').classList.add('open');
  document.getElementById('feedback-drawer-overlay').classList.add('open');
  setRating(5);
}

function closeFeedbackDrawer() {
  document.getElementById('feedback-drawer').classList.remove('open');
  document.getElementById('feedback-drawer-overlay').classList.remove('open');
}

function selectCategory(btn) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedCategory = btn.getAttribute('data-cat');
}

function setRating(val) {
  selectedRating = val;
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, idx) => {
    if (idx < val) {
      star.classList.add('filled');
    } else {
      star.classList.remove('filled');
    }
  });
}

async function submitWebFeedback(e) {
  e.preventDefault();
  const comment = document.getElementById('fb-comment').value.trim();
  const email = document.getElementById('fb-email').value.trim();
  if (!comment) return;

  const btn = document.getElementById('fb-submit-btn');
  btn.innerText = 'Sending Feedback...';
  btn.disabled = true;

  const payload = {
    _subject: `[PoquitoTalk Feedback] ${selectedCategory} (${selectedRating}★)`,
    Category: selectedCategory,
    Rating: `${selectedRating} Out of 5 Stars`,
    Comment: comment,
    Email: email || 'Anonymous (Bocas Web Visitor)',
    PageURL: window.location.href,
    SubmittedAt: new Date().toLocaleString('en-US', { timeZone: 'America/Panama' }),
    _captcha: 'false'
  };

  try {
    await fetch('https://formsubmit.co/ajax/support@hero-apps.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('FormSubmit dispatch error:', err);
  }

  // Local storage history
  try {
    const history = JSON.parse(localStorage.getItem('poquitotalk_web_feedback') || '[]');
    history.unshift({ ...payload, id: Date.now() });
    localStorage.setItem('poquitotalk_web_feedback', JSON.stringify(history));
  } catch (e) {}

  if (window.PoquitoTracker) {
    window.PoquitoTracker.track('feedback_submit', {
      category: selectedCategory,
      rating: selectedRating
    });
  }

  document.getElementById('feedback-form').style.display = 'none';
  document.getElementById('fb-success-msg').style.display = 'block';
}

// Cookie Consent Banner & Waitlist Persistence Handling
window.addEventListener('DOMContentLoaded', () => {
  const consent = localStorage.getItem('poquitotalk_cookie_consent');
  if (!consent) {
    setTimeout(() => {
      const banner = document.getElementById('cookie-banner');
      if (banner) banner.classList.add('show');
    }, 1000);
  }

  // Check if user already signed up for Google Play Store waitlist
  try {
    const waitlist = JSON.parse(localStorage.getItem('poquitotalk_playstore_waitlist') || '[]');
    if (waitlist.length > 0) {
      ['playstore-form-en', 'playstore-form-es'].forEach(id => {
        const form = document.getElementById(id);
        const isEs = id.endsWith('-es');
        const successBox = document.getElementById(isEs ? 'playstore-success-es' : 'playstore-success-en');
        if (form && successBox) {
          form.style.display = 'none';
          successBox.style.display = 'flex';
        }
      });
    }
  } catch (e) {}

  // Check if user already registered as contractor
  try {
    const registrations = JSON.parse(localStorage.getItem('poquitotalk_provider_registration') || '[]');
    if (registrations.length > 0) {
      ['contractor-form-en', 'contractor-form-es'].forEach(id => {
        const form = document.getElementById(id);
        const isEs = id.endsWith('-es');
        const successBox = document.getElementById(isEs ? 'contractor-success-es' : 'contractor-success-en');
        if (form && successBox) {
          form.style.display = 'none';
          successBox.style.display = 'flex';
        }
      });
    }
  } catch (e) {}
});

function acceptCookieConsent() {
  localStorage.setItem('poquitotalk_cookie_consent', 'true');
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.classList.remove('show');
}

// Interactive FAQ Accordion Toggle
function toggleFaq(target) {
  const card = target.closest ? target.closest('.faq-card') : target;
  if (!card) return;
  const isOpen = card.classList.contains('open');
  document.querySelectorAll('.faq-card').forEach(c => c.classList.remove('open'));
  if (!isOpen) {
    card.classList.add('open');
  }
}

// Google Play Store Waitlist Sign-up Handler (FormSubmit.co AJAX + LocalStorage Caching)
async function submitPlayStoreSignup(e, formId) {
  e.preventDefault();
  const isSpanish = formId.endsWith('-es');
  const emailInput = document.getElementById(isSpanish ? 'playstore-email-es' : 'playstore-email-en');
  const submitBtn = document.getElementById(isSpanish ? 'playstore-btn-es' : 'playstore-btn-en');
  const successBox = document.getElementById(isSpanish ? 'playstore-success-es' : 'playstore-success-en');
  const formElement = document.getElementById(formId);

  const email = emailInput ? emailInput.value.trim() : '';
  if (!email || !email.includes('@')) return;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>${isSpanish ? 'Enviando...' : 'Registering...'}</span>`;
  }

  const payload = {
    _subject: `[PoquitoTalk Play Store Waitlist] New Android Sign-Up`,
    Email: email,
    Source: 'PoquitoTalk Web Funnel',
    Language: isSpanish ? 'Spanish (es-PA)' : 'English (en-US)',
    SubmittedAt: new Date().toLocaleString('en-US', { timeZone: 'America/Panama' }),
    PageURL: window.location.href,
    _captcha: 'false'
  };

  try {
    await fetch('https://formsubmit.co/ajax/support@hero-apps.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('FormSubmit dispatch error:', err);
  }

  // Dispatch to private server-side database
  try {
    const apiPath = window.location.pathname.includes('/es/') ? '../api/waitlist.php' : 'api/waitlist.php';
    await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, Type: 'playstore' })
    });
  } catch (err) {
    console.warn('Server API waitlist error:', err);
  }

  // Cache locally to prevent redundant submissions
  try {
    const history = JSON.parse(localStorage.getItem('poquitotalk_playstore_waitlist') || '[]');
    history.unshift({ ...payload, timestamp: Date.now() });
    localStorage.setItem('poquitotalk_playstore_waitlist', JSON.stringify(history));
  } catch (e) {}

  // Explicitly track high-value conversion event
  if (window.PoquitoTracker) {
    window.PoquitoTracker.track('waitlist_submit', {
      language: isSpanish ? 'es' : 'en',
      form: formId
    });
  }

  if (formElement) formElement.style.display = 'none';
  if (successBox) successBox.style.display = 'flex';
}

// Contractor Registration Handler (FormSubmit.co AJAX + Server Storage + LocalStorage)
async function submitContractorRegistration(e, formId) {
  e.preventDefault();
  const isSpanish = formId.endsWith('-es');
  const nameInput = document.getElementById(isSpanish ? 'contractor-name-es' : 'contractor-name-en');
  const tradeSelect = document.getElementById(isSpanish ? 'contractor-trade-es' : 'contractor-trade-en');
  const locationSelect = document.getElementById(isSpanish ? 'contractor-location-es' : 'contractor-location-en');
  const phoneInput = document.getElementById(isSpanish ? 'contractor-phone-es' : 'contractor-phone-en');
  const emailInput = document.getElementById(isSpanish ? 'contractor-email-es' : 'contractor-email-en');
  const websiteInput = document.getElementById(isSpanish ? 'contractor-website-es' : 'contractor-website-en');
  const notesInput = document.getElementById(isSpanish ? 'contractor-notes-es' : 'contractor-notes-en');
  const submitBtn = document.getElementById(isSpanish ? 'contractor-submit-es' : 'contractor-submit-en');
  const successBox = document.getElementById(isSpanish ? 'contractor-success-es' : 'contractor-success-en');
  const formElement = document.getElementById(formId);

  // Aggregate checked languages
  const langCheckboxes = document.querySelectorAll(`input[name="${isSpanish ? 'contractor-lang-es' : 'contractor-lang-en'}"]:checked`);
  const selectedLanguages = Array.from(langCheckboxes).map(cb => cb.value).join(', ');

  const name = nameInput ? nameInput.value.trim() : '';
  const trade = tradeSelect ? tradeSelect.value : '';
  const location = locationSelect ? locationSelect.value : '';
  const phone = phoneInput ? phoneInput.value.trim() : '';
  const website = websiteInput ? websiteInput.value.trim() : '';

  if (!name || !trade || !location || !phone) return;

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>${isSpanish ? 'Registrando...' : 'Registering...'}</span>`;
  }

  const payload = {
    _subject: `[PoquitoTalk Bocas Directory] New Provider: ${name} (${trade})`,
    BusinessName: name,
    TradeCategory: trade,
    PrimaryLocation: location,
    LanguagesSpoken: selectedLanguages || 'Español',
    WhatsAppPhone: phone,
    Email: emailInput ? emailInput.value.trim() || 'N/A' : 'N/A',
    Website: website || 'N/A',
    website: website || 'N/A',
    ServiceSummary: notesInput ? notesInput.value.trim() || 'N/A' : 'N/A',
    SubmittedAt: new Date().toLocaleString('en-US', { timeZone: 'America/Panama' }),
    PageURL: window.location.href,
    _captcha: 'false'
  };

  try {
    await fetch('https://formsubmit.co/ajax/support@hero-apps.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn('FormSubmit dispatch error:', err);
  }

  // Dispatch to private server-side database
  try {
    const apiPath = window.location.pathname.includes('/es/') ? '../api/waitlist.php' : 'api/waitlist.php';
    await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, Type: 'contractor' })
    });
  } catch (err) {
    console.warn('Server API contractor error:', err);
  }

  // Cache registration locally
  try {
    const history = JSON.parse(localStorage.getItem('poquitotalk_provider_registration') || '[]');
    history.unshift({ ...payload, timestamp: Date.now() });
    localStorage.setItem('poquitotalk_provider_registration', JSON.stringify(history));
  } catch (e) {}

  if (formElement) formElement.style.display = 'none';
  if (successBox) successBox.style.display = 'flex';
}



// --- COMMUNITY VOUCHES & 1-TAP POST-WHATSAPP CHECK-IN ENGINE ---

let communityVouchesCache = {};
let activeContactProvider = null;

async function loadCommunityVouches() {
  try {
    const isSpanish = window.location.pathname.includes('/es/');
    const apiPath = isSpanish ? '../api/vouch.php' : 'api/vouch.php';
    const res = await fetch(apiPath);
    if (!res.ok) return;
    const data = await res.json();
    if (data.success && data.data) {
      communityVouchesCache = data.data;
      applyVouchesToDOM();
    }
  } catch (e) {
    console.warn('Could not load community vouches:', e);
  }
}

function formatVouchBadgeContent(count, isSpanish) {
  const num = parseInt(count, 10) || 0;
  const label = isSpanish
    ? (num === 1 ? 'Recomendación' : 'Recomendaciones')
    : (num === 1 ? 'Vouch' : 'Vouches');
  return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> <span class="vouch-count">${num}</span> ${label}`;
}

function applyVouchesToDOM() {
  const isSpanish = window.location.pathname.includes('/es/') || document.documentElement.lang === 'es';
  document.querySelectorAll('.vouch-badge').forEach(badge => {
    const pid = badge.getAttribute('data-provider-id');
    if (!pid) return;

    // Check if user already vouched locally
    const hasVouchedLocally = localStorage.getItem('poquito_vouched_' + pid) === 'true';
    if (hasVouchedLocally) {
      badge.classList.add('vouched');
    }

    if (communityVouchesCache[pid] && typeof communityVouchesCache[pid].count === 'number') {
      const count = communityVouchesCache[pid].count;
      badge.innerHTML = formatVouchBadgeContent(count, isSpanish);
    }
  });
}

function initiateProviderContact(providerId, providerName, targetUrl, contactType = 'whatsapp') {
  activeContactProvider = { id: providerId, name: providerName };

  if (window.PoquitoTracker) {
    window.PoquitoTracker.track(contactType === 'call' ? 'call_click' : 'whatsapp_click', {
      provider_id: providerId,
      provider_name: providerName,
      target_url: targetUrl
    });
  }

  // Set up return listener for check-in modal
  const handleReturn = () => {
    window.removeEventListener('focus', handleReturn);
    setTimeout(() => {
      openPostContactModal(providerId, providerName);
    }, 600);
  };

  window.addEventListener('focus', handleReturn);

  // Open WhatsApp or phone dialer
  if (contactType === 'whatsapp' || targetUrl.startsWith('http')) {
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = targetUrl;
  }
}

function openPostContactModal(providerId, providerName) {
  // If already vouched, don't nag
  if (localStorage.getItem('poquito_vouched_' + providerId) === 'true') {
    return;
  }

  activeContactProvider = { id: providerId, name: providerName };
  const modal = document.getElementById('postContactModal');
  const nameEl = document.getElementById('postContactProviderName');
  if (nameEl) nameEl.innerText = providerName;
  if (modal) modal.classList.add('active');
}

function closePostContactModal() {
  const modal = document.getElementById('postContactModal');
  if (modal) modal.classList.remove('active');
  activeContactProvider = null;
}

async function submitCommunityVouch(reason) {
  if (!activeContactProvider || !activeContactProvider.id) return;
  const pid = activeContactProvider.id;
  const isSpanish = window.location.pathname.includes('/es/') || document.documentElement.lang === 'es';

  // Mark local storage immediately
  localStorage.setItem('poquito_vouched_' + pid, 'true');

  // Update DOM badge immediately
  const badge = document.querySelector(`#${pid} .vouch-badge, button[data-provider-id="${pid}"]`);
  if (badge) {
    badge.classList.add('vouched');
    const countEl = badge.querySelector('.vouch-count');
    const current = countEl ? (parseInt(countEl.innerText, 10) || 0) : 0;
    const newCount = current + 1;
    badge.innerHTML = formatVouchBadgeContent(newCount, isSpanish);
  }

  closePostContactModal();

  // Send to server
  try {
    const apiPath = isSpanish ? '../api/vouch.php' : 'api/vouch.php';
    await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId: pid, reason: reason })
    });
  } catch (e) {
    console.warn('Server vouch error:', e);
  }
}

// --- CLAIM & UPDATE LISTING ENGINE ---

let activeClaimTarget = null;

function openClaimModal(providerId, providerName, phone) {
  activeClaimTarget = { id: providerId, name: providerName, phone: phone };

  const modal = document.getElementById('claimListingModal');
  const targetNameEl = document.getElementById('claimTargetName');
  const phoneDisplayEl = document.getElementById('claimCurrentPhoneDisplay');
  const hiddenIdEl = document.getElementById('claimProviderId');
  const hiddenNameEl = document.getElementById('claimProviderName');
  const waBtnEl = document.getElementById('claimDirectWABtn');

  if (targetNameEl) targetNameEl.innerText = providerName;
  if (phoneDisplayEl) phoneDisplayEl.innerText = phone || 'Teléfono no especificado';
  if (hiddenIdEl) hiddenIdEl.value = providerId;
  if (hiddenNameEl) hiddenNameEl.value = providerName;

  if (waBtnEl) {
    const isSpanish = window.location.pathname.includes('/es/');
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    const message = isSpanish
      ? 'Hola PoquitoTalk, soy el dueño de ' + providerName + ' (' + phone + '). Solicito verificar mi perfil [#CLAIM-' + cleanPhone + '].'
      : 'Hi PoquitoTalk, I am the owner of ' + providerName + ' (' + phone + '). I would like to verify my listing [#CLAIM-' + cleanPhone + '].';
    waBtnEl.href = 'https://wa.me/50762625817?text=' + encodeURIComponent(message);
  }

  if (modal) modal.classList.add('active');
}

function closeClaimModal() {
  const modal = document.getElementById('claimListingModal');
  if (modal) modal.classList.remove('active');
  activeClaimTarget = null;
}

function switchClaimTab(tabName) {
  document.querySelectorAll('.claim-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const tabWhatsApp = document.getElementById('claimTabWhatsApp');
  const tabCedula = document.getElementById('claimTabCedula');

  if (tabName === 'whatsapp') {
    if (tabWhatsApp) tabWhatsApp.style.display = 'block';
    if (tabCedula) tabCedula.style.display = 'none';
  } else {
    if (tabWhatsApp) tabWhatsApp.style.display = 'none';
    if (tabCedula) tabCedula.style.display = 'block';
  }
}

async function submitCedulaClaimForm(e) {
  e.preventDefault();
  const isSpanish = window.location.pathname.includes('/es/');
  const submitBtn = document.getElementById('claimCedulaSubmitBtn');
  const fileInput = document.getElementById('claimCedulaFile');

  const claimantName = document.getElementById('claimantFullName')?.value.trim() || '';
  const newPhone = document.getElementById('claimantNewPhone')?.value.trim() || '';
  const requestedChanges = {
    name: document.getElementById('claimNewBusinessName')?.value.trim() || '',
    phone: newPhone,
    hours: document.getElementById('claimNewHours')?.value.trim() || '',
    description: document.getElementById('claimNewDescription')?.value.trim() || ''
  };

  if (!claimantName || !newPhone) {
    alert(isSpanish ? 'Por favor ingresa tu nombre y número de WhatsApp.' : 'Please enter your name and WhatsApp number.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = isSpanish ? 'Enviando Verificación...' : 'Submitting Verification...';
  }

  let idPhotoBase64 = '';
  if (fileInput && fileInput.files && fileInput.files[0]) {
    try {
      idPhotoBase64 = await toBase64(fileInput.files[0]);
    } catch (e) {}
  }

  const payload = {
    provider_id: activeClaimTarget ? activeClaimTarget.id : '',
    provider_name: activeClaimTarget ? activeClaimTarget.name : '',
    verification_method: 'cedula_id',
    claimant_name: claimantName,
    current_phone: activeClaimTarget ? activeClaimTarget.phone : '',
    new_phone: newPhone,
    requested_changes: requestedChanges,
    id_photo_base64: idPhotoBase64
  };

  try {
    const apiPath = isSpanish ? '../api/claim_listing.php' : 'api/claim_listing.php';
    const res = await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    
    alert(isSpanish 
      ? '¡Solicitud Recibida con Éxito!\n\nHemos registrado tus cambios y documento de identidad para revisión prioritaria. Te contactaremos al ' + newPhone + ' una vez verificado.'
      : 'Claim & Update Submitted!\n\nYour changes and ID document have been queued for priority review. We will reach out to ' + newPhone + ' once verified.');
    
    closeClaimModal();
  } catch (err) {
    alert(isSpanish ? 'Error al enviar. Intenta de nuevo.' : 'Error submitting. Please try again.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = isSpanish ? 'Enviar para Verificación' : 'Submit for Verification';
    }
  }
}

// --- RECOMMEND A LOCAL PRO (COMMUNITY DEDUPLICATION) ---
let matchedExistingProvider = null;

function openRecommendModal() {
  const modal = document.getElementById('recommendProModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeRecommendModal() {
  const modal = document.getElementById('recommendProModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}

function normalizePhoneDigits(raw) {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('507') && digits.length === 11) return digits;
  if (digits.length === 8) return '507' + digits;
  return digits;
}

function checkRecommendPhoneDuplicate(rawPhone) {
  const isSpanish = window.location.pathname.includes('/es/');
  const normalized = normalizePhoneDigits(rawPhone);
  const alertBox = document.getElementById('recMatchAlert');
  const alertText = document.getElementById('recMatchText');
  const nameGroup = document.getElementById('recNameGroup');
  const catGroup = document.getElementById('recCategoryGroup');
  const submitBtnLabel = document.getElementById('recSubmitBtnLabel');

  if (!normalized || normalized.length < 7) {
    matchedExistingProvider = null;
    if (alertBox) alertBox.style.display = 'none';
    if (nameGroup) nameGroup.style.display = 'block';
    if (catGroup) catGroup.style.display = 'block';
    if (submitBtnLabel) {
      submitBtnLabel.innerText = isSpanish ? 'Agregar al Directorio Comunitario' : 'Add Pro to Bocas Directory';
    }
    return;
  }

  // Scan current DOM cards for matching phone
  const allCards = document.querySelectorAll('.dir-card');
  let found = null;

  allCards.forEach((card) => {
    const cardText = card.innerText || '';
    const digitsInCard = normalizePhoneDigits(cardText);
    if (digitsInCard.includes(normalized) || normalized.includes(digitsInCard)) {
      const titleEl = card.querySelector('.dir-title');
      found = {
        id: card.id,
        name: titleEl ? titleEl.innerText : 'Listed Provider'
      };
    }
  });

  if (found) {
    matchedExistingProvider = found;
    if (alertBox) alertBox.style.display = 'block';
    if (alertText) {
      alertText.innerHTML = isSpanish
        ? `<strong>${found.name}</strong> ya está registrado. Al enviar, sumaremos tu recomendación y voto a su perfil existente sin duplicarlo.`
        : `<strong>${found.name}</strong> is already listed in the Bocas directory. Submitting will add your recommendation & vouch note to their existing profile.`;
    }
    if (nameGroup) nameGroup.style.display = 'none';
    if (catGroup) catGroup.style.display = 'none';
    if (submitBtnLabel) {
      submitBtnLabel.innerText = isSpanish ? '+ Agregar Mi Voto y Recomendación' : '+ Add My Vouch & Recommendation';
    }
  } else {
    matchedExistingProvider = null;
    if (alertBox) alertBox.style.display = 'none';
    if (nameGroup) nameGroup.style.display = 'block';
    if (catGroup) catGroup.style.display = 'block';
    if (submitBtnLabel) {
      submitBtnLabel.innerText = isSpanish ? 'Agregar al Directorio Comunitario' : 'Add Pro to Bocas Directory';
    }
  }
}

async function submitRecommendProForm(event) {
  event.preventDefault();
  const isSpanish = window.location.pathname.includes('/es/');
  const phone = document.getElementById('recPhone')?.value.trim() || '';
  const name = document.getElementById('recName')?.value.trim() || '';
  const category = document.getElementById('recCategory')?.value || 'WATER_TAXI';
  const notes = document.getElementById('recNotes')?.value.trim() || '';
  const nominatedBy = document.getElementById('recNominatedBy')?.value.trim() || '';
  const submitBtn = document.getElementById('recSubmitBtn');

  if (!phone) {
    alert(isSpanish ? 'Por favor ingresa el número de WhatsApp del profesional.' : 'Please enter the provider WhatsApp number.');
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = isSpanish ? 'Registrando...' : 'Submitting...';
  }

  const payload = {
    provider_id: matchedExistingProvider ? matchedExistingProvider.id : ('rec_' + Date.now()),
    is_existing_merge: !!matchedExistingProvider,
    name: matchedExistingProvider ? matchedExistingProvider.name : name,
    phone: phone,
    category: category,
    notes: notes,
    nominated_by: nominatedBy
  };

  try {
    const apiPath = isSpanish ? '../api/vouch.php' : 'api/vouch.php';
    await fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {}

  alert(isSpanish
    ? '¡Muchas gracias! Tu recomendación fue registrada con éxito para la comunidad de Bocas del Toro 🇵🇦'
    : 'Thank you! Your recommendation was successfully registered for the Bocas del Toro community 🇵🇦');

  closeRecommendModal();
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.innerText = isSpanish ? 'Agregar al Directorio Comunitario' : 'Add Pro to Bocas Directory';
  }
}

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function loadDynamicContractorsToDirectory() {
  const grid = document.getElementById('directoryGrid');
  if (!grid) return;

  try {
    const isSpanish = window.location.pathname.includes('/es/');
    const apiPath = isSpanish ? '../api/contractors.php' : 'api/contractors.php';
    const res = await fetch(apiPath);
    if (!res.ok) return;
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) return;

    // Filter out standard permanent banks and water taxis
    const dynamicOnes = data.data.filter(item => 
      item.id && (
        item.id.startsWith('contractor-') || 
        item.id.startsWith('contractor_') || 
        item.id.startsWith('sub_') ||
        item.id.startsWith('fb_') ||
        item.id.startsWith('place_') ||
        (item.category && item.category !== 'WATER_TAXI' && item.category !== 'BANKING')
      )
    );

    // Find the first boat captain card to insert contractors before the long captain list
    const firstCaptain = document.querySelector('.dir-card[data-cat="WATER_TAXI"]');

    dynamicOnes.forEach(c => {
      if (document.getElementById(c.id)) return;

      const locMeta = deriveLocationMeta(c.location, c.name, c.description);
      const card = document.createElement('div');
      card.className = 'dir-card';
      
      const isGardening = (c.category && (c.category.includes('GARDEN') || c.category.includes('PLANT') || c.category.includes('JARDIN'))) ||
                          /jard[ií]n|planta|vivero|garden|plant|landscap/i.test(c.category_label || '') ||
                          (c.name && /jard[ií]n|planta|vivero|garden|plant/i.test(c.name)) ||
                          (c.description && /jard[ií]n|planta|vivero|garden|plant|chapeo/i.test(c.description));

      const isTaxiLand = (c.category && (c.category.includes('TAXI') || c.category.includes('RENTAL') || c.category.includes('CAR') || c.category === 'TRANSPORT')) ||
                         /car|taxi|rental|auto|utv|4x4|transport/i.test(c.category_label || '') ||
                         (c.name && /car|rental|taxi|utv|bike|scooter/i.test(c.name)) ||
                         (c.description && /car|rental|taxi|utv|4x4|scooter|bike/i.test(c.description));

      let cardCat = c.category || 'CONTRACTORS';
      let tradeLabel = isSpanish ? (c.category_label || 'Servicio Verificado') : (c.category_label_en || c.category_label || 'Verified Service');

      if (c.category === 'HOTEL') {
        cardCat = 'HOTEL';
        tradeLabel = isSpanish ? 'Hoteles y Hospedaje' : 'Hotels & Lodging';
      } else if (c.category === 'RESTAURANT') {
        cardCat = 'RESTAURANT';
        tradeLabel = isSpanish ? 'Restaurante y Café' : 'Restaurant & Dining';
      } else if (c.category === 'HARDWARE') {
        cardCat = 'HARDWARE';
        tradeLabel = isSpanish ? 'Ferretería y Materiales' : 'Hardware & Supplies';
      } else if (c.category === 'MEDICAL') {
        cardCat = 'MEDICAL';
        tradeLabel = isSpanish ? 'Atención Médica y Farmacia' : 'Medical & Pharmacy';
      } else if (c.category === 'MECHANIC') {
        cardCat = 'MECHANIC';
        tradeLabel = isSpanish ? 'Taller y Motores Marinos' : 'Marine & Auto Repair';
      } else if (c.category === 'SUPERMARKET') {
        cardCat = 'RESTAURANT';
        tradeLabel = isSpanish ? 'Supermercado y Abastos' : 'Supermarket & Groceries';
      } else if (c.category === 'MARINE') {
        cardCat = 'WATER_TAXI';
        tradeLabel = isSpanish ? 'Buceo y Actividades Marinas' : 'Diving & Marine Services';
      } else if (c.category === 'TRANSPORT') {
        cardCat = 'TAXI_LAND';
        tradeLabel = isSpanish ? 'Alquiler de Vehículos y Transporte' : 'Vehicle Rentals & Transport';
      } else if (c.category === 'VET') {
        cardCat = 'MEDICAL';
        tradeLabel = isSpanish ? 'Veterinaria y Cuidado Animal' : 'Veterinary & Animal Care';
      } else if (isGardening) {
        cardCat = 'GARDENING';
        tradeLabel = isSpanish ? 'Jardinería y Viveros' : 'Gardening & Plants';
      } else if (isTaxiLand) {
        cardCat = 'TAXI_LAND';
        tradeLabel = isSpanish ? 'Transporte Terrestre' : 'Land Transport';
      }

      card.setAttribute('data-cat', cardCat);
      card.setAttribute('data-zone', locMeta.zone);
      card.setAttribute('data-subloc', locMeta.subLocs);
      card.id = c.id;
      const verifiedTag = isSpanish ? 'Verificado' : 'Verified';
      const languagesText = isSpanish ? `Idiomas: ${c.languages || 'Español'}` : `Languages: ${c.languages || 'Español'}`;
      const waButtonText = 'WhatsApp';
      const callButtonText = isSpanish ? 'Llamar' : 'Call';

      const sourceBadgeHtml = c.source === 'facebook_group' 
        ? `<a href="${c.source_url || 'https://www.facebook.com/groups/200167863435003'}" target="_blank" rel="noopener noreferrer" style="color: #1877F2; font-weight: 700; font-size: 11px; display: inline-flex; align-items: center; gap: 4px; text-decoration: none; background: #EBF5FF; padding: 2px 7px; border-radius: 4px;" title="Source: Bocas Facebook Group">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> FB Group
           </a>`
        : `<span style="color: #047857; font-weight: 700; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ${verifiedTag}
           </span>`;

      // Clean description and extract Google score/reviews
      let rawDesc = (isSpanish && c.description_es ? c.description_es : (c.description || ''));
      let scoreMatch = rawDesc.match(/([0-9]\.[0-9])\(([0-9,]+)\)/);
      let ratingVal = c.rating || (scoreMatch ? parseFloat(scoreMatch[1]) : null);
      let reviewCount = c.review_count || (scoreMatch ? scoreMatch[2] : null);

      let cleanDesc = rawDesc
        .replace(/^Verified local establishment in Bocas del Toro\.?\s*/i, '')
        .replace(/[0-9]\.[0-9]\([0-9,]+\)\s*(•\s*)?/, '')
        .trim();

      card.innerHTML = `
        <div>
          <div class="dir-card-header">
            <span class="dir-badge" style="background: #FFDBCD; color: #964824; font-weight: 700;">${escapeHTML(tradeLabel)}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${sourceBadgeHtml}
              <button class="vouch-badge" data-provider-id="${c.id}" onclick="openPostContactModal('${c.id}', '${escapeHTML(c.name)}')" title="${isSpanish ? 'Recomendado por la comunidad' : 'Vouched by Bocas community'}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> <span class="vouch-count">0</span> ${isSpanish ? 'Recomendaciones' : 'Vouches'}
              </button>
            </div>
          </div>
          <h2 class="dir-title">${escapeHTML(c.name)}</h2>
          ${ratingVal && reviewCount ? `
          <div class="dir-rating-row" style="display: flex; align-items: center; gap: 6px; margin: 4px 0 8px 0; font-size: 13px;">
            <span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700; color: #B45309;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${typeof ratingVal === 'number' ? ratingVal.toFixed(1) : ratingVal}
            </span>
            ${c.map_url ? `
            <a href="${c.map_url}" target="_blank" rel="noopener noreferrer" style="color: #64748B; text-decoration: underline; font-weight: 500; font-size: 12.5px; display: inline-flex; align-items: center; gap: 3px;" title="${isSpanish ? 'Ver reseñas en Google Maps' : 'View reviews on Google Maps'}">
              <span>(${reviewCount} ${isSpanish ? 'reseñas en Google' : 'Google reviews'})</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>` : `<span style="color: #64748B; font-size: 12.5px;">(${reviewCount} ${isSpanish ? 'reseñas' : 'reviews'})</span>`}
          </div>` : ''}
          ${cleanDesc && cleanDesc !== 'N/A' ? `<p class="dir-notes">${escapeHTML(cleanDesc)}</p>` : ''}
          <div class="dir-info-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHTML(c.location || 'Bocas del Toro')} • ${languagesText}</span>
          </div>
          ${c.phone ? `
          <div class="dir-info-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>${escapeHTML(c.phone)}</span>
          </div>` : ''}
          ${c.website && c.website !== 'N/A' && c.website !== '' ? `
          <div class="dir-info-row">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <a href="${c.website.startsWith('http') ? c.website : 'https://' + c.website}" target="_blank" rel="noopener noreferrer" style="color: #964824; font-weight: 600; text-decoration: underline; word-break: break-all;">${escapeHTML(c.website.replace(/^https?:\/\//, ''))}</a>
          </div>` : ''}
        </div>
        <div class="dir-actions">
          ${c.whatsapp_url ? `
          <button type="button" class="dir-action-pill btn-action-wa" onclick="initiateProviderContact('${c.id}', '${escapeHTML(c.name)}', '${c.whatsapp_url}', 'whatsapp')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
            <span>${waButtonText}</span>
          </button>` : ''}
          ${c.phone ? `
          <button type="button" class="dir-action-pill btn-action-call" onclick="initiateProviderContact('${c.id}', '${escapeHTML(c.name)}', 'tel:${c.phone_raw || c.phone.replace(/[^0-9+]/g, '')}', 'call')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>${callButtonText}</span>
          </button>` : ''}
          ${c.website && c.website !== 'N/A' && c.website !== '' ? `
          <a href="${c.website.startsWith('http') ? c.website : 'https://' + c.website}" target="_blank" rel="noopener noreferrer" class="dir-action-pill btn-action-web" style="background: #F1F5F9; color: #334155; text-decoration: none; border: 1px solid #CBD5E1; display: inline-flex; align-items: center; gap: 5px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            <span>${isSpanish ? 'Sitio Web' : 'Website'}</span>
          </a>` : ''}
          ${c.map_url ? `
          <a href="${c.map_url}" target="_blank" rel="noopener noreferrer" class="dir-action-pill btn-action-map">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${isSpanish ? 'Ver en Mapa' : 'View on Map'}</span>
          </a>` : ''}
        </div>
      `;

      if (firstCaptain) {
        grid.insertBefore(card, firstCaptain);
      } else {
        grid.appendChild(card);
      }
    });

    applyVouchesToDOM();
    updateDirectoryCategoryCounts();
    if (typeof filterDirectory === 'function') filterDirectory();
  } catch (e) {
    console.warn('Could not load dynamic contractors:', e);
  }
}

// -------------------------------------------------------------
// DIRECTORY FILTERING & LOCATION TAXONOMY SYSTEM (OPTION 1)
// -------------------------------------------------------------
let activeCat = 'ALL';
let activeLocOption = 'ALL';

function deriveLocationMeta(locStr, titleStr = '', descStr = '') {
  const text = `${locStr || ''} ${titleStr || ''} ${descStr || ''}`.toLowerCase();
  
  const isMainland = text.includes('changuinola') || 
                     text.includes('almirante') || 
                     text.includes('guabito') || 
                     text.includes('frontera') || 
                     text.includes('sixaola') || 
                     text.includes('chiriquí grande') || 
                     text.includes('chiriqui grande') ||
                     text.includes('tierra firme') ||
                     text.includes('mainland');

  const isIslands = text.includes('isla') || 
                    text.includes('colon') || 
                    text.includes('colón') || 
                    text.includes('carenero') || 
                    text.includes('bastimentos') || 
                    text.includes('solarte') || 
                    text.includes('cristóbal') || 
                    text.includes('cristobal') || 
                    text.includes('popa') || 
                    text.includes('red frog') || 
                    text.includes('bluff') || 
                    text.includes('bocas town') || 
                    text.includes('saigón') ||
                    text.includes('saigon') ||
                    text.includes('pueblo') || 
                    text.includes('archipiélago') || 
                    text.includes('archipelago') || 
                    text.includes('water taxi') || 
                    text.includes('capitán') || 
                    text.includes('captain');

  const isGeneral = text.includes('all bocas') || 
                    text.includes('toda la provincia') || 
                    text.includes('toda la región') || 
                    text.includes('entire province') ||
                    (!isMainland && !isIslands);

  let zone = 'all';
  if (isGeneral) {
    zone = 'all';
  } else if (isMainland && !isIslands) {
    zone = 'mainland';
  } else if (isIslands && !isMainland) {
    zone = 'islands';
  } else {
    zone = 'all';
  }

  const subLocs = [];
  if (text.includes('colon') || text.includes('colón') || text.includes('bocas town') || text.includes('saigón') || text.includes('saigon') || text.includes('bluff') || text.includes('paunch') || text.includes('drago')) subLocs.push('colon');
  if (text.includes('carenero')) subLocs.push('carenero');
  if (text.includes('bastimentos') || text.includes('red frog') || text.includes('old bank')) subLocs.push('bastimentos');
  if (text.includes('solarte') || text.includes('cristóbal') || text.includes('cristobal')) subLocs.push('solarte');
  if (text.includes('popa') || text.includes('cayo de agua') || text.includes('loma partida') || text.includes('tierra oscura') || text.includes('pastor')) subLocs.push('popa');
  if (text.includes('changuinola') || text.includes('empalme') || text.includes('silencio')) subLocs.push('changuinola');
  if (text.includes('almirante')) subLocs.push('almirante');
  if (text.includes('guabito') || text.includes('sixaola') || text.includes('frontera')) subLocs.push('guabito');

  return { zone, subLocs: subLocs.join(',') };
}

function setCategoryFilter(cat, btnElement) {
  activeCat = cat;
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');
  filterDirectory();
}

function handleCompoundLocationChange(val) {
  activeLocOption = val || 'ALL';
  filterDirectory();
}

// Fallback compatibility
function setLocationFilter(zone, btnElement) {
  if (zone === 'ALL') activeLocOption = 'ALL';
  else if (zone === 'ISLANDS') activeLocOption = 'islands_all';
  else if (zone === 'MAINLAND') activeLocOption = 'mainland_all';
  const select = document.getElementById('locFilterSelect');
  if (select) select.value = activeLocOption;
  filterDirectory();
}

function setSubLocationFilter(subLoc) {
  activeLocOption = subLoc || 'ALL';
  const select = document.getElementById('locFilterSelect');
  if (select) select.value = activeLocOption;
  filterDirectory();
}

function filterDirectory() {
  const searchInput = document.getElementById('dirSearchInput');
  const searchVal = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const cards = document.querySelectorAll('.dir-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cat = card.getAttribute('data-cat') || '';
    let zone = card.getAttribute('data-zone');
    let sublocs = card.getAttribute('data-subloc');
    const text = card.innerText.toLowerCase();

    if (!zone) {
      const derived = deriveLocationMeta(text, '', '');
      zone = derived.zone;
      sublocs = derived.subLocs;
      card.setAttribute('data-zone', zone);
      card.setAttribute('data-subloc', sublocs);
    }

    // 1. Category Filter Match
    let matchesCat = (activeCat === 'ALL' || cat === activeCat);
    if (activeCat === 'CONTRACTORS') {
      matchesCat = (cat === 'CONTRACTORS' || cat === 'AC_REPAIR' || cat === 'PLUMBING' || cat === 'STARLINK' || (!['WATER_TAXI', 'BANKING', 'GARDENING', 'COMMUNITY', 'TAXI_LAND', 'MECHANIC', 'MEDICAL', 'HARDWARE', 'SHUTTLE', 'HOTEL', 'RESTAURANT', 'SUPERMARKET', 'MARINE', 'VET', 'TRANSPORT'].includes(cat) && /electric|aire|ac|refrig|plumb|plomer|construc|carpint|solar|starlink/i.test(text)));
    } else if (activeCat === 'TAXI_LAND') {
      matchesCat = (cat === 'TAXI_LAND' || cat === 'LAND_TAXI' || cat === 'TRANSPORT' || /taxi|colectivo|driver|chofer|chófer|piquera|scooter|rental|e-bike|ebike|bicicleta/i.test(text));
    } else if (activeCat === 'WATER_TAXI') {
      matchesCat = (cat === 'WATER_TAXI' || cat === 'MARINE' || (!['HARDWARE', 'HOTEL', 'RESTAURANT'].includes(cat) && /lancha|capit[aá]n|water taxi|bote|dive|buceo/i.test(text)));
    } else if (activeCat === 'HOTEL') {
      matchesCat = (cat === 'HOTEL' || /hotel|resort|hostel|suites|lodge|hospedaje|guesthouse/i.test(text));
    } else if (activeCat === 'RESTAURANT') {
      matchesCat = (cat === 'RESTAURANT' || cat === 'SUPERMARKET' || /restaurant|restaurante|cafe|café|bistro|bar|pizza|bakery|panader|supermercado|super market/i.test(text));
    } else if (activeCat === 'MECHANIC') {
      matchesCat = (cat === 'MECHANIC' || /mecanic|mecánic|outboard|fuera de borda|taller|motor|golf cart/i.test(text));
    } else if (activeCat === 'MEDICAL') {
      matchesCat = (cat === 'MEDICAL' || cat === 'VET' || /hospital|clinic|clínica|doctor|medic|médic|farmacia|pharmacy|dentist|veterinar/i.test(text));
    } else if (activeCat === 'HARDWARE') {
      matchesCat = (cat === 'HARDWARE' || /ferreter|hardware|materiales/i.test(text));
    } else if (activeCat === 'BANKING') {
      matchesCat = (cat === 'BANKING' || /banco|bank|atm|cajero|western union/i.test(text));
    } else if (activeCat === 'SHUTTLE') {
      matchesCat = (cat === 'SHUTTLE' || /shuttle|frontera|border|costa rica/i.test(text));
    } else if (activeCat === 'GARDENING') {
      matchesCat = (cat === 'GARDENING' || cat.includes('GARDEN') || cat.includes('PLANT') || cat.includes('JARDIN') || /jard[ií]n|planta|vivero|garden|plant|landscap|chapeo/i.test(text));
    } else if (activeCat === 'COMMUNITY') {
      matchesCat = (cat === 'COMMUNITY' || /book|libro|exchange|intercambio|cultura|community/i.test(text));
    }

    // 2. Location Option Match
    let matchesLoc = true;
    if (activeLocOption === 'ALL') {
      matchesLoc = true;
    } else if (activeLocOption === 'islands_all') {
      matchesLoc = (zone === 'islands' || zone === 'all');
    } else if (activeLocOption === 'mainland_all') {
      matchesLoc = (zone === 'mainland' || zone === 'all');
    } else {
      const subArr = (sublocs || '').split(',').map(s => s.trim()).filter(Boolean);
      matchesLoc = (zone === 'all' || subArr.includes(activeLocOption) || text.includes(activeLocOption));
    }

    // 3. Search Query Match
    const matchesSearch = (!searchVal || text.includes(searchVal));

    if (matchesCat && matchesLoc && matchesSearch) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // Update Dynamic Count in Sub-Header Utility Bar
  const showingCountEl = document.getElementById('showing-count-text');
  if (showingCountEl) {
    const isSpanish = document.documentElement.lang === 'es' || window.location.pathname.includes('/es/');
    showingCountEl.innerHTML = isSpanish ? 
      `Mostrando <strong>${visibleCount} proveedores verificados</strong> en Bocas del Toro` : 
      `Showing <strong>${visibleCount} verified providers</strong> in Bocas del Toro`;
  }

  let emptyState = document.getElementById('dir-empty-state');
  const grid = document.querySelector('.directory-grid');
  if (grid) {
    if (visibleCount === 0) {
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.id = 'dir-empty-state';
        emptyState.style.cssText = 'grid-column: 1 / -1; background: #FFFFFF; border: 2px dashed #D5C3B5; border-radius: 20px; padding: 48px 24px; text-align: center; margin: 20px 0;';
        grid.appendChild(emptyState);
      }
      const isSpanish = document.documentElement.lang === 'es' || window.location.pathname.includes('/es/');
      emptyState.innerHTML = isSpanish ? `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#964824" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3 style="font-size: 18px; font-weight: 800; color: #1B1C1A; margin-bottom: 6px;">No se encontraron resultados</h3>
        <p style="font-size: 14px; color: #7E766D; max-width: 440px; margin: 0 auto 16px;">No hay proveedores registrados con estos filtros de búsqueda o ubicación.</p>
        <button onclick="resetDirectoryFilters()" style="background: #964824; color: #FFFFFF; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 700; cursor: pointer; font-size: 13.5px;">Ver Todos los Resultados</button>
      ` : `
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#964824" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 12px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h3 style="font-size: 18px; font-weight: 800; color: #1B1C1A; margin-bottom: 6px;">No Listings Found</h3>
        <p style="font-size: 14px; color: #7E766D; max-width: 440px; margin: 0 auto 16px;">There are no providers matching this specific category and location filter.</p>
        <button onclick="resetDirectoryFilters()" style="background: #964824; color: #FFFFFF; border: none; padding: 10px 20px; border-radius: 20px; font-weight: 700; cursor: pointer; font-size: 13.5px;">Reset All Filters</button>
      `;
      emptyState.style.display = 'block';
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }
  }
}

function resetDirectoryFilters() {
  const searchInput = document.getElementById('dirSearchInput');
  if (searchInput) searchInput.value = '';
  const locSelect = document.getElementById('locFilterSelect');
  if (locSelect) locSelect.value = 'ALL';
  activeCat = 'ALL';
  activeLocOption = 'ALL';
  document.querySelectorAll('.cat-pill').forEach((b, i) => i === 0 ? b.classList.add('active') : b.classList.remove('active'));
  filterDirectory();
}

// URL Parameter Initialization for Directory Deep-Linking
function initDirectoryFromURL() {
  if (typeof window === 'undefined' || !window.location.search) return;
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const cat = params.get('cat');
  const loc = params.get('loc');

  let shouldFilter = false;

  if (q) {
    const searchInput = document.getElementById('dirSearchInput');
    if (searchInput) {
      searchInput.value = q;
      shouldFilter = true;
    }
  }

  if (loc) {
    const locSelect = document.getElementById('locFilterSelect');
    if (locSelect) {
      locSelect.value = loc;
      activeLocOption = loc;
      shouldFilter = true;
    }
  }

  if (cat) {
    const targetCat = cat.toUpperCase();
    activeCat = targetCat;
    document.querySelectorAll('.cat-pill').forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick') || '';
      if (onclickAttr.includes(targetCat)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    shouldFilter = true;
  }

  if (shouldFilter && typeof filterDirectory === 'function') {
    filterDirectory();
  }
}

function highlightTargetFromHash() {
  if (typeof window === 'undefined' || !window.location.hash) return;
  const targetId = window.location.hash.substring(1);
  if (!targetId) return;

  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const el = document.getElementById(targetId);
    if (el) {
      clearInterval(interval);
      const cardCat = el.getAttribute('data-cat');
      if (cardCat && typeof activeCat !== 'undefined' && activeCat !== 'ALL' && activeCat !== cardCat) {
        if (typeof setCategoryFilter === 'function') {
          const allPill = document.querySelector('.cat-pill[onclick*="ALL"]');
          setCategoryFilter('ALL', allPill);
        }
      }
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.transition = 'box-shadow 0.4s ease, border-color 0.4s ease';
        el.style.borderColor = '#964824';
        el.style.boxShadow = '0 0 0 3px rgba(150, 72, 36, 0.4), 0 12px 30px rgba(0,0,0,0.1)';
        setTimeout(() => {
          el.style.borderColor = '';
          el.style.boxShadow = '';
        }, 3500);
      }, 250);
    } else if (attempts >= 10) {
      clearInterval(interval);
    }
  }, 200);
}

function updateDirectoryCategoryCounts() {
  const cards = document.querySelectorAll('.directory-grid .dir-card');
  if (!cards || cards.length === 0) return;

  const counts = {
    total: cards.length,
    water_taxi: 0,
    taxi_land: 0,
    contractors: 0,
    hotel: 0,
    restaurant: 0,
    mechanic: 0,
    medical: 0,
    hardware: 0,
    banking: 0,
    shuttle: 0,
    gardening: 0,
    community: 0
  };

  cards.forEach(card => {
    const cat = card.getAttribute('data-cat') || '';
    const text = card.innerText.toLowerCase();

    if (cat === 'WATER_TAXI' || cat === 'MARINE' || (!['HARDWARE', 'HOTEL', 'RESTAURANT'].includes(cat) && /lancha|capit[aá]n|water taxi|bote|dive|buceo/i.test(text))) {
      counts.water_taxi++;
    } else if (cat === 'HOTEL' || /hotel|resort|hostel|suites|lodge|hospedaje|guesthouse/i.test(text)) {
      counts.hotel++;
    } else if (cat === 'RESTAURANT' || cat === 'SUPERMARKET' || /restaurant|restaurante|cafe|café|bistro|bar|pizza|bakery|panader|supermercado|super market/i.test(text)) {
      counts.restaurant++;
    } else if (cat === 'HARDWARE' || /ferreter|hardware|materiales/i.test(text)) {
      counts.hardware++;
    } else if (cat === 'TAXI_LAND' || cat === 'LAND_TAXI' || cat === 'TRANSPORT' || /taxi|colectivo|driver|chofer|chófer|piquera|scooter|rental|e-bike|ebike|bicicleta/i.test(text)) {
      counts.taxi_land++;
    } else if (cat === 'BANKING' || /banco|bank|atm|cajero|western union/i.test(text)) {
      counts.banking++;
    } else if (cat === 'MEDICAL' || cat === 'VET' || /hospital|clinic|clínica|doctor|medic|médic|farmacia|pharmacy|dentist|veterinar/i.test(text)) {
      counts.medical++;
    } else if (cat === 'MECHANIC' || /mecanic|mecánic|outboard|fuera de borda|taller|motor|golf cart/i.test(text)) {
      counts.mechanic++;
    } else if (cat === 'SHUTTLE' || /shuttle|frontera|border|costa rica/i.test(text)) {
      counts.shuttle++;
    } else if (cat === 'GARDENING' || cat.includes('GARDEN') || cat.includes('PLANT') || cat.includes('JARDIN') || /jard[ií]n|planta|vivero|garden|plant|landscap|chapeo/i.test(text)) {
      counts.gardening++;
    } else if (cat === 'COMMUNITY' || /book|libro|exchange|intercambio|cultura|community/i.test(text)) {
      counts.community++;
    } else if (cat === 'CONTRACTORS' || cat === 'AC_REPAIR' || cat === 'PLUMBING' || cat === 'STARLINK' || (!['WATER_TAXI', 'BANKING', 'GARDENING', 'COMMUNITY', 'TAXI_LAND', 'MECHANIC', 'MEDICAL', 'HARDWARE', 'SHUTTLE', 'HOTEL', 'RESTAURANT', 'SUPERMARKET', 'MARINE', 'VET', 'TRANSPORT'].includes(cat) && /electric|aire|ac|refrig|plumb|plomer|construc|carpint|solar|starlink/i.test(text))) {
      counts.contractors++;
    }
  });

  const setEl = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setEl('total-count', counts.total);
  setEl('water-taxi-count', counts.water_taxi);
  setEl('taxi-land-count', counts.taxi_land);
  setEl('contractors-count', counts.contractors);
  setEl('hotel-count', counts.hotel);
  setEl('restaurant-count', counts.restaurant);
  setEl('mechanic-count', counts.mechanic);
  setEl('medical-count', counts.medical);
  setEl('hardware-count', counts.hardware);
  setEl('banking-count', counts.banking);
  setEl('shuttle-count', counts.shuttle);
  setEl('gardening-count', counts.gardening);
  setEl('community-count', counts.community);
}

// Auto-run on DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    loadCommunityVouches();
    updateDirectoryCategoryCounts();
    loadDynamicContractorsToDirectory();
    initDirectoryFromURL();
    highlightTargetFromHash();
  });
}


