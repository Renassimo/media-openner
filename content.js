(function () {
  if (window.__domSelectorActive) return;
  window.__domSelectorActive = true;

  const style = document.createElement("style");
  style.id = "__dom_selector_style";
  style.textContent = "* { cursor: crosshair !important; }";
  document.head.appendChild(style);

  // mode: image or video
  const mode = window.__domSelectorMode || "image";

  function cleanup() {
    document.getElementById("__dom_selector_style")?.remove();
    document.removeEventListener("click", clickHandler, true);
    document.removeEventListener("keydown", keyHandler, true);
    window.__domSelectorActive = false;
    window.__domSelectorMode = null;
  }

  function findNearestImageSrc(element) {
    if (!element) return null;
    if (
      element.tagName &&
      element.tagName.toLowerCase() === "img" &&
      element.src
    ) {
      return element.src;
    }
    const imgInDescendants = element.querySelector("img");
    if (imgInDescendants && imgInDescendants.src) {
      return imgInDescendants.src;
    }
    let sibling = element.nextElementSibling;
    while (sibling) {
      if (
        sibling.tagName &&
        sibling.tagName.toLowerCase() === "img" &&
        sibling.src
      ) {
        return sibling.src;
      }
      const imgInSibling = sibling.querySelector("img");
      if (imgInSibling && imgInSibling.src) {
        return imgInSibling.src;
      }
      sibling = sibling.nextElementSibling;
    }
    return null;
  }

  function findNearestVideoSrc(element) {
    if (!element) return null;
    let videoEl = null;
    if (element.tagName && element.tagName.toLowerCase() === "video") {
      videoEl = element;
    } else {
      videoEl = element.querySelector("video");
    }
    if (!videoEl) return null;
    const sources = Array.from(videoEl.querySelectorAll("source"));
    if (!sources.length) return null;

    // 1. label="original"
    let original = sources.find(
      (s) => s.getAttribute("label")?.toLowerCase() === "original"
    );
    if (original) return original.src;

    // 2. max numeric label
    let withNumberLabels = sources
      .map((s) => ({ el: s, num: parseFloat(s.getAttribute("label")) }))
      .filter((obj) => !isNaN(obj.num));
    if (withNumberLabels.length) {
      let maxLabel = withNumberLabels.reduce((a, b) => (b.num > a.num ? b : a));
      return maxLabel.el.src;
    }

    // 3. last source
    return sources[sources.length - 1].src;
  }

  function clickHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    let src = null;
    if (mode === "video") {
      src = findNearestVideoSrc(e.target);
    } else {
      src = findNearestImageSrc(e.target);
    }
    if (src) {
      console.log(`Nearest ${mode} src:`, src);
      window.open(src, "_blank");
    } else {
      console.log(`No ${mode} found in or near the selected element`);
    }
    cleanup();
  }

  function keyHandler(e) {
    if (e.key === "Escape") {
      console.log("DOM Selector — canceled");
      cleanup();
    }
  }

  document.addEventListener("click", clickHandler, true);
  document.addEventListener("keydown", keyHandler, true);
})();
