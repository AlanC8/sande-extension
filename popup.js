document.addEventListener("DOMContentLoaded", () => {
  const statusElement = document.getElementById("status");
  const loginForm = document.getElementById("login-form");
  const logoutButton = document.getElementById("logout-button");
  const categorySelection = document.getElementById("category-selection");
  const imageSelection = document.getElementById("image-selection");
  const generateButton = document.getElementById("generate-button");
  const spinner = document.getElementById("spinner");
  const saveButton = document.getElementById("save-button");
  const resetButton = document.getElementById("reset-button");
  const selectedImage = document.getElementById("selected-image");

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("http://localhost:3001/api/v1/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => response.json())
    .then(data => {
      if (data.accessToken) {
        chrome.storage.local.set({
          userToken: data.accessToken,
          userImage: data.user.userImage
        }, () => {
          statusElement.textContent = "Logged in successfully!";
          loginForm.style.display = "none";
          logoutButton.style.display = "block";
          categorySelection.style.display = "block";
          imageSelection.style.display = "block";
          generateButton.style.display = "block";
        });
      } else {
        statusElement.textContent = "Login failed.";
      }
    })
    .catch(error => {
      console.error("Error:", error);
      statusElement.textContent = "Login failed.";
    });
  });

  logoutButton.addEventListener("click", () => {
    chrome.storage.local.clear(() => {
      statusElement.textContent = "Please log in.";
      loginForm.style.display = "block";
      logoutButton.style.display = "none";
      categorySelection.style.display = "none";
      imageSelection.style.display = "none";
      generateButton.style.display = "none";
      saveButton.style.display = "none";
      resetButton.style.display = "none";
    });
  });

  generateButton.addEventListener("click", () => {
    chrome.storage.local.get(["userToken", "category", "imageUrl"], (result) => {
      console.log("Values before generating:", result);
      const userToken = result.userToken;
      const category = document.getElementById("category").value;
      const imageUrl = result.imageUrl;

      if (!userToken || !imageUrl || !category) {
        alert("Please log in and select an image and category first.");
        return;
      }

      spinner.style.display = "block";
      generateButton.style.display = "none";

      fetch("http://localhost:3001/api/v1/vton-extension", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userToken}`
        },
        body: JSON.stringify({ imageLink: imageUrl, category: category })
      })
      .then(response => response.json())
      .then(data => {
        spinner.style.display = "none";
        if (data.output) {
          selectedImage.src = data.output;
          saveButton.style.display = "block";
          saveButton.setAttribute("href", data.output);
          saveButton.setAttribute("download", "generated_image.png");
        } else {
          console.error("Error:", data);
          alert("Failed to generate image.");
          generateButton.style.display = "block";
        }
      })
      .catch(error => {
        spinner.style.display = "none";
        generateButton.style.display = "block";
        console.error("Error:", error);
        alert("Failed to generate image.");
      });
    });
  });

  resetButton.addEventListener("click", () => {
    selectedImage.src = "";
    saveButton.style.display = "none";
    generateButton.style.display = "block";
  });

  chrome.storage.local.get(["userToken", "imageUrl"], (result) => {
    if (result.userToken) {
      statusElement.textContent = "Logged in successfully!";
      loginForm.style.display = "none";
      logoutButton.style.display = "block";
      categorySelection.style.display = "block";
      imageSelection.style.display = "block";
      generateButton.style.display = "block";
    }
    if (result.imageUrl) {
      selectedImage.src = result.imageUrl;
    }
  });
});
