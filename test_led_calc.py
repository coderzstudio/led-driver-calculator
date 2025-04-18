import unittest
from led_calc import calculate_led_requirements

class TestLEDCalculator(unittest.TestCase):
    def test_basic_calculation(self):
        # Test with known values
        result = calculate_led_requirements(12, 60, 5, 1)
        
        # 60 LEDs/m × 5m × 1 piece = 300 LEDs
        # 60 LEDs/m consumes 4.8W/m
        # Total power = 4.8W/m × 5m × 1 = 24W
        # Current = 24W ÷ 12V = 2A
        # Recommended = 2A × 1.2 = 2.4A
        
        self.assertEqual(result['power'], 24)
        self.assertEqual(result['current'], 2)
        self.assertEqual(result['recommended'], 2.4)
    
    def test_multiple_strips(self):
        # Test with multiple strips
        result = calculate_led_requirements(24, 120, 2, 3)
        
        # 120 LEDs/m × 2m × 3 pieces = 720 LEDs
        # 120 LEDs/m consumes 9.6W/m
        # Total power = 9.6W/m × 2m × 3 = 57.6W
        # Current = 57.6W ÷ 24V = 2.4A
        # Recommended = 2.4A × 1.2 = 2.88A
        
        self.assertEqual(result['power'], 57.6)
        self.assertEqual(result['current'], 2.4)
        self.assertEqual(result['recommended'], 2.88)
    
    def test_high_density(self):
        # Test with high density LEDs
        result = calculate_led_requirements(12, 144, 1, 1)
        
        # 144 LEDs/m × 1m × 1 piece = 144 LEDs
        # 144 LEDs/m consumes 11.5W/m
        # Total power = 11.5W/m × 1m × 1 = 11.5W
        # Current = 11.5W ÷ 12V = 0.96A (rounds to 0.96)
        # Recommended = 0.96A × 1.2 = 1.15A (rounds to 1.15)
        
        self.assertEqual(result['power'], 11.5)
        self.assertEqual(result['current'], 0.96)
        self.assertEqual(result['recommended'], 1.15)
    
    def test_rounding(self):
        # Test rounding behavior
        result = calculate_led_requirements(5, 30, 3.33, 2)
        
        # 30 LEDs/m × 3.33m × 2 pieces = ~200 LEDs
        # 30 LEDs/m consumes 2.4W/m
        # Total power = 2.4W/m × 3.33m × 2 = 15.984W
        # Current = 15.984W ÷ 5V = 3.1968A
        # Recommended = 3.1968A × 1.2 = 3.83616A
        
        # Check rounding to 2 decimal places
        self.assertEqual(result['power'], 15.98)
        self.assertEqual(result['current'], 3.2)
        self.assertEqual(result['recommended'], 3.84)

if __name__ == '__main__':
    unittest.main()
