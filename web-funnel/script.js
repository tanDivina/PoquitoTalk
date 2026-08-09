// PoquitoTalk Web Funnel Logic & Demo Engine

const DEMO_TRANSLATIONS = {
  'hi! my air conditioning is leaking water inside the bedroom.': '¡Buenas! El aire acondicionado está goteando agua dentro de la habitación. ¿Podría venir a revisarlo?',
  'hi! the outboard motor on my boat won\'t start at the dock.': '¡Buenas! El motor fuera de borda de la lancha no quiere arrancar en el muelle. ¿Hace trabajos de mecánica marina?',
  'hello! my starlink dish lost signal connection today.': 'Buenas, la antena de Starlink perdió la conexión hoy. ¿Sabe si hay una caída de red en la zona?',
  'hi! the water pressure in the main bathroom dropped.': '¡Buenas! La presión del agua en el baño principal bajó por completo. ¿Podría revisar la tubería?',
};

// Natural Voice Personas & Pitch Calibrations matching app (src/services/googleVoice.ts)
const VOICE_PITCHES = {
  'Diego': { pitch: 0.96, rate: 0.88, name: 'Diego', flag: '👨' },
  'Mateo': { pitch: 0.90, rate: 0.84, name: 'Mateo', flag: '🧔' },
  'Sofia': { pitch: 1.02, rate: 0.92, name: 'Sofia', flag: '👩' },
  'Valeria': { pitch: 1.08, rate: 0.95, name: 'Valeria', flag: '👧' }
};

let currentDemoVoice = 'Diego';

function selectDemoVoice(name) {
  currentDemoVoice = name;
  document.querySelectorAll('.voice-chip-btn').forEach(btn => {
    if (btn.getAttribute('data-voice') === name) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const voice = VOICE_PITCHES[name] || VOICE_PITCHES['Diego'];
  const playBtn = document.getElementById('play-audio-btn');
  if (playBtn) {
    playBtn.innerHTML = `🔊 Play ${voice.flag} ${voice.name} Audio Note`;
  }
  const playBtnEs = document.getElementById('play-audio-btn-es');
  if (playBtnEs) {
    playBtnEs.innerHTML = `🔊 Reproducir Audio ${voice.flag} ${voice.name}`;
  }
}

function setDemoPrompt(tag, text) {
  document.getElementById('demo-input').value = text;
  runDemoTranslation();
}

function runDemoTranslation() {
  const input = document.getElementById('demo-input').value.trim();
  if (!input) return;

  const btn = document.getElementById('translate-btn');
  btn.innerText = 'Translating with Gemma AI...';

  setTimeout(() => {
    const key = input.toLowerCase();
    const result = DEMO_TRANSLATIONS[key] || `¡Buenas! ${input} (Traducido al español de Panamá para WhatsApp)`;
    
    document.getElementById('result-text').innerText = result;
    document.getElementById('result-box').style.display = 'block';
    btn.innerHTML = 'Translate to Panamanian Spanish 🇵🇦 <span class="arrow">→</span>';
  }, 350);
}

function sendDemoWhatsApp() {
  const text = document.getElementById('result-text').innerText;
  if (!text) return;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function playDemoAudio() {
  const text = document.getElementById('result-text').innerText;
  if (!text) return;

  // Web Speech API Synthesis with Spanish Voice & Pitch Calibration matching app
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-PA';

    const config = VOICE_PITCHES[currentDemoVoice] || VOICE_PITCHES['Diego'];
    const isQuestion = text.includes('?') || text.includes('¿');
    utterance.pitch = isQuestion ? config.pitch + 0.05 : config.pitch;
    utterance.rate = config.rate;

    window.speechSynthesis.speak(utterance);
  } else {
    alert('Audio playback is ready on PoquitoTalk mobile app!');
  }
}

function initiateStripeCheckout(plan) {
  // Redirect to Stripe Checkout / RevenueCat Web Funnel
  alert(`Redirecting to Stripe Checkout for ${plan === 'pro_monthly' ? 'Pro Monthly Membership ($9.99/mo)' : '50 Natural Voice Notes Pack ($4.99)'}...`);
  window.location.href = `https://checkout.stripe.com/pay/poquitotalk_${plan}`;
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

  // Cache locally to prevent redundant submissions
  try {
    const history = JSON.parse(localStorage.getItem('poquitotalk_playstore_waitlist') || '[]');
    history.unshift({ ...payload, timestamp: Date.now() });
    localStorage.setItem('poquitotalk_playstore_waitlist', JSON.stringify(history));
  } catch (e) {}

  if (formElement) formElement.style.display = 'none';
  if (successBox) successBox.style.display = 'flex';
}

// Contractor Registration Handler (FormSubmit.co AJAX + LocalStorage Caching)
async function submitContractorRegistration(e, formId) {
  e.preventDefault();
  const isSpanish = formId.endsWith('-es');
  const nameInput = document.getElementById(isSpanish ? 'contractor-name-es' : 'contractor-name-en');
  const tradeSelect = document.getElementById(isSpanish ? 'contractor-trade-es' : 'contractor-trade-en');
  const locationSelect = document.getElementById(isSpanish ? 'contractor-location-es' : 'contractor-location-en');
  const phoneInput = document.getElementById(isSpanish ? 'contractor-phone-es' : 'contractor-phone-en');
  const emailInput = document.getElementById(isSpanish ? 'contractor-email-es' : 'contractor-email-en');
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

  // Cache registration locally
  try {
    const history = JSON.parse(localStorage.getItem('poquitotalk_provider_registration') || '[]');
    history.unshift({ ...payload, timestamp: Date.now() });
    localStorage.setItem('poquitotalk_provider_registration', JSON.stringify(history));
  } catch (e) {}

  if (formElement) formElement.style.display = 'none';
  if (successBox) successBox.style.display = 'flex';
}

