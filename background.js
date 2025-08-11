chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "pickImage",
    title: "Pick image",
    contexts: ["all"],
  });
  chrome.contextMenus.create({
    id: "pickVideo",
    title: "Pick video",
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

        const el = document.elementFromPoint(
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
      func: (mode) => {
        window.__domSelectorMode = mode;
      },
      args: ["video"],
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
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
