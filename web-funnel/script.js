// PoquitoTalk Web Funnel Logic & Studio Audio Demo Engine

const POQUITO_PRESETS = {
  'ac_leaking_water': {
    id: 'ac_leaking_water',
    title: 'A/C Leaking Water',
    input: 'Hi! My air conditioning is leaking water inside the bedroom.',
    levels: {
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
      poquito: '¡Hola! La antena de Starlink se quedó sin señal y no conecta. ¿Tiene servicio técnico disponible?',
      full_panameno: '¡Buenas amigo! El plato de Starlink se cayó y está offline total. ¿Hace instalaciones y chequeo de señal?'
    },
    audio: 'diego_starlink_dish_offline'
  }
};

let currentPresetKey = 'ac_leaking_water';
let currentPoquitoTone = 'poquito'; // 'poquito' | 'full_panameno'
let currentDemoVoice = 'Diego';
let activeDemoAudio = null;

const POQUITO_LABELS_EN = {
  poquito: 'Poquito: Friendly & Natural',
  full_panameno: 'Full Panameño: Local Dialect'
};

const POQUITO_LABELS_ES = {
  poquito: 'Poquito: Amable y Natural',
  full_panameno: 'Full Panameño: Dialecto Local'
};

const MASCOT_DIALECT_TIPS_EN = {
  poquito: "<strong>Poquito:</strong> Natural Panamanian warmth — friendly, polite, and respectful.",
  full_panameno: "<strong>Poquito:</strong> ¡Qué xopa! Full Panameño with authentic local Panama phrasing."
};

const MASCOT_DIALECT_TIPS_ES = {
  poquito: "<strong>Poquito:</strong> Calidez panameña natural — amable, educado y respetuoso.",
  full_panameno: "<strong>Poquito:</strong> ¡Qué xopa! Full Panameño con modismos y dialecto local de Panamá."
};

function getDisplayTranslation(presetKey, tone) {
  const preset = POQUITO_PRESETS[presetKey];
  if (preset && preset.levels && preset.levels[tone]) {
    return preset.levels[tone];
  }
  
  // Custom typed input fallback
  const customInput = document.getElementById('demo-input')?.value.trim() || '';
  return applyCustomPoquitoTone(customInput, tone);
}

function applyCustomPoquitoTone(rawText, tone) {
  if (!rawText) return '¡Buenas! ¿Cómo está?';
  const clean = rawText.replace(/^(¡Buenas!|Hola,|Buenas,|¡Buenas Capitán!|Buenas tardes,)/i, '').trim();
  const rest = clean.length > 0 ? (clean.charAt(0).toLowerCase() + clean.slice(1)) : '';
  
  if (tone === 'poquito') {
    return '¡Buenas! ' + rest + '. ¿Podría apoyarme con esto?';
  }
  if (tone === 'full_panameno') {
    return '¡Qué xopa compa! ' + rest + ', quedo al pendiente.';
  }
  return rawText;
}

function setPoquitoTone(tone) {
  currentPoquitoTone = tone;
  
  // 1. Sync Buttons
  document.querySelectorAll('.segmented-btn, .poquito-step-btn').forEach(btn => {
    const btnTone = btn.getAttribute('data-tone');
    if (btnTone === currentPoquitoTone) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Track tone change event
  if (window.PoquitoTracker) {
    window.PoquitoTracker.track('toggle_tone', {
      tone: tone,
      preset: typeof currentPresetKey !== 'undefined' ? currentPresetKey : 'custom'
    });
  }

  // 2. Trigger corner mascot reaction animation
  const cornerMascot = document.getElementById('poquito-corner-mascot-wrapper') || document.querySelector('.poquito-corner-mascot-wrapper');
  if (cornerMascot) {
    cornerMascot.classList.remove('cheer-active');
    void cornerMascot.offsetWidth; // trigger reflow
    cornerMascot.classList.add('cheer-active');
  }

  // 3. Update Result Text with immediate text update
  const resultEl = document.getElementById('result-text');
  if (resultEl) {
    const updatedText = getDisplayTranslation(currentPresetKey, currentPoquitoTone);
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

// Backward compatibility alias
function setPoquitoSlider(val) {
  setPoquitoTone(val === 1 || val === '1' ? 'poquito' : (val === 3 || val === '3' ? 'full_panameno' : 'poquito'));
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
  if (resultEl) resultEl.innerText = getDisplayTranslation(presetKey, currentPoquitoTone);

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

    const resultText = getDisplayTranslation(currentPresetKey, currentPoquitoTone);
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

function selectDemoVoice(name) {
  currentDemoVoice = name;
  document.querySelectorAll('.voice-chip-btn').forEach(btn => {
    if (btn.getAttribute('data-voice') === name) {
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
  const resultText = getDisplayTranslation(matchedKey, currentPoquitoTone);

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
  const voice = currentDemoVoice.toLowerCase();
  
  // Resolve relative audio path for web-funnel or es/ subfolder
  const basePath = isSpanish ? '../audio/presets/' : 'audio/presets/';
  
  // Explicitly map dialect level: poquito -> _lvl2, full_panameno -> _lvl3
  const levelSuffix = currentPoquitoTone === 'full_panameno' ? '_lvl3' : '_lvl2';
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
      tone: currentPoquitoTone,
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
    'credits_50': { 
      name: '50 Poquito Credits Pack (Never Expires)', 
      price: '$3.74 (Reg. $4.99)', 
      stripeUrl: 'https://buy.stripe.com/8x214n3nngsS6dw8Bz4sE0b',
      isDirectPay: true 
    },
    'tourist_weekly': { 
      name: 'Weekly Tourist Pass (7 Days)', 
      price: '$4.99/wk (Starts on launch day)', 
      isDirectPay: false 
    },
    'pro_monthly': { 
      name: 'Pro Monthly Membership', 
      price: '$12.99/mo (Starts on launch day)', 
      isDirectPay: false 
    }
  };
  const selected = planNames[plan] || planNames['credits_50'];
  const isSpanish = window.location.pathname.includes('/es/');

  // 1. Direct Pay for 50 Credits Pack (Zero friction — goes straight to Stripe Checkout)
  if (selected.isDirectPay && selected.stripeUrl) {
    window.location.href = selected.stripeUrl;
    return;
  }

  // 2. Pre-Launch Reservation for Weekly / Monthly Passes
  const promptText = isSpanish
    ? `🚀 RESERVA DE LANZAMIENTO\n\nHas seleccionado: ${selected.name}\nPrecio: ${selected.price}\n\nTu periodo de pase comenzará el día del lanzamiento oficial en Google Play.\n\nIngresa tu correo para reservar tu acceso:`
    : `🚀 LAUNCH DAY RESERVATION\n\nYou selected: ${selected.name}\nPrice: ${selected.price}\n\nYour pass period will start counting on official launch day on Google Play.\n\nEnter your email to reserve your spot:`;

  const userEmail = prompt(promptText, '');

  if (userEmail && userEmail.includes('@')) {
    const payload = {
      _subject: `[PoquitoTalk Launch Order] Pass Reservation (${selected.name})`,
      Email: userEmail,
      PlanSelected: selected.name,
      PromoPrice: selected.price,
      SubmittedAt: new Date().toLocaleString('en-US', { timeZone: 'America/Panama' }),
      _captcha: 'false'
    };

    fetch('https://formsubmit.co/ajax/support@hero-apps.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });

    const apiPath = isSpanish ? '../api/waitlist.php' : 'api/waitlist.php';
    fetch(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, Type: 'prelaunch_order' })
    });

    alert(
      isSpanish 
        ? `¡Reserva Confirmada!\n\nHemos registrado tu solicitud para ${selected.name} a ${selected.price}. Te enviaremos tu enlace de acceso y pago a ${userEmail}!`
        : `Reservation Confirmed!\n\nWe've locked in your request for ${selected.name} at ${selected.price}. We will email your checkout and access link to ${userEmail}!`
    );
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

function applyVouchesToDOM() {
  document.querySelectorAll('.vouch-badge').forEach(badge => {
    const pid = badge.getAttribute('data-provider-id');
    if (!pid) return;

    // Check if user already vouched locally
    const hasVouchedLocally = localStorage.getItem('poquito_vouched_' + pid) === 'true';
    if (hasVouchedLocally) {
      badge.classList.add('vouched');
    }

    const countEl = badge.querySelector('.vouch-count');
    if (countEl && communityVouchesCache[pid]) {
      countEl.innerText = communityVouchesCache[pid].count;
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

  // Mark local storage immediately
  localStorage.setItem('poquito_vouched_' + pid, 'true');

  // Update DOM badge immediately
  const badge = document.querySelector(`#${pid} .vouch-badge, button[data-provider-id="${pid}"]`);
  if (badge) {
    badge.classList.add('vouched');
    const countEl = badge.querySelector('.vouch-count');
    if (countEl) {
      const current = parseInt(countEl.innerText, 10) || 0;
      countEl.innerText = current + 1;
    } else {
      badge.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> <span class="vouch-count">1</span> Vouches`;
    }
  }

  closePostContactModal();

  // Send to server
  try {
    const isSpanish = window.location.pathname.includes('/es/');
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
        (item.category && item.category !== 'WATER_TAXI' && item.category !== 'BANKING')
      )
    );

    const gardeningOnes = dynamicOnes.filter(c => {
      const tradeLabel = c.category_label || '';
      return (c.category && (c.category.includes('GARDEN') || c.category.includes('PLANT') || c.category.includes('JARDIN'))) ||
             /jard[ií]n|planta|vivero|garden|plant|landscap/i.test(tradeLabel) ||
             /jard[ií]n|planta|vivero|garden|plant/i.test(c.name || '') ||
             /jard[ií]n|planta|vivero|garden|plant|chapeo/i.test(c.description || '');
    });

    const gardeningCountEl = document.getElementById('gardening-count');
    if (gardeningCountEl) gardeningCountEl.textContent = gardeningOnes.length;

    const countEl = document.getElementById('contractors-count');
    if (countEl) countEl.textContent = dynamicOnes.length;

    const totalCountEl = document.getElementById('total-count');
    if (totalCountEl) totalCountEl.textContent = 80 + dynamicOnes.length;

    // Find the first boat captain card to insert contractors before the long captain list
    const firstCaptain = document.querySelector('.dir-card[data-cat="WATER_TAXI"]');

    dynamicOnes.forEach(c => {
      if (document.getElementById(c.id)) return;

      const locMeta = deriveLocationMeta(c.location, c.name, c.description);
      const card = document.createElement('div');
      card.className = 'dir-card';
      
      const tradeLabel = c.category_label || (isSpanish ? 'Contratista Verificado' : 'Verified Contractor');
      const isGardening = (c.category && (c.category.includes('GARDEN') || c.category.includes('PLANT') || c.category.includes('JARDIN'))) ||
                          (tradeLabel && /jard[ií]n|planta|vivero|garden|plant|landscap/i.test(tradeLabel)) ||
                          (c.name && /jard[ií]n|planta|vivero|garden|plant/i.test(c.name)) ||
                          (c.description && /jard[ií]n|planta|vivero|garden|plant|chapeo/i.test(c.description));

      card.setAttribute('data-cat', isGardening ? 'GARDENING' : 'CONTRACTORS');
      card.setAttribute('data-zone', locMeta.zone);
      card.setAttribute('data-subloc', locMeta.subLocs);
      card.id = c.id;
      const verifiedTag = isSpanish ? 'Profesional Verificado' : 'Verified Pro';
      const languagesText = isSpanish ? `Idiomas: ${c.languages || 'Español'}` : `Languages: ${c.languages || 'Español'}`;
      const waButtonText = 'WhatsApp';
      const callButtonText = isSpanish ? 'Llamar' : 'Call';

      card.innerHTML = `
        <div>
          <div class="dir-card-header">
            <span class="dir-badge" style="background: #FFDBCD; color: #964824; font-weight: 700;">${escapeHTML(tradeLabel)}</span>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: #047857; font-weight: 700; font-size: 11.5px; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ${verifiedTag}
              </span>
              <button class="vouch-badge" data-provider-id="${c.id}" onclick="openPostContactModal('${c.id}', '${escapeHTML(c.name)}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> <span class="vouch-count">0</span> ${isSpanish ? 'Votos' : 'Vouches'}
              </button>
            </div>
          </div>
          <h2 class="dir-title">${escapeHTML(c.name)}</h2>
          ${c.description && c.description !== 'N/A' ? `<p class="dir-notes">${escapeHTML(c.description)}</p>` : ''}
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
        </div>
      `;

      if (firstCaptain) {
        grid.insertBefore(card, firstCaptain);
      } else {
        grid.appendChild(card);
      }
    });

    applyVouchesToDOM();
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
      matchesCat = (cat === 'CONTRACTORS' || cat === 'GARDENING' || (cat !== 'WATER_TAXI' && cat !== 'BANKING'));
    } else if (activeCat === 'GARDENING') {
      matchesCat = (cat === 'GARDENING' || cat.includes('GARDEN') || cat.includes('PLANT') || cat.includes('JARDIN') || /jard[ií]n|planta|vivero|garden|plant|landscap|chapeo/i.test(text));
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

// Auto-run on DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    loadCommunityVouches();
    loadDynamicContractorsToDirectory();
  });
}
