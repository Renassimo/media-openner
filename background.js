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
      func: (mode) => {
        window.__domSelectorMode = mode;
      },
      args: ["image"],
    });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
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
