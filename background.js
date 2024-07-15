chrome.runtime.onInstalled.addListener(() => {
  console.log("AI Clothing Selector Extension Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received in background script:", message);

  if (message.type === "imageSelected") {
    const { imageUrl } = message.data;
    chrome.storage.local.set({ imageUrl: imageUrl }, () => {
      console.log("Image URL saved:", imageUrl);
      sendResponse({ status: "success" });
    });
    return true; // To keep the messaging channel open for sendResponse
  }
});
