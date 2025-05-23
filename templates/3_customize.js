document.addEventListener("DOMContentLoaded", function () {
    const themeSelect = document.getElementById("theme");
    const fontSelect = document.getElementById("font");
    const colorPicker = document.getElementById("color");
    const selectedColorText = document.getElementById("selectedColor");
    const layoutSelect = document.getElementById("layout"); 
    const resetButton = document.getElementById("resetBtn"); 
    const inputText = document.querySelector(".input-container input"); // Input box
    const sendButton = document.querySelector(".send-btn"); // Send button
    const voiceButton = document.querySelector(".voice-btn"); // Voice command button
    const voiceText = document.querySelector(".voice-text");
    const voiceStatus = document.querySelector(".status"); // Voice status text

    const previewBox = document.querySelector(".preview-box");
    const sampleSlide = document.querySelector(".sample-slide");
    const subtitle = document.querySelector(".subtitle");
    const previewText = document.querySelector(".preview-text");

    // Initialize Speech Recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false; // Stop listening once a command is detected
    recognition.lang = 'en-US';
    recognition.interimResults = false; // Only final results
    recognition.maxAlternatives = 1; // Max number of alternatives to return

    // Function to apply theme
    function applyTheme(theme) {
        if (theme === "modern") {
            previewBox.style.backgroundColor = "#f5f5f5";
            previewBox.style.color = "#222";
        } else if (theme === "classic") {
            previewBox.style.backgroundColor = "#fff4e6";
            previewBox.style.color = "#5a3e1b";
        } else if (theme === "dark") {
            previewBox.style.backgroundColor = "#222";
            previewBox.style.color = "#fff";
        }
    }

    // Function to apply font
    function applyFont(font) {
        sampleSlide.style.fontFamily = font;
        subtitle.style.fontFamily = font;
        previewText.style.fontFamily = font;
    }

    // Function to apply color
    function applyColor(color) {
        previewBox.style.border = `2px solid ${color}`;
        selectedColorText.textContent = color;
    }

    // Function to apply layout
    function applyLayout(layout) {
        if (layout === "centered") {
            previewBox.style.textAlign = "center";
        } else if (layout === "left-aligned") {
            previewBox.style.textAlign = "left";
        } else if (layout === "right-aligned") {
            previewBox.style.textAlign = "right";
        }
    }

    // Function to process the input command
    function processCommand(command) {
        const lowerCommand = command.toLowerCase();

        // Theme Commands
        if (lowerCommand.includes("theme")) {
            if (lowerCommand.includes("modern")) applyTheme("modern");
            else if (lowerCommand.includes("classic")) applyTheme("classic");
            else if (lowerCommand.includes("dark")) applyTheme("dark");
        }

        // Font Commands
        else if (lowerCommand.includes("font")) {
            if (lowerCommand.includes("arial")) applyFont("Arial");
            else if (lowerCommand.includes("times new roman")) applyFont("Times New Roman");
            else if (lowerCommand.includes("verdana")) applyFont("Verdana");
            else if (lowerCommand.includes("calibri")) applyFont("Calibri");
            else if (lowerCommand.includes("georgia")) applyFont("Georgia");
        }

        // Layout Commands
        else if (lowerCommand.includes("layout")) {
            if (lowerCommand.includes("widescreen")) applyLayout("widescreen");
            else if (lowerCommand.includes("standard")) applyLayout("standard");
        }

        // Color Commands
        else if (lowerCommand.includes("color") || lowerCommand.includes("primary color")) {
            const colorMatch = lowerCommand.match(/#([a-f0-9]{6}|[a-f0-9]{3})\b/);
            if (colorMatch) {
                applyColor(colorMatch[0]);
            }
        }
    }

    // Event listener for the Send button (text command)
    sendButton.addEventListener("click", function () {
        const userInput = inputText.value.trim();
        if (userInput) {
            processCommand(userInput); // Process the user input
            inputText.value = ""; // Clear input box after sending
        }
    });

    // Event listener for the Voice button
    voiceButton.addEventListener("click", function () {
        recognition.start();
        voiceText.textContent = "Listening..."; // Show that it's listening
        voiceStatus.classList.add("active");
        voiceStatus.classList.remove("inactive");
    });

    // Handle the result of the speech recognition
    recognition.addEventListener("result", function (event) {
        const command = event.results[0][0].transcript.trim();
        voiceText.textContent = `Command Received: ${command}`;
        processCommand(command); // Process the voice command

        // After processing, stop listening
        voiceStatus.classList.remove("active");
        voiceStatus.classList.add("inactive");
    });

    // Handle errors in speech recognition
    recognition.addEventListener("error", function () {
        voiceText.textContent = "Sorry, I didn't catch that.";
        voiceStatus.classList.remove("active");
        voiceStatus.classList.add("inactive");
    });

    // Event listeners for user selection (text command)
    themeSelect.addEventListener("change", function () {
        applyTheme(this.value);
    });

    fontSelect.addEventListener("change", function () {
        applyFont(this.value);
    });

    colorPicker.addEventListener("input", function () {
        applyColor(this.value);
    });

    layoutSelect.addEventListener("change", function () {
        applyLayout(this.value);
    });

    resetButton.addEventListener("click", resetOptions); // Reset event

    // Function to reset all selections
    function resetOptions() {
        themeSelect.value = "modern"; // Default theme
        fontSelect.value = "Arial"; // Default font
        colorPicker.value = "#000000"; // Default color
        layoutSelect.value = "centered"; // Default layout

        applyTheme("modern");
        applyFont("Arial");
        applyColor("#000000");
        applyLayout("centered");
    }

    // Initial Load
    applyTheme(themeSelect.value);
    applyFont(fontSelect.value);
    applyColor(colorPicker.value);
    applyLayout(layoutSelect.value);
});
