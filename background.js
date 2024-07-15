chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Clothing Selector Extension Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);

  if (message.type === "imageSelected") {
    chrome.storage.local.set({ imageUrl: message.data.imageUrl }, () => {
      console.log("Image URL saved:", message.data.imageUrl);
      sendResponse({ status: "success" });
    });
  } else if (message.type === "getSessionData") {
    chrome.storage.local.get(["userToken", "userImage", "imageUrl"], (data) => {
      sendResponse({ data });
    });
  } else if (message.type === "setSessionData") {
    chrome.storage.local.set(message.data, () => {
      console.log("Session data updated:", message.data);
      sendResponse({ status: "success" });
    });
  }
  return true;
});
