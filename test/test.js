document.body.style.padding = '10px';
if (document.body.style.padding == '10px') {
  console.info('js loaded');
  document.body.style.padding = '';
}

var test = 1;

var getStyles = function (elem) {
  // Support: IE<=11+, Firefox<=30+ (#15098, #14150)
  // IE throws on elements created in popups
  // FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
  var view = elem.ownerDocument.defaultView;

  if (!view || !view.opener) {
    view = window;
  }

  return view.getComputedStyle(elem);
};
