// LED Driver Calculator JavaScript

// Global state for calculations
const savedCalculations = [];
let currentCalculation = null;

// Get current language from cookie or default to English
function getCurrentLanguage() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'language') {
            return value;
        }
    }
    return 'en';
}

// Update UI language based on selected language
function updateLanguage(lang) {
    // Set active language button
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.lang-btn[data-lang="${lang}"]`).classList.add('active');
    
    // Update all translatable elements
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[key] && translations[key][lang]) {
            element.textContent = translations[key][lang];
        }
    });
    
    // Update placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[key] && translations[key][lang]) {
            element.setAttribute('placeholder', translations[key][lang]);
        }
    });
    
    // Set HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update meta tags for SEO
    updateMetaTags(lang);
    
    // Update saved calculations list to reflect new language
    updateSavedCalculationsList();
}

// Update meta tags based on language
function updateMetaTags(lang) {
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    metaDescription.content = translations['app_description'][lang];
    
    // Update Open Graph and Twitter descriptions
    document.querySelector('meta[property="og:description"]').content = translations['app_description'][lang];
    document.querySelector('meta[name="twitter:description"]').content = translations['app_description'][lang];
    
    // Update canonical and alternate links
    const baseUrl = window.location.origin;
    document.querySelector('link[rel="canonical"]').href = `${baseUrl}${lang === 'hi' ? '?lang=hi' : ''}`;
    
    // Update alternate language links
    document.querySelector('link[hreflang="en"]').href = baseUrl;
    document.querySelector('link[hreflang="hi"]').href = `${baseUrl}?lang=hi`;
}

// Switch language
function switchLanguage(lang) {
    fetch('/api/switch-language', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ language: lang })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateLanguage(lang);
        } else {
            console.error('Failed to switch language:', data.error);
        }
    })
    .catch(error => {
        console.error('Error switching language:', error);
    });
}

// Update real-time length conversion
function updateRealTimeLength() {
    const length = parseFloat(document.getElementById('length').value) || 0;
    const lengthUnit = document.getElementById('length-unit').value;
    const pieces = parseInt(document.getElementById('pieces').value) || 1;
    
    // Convert to meters
    let lengthInMeters = length;
    if (lengthUnit === 'cm') {
        lengthInMeters = length / 100;
    } else if (lengthUnit === 'in') {
        lengthInMeters = length * 0.0254;
    } else if (lengthUnit === 'ft') {
        lengthInMeters = length * 0.3048;
    }
    
    // Calculate total length in meters
    const totalLengthInMeters = lengthInMeters * pieces;
    
    // Update display
    document.getElementById('meters-value').textContent = totalLengthInMeters.toFixed(2);
    
    // Show/hide real-time length display
    if (lengthUnit !== 'm' || pieces > 1) {
        document.getElementById('real-time-length').classList.remove('d-none');
    } else {
        document.getElementById('real-time-length').classList.add('d-none');
    }
}

// Calculate LED requirements
function calculateLEDRequirements() {
    // Get input values
    let voltage;
    if (document.getElementById('voltage').value === 'custom') {
        voltage = parseFloat(document.getElementById('custom-voltage').value);
    } else {
        voltage = parseFloat(document.getElementById('voltage').value);
    }
    
    const density = parseInt(document.getElementById('density').value);
    const length = parseFloat(document.getElementById('length').value);
    const lengthUnit = document.getElementById('length-unit').value;
    const pieces = parseInt(document.getElementById('pieces').value);
    const lang = getCurrentLanguage();
    
    // Validate inputs
    if (!voltage || !density || !length || !pieces) {
        showError('Please fill in all fields');
        return;
    }
    
    if (voltage <= 0 || length <= 0 || pieces <= 0) {
        showError('Values must be greater than zero');
        return;
    }
    
    // Clear previous error
    clearError();
    
    // Show loading indicator
    document.getElementById('loading-indicator').classList.remove('d-none');
    document.getElementById('results-section').classList.add('d-none');
    
    // Send calculation request to API
    fetch('/api/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept-Language': lang
        },
        body: JSON.stringify({
            voltage: voltage,
            density: density,
            length: length,
            pieces: pieces,
            length_unit: lengthUnit
        })
    })
    .then(response => response.json())
    .then(data => {
        // Hide loading indicator
        document.getElementById('loading-indicator').classList.add('d-none');
        
        if (data.error) {
            showError(data.error);
            return;
        }
        
        // Store current calculation
        currentCalculation = {
            timestamp: new Date().toISOString(),
            inputs: {
                voltage: voltage,
                density: density,
                length: length,
                length_unit: lengthUnit,
                pieces: pieces
            },
            results: data
        };
        
        // Update results
        document.getElementById('results-title').textContent = data.messages.results_title;
        document.getElementById('power-label').textContent = data.messages.power_label;
        document.getElementById('current-label').textContent = data.messages.current_label;
        document.getElementById('recommended-label').textContent = data.messages.recommended_label;
        document.getElementById('total-length-label').textContent = data.messages.total_length_label;
        document.getElementById('wire-gauge-label').textContent = data.messages.wire_gauge_label;
        document.getElementById('max-run-label').textContent = data.messages.max_run_label;
        
        document.getElementById('power-value').textContent = `${data.power} ${data.messages.watt_unit}`;
        document.getElementById('current-value').textContent = `${data.current} ${data.messages.amp_unit}`;
        document.getElementById('recommended-value').textContent = `${data.recommended} ${data.messages.amp_unit}`;
        
        // Add standard driver display
        if (data.standard_driver) {
            document.getElementById('standard-driver-value').textContent = data.standard_driver;
        } else {
            document.getElementById('standard-driver-value').textContent = `${Math.ceil(data.recommended)}A`;
        }
        
        document.getElementById('total-length-value').textContent = `${data.total_length_meters} ${data.messages.meter_unit}`;
        document.getElementById('wire-gauge-value').textContent = data.wire_gauge;
        document.getElementById('max-run-value').textContent = `${data.max_run} ${data.messages.meter_unit}`;
        
        // Show results section
        document.getElementById('results-section').classList.remove('d-none');
        
        // Scroll to results
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    })
    .catch(error => {
        document.getElementById('loading-indicator').classList.add('d-none');
        showError('Failed to calculate. Please try again.');
        console.error('Calculation error:', error);
    });
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
}

// Clear error message
function clearError() {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = '';
    errorElement.classList.add('d-none');
}

// Save current calculation
function saveCalculation(name) {
    if (!currentCalculation) {
        return;
    }
    
    // Add name to calculation
    currentCalculation.name = name || `Calculation ${savedCalculations.length + 1}`;
    
    // Add to saved calculations
    savedCalculations.push({...currentCalculation});
    
    // Save to localStorage
    localStorage.setItem('ledCalculations', JSON.stringify(savedCalculations));
    
    // Update UI
    updateSavedCalculationsList();
}

// Load calculations from localStorage
function loadSavedCalculations() {
    const storedCalculations = localStorage.getItem('ledCalculations');
    if (storedCalculations) {
        // Clear current array
        savedCalculations.length = 0;
        
        // Add stored calculations
        const parsed = JSON.parse(storedCalculations);
        parsed.forEach(calc => savedCalculations.push(calc));
        
        // Update UI
        updateSavedCalculationsList();
    }
}

// Update saved calculations list in UI
function updateSavedCalculationsList() {
    const container = document.getElementById('saved-calculations-list');
    const lang = getCurrentLanguage();
    
    // Clear container
    container.innerHTML = '';
    
    if (savedCalculations.length === 0) {
        const noCalcsMsg = document.createElement('p');
        noCalcsMsg.className = 'text-muted';
        noCalcsMsg.textContent = translations['no_saved_calculations'][lang];
        container.appendChild(noCalcsMsg);
        return;
    }
    
    // Add each saved calculation
    savedCalculations.forEach((calc, index) => {
        const calcElement = document.createElement('div');
        calcElement.className = 'saved-calculation';
        
        // Header with name and actions
        const header = document.createElement('div');
        header.className = 'saved-calculation-header';
        
        const nameElement = document.createElement('div');
        nameElement.className = 'saved-calculation-name';
        nameElement.textContent = calc.name;
        
        const actionsElement = document.createElement('div');
        actionsElement.className = 'saved-calculation-actions';
        
        const loadButton = document.createElement('button');
        loadButton.className = 'btn btn-sm btn-outline-info';
        loadButton.textContent = translations['edit_calculation'][lang];
        loadButton.addEventListener('click', () => loadCalculation(index));
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-outline-danger';
        deleteButton.textContent = translations['delete_calculation'][lang];
        deleteButton.addEventListener('click', () => deleteCalculation(index));
        
        actionsElement.appendChild(loadButton);
        actionsElement.appendChild(deleteButton);
        
        header.appendChild(nameElement);
        header.appendChild(actionsElement);
        
        // Summary of calculation
        const summary = document.createElement('div');
        summary.className = 'saved-calculation-body small';
        
        const inputs = calc.inputs;
        const results = calc.results;
        
        summary.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div><strong>${translations['voltage_label'][lang]}:</strong> ${inputs.voltage}V</div>
                    <div><strong>${translations['density_label'][lang]}:</strong> ${inputs.density} LEDs/m</div>
                    <div><strong>${translations['length_label'][lang]}:</strong> ${inputs.length} ${inputs.length_unit}</div>
                    <div><strong>${translations['pieces_label'][lang]}:</strong> ${inputs.pieces}</div>
                </div>
                <div class="col-md-6">
                    <div><strong>${translations['power_label'][lang]}:</strong> ${results.power} ${translations['watt_unit'][lang]}</div>
                    <div><strong>${translations['current_label'][lang]}:</strong> ${results.current} ${translations['amp_unit'][lang]}</div>
                    <div><strong>${translations['recommended_label'][lang]}:</strong> ${results.recommended} ${translations['amp_unit'][lang]}</div>
                    <div><strong>${translations['standard_driver_label'][lang]}:</strong> ${results.standard_driver || `${Math.ceil(results.recommended)}A`}</div>
                </div>
            </div>
        `;
        
        calcElement.appendChild(header);
        calcElement.appendChild(summary);
        container.appendChild(calcElement);
    });
}

// Load a saved calculation into form
function loadCalculation(index) {
    const calc = savedCalculations[index];
    if (!calc) return;
    
    const inputs = calc.inputs;
    
    // Set voltage
    if ([5, 12, 24].includes(inputs.voltage)) {
        document.getElementById('voltage').value = inputs.voltage;
        document.getElementById('custom-voltage').classList.add('d-none');
    } else {
        document.getElementById('voltage').value = 'custom';
        document.getElementById('custom-voltage').value = inputs.voltage;
        document.getElementById('custom-voltage').classList.remove('d-none');
    }
    
    // Set density
    const densityValue = inputs.density;
    document.getElementById('density').value = densityValue;
    document.getElementById('density-slider').value = densityValue;
    document.getElementById('density-value').textContent = densityValue;
    
    // Update density select dropdown
    const densitySelect = document.getElementById('density-select');
    const standardDensities = [30, 60, 90, 120, 144, 150, 180, 210, 240];
    if (standardDensities.includes(densityValue)) {
        densitySelect.value = densityValue;
        document.getElementById('density-slider-container').classList.add('d-none');
    } else {
        densitySelect.value = 'slider';
        document.getElementById('density-slider-container').classList.remove('d-none');
    }
    
    // Set length and unit
    document.getElementById('length').value = inputs.length;
    document.getElementById('length-unit').value = inputs.length_unit;
    document.getElementById('length-unit-display').textContent = inputs.length_unit;
    
    // Set pieces
    document.getElementById('pieces').value = inputs.pieces;
    
    // Update real-time length
    updateRealTimeLength();
    
    // Scroll to form
    document.getElementById('led-form').scrollIntoView({ behavior: 'smooth' });
}

// Delete a saved calculation
function deleteCalculation(index) {
    savedCalculations.splice(index, 1);
    
    // Update localStorage
    localStorage.setItem('ledCalculations', JSON.stringify(savedCalculations));
    
    // Update UI
    updateSavedCalculationsList();
}

// Translations for client-side
const translations = {
    'app_title': {
        'en': 'LED Driver Calculator',
        'hi': 'एलईडी ड्राइवर कैलकुलेटर'
    },
    'app_description': {
        'en': 'Calculate power requirements for LED strips',
        'hi': 'एलईडी स्ट्रिप्स के लिए पावर आवश्यकताओं की गणना करें'
    },
    'language_label': {
        'en': 'Language',
        'hi': 'भाषा'
    },
    'english': {
        'en': 'English',
        'hi': 'अंग्रेज़ी'
    },
    'hindi': {
        'en': 'Hindi',
        'hi': 'हिन्दी'
    },
    'voltage_label': {
        'en': 'Voltage (V)',
        'hi': 'वोल्टेज (V)'
    },
    'density_label': {
        'en': 'LED Density (LEDs/m)',
        'hi': 'एलईडी घनत्व (एलईडी/मी)'
    },
    'length_label': {
        'en': 'Strip Length',
        'hi': 'स्ट्रिप लंबाई'
    },
    'length_unit': {
        'en': 'Unit',
        'hi': 'इकाई'
    },
    'pieces_label': {
        'en': 'Number of Strips',
        'hi': 'स्ट्रिप्स की संख्या'
    },
    'calculate_button': {
        'en': 'Calculate',
        'hi': 'गणना करें'
    },
    'input_parameters': {
        'en': 'Input Parameters',
        'hi': 'इनपुट पैरामीटर'
    },
    'results_title': {
        'en': 'Calculation Results',
        'hi': 'गणना परिणाम'
    },
    'power_label': {
        'en': 'Total Power',
        'hi': 'कुल वाटेज'
    },
    'current_label': {
        'en': 'Current Draw',
        'hi': 'विद्युत धारा'
    },
    'recommended_label': {
        'en': 'Recommended Driver',
        'hi': 'अनुशंसित ड्राइवर'
    },
    'watt_unit': {
        'en': 'Watts',
        'hi': 'वाट'
    },
    'amp_unit': {
        'en': 'Amps',
        'hi': 'एम्पियर'
    },
    'save_calculation': {
        'en': 'Save Calculation',
        'hi': 'गणना सहेजें'
    },
    'saved_calculations': {
        'en': 'Saved Calculations',
        'hi': 'सहेजी गई गणनाएँ'
    },
    'delete_calculation': {
        'en': 'Delete',
        'hi': 'हटाएँ'
    },
    'edit_calculation': {
        'en': 'Edit',
        'hi': 'संपादित करें'
    },
    'no_saved_calculations': {
        'en': 'No saved calculations yet',
        'hi': 'अभी तक कोई गणना सहेजी नहीं गई'
    },
    'save_button': {
        'en': 'Save',
        'hi': 'सहेजें'
    },
    'cancel_button': {
        'en': 'Cancel',
        'hi': 'रद्द करें'
    },
    'total_length_label': {
        'en': 'Total Length',
        'hi': 'कुल लंबाई'
    },
    'meter_unit': {
        'en': 'meters',
        'hi': 'मीटर'
    },
    'wire_gauge_label': {
        'en': 'Recommended Wire',
        'hi': 'अनुशंसित तार'
    },
    'max_run_label': {
        'en': 'Maximum Run Length',
        'hi': 'अधिकतम रन लंबाई'
    },
    'usage_tips_title': {
        'en': 'Usage Tips',
        'hi': 'उपयोग के टिप्स'
    },
    'real_time_length': {
        'en': 'Total Length in Meters',
        'hi': 'मीटर में कुल लंबाई'
    },
    'calculation_name': {
        'en': 'Calculation Name',
        'hi': 'गणना का नाम'
    },
    'standard_driver_label': {
        'en': 'Standard Driver',
        'hi': 'मानक ड्राइवर'
    }
};

// Initialize the calculator when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Hide density slider by default (show dropdown)
    document.getElementById('density-slider-container').classList.add('d-none');

    // Set up language switcher
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });
    
    // Set up voltage selector
    document.getElementById('voltage').addEventListener('change', function() {
        if (this.value === 'custom') {
            document.getElementById('custom-voltage').classList.remove('d-none');
        } else {
            document.getElementById('custom-voltage').classList.add('d-none');
        }
    });
    
    // Set up density select and slider
    const densitySlider = document.getElementById('density-slider');
    const densityValue = document.getElementById('density-value');
    const densityInput = document.getElementById('density');
    const densitySelect = document.getElementById('density-select');
    const densitySliderContainer = document.getElementById('density-slider-container');
    
    // Handle slider changes
    densitySlider.addEventListener('input', function() {
        densityValue.textContent = this.value;
        densityInput.value = this.value;
    });
    
    // Handle density select dropdown
    densitySelect.addEventListener('change', function() {
        const selectedValue = this.value;
        
        if (selectedValue === 'slider') {
            // Show slider for custom density selection
            densitySliderContainer.classList.remove('d-none');
        } else {
            // Set exact density from dropdown
            const newDensity = parseInt(selectedValue);
            densityInput.value = newDensity;
            densitySlider.value = newDensity;
            densityValue.textContent = newDensity;
            densitySliderContainer.classList.add('d-none');
        }
    });
    
    // Set up length unit selector
    document.querySelectorAll('.dropdown-item[data-unit]').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const unit = this.getAttribute('data-unit');
            document.getElementById('length-unit').value = unit;
            document.getElementById('length-unit-display').textContent = unit;
            updateRealTimeLength();
        });
    });
    
    // Set up real-time length update
    document.getElementById('length').addEventListener('input', updateRealTimeLength);
    document.getElementById('pieces').addEventListener('input', updateRealTimeLength);
    
    // Set up calculate button
    document.getElementById('calculate-btn').addEventListener('click', calculateLEDRequirements);
    
    // Set up form submission
    document.getElementById('led-form').addEventListener('submit', function(e) {
        e.preventDefault();
        calculateLEDRequirements();
    });
    
    // Set up save calculation button
    document.getElementById('save-calculation-btn').addEventListener('click', function() {
        const modal = new bootstrap.Modal(document.getElementById('save-calculation-modal'));
        modal.show();
    });
    
    // Set up save confirmation button
    document.getElementById('save-calculation-confirm').addEventListener('click', function() {
        const name = document.getElementById('calculation-name').value.trim();
        saveCalculation(name);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('save-calculation-modal'));
        modal.hide();
        
        // Clear input
        document.getElementById('calculation-name').value = '';
    });
    
    // Initialize language
    const currentLang = getCurrentLanguage();
    updateLanguage(currentLang);
    
    // Load saved calculations from localStorage
    loadSavedCalculations();
    
    // Initialize real-time length display
    updateRealTimeLength();
});
