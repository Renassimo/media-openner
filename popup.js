const status = document.getElementById("status");

document.getElementById("selectModeBtn").addEventListener("click", async () => {
  status.textContent = "Activating...";
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab || !tab.id) throw new Error("No active tab found");

    if (!chrome.scripting)
      throw new Error(
        "chrome.scripting API not available — check manifest permissions"
      );

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    status.textContent =
      "Select mode activated — click any element in the page";
    setTimeout(() => window.close(), 500);
  } catch (err) {
    console.error("Injection failed:", err);
    status.textContent = "Failed to activate: " + err.message;
    alert("Failed to activate select mode: " + err.message);
  }
});
