# Language support for the LED Driver Calculator

# Translation dictionary
translations = {
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
    'length_unit_label': {
        'en': 'Length Unit',
        'hi': 'लंबाई इकाई'
    },
    'pieces_label': {
        'en': 'Number of Strips',
        'hi': 'स्ट्रिप्स की संख्या'
    },
    'calculate_button': {
        'en': 'Calculate',
        'hi': 'गणना करें'
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
    'length_unit': {
        'en': 'Unit',
        'hi': 'इकाई'
    },
    'meter_unit': {
        'en': 'meters',
        'hi': 'मीटर'
    },
    'centimeter_unit': {
        'en': 'centimeters',
        'hi': 'सेंटीमीटर'
    },
    'inch_unit': {
        'en': 'inches',
        'hi': 'इंच'
    },
    'foot_unit': {
        'en': 'feet',
        'hi': 'फीट'
    },
    'input_parameters': {
        'en': 'Input Parameters',
        'hi': 'इनपुट पैरामीटर'
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
    'total_length_label': {
        'en': 'Total Length',
        'hi': 'कुल लंबाई'
    },
    'wire_gauge_label': {
        'en': 'Recommended Wire',
        'hi': 'अनुशंसित तार'
    },
    'max_run_label': {
        'en': 'Maximum Run Length',
        'hi': 'अधिकतम रन लंबाई'
    },
    'save_button': {
        'en': 'Save',
        'hi': 'सहेजें'
    },
    'cancel_button': {
        'en': 'Cancel',
        'hi': 'रद्द करें'
    },
    'calculation_name': {
        'en': 'Calculation Name',
        'hi': 'गणना का नाम'
    },
    'usage_tips_title': {
        'en': 'Usage Tips',
        'hi': 'उपयोग के टिप्स'
    },
    'real_time_length': {
        'en': 'Total Length in Meters',
        'hi': 'मीटर में कुल लंबाई'
    },
    'standard_driver_label': {
        'en': 'Standard Driver',
        'hi': 'मानक ड्राइवर'
    }
}

def get_translation(key, lang='en'):
    """
    Get translation for a given key and language
    
    Args:
        key (str): The translation key
        lang (str): Language code ('en' or 'hi')
        
    Returns:
        str: Translated text or key if translation not found
    """
    if lang not in ['en', 'hi']:
        lang = 'en'  # Default to English
        
    if key in translations and lang in translations[key]:
        return translations[key][lang]
    
    # Fallback to English if specific translation not found
    if key in translations and 'en' in translations[key]:
        return translations[key]['en']
    
    # Return key if no translation found
    return key
