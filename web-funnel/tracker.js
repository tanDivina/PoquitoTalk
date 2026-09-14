/**
 * PoquitoTalk Lightweight Visitor & Event Tracker (tracker.js)
 * Privacy-first first-party telemetry with Google Analytics 4 (GA4) dual-dispatch.
 * Captures pageviews, sessions, UTM campaigns, granular UI interactions, and conversions.
 */

(function () {
  'use strict';

  var GA_MEASUREMENT_ID = window.GA_MEASUREMENT_ID || 'G-R91FWY3RHP';
  var STORAGE_KEY_VID = 'pt_vid';
  var STORAGE_KEY_SID = 'pt_sid';
  var STORAGE_KEY_SID_TIME = 'pt_sid_time';
  var SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  // Asynchronously initialize Google Analytics 4 (GA4)
  function initGA4() {
    if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return;
    if (window._poquitoGa4Initialized) return;
    window._poquitoGa4Initialized = true;

    // Define dataLayer and gtag shim immediately so early events are queued
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false // Synchronized directly via sendToGA4
    });

    // Inject remote gtag.js script asynchronously without render-blocking
    try {
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_MEASUREMENT_ID);
      var firstScript = document.getElementsByTagName('script')[0];
      if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
      } else if (document.head) {
        document.head.appendChild(script);
      }
    } catch (e) {}
  }

  // Dual-dispatch events to Google Analytics 4
  function sendToGA4(eventName, payload) {
    if (!window.gtag) return;
    try {
      var eventData = payload.data || {};

      if (eventName === 'pageview') {
        window.gtag('event', 'page_view', {
          page_title: payload.title,
          page_location: payload.url,
          page_path: payload.path,
          traffic_source: payload.source,
          visitor_id: payload.visitor_id
        });
      } else if (eventName === 'whatsapp_click') {
        window.gtag('event', 'generate_lead', {
          event_category: 'Contractor_Inquiry',
          event_label: eventData.provider_name || eventData.text || 'WhatsApp',
          link_url: eventData.target_url || eventData.href || '',
          value: 1
        });
        window.gtag('event', 'whatsapp_inquiry', {
          provider_id: eventData.provider_id || '',
          provider_name: eventData.provider_name || eventData.text || '',
          section: eventData.section || ''
        });
      } else if (eventName === 'call_click') {
        window.gtag('event', 'contact', {
          method: 'phone',
          event_label: eventData.text || eventData.href || 'Call',
          section: eventData.section || ''
        });
      } else if (eventName === 'download_click') {
        window.gtag('event', 'app_download', {
          file_name: eventData.href || 'apk',
          event_label: eventData.text || 'Download',
          section: eventData.section || ''
        });
      } else if (eventName === 'play_voice_demo' || eventName === 'audio_play') {
        window.gtag('event', 'play_audio', {
          event_category: 'Voice_Demo',
          event_label: eventData.voice || eventData.label || 'Audio',
          section: eventData.section || ''
        });
      } else if (eventName === 'waitlist_submit') {
        window.gtag('event', 'sign_up', {
          method: 'waitlist',
          event_category: 'Conversions',
          event_label: eventData.role || 'Expat'
        });
      } else {
        // Universal UI interaction
        window.gtag('event', 'ui_click', {
          event_category: eventData.category || 'UI_Interaction',
          event_label: eventData.text || eventData.label || eventName,
          action_name: eventData.action || eventName,
          section: eventData.section || '',
          link_url: eventData.href || ''
        });
      }
    } catch (e) {}
  }

  // Determine API tracking endpoint
  var getApiEndpoint = function () {
    var isSubdir = window.location.pathname.indexOf('/es/') !== -1;
    return isSubdir ? '../api/track.php' : 'api/track.php';
  };

  // Generate unique random identifier
  function generateId(prefix) {
    var chars = '0123456789abcdef';
    var res = prefix ? prefix + '_' : '';
    for (var i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  }

  // Get or initialize persistent visitor ID
  function getVisitorId() {
    try {
      var vid = localStorage.getItem(STORAGE_KEY_VID);
      if (!vid) {
        vid = generateId('v');
        localStorage.setItem(STORAGE_KEY_VID, vid);
      }
      return vid;
    } catch (e) {
      return generateId('v_temp');
    }
  }

  // Get or refresh 30-minute session ID
  function getSessionId() {
    try {
      var now = Date.now();
      var sid = localStorage.getItem(STORAGE_KEY_SID);
      var lastTime = parseInt(localStorage.getItem(STORAGE_KEY_SID_TIME) || '0', 10);

      if (!sid || now - lastTime > SESSION_TIMEOUT_MS) {
        sid = generateId('s');
        localStorage.setItem(STORAGE_KEY_SID, sid);
      }
      localStorage.setItem(STORAGE_KEY_SID_TIME, now.toString());
      return sid;
    } catch (e) {
      return generateId('s_temp');
    }
  }

  // Extract query parameters (UTM & referrals)
  function getQueryParams() {
    var params = {};
    try {
      var search = window.location.search.substring(1);
      if (!search) return params;
      var pairs = search.split('&');
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if (pair[0]) {
          params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
      }
    } catch (e) {}
    return params;
  }

  // Categorize referrer source
  function categorizeReferrer(refUrl) {
    if (!refUrl) return 'Direct';
    try {
      var host = new URL(refUrl).hostname.toLowerCase();
      var curHost = window.location.hostname.toLowerCase();
      if (host === curHost) return 'Internal';
      if (host.indexOf('devpost.com') !== -1) return 'Devpost';
      if (host.indexOf('twitter.com') !== -1 || host.indexOf('t.co') !== -1 || host.indexOf('x.com') !== -1) return 'X / Twitter';
      if (host.indexOf('google.') !== -1) return 'Google';
      if (host.indexOf('bing.') !== -1) return 'Bing';
      if (host.indexOf('yahoo.') !== -1) return 'Yahoo';
      if (host.indexOf('duckduckgo.') !== -1) return 'DuckDuckGo';
      if (host.indexOf('chatgpt.com') !== -1) return 'ChatGPT';
      if (host.indexOf('producthunt.com') !== -1) return 'Product Hunt';
      if (host.indexOf('hackernoon.com') !== -1) return 'HackerNoon';
      if (host.indexOf('github.com') !== -1) return 'GitHub';
      if (host.indexOf('linkedin.com') !== -1) return 'LinkedIn';
      if (host.indexOf('reddit.com') !== -1) return 'Reddit';
      if (host.indexOf('whatsapp.com') !== -1 || host.indexOf('wa.me') !== -1) return 'WhatsApp';
      if (host.indexOf('facebook.com') !== -1 || host.indexOf('fb.me') !== -1) return 'Facebook';
      if (host.indexOf('instagram.com') !== -1) return 'Instagram';
      if (host.indexOf('hero-apps.com') !== -1) return 'Hero-Apps Network';
      return host;
    } catch (e) {
      return 'Referral';
    }
  }

  // Detect basic device type
  function getDeviceType() {
    var ua = navigator.userAgent || '';
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Core tracking dispatcher (first-party + GA4)
  function sendTrackPayload(eventName, eventData) {
    var queryParams = getQueryParams();
    var ref = document.referrer || '';
    var source = queryParams.utm_source || categorizeReferrer(ref);

    var payload = {
      event: eventName || 'pageview',
      visitor_id: getVisitorId(),
      session_id: getSessionId(),
      url: window.location.href,
      path: window.location.pathname,
      title: document.title || '',
      referrer: ref,
      referrer_category: categorizeReferrer(ref),
      source: source,
      utm_source: queryParams.utm_source || '',
      utm_medium: queryParams.utm_medium || '',
      utm_campaign: queryParams.utm_campaign || '',
      utm_term: queryParams.utm_term || '',
      utm_content: queryParams.utm_content || '',
      ref_code: queryParams.ref || '',
      device: getDeviceType(),
      screen_width: window.innerWidth || (window.screen ? window.screen.width : 0) || 0,
      screen_height: window.innerHeight || (window.screen ? window.screen.height : 0) || 0,
      language: navigator.language || navigator.userLanguage || 'en',
      timezone: (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone || '' : '',
      timezone_offset: new Date().getTimezoneOffset(),
      data: eventData || {},
      timestamp: Date.now()
    };

    // 1. Dispatch to Google Analytics 4
    sendToGA4(eventName, payload);

    // 2. Dispatch to First-Party LiteSpeed API
    var endpoint = getApiEndpoint();
    var jsonString = JSON.stringify(payload);

    // Prefer navigator.sendBeacon for non-blocking asynchronous delivery
    if (typeof navigator.sendBeacon === 'function') {
      var blob = new Blob([jsonString], { type: 'application/json' });
      var sent = navigator.sendBeacon(endpoint, blob);
      if (sent) return;
    }

    // Fallback to fetch with keepalive
    if (typeof fetch === 'function') {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: jsonString,
        keepalive: true
      }).catch(function () {});
    } else {
      // Legacy XMLHttpRequest fallback
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', endpoint, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(jsonString);
      } catch (e) {}
    }
  }

  // Expose global tracker object
  window.PoquitoTracker = {
    track: function (eventName, eventData) {
      sendTrackPayload(eventName, eventData);
    },
    trackPageView: function () {
      sendTrackPayload('pageview', {
        load_time: performance && performance.now ? Math.round(performance.now()) : 0
      });
    },
    trackClick: function (label, category, extra) {
      var data = extra || {};
      data.label = label;
      data.category = category || 'CTA';
      sendTrackPayload('ui_click', data);
    },
    trackConversion: function (type, details) {
      var data = details || {};
      data.conversion_type = type;
      sendTrackPayload('conversion', data);
    }
  };

  // Helper: Extract enclosing semantic section or container
  function getElementSection(el) {
    if (!el || !el.closest) return 'page';
    var container = el.closest('[data-section], header, nav, footer, main, section, aside, form, dialog, .modal, #directory, #contractors, #how-it-works, #pricing, #hero, #waitlist');
    if (!container) return 'body';
    return container.getAttribute('data-section') || container.id || container.tagName.toLowerCase();
  }

  // Helper: Deduce meaningful category for click events
  function getClickCategory(target, href, text) {
    if (href.indexOf('wa.me') !== -1 || href.indexOf('api.whatsapp.com') !== -1) {
      return 'Outbound_WhatsApp';
    }
    if (href.indexOf('tel:') === 0) {
      return 'Outbound_Call';
    }
    if (href.indexOf('.apk') !== -1 || href.indexOf('play.google.com') !== -1) {
      return 'App_Download';
    }
    if (href.indexOf('/es/') !== -1 || href.indexOf('../') !== -1 || text.indexOf('Español') !== -1 || text.indexOf('English') !== -1) {
      return 'Language_Switch';
    }
    if (target.closest('.category-chip, .cat-pill, .category-pill, .filter-chip, [data-category]')) {
      return 'Directory_Filter';
    }
    if (target.closest('.tone-btn, .urgency-chip, [data-tone], [data-urgency]')) {
      return 'Tone_Selector';
    }
    if (target.closest('.btn-listen, .audio-btn, [data-audio], [data-play]') || text.indexOf('Listen') !== -1 || text.indexOf('Escuchar') !== -1) {
      return 'Audio_Control';
    }
    if (target.closest('nav, header, .nav-links, .menu')) {
      return 'Navigation';
    }
    if (target.closest('footer')) {
      return 'Footer_Link';
    }
    if (target.closest('form, #waitlist, .waitlist-box')) {
      return 'Form_CTA';
    }
    if (target.tagName.toLowerCase() === 'summary' || target.closest('.accordion, [data-accordion]')) {
      return 'Accordion_Toggle';
    }
    return 'CTA';
  }

  // Universal Granular UI Click Tracker with Debouncing
  var lastClickTime = 0;
  var lastClickTarget = null;

  function attachAutoTrackListeners() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('a, button, [role="button"], [data-track], [data-track-click], input[type="submit"], input[type="button"], summary, .category-pill, .filter-chip, .tone-btn');
      if (!target) return;

      var now = Date.now();
      if (target === lastClickTarget && now - lastClickTime < 350) {
        return; // Debounce rapid double-clicks
      }
      lastClickTime = now;
      lastClickTarget = target;

      var trackAttr = target.getAttribute('data-track') || target.getAttribute('data-track-click');
      var href = target.getAttribute('href') || (target.tagName.toLowerCase() === 'a' ? target.href : '');
      var text = (target.getAttribute('aria-label') || target.getAttribute('title') || target.innerText || target.value || target.textContent || '').trim().replace(/\s+/g, ' ').substring(0, 60);
      var section = getElementSection(target);
      var category = getClickCategory(target, href, text);
      var tagName = target.tagName.toLowerCase();

      // Explicit Data-Track override
      if (trackAttr) {
        window.PoquitoTracker.track('ui_click', {
          action: trackAttr,
          category: category,
          text: text,
          href: href,
          section: section,
          tag: tagName
        });
        return;
      }

      // Outbound WhatsApp links
      if (category === 'Outbound_WhatsApp') {
        window.PoquitoTracker.track('whatsapp_click', {
          href: href,
          target_url: href,
          text: text,
          section: section
        });
        return;
      }

      // Outbound Call links
      if (category === 'Outbound_Call') {
        window.PoquitoTracker.track('call_click', {
          href: href,
          text: text,
          section: section
        });
        return;
      }

      // Outbound APK / Store / External download links
      if (category === 'App_Download') {
        window.PoquitoTracker.track('download_click', {
          href: href,
          text: text,
          section: section
        });
        return;
      }

      // Skip empty or generic click targets with no identifiable text or action
      if (!text && !href && !target.id) return;

      // Universal Granular UI Click
      var actionLabel = target.id ? ('id:' + target.id) : (category.toLowerCase() + ':' + text.toLowerCase().substring(0, 24));
      window.PoquitoTracker.track('ui_click', {
        action: actionLabel,
        category: category,
        text: text,
        href: href,
        section: section,
        tag: tagName
      });
    }, { passive: true });
  }

  // Time on page tracking (beforeunload / visibilitychange)
  var pageStartTime = Date.now();
  var durationLogged = false;

  function logPageDuration() {
    if (durationLogged) return;
    durationLogged = true;
    var durationSeconds = Math.round((Date.now() - pageStartTime) / 1000);
    if (durationSeconds > 1) {
      sendTrackPayload('time_on_page', {
        duration_seconds: durationSeconds
      });
    }
  }

  window.addEventListener('beforeunload', logPageDuration);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      logPageDuration();
    }
  });

  // Initialize Telemetry on DOM Ready
  function initTracker() {
    initGA4();
    window.PoquitoTracker.trackPageView();
    attachAutoTrackListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracker);
  } else {
    initTracker();
  }

})();
