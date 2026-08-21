/**
 * PoquitoTalk Lightweight Visitor & Event Tracker (tracker.js)
 * Privacy-first, zero-dependency client-side telemetry.
 * Captures pageviews, sessions, UTM campaign sources, device metadata, and conversion actions.
 */

(function () {
  'use strict';

  var STORAGE_KEY_VID = 'pt_vid';
  var STORAGE_KEY_SID = 'pt_sid';
  var STORAGE_KEY_SID_TIME = 'pt_sid_time';
  var SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

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

  // Core tracking dispatcher
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
      screen_width: window.innerWidth || screen.width || 0,
      screen_height: window.innerHeight || screen.height || 0,
      language: navigator.language || navigator.userLanguage || 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      timezone_offset: new Date().getTimezoneOffset(),
      data: eventData || {},
      timestamp: Date.now()
    };

    var endpoint = getApiEndpoint();
    var jsonString = JSON.stringify(payload);

    // Prefer navigator.sendBeacon for reliable async delivery
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
      sendTrackPayload('click', data);
    },
    trackConversion: function (type, details) {
      var data = details || {};
      data.conversion_type = type;
      sendTrackPayload('conversion', data);
    }
  };

  // Initial Pageview Tracking on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      window.PoquitoTracker.trackPageView();
      attachAutoTrackListeners();
    });
  } else {
    window.PoquitoTracker.trackPageView();
    attachAutoTrackListeners();
  }

  // Auto-track key interactive clicks across the page
  function attachAutoTrackListeners() {
    document.addEventListener('click', function (e) {
      var target = e.target.closest('a, button, [data-track], [data-track-click]');
      if (!target) return;

      var trackAttr = target.getAttribute('data-track') || target.getAttribute('data-track-click');
      var href = target.getAttribute('href') || '';
      var text = (target.innerText || target.textContent || '').trim().substring(0, 50);

      if (trackAttr) {
        window.PoquitoTracker.track('ui_click', {
          action: trackAttr,
          text: text,
          href: href
        });
        return;
      }

      // Outbound WhatsApp links
      if (href.indexOf('wa.me') !== -1 || href.indexOf('api.whatsapp.com') !== -1) {
        window.PoquitoTracker.track('whatsapp_click', {
          href: href,
          text: text
        });
      }
      // Outbound APK / Store / External links
      else if (href.indexOf('.apk') !== -1 || href.indexOf('play.google.com') !== -1) {
        window.PoquitoTracker.track('download_click', {
          href: href,
          text: text
        });
      }
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

})();
