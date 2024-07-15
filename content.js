document.addEventListener("click", (event) => {
  let imageUrl = '';

  if (event.target.tagName === "IMG") {
    imageUrl = event.target.src;
  } else {
    const bgImage = window.getComputedStyle(event.target).backgroundImage;
    if (bgImage && bgImage !== 'none') {
      imageUrl = bgImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2');
    }
  }

  if (imageUrl) {
    console.log("Image URL clicked:", imageUrl);

    chrome.runtime.sendMessage(
      { type: "imageSelected", data: { imageUrl } },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError.message);
        } else if (response && response.status === "success") {
          console.log("Image selected:", imageUrl);
          alert("Image selected. Open the extension popup to generate.");
        } else {
          console.error("Error selecting image", response);
        }
      }
    );
  }
});
