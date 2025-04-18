import os
import logging
from flask import Flask, render_template, request, jsonify, make_response
from flask_cors import CORS
from led_calc import calculate_led_requirements
from lang import translations, get_translation

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "default_secret_key")
CORS(app)

@app.route('/')
def index():
    # Get language from cookie or default to English
    lang = request.cookies.get('language', 'en')
    return render_template('index.html', lang=lang)

@app.route('/api/calculate', methods=['POST'])
def calculate():
    try:
        data = request.json
        lang = request.headers.get('Accept-Language', 'en')
        
        # Validate input data
        required_fields = ['voltage', 'density', 'length', 'pieces']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Convert input data to appropriate types
        try:
            voltage = float(data['voltage'])
            density = int(data['density'])
            length = float(data['length'])
            pieces = int(data['pieces'])
            length_unit = data.get('length_unit', 'm')
        except ValueError:
            return jsonify({'error': 'Invalid input types'}), 400
        
        # Validate input ranges
        if voltage <= 0 or length <= 0 or pieces <= 0:
            return jsonify({'error': 'Values must be greater than zero'}), 400
        
        if density < 30 or density > 240:
            return jsonify({'error': 'Density must be between 30 and 240 LEDs/meter'}), 400
            
        # Validate length unit
        if length_unit not in ['m', 'cm', 'in', 'ft']:
            return jsonify({'error': 'Invalid length unit'}), 400
            
        # Calculate LED requirements
        result = calculate_led_requirements(voltage, density, length, pieces, length_unit)
        
        # Add translated messages
        result['messages'] = {
            'results_title': get_translation('results_title', lang),
            'power_label': get_translation('power_label', lang),
            'current_label': get_translation('current_label', lang),
            'recommended_label': get_translation('recommended_label', lang),
            'watt_unit': get_translation('watt_unit', lang),
            'amp_unit': get_translation('amp_unit', lang),
            'length_unit': get_translation('length_unit', lang),
            'total_length_label': get_translation('total_length_label', lang),
            'meter_unit': get_translation('meter_unit', lang),
            'wire_gauge_label': get_translation('wire_gauge_label', lang),
            'max_run_label': get_translation('max_run_label', lang),
            'standard_driver_label': get_translation('standard_driver_label', lang)
        }
        
        return jsonify(result)
    except Exception as e:
        logging.error(f"Calculation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/switch-language', methods=['POST'])
def switch_language():
    try:
        data = request.json
        lang = data.get('language', 'en')
        
        # Validate language
        if lang not in ['en', 'hi']:
            return jsonify({'error': 'Invalid language'}), 400
        
        # Create response with language cookie
        response = make_response(jsonify({'success': True}))
        response.set_cookie('language', lang, max_age=60*60*24*30)  # 30 days
        
        return response
    except Exception as e:
        logging.error(f"Language switch error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/sitemap.xml')
def sitemap():
    response = make_response(render_template('sitemap.xml'))
    response.headers['Content-Type'] = 'application/xml'
    return response

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
