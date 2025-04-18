# LED Driver Calculator

A bilingual (English/Hindi) web application for calculating LED power requirements and driver specifications.

## Features

- Calculate power requirements for LED installations
- Determine recommended driver capacity with safety margin
- Support for various LED densities (30-240 LEDs/m)
- Support for multiple length units (meters, centimeters, inches, feet)
- Wire gauge recommendation based on current draw
- Maximum run length calculation to prevent voltage drop
- Bilingual interface (English/Hindi)
- Save and recall previous calculations
- Mobile-friendly responsive design

## Technical Details

- **Backend**: Python with Flask framework
- **Frontend**: HTML, CSS, JavaScript with Bootstrap framework
- **Calculation Engine**: Custom Python module for accurate power, current and driver calculations
- **Data Persistence**: Client-side localStorage for saved calculations
- **SEO Optimization**: Built-in sitemap and meta tags for search engines
- **Internationalization**: Complete bilingual support for all UI elements

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install flask flask-cors gunicorn psycopg2-binary email-validator flask-sqlalchemy
   ```
3. Run the application:
   ```
   gunicorn --bind 0.0.0.0:5000 main:app
   ```

## Usage

1. Select input voltage (5V, 12V, 24V or custom)
2. Choose LED density using dropdown or slider (30-240 LEDs/m)
3. Enter strip length in your preferred unit
4. Calculate to see power requirements and recommendations
5. Save calculations for future reference

## License

This project is available under the MIT License.