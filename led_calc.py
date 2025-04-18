def calculate_led_requirements(voltage, density, length, pieces, length_unit='m'):
    """
    Calculate LED power requirements based on input parameters.
    
    Args:
        voltage (float): Input voltage in volts
        density (int): LED density in LEDs per meter (30-240)
        length (float): Length of LED strip in specified unit
        pieces (int): Number of LED strips
        length_unit (str): Unit of length measurement ('m', 'cm', 'in', 'ft')
        
    Returns:
        dict: Contains power (watts), current (amps), and recommended driver capacity
    """
    # Convert length to meters based on unit
    length_in_meters = convert_to_meters(length, length_unit)
    
    # Power consumption per meter for different LED densities
    # Extended to support more density values
    WATT_MAP = {
        30: 2.4,
        60: 4.8,
        90: 7.2,
        120: 9.6,
        144: 11.5,
        150: 12.0,
        180: 14.4,
        210: 16.8,
        240: 19.2
    }
    
    # If density is not in the map, interpolate based on closest values
    if density not in WATT_MAP:
        # Find closest densities
        densities = sorted(WATT_MAP.keys())
        
        if density < densities[0]:
            # If below minimum, use lowest value
            watt_per_meter = WATT_MAP[densities[0]] * (density / densities[0])
        elif density > densities[-1]:
            # If above maximum, use highest value
            watt_per_meter = WATT_MAP[densities[-1]] * (density / densities[-1])
        else:
            # Interpolate between two closest values
            lower = max(filter(lambda x: x <= density, densities))
            upper = min(filter(lambda x: x >= density, densities))
            
            if lower == upper:
                watt_per_meter = WATT_MAP[lower]
            else:
                watt_lower = WATT_MAP[lower]
                watt_upper = WATT_MAP[upper]
                # Linear interpolation
                ratio = (density - lower) / (upper - lower)
                watt_per_meter = watt_lower + ratio * (watt_upper - watt_lower)
    else:
        watt_per_meter = WATT_MAP[density]
    
    # Calculate total power consumption
    total_watts = watt_per_meter * length_in_meters * pieces
    
    # Calculate current draw (P = V * I, so I = P / V)
    current = total_watts / voltage
    
    # Calculate wire gauge recommendation
    wire_gauge = recommend_wire_gauge(current)
    
    # Calculate maximum run length
    max_run = calculate_max_run_length(voltage, density, current)
    
    # Calculate safety margin for recommended current
    recommended_current = current * 1.2  # 20% margin
    
    # Get standard driver capacity recommendation
    standard_driver = recommend_driver_capacity(recommended_current)
    
    # Return results with 20% safety margin for recommended driver
    return {
        'power': round(total_watts, 2),
        'current': round(current, 2),
        'recommended': round(recommended_current, 2),  # 20% margin
        'total_length_meters': round(length_in_meters * pieces, 2),
        'wire_gauge': wire_gauge,
        'max_run': round(max_run, 2),
        'standard_driver': standard_driver
    }

def convert_to_meters(length, unit):
    """
    Convert length from various units to meters.
    
    Args:
        length (float): Length value
        unit (str): Unit of measurement ('m', 'cm', 'in', 'ft')
        
    Returns:
        float: Length in meters
    """
    conversion = {
        'm': 1.0,
        'cm': 0.01,
        'in': 0.0254,
        'ft': 0.3048
    }
    return length * conversion.get(unit, 1.0)

def recommend_wire_gauge(current):
    """
    Recommend wire gauge based on current draw.
    
    Args:
        current (float): Current in amps
        
    Returns:
        str: Recommended wire gauge (AWG)
    """
    if current < 3:
        return "22 AWG"
    elif current < 5:
        return "20 AWG"
    elif current < 7:
        return "18 AWG"
    elif current < 10:
        return "16 AWG"
    elif current < 15:
        return "14 AWG"
    elif current < 20:
        return "12 AWG"
    else:
        return "10 AWG or thicker"
        
def recommend_driver_capacity(current):
    """
    Recommend a standard driver capacity based on required current with safety margin.
    
    Args:
        current (float): Current in amps with safety margin already applied
        
    Returns:
        str: Recommended standard driver capacity
    """
    # Standard driver capacities
    driver_capacities = [3, 5, 8.5, 10, 12.5, 16.5, 20, 25, 30, 33]
    
    # Find the smallest capacity that is greater than or equal to required current
    for capacity in driver_capacities:
        if current <= capacity:
            return f"{capacity}A"
    
    # If current exceeds all standard sizes, recommend the largest standard size
    # and indicate that multiple drivers may be needed
    largest = driver_capacities[-1]
    return f"{largest}A (multiple drivers recommended)"

def calculate_max_run_length(voltage, density, current):
    """
    Calculate maximum recommended run length based on voltage drop.
    
    Args:
        voltage (float): Supply voltage
        density (int): LED density
        current (float): Current draw in amps
        
    Returns:
        float: Maximum run length in meters
    """
    # Assuming 5% voltage drop as acceptable
    voltage_drop_limit = voltage * 0.05
    
    # Approximate resistance per meter of LED strip (ohms/m)
    # This is a simplified model, real values vary by strip quality and type
    resistance_per_meter = 0.05
    
    # Maximum length based on voltage drop (V = I * R)
    if current > 0:
        max_length = voltage_drop_limit / (current * resistance_per_meter)
        return max_length
    return 100  # Arbitrary large value if current is near zero
