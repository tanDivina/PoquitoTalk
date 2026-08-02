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
