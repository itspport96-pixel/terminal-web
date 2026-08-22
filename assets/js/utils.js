// ═══════════════════════════════════════════════
// MENU HAMBURGUESA
// ═══════════════════════════════════════════════
(function() {
  'use strict';

  var toggleBtn = document.getElementById('nav-toggle-btn');
  var navMenu = document.getElementById('nav-menu');
  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', function() {
      var isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
      navMenu.classList.toggle('active');
    });
  }

  // ═══════════════════════════════════════════════
  // COOKIE CONSENT
  // ═══════════════════════════════════════════════
  var CONSENT_KEY = 'terminal_consent_v1';
  var banner = document.getElementById('cookie-banner');
  var btnAccept = document.getElementById('cookie-accept');
  var btnReject = document.getElementById('cookie-reject');
  var btnRejectAll = document.getElementById('cookie-reject-all');
  var userAccordion = document.getElementById('user-info-accordion');

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'wait_for_update': 500
  });

  var storedConsent = null;
  try {
    storedConsent = localStorage.getItem(CONSENT_KEY);
  } catch (e) {}

  if (storedConsent === null) {
    if (banner) banner.classList.remove('hidden');
  } else if (storedConsent === 'granted') {
    gtag('consent', 'update', {
      'ad_storage': 'denied',
      'analytics_storage': 'granted',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
    activateUserInfo();
  } else {
    gtag('consent', 'update', {
      'ad_storage': 'denied',
      'analytics_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied'
    });
  }

  if (btnAccept) {
    btnAccept.addEventListener('click', function() {
      try { localStorage.setItem(CONSENT_KEY, 'granted'); } catch (e) {}
      gtag('consent', 'update', {
        'ad_storage': 'denied',
        'analytics_storage': 'granted',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
      if (banner) banner.classList.add('hidden');
      activateUserInfo();
    });
  }

  if (btnReject) {
    btnReject.addEventListener('click', function() {
      try { localStorage.setItem(CONSENT_KEY, 'necessary'); } catch (e) {}
      gtag('consent', 'update', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
      if (banner) banner.classList.add('hidden');
    });
  }

  if (btnRejectAll) {
    btnRejectAll.addEventListener('click', function() {
      try {
        localStorage.setItem(CONSENT_KEY, 'denied');
        sessionStorage.removeItem('terminal_user_info');
      } catch (e) {}
      gtag('consent', 'update', {
        'ad_storage': 'denied',
        'analytics_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
      if (banner) banner.classList.add('hidden');
    });
  }

  // ═══════════════════════════════════════════════
  // USER INFO
  // ═══════════════════════════════════════════════
  function activateUserInfo() {
    if (!userAccordion) return;
    userAccordion.style.display = '';
    var detailsEl = userAccordion;
    detailsEl.addEventListener('toggle', function() {
      if (detailsEl.open) {
        collectAndDisplayUserInfo();
      }
    });
  }

  function collectAndDisplayUserInfo() {
    var grid = document.getElementById('user-info-grid');
    if (!grid) return;

    var cached = null;
    try { cached = sessionStorage.getItem('terminal_user_info'); } catch (e) {}

    if (cached) {
      renderUserInfo(JSON.parse(cached), grid);
      return;
    }

    var info = {
      'Navegador': getBrowserInfo(),
      'Sistema Operativo': getOSInfo(),
      'Dispositivo': getDeviceType(),
      'Resolucion': window.screen.width + 'x' + window.screen.height,
      'Profundidad Color': window.screen.colorDepth + '-bit',
      'Viewport': window.innerWidth + 'x' + window.innerHeight,
      'Idioma': navigator.language || 'desconocido',
      'Zona Horaria': Intl.DateTimeFormat().resolvedOptions().timeZone || 'desconocida',
      'Referrer': document.referrer || 'Directo / Ninguno',
      'URL Actual': window.location.href,
      'Protocolo': window.location.protocol,
      'Touch Support': ('ontouchstart' in window) ? 'Si' : 'No',
      'Conexion': getConnectionInfo(),
      'Modo Oscuro Preferido': window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Si' : 'No',
      'Cookies Habilitadas': navigator.cookieEnabled ? 'Si' : 'No',
      'JavaScript': 'Activo',
      'Hora Local': new Date().toLocaleString('es-ES'),
      'User Agent (hash)': hashString(navigator.userAgent || 'unknown')
    };

    try { sessionStorage.setItem('terminal_user_info', JSON.stringify(info)); } catch (e) {}

    fetchIPInfo(info, grid);
  }

  function renderUserInfo(info, grid) {
    grid.innerHTML = '';
    for (var key in info) {
      if (info.hasOwnProperty(key)) {
        var item = document.createElement('div');
        item.className = 'user-info-item';
        var isHighlight = key === 'IP Publica' || key === 'Pais' || key === 'ISP';
        item.innerHTML =
          '<span class="user-info-label">' + escapeHtml(key) + '</span>' +
          '<span class="user-info-value' + (isHighlight ? ' highlight' : '') + '">' + escapeHtml(String(info[key])) + '</span>';
        grid.appendChild(item);
      }
    }
  }

  function fetchIPInfo(info, grid) {
    fetch('https://ipapi.co/json/')
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(data) {
        if (data.ip) info['IP Publica'] = data.ip;
        if (data.city) info['Ciudad'] = data.city;
        if (data.region) info['Region'] = data.region;
        if (data.country_name) info['Pais'] = data.country_name + ' (' + (data.country_code || '') + ')';
        if (data.org) info['ISP'] = data.org;
        if (data.latitude && data.longitude) {
          info['Latitud'] = String(data.latitude);
          info['Longitud'] = String(data.longitude);
        }
        try { sessionStorage.setItem('terminal_user_info', JSON.stringify(info)); } catch (e) {}
        renderUserInfo(info, grid);
      })
      .catch(function(err) {
        fetch('https://api.ipify.org?format=json')
          .then(function(res) { return res.json(); })
          .then(function(data) {
            if (data.ip) info['IP Publica'] = data.ip;
            info['Nota'] = 'Datos de geolocalizacion no disponibles';
            try { sessionStorage.setItem('terminal_user_info', JSON.stringify(info)); } catch (e) {}
            renderUserInfo(info, grid);
          })
          .catch(function() {
            info['IP Publica'] = 'No disponible (API limitada o bloqueada)';
            renderUserInfo(info, grid);
          });
      });
  }

  function getBrowserInfo() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('SamsungBrowser') > -1) return 'Samsung Browser';
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
    if (ua.indexOf('Trident') > -1) return 'Internet Explorer';
    if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) return 'Microsoft Edge';
    if (ua.indexOf('Chrome') > -1) return 'Google Chrome';
    if (ua.indexOf('Safari') > -1) return 'Apple Safari';
    return 'Desconocido';
  }

  function getOSInfo() {
    var ua = navigator.userAgent;
    if (ua.indexOf('Windows NT 10') > -1) return 'Windows 10/11';
    if (ua.indexOf('Windows NT 6.3') > -1) return 'Windows 8.1';
    if (ua.indexOf('Windows NT 6.2') > -1) return 'Windows 8';
    if (ua.indexOf('Windows NT 6.1') > -1) return 'Windows 7';
    if (ua.indexOf('Mac OS X') > -1 || ua.indexOf('macOS') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1 || ua.indexOf('iPod') > -1) return 'iOS';
    return 'Desconocido';
  }

  function getDeviceType() {
    var ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'Tablet';
    if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return 'Movil';
    return 'Escritorio';
  }

  function getConnectionInfo() {
    var conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) return 'Desconocida';
    var type = conn.effectiveType || '?';
    var downlink = conn.downlink ? ' (~' + conn.downlink + ' Mbps)' : '';
    return type + downlink;
  }

  function hashString(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return 'UA_' + Math.abs(hash).toString(16).toUpperCase();
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

})();

// ███████ SCRIPT PARA COPIAR CÓDIGO ███████ //

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.copy-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const wrapper = this.closest('.code-block-wrapper');
      const codeBlock = wrapper.querySelector('.code-block');
      const text = codeBlock.textContent.trim();
      navigator.clipboard.writeText(text).then(() => {
        const original = this.textContent;
        this.textContent = '[Copiado]';
        setTimeout(() => this.textContent = original, 2000);
      }).catch(() => alert('No se pudo copiar.'));
    });
  });
});
