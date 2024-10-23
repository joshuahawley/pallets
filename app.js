// Cache DOM elements for sliders, display spans, and sections
const lengthSlider = document.getElementById("length");
const widthSlider = document.getElementById("width");
const heightSlider = document.getElementById("height");
const weightSlider = document.getElementById("weight");

const palletLengthSlider = document.getElementById("palletLength");
const palletWidthSlider = document.getElementById("palletWidth");
const palletMaxHeightSlider = document.getElementById("palletMaxHeight");
const maxWeightSlider = document.getElementById("maxWeight");

const lengthDisplay = document.getElementById("lengthDisplay");
const widthDisplay = document.getElementById("widthDisplay");
const heightDisplay = document.getElementById("heightDisplay");
const weightDisplay = document.getElementById("weightDisplay");

const palletLengthDisplay = document.getElementById("palletLengthDisplay");
const palletWidthDisplay = document.getElementById("palletWidthDisplay");
const palletMaxHeightDisplay = document.getElementById("palletMaxHeightDisplay");
const maxWeightDisplay = document.getElementById("maxWeightDisplay");

const mainMenu = document.querySelector(".main-menu");
const optimizationSection = document.getElementById("optimizationSection");
const helpSection = document.getElementById("helpSection");
const resultDiv = document.getElementById("result");

const startBtn = document.getElementById("startBtn");
const helpBtn = document.getElementById("helpBtn");
const backToMenuBtn = document.getElementById("backToMenu");

const downloadCSVBtn = document.getElementById("downloadCSV");
const downloadPDFBtn = document.getElementById("downloadPDF");

let resultData;  // Store result data for downloading

// Real-time input validation
function validateInput(slider, min, max, display, message) {
    const value = parseFloat(slider.value);
    if (value < min || value > max) {
        display.innerHTML = `<span style="color: red;">${message}</span>`;
    } else {
        display.textContent = slider.value;
    }
}

// Apply validation to each slider
lengthSlider.addEventListener("input", () => validateInput(lengthSlider, 10, 60, lengthDisplay, "Invalid length"));
widthSlider.addEventListener("input", () => validateInput(widthSlider, 10, 60, widthDisplay, "Invalid width"));
heightSlider.addEventListener("input", () => validateInput(heightSlider, 5, 20, heightDisplay, "Invalid height"));
weightSlider.addEventListener("input", () => validateInput(weightSlider, 10, 100, weightDisplay, "Invalid weight"));

palletLengthSlider.addEventListener("input", () => validateInput(palletLengthSlider, 20, 120, palletLengthDisplay, "Invalid pallet length"));
palletWidthSlider.addEventListener("input", () => validateInput(palletWidthSlider, 20, 120, palletWidthDisplay, "Invalid pallet width"));
palletMaxHeightSlider.addEventListener("input", () => validateInput(palletMaxHeightSlider, 50, 100, palletMaxHeightDisplay, "Invalid pallet height"));
maxWeightSlider.addEventListener("input", () => validateInput(maxWeightSlider, 500, 3000, maxWeightDisplay, "Invalid max weight"));

// Navigation between sections
startBtn.addEventListener("click", () => {
    mainMenu.style.opacity = 0;
    setTimeout(() => {
        mainMenu.style.display = "none";
        optimizationSection.style.display = "block";
        setTimeout(() => {
            optimizationSection.style.opacity = 1;
        }, 100);
    }, 500);
});

helpBtn.addEventListener("click", () => {
    mainMenu.style.opacity = 0;
    setTimeout(() => {
        mainMenu.style.display = "none";
        helpSection.style.display = "block";
        setTimeout(() => {
            helpSection.style.opacity = 1;
        }, 100);
    }, 500);
});

backToMenuBtn.addEventListener("click", () => {
    helpSection.style.opacity = 0;
    setTimeout(() => {
        helpSection.style.display = "none";
        mainMenu.style.display = "block";
        setTimeout(() => {
            mainMenu.style.opacity = 1;
        }, 100);
    }, 500);
});

// Function to generate CSV data
function generateCSV(data) {
    const csvRows = [];
    const headers = ['Bags per Layer', 'Total Layers', 'Total Bags', 'Total Stack Weight (lbs)', 'Bag Dimensions (LxWxH)', 'Bag Weight', 'Pallet Dimensions (LxWxH)', 'Max Pallet Weight'];
    csvRows.push(headers.join(','));

    const values = [data.bags_per_layer, data.total_layers, data.total_bags, data.total_stack_weight,
    `${lengthSlider.value}x${widthSlider.value}x${heightSlider.value}`, `${weightSlider.value}`,
    `${palletLengthSlider.value}x${palletWidthSlider.value}x${palletMaxHeightSlider.value}`, `${maxWeightSlider.value}`];
    csvRows.push(values.join(','));

    return csvRows.join('\n');
}

// Function to download CSV
function downloadCSV() {
    const csvContent = generateCSV(resultData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'stack_optimization.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);  // Remove the element after the download starts
}

// Function to download PDF
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("Poppins");
    doc.setFontSize(16);
    doc.text("Pallet Stack Optimization Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Bags per Layer: ${resultData.bags_per_layer}`, 20, 40);
    doc.text(`Total Layers: ${resultData.total_layers}`, 20, 50);
    doc.text(`Total Bags: ${resultData.total_bags}`, 20, 60);
    doc.text(`Total Stack Weight (lbs): ${resultData.total_stack_weight}`, 20, 70);
    doc.text(`Bag Dimensions: ${lengthSlider.value} x ${widthSlider.value} x ${heightSlider.value}`, 20, 80);
    doc.text(`Pallet Dimensions: ${palletLengthSlider.value} x ${palletWidthSlider.value} x ${palletMaxHeightSlider.value}`, 20, 90);
    doc.text(`Max Pallet Weight: ${maxWeightSlider.value}`, 20, 100);

    doc.save("stack_optimization_report.pdf");
}

// Event listener for the CSV download button
document.getElementById("downloadCSV").addEventListener("click", function () {
    if (resultData) {
        downloadCSV();
    } else {
        alert("No data available for download!");
    }
});

// Event listener for the PDF download button
document.getElementById("downloadPDF").addEventListener("click", function () {
    if (resultData) {
        downloadPDF();
    } else {
        alert("No data available for download!");
    }
});

// Handle form submission and generate new optimization result based on current inputs
stackForm.addEventListener("submit", function (event) {
    event.preventDefault();

    // Show loading spinner and ensure result and download buttons are hidden
    const spinner = document.getElementById("loadingSpinner");
    spinner.style.display = "block"; // Show spinner
    resultDiv.innerHTML = ""; // Clear the previous result
    downloadCSVBtn.style.display = "none"; // Hide buttons initially
    downloadPDFBtn.style.display = "none"; // Hide buttons initially

    // Collect updated form data
    const formData = {
        length: parseFloat(lengthSlider.value),
        width: parseFloat(widthSlider.value),
        height: parseFloat(heightSlider.value),
        weight: parseFloat(weightSlider.value),
        palletLength: parseFloat(palletLengthSlider.value),
        palletWidth: parseFloat(palletWidthSlider.value),
        palletMaxHeight: parseFloat(palletMaxHeightSlider.value),
        maxWeight: parseFloat(maxWeightSlider.value)
    };

    console.log("Current form data:", formData);

    // Simulate optimization result based on updated form data
    const data = {
        bags_per_layer: Math.floor((formData.palletLength * formData.palletWidth) / (formData.length * formData.width)),
        total_layers: Math.floor(formData.palletMaxHeight / formData.height),
        total_bags: Math.floor((formData.palletLength * formData.palletWidth) / (formData.length * formData.width)) * Math.floor(formData.palletMaxHeight / formData.height),
        total_stack_weight: Math.floor((formData.palletLength * formData.palletWidth) / (formData.length * formData.width)) * Math.floor(formData.palletMaxHeight / formData.height) * formData.weight
    };

    // Assign new data to resultData
    resultData = data;

    // Hide spinner immediately after processing
    spinner.style.display = "none";
    console.log("Showing result and buttons");

    // Display the new result
    resultDiv.innerHTML = `
        <h2>Stack Optimization Result</h2>
        <p>Bags per Layer: ${data.bags_per_layer}</p>
        <p>Total Layers: ${data.total_layers}</p>
        <p>Total Bags: ${data.total_bags}</p>
        <p>Total Stack Weight (lbs): ${data.total_stack_weight}</p>
    `;

    // Show download buttons
    downloadCSVBtn.style.display = "inline"; 
    downloadPDFBtn.style.display = "inline"; 
    console.log("Download buttons should now be visible");
});

// Real-time pallet preview update
function updatePalletPreview() {
    const length = document.getElementById("palletLength").value;
    const width = document.getElementById("palletWidth").value;
    const height = document.getElementById("palletMaxHeight").value;

    const palletPreview = document.getElementById("palletPreview");
    palletPreview.innerHTML = `<div class="pallet-box" style="width: ${width}px; height: ${height}px; transform: translateX(${length / 2}px);"></div>`;
}

// Set up real-time updates and numeric input for each slider
sliders.forEach(({ slider, input, display }) => {
    slider.addEventListener("input", () => {
        display.textContent = slider.value;
        input.value = slider.value;
        updatePalletPreview();
    });
    toggleInput(slider, input, display);
});
