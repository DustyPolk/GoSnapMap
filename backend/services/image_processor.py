from PIL import Image as PILImage # Aliasing to avoid conflict if we name our model Image
from PIL.ExifTags import TAGS, GPSTAGS

def get_exif_data(image_path):
    """Extracts EXIF data from an image."""
    exif_data = {}
    try:
        image = PILImage.open(image_path)
        info = image._getexif()
        if info:
            for tag, value in info.items():
                decoded = TAGS.get(tag, tag)
                if decoded == "GPSInfo":
                    gps_data = {}
                    for t in value:
                        sub_decoded = GPSTAGS.get(t, t)
                        gps_data[sub_decoded] = value[t]
                    exif_data[decoded] = gps_data
                else:
                    exif_data[decoded] = value
    except Exception as e:
        print(f"Error reading EXIF data: {e}") # Replace with proper logging
    return exif_data

def get_decimal_from_dms(dms, ref):
    """Converts DMS (degrees, minutes, seconds) to decimal degrees."""
    degrees = dms[0]
    minutes = dms[1] / 60.0
    seconds = dms[2] / 3600.0

    if ref in ['S', 'W']:
        degrees = -degrees
        minutes = -minutes
        seconds = -seconds
    
    return degrees + minutes + seconds

def get_lat_lon(exif_data):
    """Extracts latitude and longitude from EXIF GPS data."""
    lat = None
    lon = None

    if "GPSInfo" in exif_data:
        gps_info = exif_data["GPSInfo"]
        gps_latitude = gps_info.get('GPSLatitude')
        gps_latitude_ref = gps_info.get('GPSLatitudeRef')
        gps_longitude = gps_info.get('GPSLongitude')
        gps_longitude_ref = gps_info.get('GPSLongitudeRef')

        if gps_latitude and gps_latitude_ref and gps_longitude and gps_longitude_ref:
            lat = get_decimal_from_dms(gps_latitude, gps_latitude_ref)
            lon = get_decimal_from_dms(gps_longitude, gps_longitude_ref)
    
    return lat, lon

def process_image_data(image_path):
    """Processes an image to extract location data."""
    exif_data = get_exif_data(image_path)
    latitude, longitude = get_lat_lon(exif_data)
    
    # Placeholder for future reverse geocoding to get address
    address = None 

    return {
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'raw_exif': exif_data # Optional: for debugging or future use
    }

# Example usage (for testing this module directly):
if __name__ == '__main__':
    # Create a dummy image with EXIF for testing if you have one
    # For now, this will just show how to call it.
    # test_image_path = 'path_to_your_test_image_with_gps.jpg'
    # if os.path.exists(test_image_path):
    #     location_info = process_image_data(test_image_path)
    #     print(f"Latitude: {location_info.get('latitude')}")
    #     print(f"Longitude: {location_info.get('longitude')}")
    # else:
    #     print(f"Test image not found. Skipping direct test.")
    pass
