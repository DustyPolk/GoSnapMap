# Backend Development: Photo Location Mapper

This document outlines the steps to develop the Python backend for the Photo Location Mapper application.

## 1. Setup Python Environment

1.  **Install Python:** Ensure Python (version 3.8+ recommended) is installed.
2.  **Create a Virtual Environment:**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install Dependencies:** Create a `requirements.txt` file and install necessary packages.
    -   **Flask (or FastAPI):** For the web framework.
        -   Example: `pip install Flask`
    -   **Pillow:** For image processing and EXIF data extraction.
        -   Example: `pip install Pillow`
    -   **Flask-CORS (if using Flask):** To handle Cross-Origin Resource Sharing if the frontend and backend are on different domains/ports during development.
        -   Example: `pip install Flask-CORS`

    **`requirements.txt` example:**
    ```
    Flask
Pillow
Flask-CORS
    ```
    Install with: `pip install -r requirements.txt`

## 2. Project Structure (Example for Flask)

```
photo_map_project/
├── backend/
│   ├── venv/
│   ├── app.py            # Main application file
│   ├── routes.py         # API endpoint definitions
│   ├── services/         # Business logic (e.g., image processing)
│   │   └── image_processor.py
│   ├── models/           # (Optional) Database models if used
│   ├── instance/         # (Optional) Instance specific config, SQLite DB
│   ├── static/           # (Optional) For serving static files if needed by backend
│   ├── templates/        # (Optional) For HTML templates if backend serves HTML
│   └── requirements.txt
├── frontend/
└── project_overview.md
└── backend_development.md
... (other markdown files)
```

## 3. API Endpoints Design

We'll need at least one primary endpoint:

-   **`POST /api/upload_image`**
    -   **Request:** `multipart/form-data` containing the image file.
    -   **Response (Success - 200 OK):**
        ```json
        {
          "latitude": 34.0522,
          "longitude": -118.2437,
          "message": "Location extracted successfully."
        }
        ```
    -   **Response (Failure - 400 Bad Request / 422 Unprocessable Entity / 500 Internal Server Error):**
        ```json
        {
          "error": "Could not extract location data."
        }
        ```
        or
        ```json
        {
          "error": "No image file provided."
        }
        ```
        or
        ```json
        {
          "error": "Invalid image format."
        }
        ```

## 4. Core Logic: EXIF Data Extraction

-   **Image Reception:** The API endpoint will receive the image file.
-   **Temporary Storage/In-memory processing:** Decide whether to save the image temporarily or process it in memory.
-   **EXIF Extraction (using Pillow):**
    -   Open the image using `Image.open()`.
    -   Access EXIF data using `image._getexif()`.
    -   Identify and parse GPS-related tags (e.g., `GPSInfo`).
    -   Convert GPS coordinates from DMS (Degrees, Minutes, Seconds) format to Decimal Degrees.
-   **Error Handling:** Implement robust error handling for cases where:
    -   No EXIF data is present.
    -   No GPS information is found within EXIF data.
    -   The image format is unsupported or corrupt.

## 5. Implementation Steps (Flask Example)

1.  **Initialize Flask App (`app.py`):**
    -   Set up Flask app instance.
    -   Configure CORS if needed.
2.  **Define Upload Route (`routes.py`):**
    -   Create the `/api/upload_image` endpoint.
    -   Handle file uploads (check for file presence, allowed extensions).
3.  **Implement Image Processing Service (`services/image_processor.py`):**
    -   Function to take an image file (or path) as input.
    -   Use Pillow to open the image and extract EXIF data.
    -   Logic to parse GPSInfo tag and convert coordinates.
    -   Return latitude and longitude, or an error/None.
4.  **Connect Route to Service:**
    -   In the route handler, call the image processing service.
    -   Format the JSON response based on the service's output.

## 6. Security Considerations (Initial)

-   **File Type Validation:** Only allow specific image types (e.g., JPEG, PNG).
-   **File Size Limits:** Prevent excessively large uploads.
-   **Temporary File Management:** Ensure temporary files are securely handled and deleted if used.

## 7. Testing

-   Prepare test images with and without EXIF GPS data.
-   Use tools like Postman or `curl` to test the API endpoint directly.
-   Write unit tests for the EXIF extraction logic.

This provides a solid foundation for building the backend. Further details will be fleshed out during the actual coding phase.
