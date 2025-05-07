document.addEventListener("DOMContentLoaded", function () {
    const themeSelect = document.getElementById("theme");
    const fontSelect = document.getElementById("font");
    const colorPicker = document.getElementById("color");
    const selectedColorText = document.getElementById("selectedColor");
    const layoutSelect = document.getElementById("layout"); 
    const resetButton = document.getElementById("resetBtn"); 

    const previewBox = document.querySelector(".preview-box");
    const sampleSlide = document.querySelector(".sample-slide");
    const subtitle = document.querySelector(".subtitle");
    const previewText = document.querySelector(".preview-text");

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

    // Event listeners for user selection
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

    // Initial Load
    applyTheme(themeSelect.value);
    applyFont(fontSelect.value);
    applyColor(colorPicker.value);
    applyLayout(layoutSelect.value);
});
