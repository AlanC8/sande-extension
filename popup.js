document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["userToken", "category", "imageUrl"], (result) => {
    console.log("Loaded from storage on DOMContentLoaded:", result);
    if (result.userToken) {
      document.getElementById("status").textContent = "Logged in successfully!";
      document.getElementById("login-form").style.display = "none";
      document.getElementById("category-selection").style.display = "block";
      document.getElementById("logout-button").style.display = "block";
      if (result.category) {
        document.getElementById("category").value = result.category;
      }
      if (result.imageUrl) {
        document.getElementById("image-selection").style.display = "block";
        document.getElementById("selected-image").src = result.imageUrl;
        document.getElementById("generate-button").style.display = "block";
      }
    } else {
      document.getElementById("status").textContent = "Please log in.";
      document.getElementById("login-form").style.display = "block";
      document.getElementById("category-selection").style.display = "none";
      document.getElementById("image-selection").style.display = "none";
      document.getElementById("generate-button").style.display = "none";
      document.getElementById("spinner").style.display = "none";
      document.getElementById("save-button").style.display = "none";
    }
  });
});

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  fetch("http://localhost:3001/api/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Login response data:", data);
      if (data.accessToken) {
        chrome.storage.local.set({ userToken: data.accessToken }, () => {
          console.log("User token saved:", data.accessToken);
          document.getElementById("status").textContent =
            "Logged in successfully!";
          document.getElementById("login-form").style.display = "none";
          document.getElementById("category-selection").style.display = "block";
          document.getElementById("logout-button").style.display = "block";
        });
      } else {
        document.getElementById("status").textContent = "Login failed.";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("status").textContent = "Login failed.";
    });
});

document.getElementById("category").addEventListener("change", (event) => {
  event.preventDefault(); // Предотвращаем обновление страницы
  const category = event.target.value;
  chrome.storage.local.set({ category: category }, () => {
    console.log("Category saved:", category);
  });
});

document
  .getElementById("generate-button")
  .addEventListener("click", (event) => {
    event.preventDefault(); // Предотвращаем обновление страницы
    chrome.storage.local.get(
      ["userToken", "category", "imageUrl"],
      (result) => {
        console.log("Values before generating:", result);
        const userToken = result.userToken;
        const category = result.category;
        const imageUrl = result.imageUrl;

        // Дополнительное логирование перед отправкой запроса
        console.log("User Token:", userToken);
        console.log("Category:", category);
        console.log("Image URL:", imageUrl);

        if (!userToken || !imageUrl || !category) {
          alert("Please log in and select an image and category first.");
          return;
        }

        document.getElementById("spinner").style.display = "block";
        document.getElementById("generate-button").style.display = "none";

        fetch("http://localhost:3001/api/v1/vton-extension", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ imageLink: imageUrl, category: category }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            console.log("Response from backend:", data);
            document.getElementById("spinner").style.display = "none";
            if (data.output) {
              document.getElementById("selected-image").src = data.output;
              const saveButton = document.getElementById("save-button");
              saveButton.style.display = "block";
              saveButton.setAttribute("href", data.output);
              saveButton.setAttribute("download", "generated_image.png");
            } else {
              console.error("Error:", data);
              alert("Failed to generate image.");
              document.getElementById("generate-button").style.display =
                "block";
            }
          })
          .catch((error) => {
            document.getElementById("spinner").style.display = "none";
            document.getElementById("generate-button").style.display = "block";
            console.error("Error:", error);
            alert("Failed to generate image.");
          });
      }
    );
  });

document.getElementById("logout-button").addEventListener("click", (event) => {
  event.preventDefault(); // Предотвращаем обновление страницы
  chrome.storage.local.remove(["userToken", "category", "imageUrl"], () => {
    console.log("User logged out, storage cleared");
    document.getElementById("status").textContent = "Logged out successfully!";
    document.getElementById("login-form").style.display = "block";
    document.getElementById("category-selection").style.display = "none";
    document.getElementById("image-selection").style.display = "none";
    document.getElementById("generate-button").style.display = "none";
    document.getElementById("spinner").style.display = "none";
    document.getElementById("save-button").style.display = "none";
    document.getElementById("logout-button").style.display = "none";
  });
});
