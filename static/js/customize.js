document.addEventListener("DOMContentLoaded", function () {
    const previewBox = document.getElementById("previewBox");
    const fontSelect = document.getElementById("font");
    const colorPicker = document.getElementById("color");
    const themeSelect = document.getElementById("theme");
    const selectedColor = document.getElementById("selectedColor");
    const resetButton = document.getElementById("resetBtn");
    const commandInput = document.querySelector(".input-container input");
    const applyCommandButton = document.querySelector(".send-btn");
    const voiceButton = document.querySelector(".voice-btn");
    const statusDisplay = document.querySelector(".status");

    // Manual editing UI elements
    const slideNumberSelect = document.getElementById("slideNumber");
    const headingInput = document.getElementById("headingInput");
    const updateHeadingBtn = document.getElementById("updateHeadingBtn");
    const listItemNumberInput = document.getElementById("listItemNumber");
    const listItemTextInput = document.getElementById("listItemText");
    const updateListItemBtn = document.getElementById("updateListItemBtn");

    // === Animate UI with GSAP ===
    function animateUI() {
        gsap.fromTo([".style-options", ".preview"], { x: 100, opacity: 0 }, {
            x: 0, opacity: 1, duration: 1, delay: 0.8, stagger: 0.3, ease: "power3.out"
        });
        gsap.from(".nav", { y: -100, opacity: 0, duration: 1, ease: "power2.out" });
        gsap.from(".step", { opacity: 0, y: 20, stagger: 0.2, duration: 1, ease: "power2.out" });
        gsap.from(".preview-box", { opacity: 0, y: 30, duration: 1, ease: "bounce.out" });
        gsap.from("#selectedColor", { opacity: 0, duration: 1, delay: 1, ease: "power2.out" });
        gsap.from(".button-container button", { opacity: 0, scale: 0.8, stagger: 0.2, duration: 1, ease: "back.out(1.7)" });
        gsap.from(".voice-commands h2", { opacity: 0, y: -30, duration: 1, ease: "power2.out" });
        gsap.from(".voice-commands p", { opacity: 0, y: 20, delay: 0.5, duration: 1, ease: "power2.out" });
        gsap.from(".command-section", { opacity: 0, x: -50, delay: 1, duration: 1, ease: "power2.out" });
        gsap.from(".command-section ul li", { opacity: 0, x: -30, stagger: 0.2, delay: 1.5, duration: 1, ease: "power2.out" });
    }

    animateUI();

    // === Load Keypoints from localStorage ===
    const storedData = localStorage.getItem('pptKeypoints');
    if (!storedData) {
        previewBox.innerHTML = "<p>No keypoints data found. Please upload a document first.</p>";
        console.error("No pptKeypoints found in localStorage");
        return;
    }

    let keypoints;
    try {
        keypoints = JSON.parse(storedData);
    } catch (e) {
        previewBox.innerHTML = "<p>Error: Invalid keypoints data in localStorage.</p>";
        console.error("JSON parse error:", e);
        return;
    }

    previewBox.innerHTML = "";
    const sectionOrder = ["Abstract", "Introduction", "Proposed Methodology", "Results", "Conclusion"];

    sectionOrder.forEach(section => {
        const points = keypoints[section];
        if (!points || !Array.isArray(points)) return;

        const slide = document.createElement("div");
        slide.classList.add("preview-slide");

        const title = document.createElement("h3");
        title.textContent = section;
        slide.appendChild(title);

        const list = document.createElement("ul");
        points.forEach(point => {
            const li = document.createElement("li");
            li.textContent = point;
            list.appendChild(li);
        });

        slide.appendChild(list);
        previewBox.appendChild(slide);
    });

    

    function showStatus(message, isSuccess = true) {
        statusDisplay.textContent = isSuccess ? `✅ ${message}` : `❌ ${message}`;
        statusDisplay.classList.remove("active", "inactive");
        statusDisplay.classList.add(isSuccess ? "active" : "inactive");
    
        setTimeout(() => {
            statusDisplay.textContent = "Inactive";
            statusDisplay.classList.remove("active");
            statusDisplay.classList.add("inactive");
            commandInput.value = "";
            commandInput.placeholder = "Type your command (e.g., 'theme modern' or 'font arial')";
        }, 3000);
    }
    
    // Populate slide selector for manual editing
    function populateSlideSelector() {
        slideNumberSelect.innerHTML = "";
        const slides = document.querySelectorAll(".preview-slide");
        if (slides.length === 0) {
            console.warn("No preview slides found");
            slideNumberSelect.innerHTML = '<option value="">No slides available</option>';
            return;
        }
        slides.forEach((slide, idx) => {
            const option = document.createElement("option");
            option.value = idx;
            option.textContent = `${idx + 1}: ${slide.querySelector("h3").textContent}`;
            slideNumberSelect.appendChild(option);
        });
        console.log("Slide selector populated with", slides.length, "slides");
    }
    populateSlideSelector();

    // === Utility Functions ===
    function updateSlidesStyle(styleKey, value) {
        const slides = document.querySelectorAll(".preview-slide");
        slides.forEach(slide => {
            slide.style[styleKey] = value;
            // Force reflow to ensure style updates are visible
            slide.offsetHeight;
        });
        console.log(`Applied ${styleKey}: ${value} to ${slides.length} slides`);
    }

    function resetStyles() {
        updateSlidesStyle("fontFamily", "");
        updateSlidesStyle("color", "");
        updateSlidesStyle("backgroundColor", "");
        previewBox.className = "preview-box"; // Fixed to match HTML class
        selectedColor.textContent = "Selected Color: None";
        fontSelect.value = "";
        themeSelect.value = "";
        colorPicker.value = "#363636";
        console.log("Styles reset");
    }

    // === Manual Customization Handlers ===
    fontSelect?.addEventListener("change", () => {
        const fontVal = fontSelect.value;
        updateSlidesStyle("fontFamily", fontVal);
    });

    colorPicker?.addEventListener("input", () => {
        const color = colorPicker.value;
        selectedColor.textContent = `Selected Color: ${color}`;
        updateSlidesStyle("color", color);
    });
    themeSelect?.addEventListener("change", () => {
        previewBox.classList.remove("modern", "classic", "dark");
        previewBox.classList.add(themeSelect.value);
        console.log(`Theme changed to ${themeSelect.value}`);
    });

    resetButton?.addEventListener("click", () => {
        resetStyles();
    });

    // === Manual Editing Handlers ===
    updateHeadingBtn?.addEventListener("click", () => {
        const slideIdx = parseInt(slideNumberSelect.value);
        const newHeading = headingInput.value.trim();
        if (!isNaN(slideIdx) && newHeading) {
            const slide = document.querySelectorAll(".preview-slide")[slideIdx];
            if (slide) {
                slide.querySelector("h3").textContent = newHeading;
                populateSlideSelector();
                showStatus(`Slide ${slideIdx + 1} heading updated`, true);
                headingInput.value = "";
            } else {
                showStatus("Invalid slide selected", false);
            }
        } else {
            showStatus("Please enter a valid heading", false);
        }
    });
    

    updateListItemBtn?.addEventListener("click", () => {
        const slideIdx = parseInt(slideNumberSelect.value);
        const itemIdx = parseInt(listItemNumberInput.value) - 1;
        const newText = listItemTextInput.value.trim();
    
        if (!isNaN(slideIdx) && !isNaN(itemIdx) && newText) {
            const slide = document.querySelectorAll(".preview-slide")[slideIdx];
            if (slide) {
                const listItems = slide.querySelectorAll("ul li");
                if (listItems[itemIdx]) {
                    listItems[itemIdx].textContent = newText;
                    showStatus(`Slide ${slideIdx + 1} list item ${itemIdx + 1} updated`, true);
                    listItemNumberInput.value = "";
                    listItemTextInput.value = "";
                } else {
                    showStatus("List item number out of range", false);
                }
            } else {
                showStatus("Invalid slide selected", false);
            }
        } else {
            showStatus("Please enter valid list item number and text", false);
        }
    });
    

    // === Voice Recognition Setup ===
    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!recognition) {
        voiceButton.disabled = true;
        statusDisplay.textContent = "Speech Recognition not supported in this browser";
        statusDisplay.classList.add("inactive");
        console.warn("SpeechRecognition not supported");
    } else {
        const recognitionInstance = new recognition();
        recognitionInstance.continuous = false;
        recognitionInstance.lang = "en-US";
        recognitionInstance.interimResults = false;
        recognitionInstance.maxAlternatives = 1;

        voiceButton.addEventListener("click", () => {
            try {
                recognitionInstance.start();
                statusDisplay.textContent = "Listening...";
                statusDisplay.classList.remove("inactive");
                statusDisplay.classList.add("active");
                console.log("Voice recognition started");
            } catch (error) {
                console.error("Speech recognition start error:", error);
                statusDisplay.textContent = "Error: Microphone access denied";
                statusDisplay.classList.remove("active");
                statusDisplay.classList.add("inactive");
            }
        });

        recognitionInstance.onresult = function (event) {
        
            const command = event.results[0][0].transcript.toLowerCase().trim();
            console.log("Voice command received:", command);
        
            commandInput.value = command;
        
            let isValid = false;
            try {
                isValid = applyVoiceCommand(command);
            } catch (err) {
                console.error("Error in applyVoiceCommand:", err);
            }
        
            if (isValid) {
                showStatus("Updated!", true);
            } commandInput.value = "";
            commandInput.placeholder = "Type your command (e.g., 'theme modern' or 'font arial')";
        };
        recognitionInstance.onresult = function (event) {
        
            const command = event.results[0][0].transcript.toLowerCase().trim();
            console.log("Voice command received:", command);
        
            commandInput.value = command;
        
            let isValid = false;
            try {
                isValid = applyVoiceCommand(command);
            } catch (err) {
                console.error("Error in applyVoiceCommand:", err);
            }
        
            if (isValid) {
                showStatus("Updated!", true);
            } 
        
            setTimeout(() => {
                console.log("Clearing input...");
                commandInput.value = "";
                commandInput.placeholder = "Type your command (e.g., 'theme modern' or 'font arial')";
                showStatus("Inactive", false);
            }, 3000);
        };
        

        recognitionInstance.onerror = function (event) {
            console.error("Speech recognition error:", event.error);
            statusDisplay.textContent = `Error: ${event.error}`;
            statusDisplay.classList.remove("active");
            statusDisplay.classList.add("inactive");
        };

        recognitionInstance.onend = function () {
            statusDisplay.textContent = "Inactive";
            statusDisplay.classList.remove("active");
            statusDisplay.classList.add("inactive");
            console.log("Voice recognition ended");
        };
    }

    // === Manual Command Button Click ===
    applyCommandButton?.addEventListener("click", () => {
        const command = commandInput.value.toLowerCase().trim();
        applyVoiceCommand(command);
    });

    // === Command Parser ===
    function applyVoiceCommand(command) {
        console.log("Processing command:", command);

        // Theme commands
        const themeMatch = command.match(/(modern|classic|dark)/i);
        if (themeMatch || command.includes("theme")) {
            const themeName = themeMatch ? themeMatch[1].toLowerCase() : command.replace(/(change|set|switch to)\s*theme\s*/i, "").toLowerCase();
            if (["modern", "classic", "dark"].includes(themeName)) {
                themeSelect.value = themeName;
                previewBox.classList.remove("modern", "classic", "dark");
                previewBox.classList.add(themeName);
                showStatus(`Updated!`, true);
                console.log(`Applied theme: ${themeName}`);
                return;
            }
        }

        // Font commands
        const fontMatch = command.match(/font\s+(arial|times new roman|verdana)/i);
        if (fontMatch) {
            const fontName = fontMatch[1].toLowerCase();
            fontSelect.value = fontName;
            updateSlidesStyle("fontFamily", fontName);
            showStatus(`Updated!`, true);
            console.log(`Applied font: ${fontName}`);
            return;
        }

        // Color commands
        const colorMatch = command.match(/(#[0-9a-f]{6}|red|blue|green|black|white|purple|orange|yellow)/i);
        if (colorMatch) {
            const colorVal = colorMatch[1].toLowerCase();
            colorPicker.value = colorVal;
            selectedColor.textContent = `Selected Color: ${colorVal}`;
            updateSlidesStyle("color", colorVal);
            showStatus(`Updated!`, true);
            console.log(`Applied color: ${colorVal}`);
            return;
        }

        // Layout commands
        const layoutMatch = command.match(/(standard|widescreen)/i);
        if (layoutMatch) {
            const layoutVal = layoutMatch[1].toLowerCase();
            layoutSelect.value = layoutVal;
            previewBox.classList.remove("standard", "widescreen");
            previewBox.classList.add(layoutVal);
            showStatus(`Updated!`, true);
            console.log(`Applied layout: ${layoutVal}`);
            return;
        }

        // Slide heading command
        const slideHeadingRegex = /change heading of slide (\d+) to (.+)/i;
        if (slideHeadingRegex.test(command)) {
            const [, slideNumStr, newHeading] = command.match(slideHeadingRegex);
            const slideNum = parseInt(slideNumStr);
            if (slideNum >= 1 && slideNum <= document.querySelectorAll(".preview-slide").length) {
                const slide = document.querySelectorAll(".preview-slide")[slideNum - 1];
                slide.querySelector("h3").textContent = newHeading;
                populateSlideSelector();
                showStatus(`Updated!`, true);
                console.log(`Updated heading of slide ${slideNum} to "${newHeading}"`);
            } else {
                showStatus(`Updated!`, true);
                console.error("Invalid slide number for heading change:", slideNum);
            }
            return;
        }

        // List item command
        const listItemRegex = /change list item (\d+) of slide (\d+) to (.+)/i;
        if (listItemRegex.test(command)) {
            const [, itemNumStr, slideNumStr, newText] = command.match(listItemRegex);
            const itemNum = parseInt(itemNumStr);
            const slideNum = parseInt(slideNumStr);
            if (slideNum >= 1 && slideNum <= document.querySelectorAll(".preview-slide").length) {
                const slide = document.querySelectorAll(".preview-slide")[slideNum - 1];
                const listItems = slide.querySelectorAll("ul li");
                if (itemNum >= 1 && itemNum <= listItems.length) {
                    listItems[itemNum - 1].textContent = newText;
                    showStatus(`Updated!`, true);
                    console.log(`Updated list item ${itemNum} of slide ${slideNum} to "${newText}"`);
                } else {
                    showStatus(`Updated!`, true);
                    console.error("Invalid list item number:", itemNum, "for slide", slideNum);
                }
            } else {
                showStatus(`Invalid!`, false);
                console.error("Invalid slide number for list item change:", slideNum);
            }
            return;
        }

        // Action commands
        if (command.includes("generate") || command.includes("create presentation")) {
            document.querySelector(".generate-btn").click();
            showStatus(`Generating Presentation!`, true);
            console.log("Generate presentation triggered");
            return;
        }
        if (command.includes("reset") || command.includes("clear")) {
            resetButton.click();
            showStatus(`Style Reset`, true);
            console.log("Reset triggered");
            return;
        }

        showStatus(`Invalid!`, false);
        console.warn("Unrecognized command:", command);
    }

    function captureSlidesAsJSON() {
        const slides = document.querySelectorAll('.preview-slide');
        const data = [];
    
        slides.forEach(slide => {
            const title = slide.querySelector('h3')?.textContent || '';
            const points = Array.from(slide.querySelectorAll('li')).map(li => li.textContent);
            const styles = {
                font: slide.style.fontFamily,
                color: slide.style.color,
                backgroundColor: slide.style.backgroundColor
            };
            data.push({ title, points, styles });
        });
    
        return data;
    }
    
    document.getElementById("downloadBtn").addEventListener("click", () => {
        const slidesData = captureSlidesAsJSON();
    
        fetch("/generate_ppt", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slides: slidesData })
        })
        .then(response => response.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "custom_slides.pptx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });
    
    
      
});