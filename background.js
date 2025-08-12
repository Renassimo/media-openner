chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "pickImage",
    title: "Pick image (Cmd+I)",
    contexts: ["all"],
  });
  chrome.contextMenus.create({
    id: "pickVideo",
    title: "Pick video (CMD+U)",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab?.id) return;

  if (info.menuItemId === "pickImage") {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
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

        const el = document?.elementFromPoint(
          window._contextMenuClickX,
          window._contextMenuClickY
        );
        const src = findNearestImageSrc(el);
        if (src) {
          window.open(src, "_blank");
        } else {
          console.log("No image found for element");
        }
      },
    });
  }

  if (info.menuItemId === "pickVideo") {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        function findVideoSourceUrl(element) {
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
          const original = sources.find(
            (s) => s.getAttribute("label")?.toLowerCase() === "original"
          );
          if (original) return original.src;

          // 2. max numeric label
          const numericSources = sources
            .map((s) => ({
              el: s,
              num: Number(s.getAttribute("label")),
            }))
            .filter((s) => !isNaN(s.num));
          if (numericSources.length) {
            numericSources.sort((a, b) => b.num - a.num);
            return numericSources[0].el.src;
          }

          // 3. last source
          return sources[sources.length - 1].src;
        }

        const el = document?.elementFromPoint(
          window._contextMenuClickX,
          window._contextMenuClickY
        );
        const src = findVideoSourceUrl(el);
        if (src) {
          window.open(src, "_blank");
        } else {
          console.log("No video source found for element");
        }
      },
    });
  }
});

// Inject listener for right-click coordinates
tabsQueryAndInject();

function tabsQueryAndInject() {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (!tab.id) continue;
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          document.addEventListener(
            "contextmenu",
            (e) => {
              window._contextMenuClickX = e.clientX;
              window._contextMenuClickY = e.clientY;
            },
            true
          );
        },
      });
    }
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "pick_image_hotkey") {
    activatePickingMode("image");
  }
  if (command === "pick_video_hotkey") {
    activatePickingMode("video");
  }
});

function activatePickingMode(type) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (mode) => {
        document.body.style.cursor = "crosshair";
        const listener = (event) => {
          event.preventDefault();
          document.removeEventListener("click", listener, true);
          document.body.style.cursor = "";
          if (mode === "image") {
            function findNearestImageSrc(element) {
              if (!element) return null;
              if (element.tagName?.toLowerCase() === "img" && element.src)
                return element.src;
              const imgInDescendants = element.querySelector("img");
              if (imgInDescendants?.src) return imgInDescendants.src;
              let sibling = element.nextElementSibling;
              while (sibling) {
                if (sibling.tagName?.toLowerCase() === "img" && sibling.src)
                  return sibling.src;
                const imgInSibling = sibling.querySelector("img");
                if (imgInSibling?.src) return imgInSibling.src;
                sibling = sibling.nextElementSibling;
              }
              return null;
            }
            const src = findNearestImageSrc(event.target);
            if (src) window.open(src, "_blank");
          } else if (mode === "video") {
            function findVideoSourceUrl(element) {
              if (!element) return null;
              let videoEl =
                element.tagName?.toLowerCase() === "video"
                  ? element
                  : element.querySelector("video");
              if (!videoEl) return null;
              const sources = Array.from(videoEl.querySelectorAll("source"));
              if (!sources.length) return null;
              const original = sources.find(
                (s) => s.getAttribute("label")?.toLowerCase() === "original"
              );
              if (original) return original.src;
              const numericSources = sources
                .map((s) => ({ el: s, num: Number(s.getAttribute("label")) }))
                .filter((s) => !isNaN(s.num));
              if (numericSources.length) {
                numericSources.sort((a, b) => b.num - a.num);
                return numericSources[0].el.src;
              }
              return sources[sources.length - 1].src;
            }
            const src = findVideoSourceUrl(event.target);
            if (src) window.open(src, "_blank");
          }
        };
        document.addEventListener("click", listener, true);
      },
      args: [type],
    });
  });
}