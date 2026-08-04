// PoquitoTalk Web Funnel Logic & Demo Engine

const DEMO_TRANSLATIONS = {
  'hi! my air conditioning is leaking water inside the bedroom.': '¡Buenas! El aire acondicionado está goteando agua dentro de la habitación. ¿Podría venir a revisarlo?',
  'hi! the outboard motor on my boat won\'t start at the dock.': '¡Buenas! El motor fuera de borda de la lancha no quiere arrancar en el muelle. ¿Hace trabajos de mecánica marina?',
  'hello! my starlink dish lost signal connection today.': 'Buenas, la antena de Starlink perdió la conexión hoy. ¿Sabe si hay una caída de red en la zona?',
  'hi! the water pressure in the main bathroom dropped.': '¡Buenas! La presión del agua en el baño principal bajó por completo. ¿Podría revisar la tubería?',
};

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

  // Web Speech API Synthesis with Spanish Voice
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-PA';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  } else {
    alert('Audio playback is ready on PoquitoTalk mobile app!');
  }
}

function initiateStripeCheckout(plan) {
  // Redirect to Stripe Checkout / RevenueCat Web Funnel
  alert(`Redirecting to Stripe Checkout for ${plan === 'pro_annual' ? 'Annual Unlimited Pass ($19.99)' : '100 Credits ($4.99)'}...`);
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

// Cookie Consent Banner Handling
window.addEventListener('DOMContentLoaded', () => {
  const consent = localStorage.getItem('poquitotalk_cookie_consent');
  if (!consent) {
    setTimeout(() => {
      const banner = document.getElementById('cookie-banner');
      if (banner) banner.classList.add('show');
    }, 1000);
  }
});

function acceptCookieConsent() {
  localStorage.setItem('poquitotalk_cookie_consent', 'true');
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.classList.remove('show');
}
