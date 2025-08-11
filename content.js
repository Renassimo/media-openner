(function () {
  if (window.__domSelectorActive) return;
  window.__domSelectorActive = true;

  const style = document.createElement('style');
  style.id = '__dom_selector_style';
  style.textContent = '* { cursor: crosshair !important; }';
  document.head.appendChild(style);

  function cleanup() {
    document.getElementById('__dom_selector_style')?.remove();
    document.removeEventListener('click', clickHandler, true);
    document.removeEventListener('keydown', keyHandler, true);
    window.__domSelectorActive = false;
  }

  function findNearestImageSrc(element) {
    if (!element) return null;
    if (element.tagName && element.tagName.toLowerCase() === 'img' && element.src) {
      return element.src;
    }
    const imgInDescendants = element.querySelector('img');
    if (imgInDescendants && imgInDescendants.src) {
      return imgInDescendants.src;
    }
    // Search for the next sibling if the current element does not have an image
    let sibling = element.nextElementSibling;
    while (sibling) {
      if (sibling.tagName && sibling.tagName.toLowerCase() === 'img' && sibling.src) {
        return sibling.src;
      }
      const imgInSibling = sibling.querySelector('img');
      if (imgInSibling && imgInSibling.src) {
        return imgInSibling.src;
      }
      sibling = sibling.nextElementSibling;
    }
    return null;
  }

  function clickHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    const src = findNearestImageSrc(e.target);
    if (src) {
      console.log('Nearest image src:', src);
      window.open(src, '_blank');
    } else {
      console.log('No image found in or near the selected element');
    }
    cleanup();
  }

  function keyHandler(e) {
    if (e.key === 'Escape') {
      console.log('DOM Selector — canceled');
      cleanup();
    }
  }

  document.addEventListener('click', clickHandler, true);
  document.addEventListener('keydown', keyHandler, true);
})();