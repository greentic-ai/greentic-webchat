(function () {
  var BASE_PATH = '/greentic-webchat/';

  function repoSegment() {
    return BASE_PATH.replace(/^\/+|\/+$/g, '');
  }

  function currentTenant() {
    var segments = window.location.pathname.replace(/^\/+|\/+$/g, '').split('/');
    if (segments.length >= 2 && segments[0] === repoSegment()) {
      return segments[1];
    }
    var html = document.documentElement;
    if (html && typeof html.getAttribute === 'function') {
      var value = html.getAttribute('data-tenant');
      if (value) return value;
    }
    return '';
  }

  window.__BASE_PATH__ = BASE_PATH;
  window.__TENANT__ = currentTenant();
  window.__skinUrl__ = function (tenant) {
    var t = tenant || window.__TENANT__ || 'demo';
    return BASE_PATH + 'skins/' + encodeURIComponent(t) + '.json';
  };
})();
