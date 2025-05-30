document.addEventListener("DOMContentLoaded", () => {
  const fileUpload = document.getElementById("file-upload");
  const fileName = document.getElementById("file-name");
  const processButton = document.getElementById("process-button");
  const uploadForm = document.getElementById("upload-form");
  const backButton = document.querySelector("header .cta-button");
  const uploadSection = document.querySelector(".upload-section");
  const analysisResults = document.querySelector(".analysis-results");
  const contentBox = document.querySelector(".content-box");
  const tabButtons = document.querySelectorAll(".tab-button");
  const startOverButton = document.querySelector(".action-buttons .cta-button.secondary");
  const downloadButton = document.querySelector(".action-buttons .cta-button:nth-child(1)");
  const customizeButton = document.querySelector(".action-buttons .cta-button:nth-child(2)");

  analysisResults.style.display = "none";
  let currentResult = null;

  function updateProgressStep(stepIndex) {
    const steps = document.querySelectorAll(".step");
    steps.forEach((step, index) => {
      step.classList.toggle("active", index === stepIndex);
    });
  }

  fileUpload.addEventListener("change", () => {
    if (fileUpload.files.length === 1) {
      const file = fileUpload.files[0];
      const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
      const validExtensions = [".pdf", ".txt"];
      if (validExtensions.includes(extension)) {
        fileName.textContent = file.name;
        processButton.disabled = false;
      } else {
        alert("Please select a .pdf or .txt file.");
        fileUpload.value = "";
        fileName.textContent = "No file chosen";
        processButton.disabled = true;
      }
    } else {
      fileName.textContent = "No file chosen";
      processButton.disabled = true;
    }
  });

  let isSubmitting = false;
  uploadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    processButton.disabled = true;
    processButton.textContent = "Processing...";
    updateProgressStep(1);

    try {
      const formData = new FormData(uploadForm);
      const response = await fetch("http://127.0.0.1:8080/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error ${response.status}`);
      }

      const data = await response.json();
      currentResult = data;

      // Check keypoints and save to localStorage
      const keypoints = data.keypoints;
      if (!keypoints || Object.keys(keypoints).length === 0) {
        alert("No keypoints found in the document.");
        resetToInitialState();
        return;
      }
      localStorage.setItem('pptKeypoints', JSON.stringify(keypoints));
      
      uploadSection.style.display = "none";
      analysisResults.style.display = "block";
      switchTab("extracted-texts");
      

    } catch (error) {
      contentBox.innerHTML = `<div class="error-message">Error: ${error.message}</div>`;
      uploadSection.style.display = "none";
      analysisResults.style.display = "block";
    } finally {
      isSubmitting = false;
      processButton.disabled = false;
      processButton.textContent = "Process Document";
    }
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button.dataset.tab);
    });
  });

  if (backButton) backButton.addEventListener("click", resetToInitialState);
  if (startOverButton) startOverButton.addEventListener("click", resetToInitialState);

if (downloadButton) {
    downloadButton.addEventListener("click", () => {
        if (!currentResult) {
            alert("No results available to download.");
            return;
        }

        // Find the active tab
        const activeTab = document.querySelector(".tab-button.active").dataset.tab;
        let content = "";
        let downloadFileName = `${currentResult.filename.split('.')[0]}`;

        if (activeTab === "extracted-texts") {
            content = currentResult.text || "";
            downloadFileName += "_extracted.txt";
        } else if (activeTab === "summary") {
            const orderedSections = [
                "Abstract",
                "Introduction",
                "Proposed Methodology",
                "Results",
                "Conclusion"
            ];
            content = orderedSections
                .filter(section => currentResult.summary[section])
                .map(section => `${section}\n${currentResult.summary[section]}\n`)
                .join("\n");
            downloadFileName += "_summary.txt";
        } else if (activeTab === "keypoints") {
            const orderedSections = [
                "Abstract",
                "Introduction",
                "Proposed Methodology",
                "Results",
                "Conclusion"
            ];
            content = orderedSections
                .filter(section => currentResult.keypoints[section] && currentResult.keypoints[section].length > 0)
                .map(section => {
                    const points = currentResult.keypoints[section]
                        .map(point => `- ${point}`)
                        .join("\n");
                    return `${section}\n${points}\n`;
                })
                .join("\n");
            downloadFileName += "_keypoints.txt";
        }

        if (content) {
            const blob = new Blob([content], { type: "text/plain" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = downloadFileName;
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            alert("No content available to download for the selected tab.");
        }
    });
}

  if (customizeButton) {
    customizeButton.addEventListener("click", () => {
      window.location.href = "/customize";
    });
  }

  function switchTab(tabName) {
    tabButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.tab === tabName);
    });

    const stepIndex = {
      "extracted-texts": 1,
      summary: 2,
      keypoints: 3,
    }[tabName] || 1;
    updateProgressStep(stepIndex);

    if (tabName === "extracted-texts") {
      displayResults(currentResult.text);
    } else if (tabName === "summary") {
      displaySummary(currentResult.summary);
    } else if (tabName === "keypoints") {
      displayKeypoints(currentResult.keypoints);
    }
  }

  function displayResults(text) {
    contentBox.innerHTML = `
      <div class="result-item">
        <h3>Extracted Text</h3>
        <div class="extracted-text">${formatText(text)}</div>
      </div>
    `;
  }  

  function displaySummary(summary) {
    const orderedSections = [
      "Abstract",
      "Introduction",
      "Proposed Methodology",
      "Results",
      "Conclusion"
    ];
  
    let html = `<div class="summary-container">`;
    for (const section of orderedSections) {
      if (summary[section]) {
        html += `<div class="summary-section"><h4>${section}</h4><p>${formatText(summary[section])}</p></div>`;
      }
    }
    html += `</div>`;
    contentBox.innerHTML = html;
  }

  function displayKeypoints(keypoints) {
    const orderedSections = [
      "Abstract",
      "Introduction",
      "Proposed Methodology",
      "Results",
      "Conclusion"
    ];
  
    let html = `<div class="keypoints-container">`;
    for (const section of orderedSections) {
      if (keypoints[section] && keypoints[section].length > 0) {
        html += `<div class="keypoints-section"><h4>${section}</h4><ul>`;
        for (const point of keypoints[section]) {
          html += `<li>${formatText(point)}</li>`;
        }
        html += `</ul></div>`;
      }
    }
    html += `</div>`;
    contentBox.innerHTML = html;
  }

  function formatText(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
  }

  function resetToInitialState() {
    analysisResults.style.display = "none";
    uploadSection.style.display = "block";
    updateProgressStep(0);
    fileUpload.value = "";
    fileName.textContent = "No file chosen";
    processButton.disabled = true;
    processButton.textContent = "Process Document";
    contentBox.innerHTML = "";
    currentResult = null;
    switchTab("extracted-texts");
  }
});


    document.addEventListener("DOMContentLoaded", () => {
        // Animate the header (fade in and slide down)
        gsap.from("header h1", {
            duration: 1,
            opacity: 0,
            y: -50,
            ease: "power2.out"
        });

        // Animate the back button (fade in with delay)
        gsap.from("#back", {
            duration: 1,
            opacity: 0,
            delay: 0.5,
            ease: "power2.out"
        });

        // Animate the progress bar steps (staggered fade-in and slide from left)
        gsap.from(".step", {
            duration: 0.8,
            opacity: 0,
            x: -30,
            stagger: 0.2,
            delay: 0.2,
            ease: "power2.out"
        });

        // Animate the upload section (fade in and slide up)
        gsap.from(".upload-section", {
            duration: 1,
            opacity: 0,
            y: 50,
            delay: 0.5,
            ease: "power2.out"
        });

        // Animate the upload section's content (staggered fade-in for children)
        gsap.from(".upload-section > *", {
            duration: 0.8,
            opacity: 0,
            y: 20,
            stagger: 0.1,
            delay: 0.7,
            ease: "power2.out"
        });
    });
