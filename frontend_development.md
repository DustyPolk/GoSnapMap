# Frontend Development: Photo Location Mapper

This document outlines the steps to develop the React frontend for the Photo Location Mapper application.

## 1. Setup React Environment

1.  **Install Node.js and npm/yarn:** Ensure Node.js (which includes npm) is installed. Yarn is an alternative package manager.
2.  **Create React App:** Use `create-react-app` (or Vite for a faster, more modern setup) to bootstrap the project.
    ```bash
    npx create-react-app frontend  # Using create-react-app
    # OR
    # npm create vite@latest frontend -- --template react
    cd frontend
    ```
3.  **Install Dependencies:**
    -   **Mapping Library:**
        -   `react-leaflet` (and `leaflet`): For Leaflet maps.
          ```bash
          npm install react-leaflet leaflet
          # or
          # yarn add react-leaflet leaflet
          ```
        -   Alternatively, `@react-google-maps/api` for Google Maps, or `mapbox-gl` and `react-map-gl` for Mapbox.
    -   **Axios:** For making API calls to the backend.
        ```bash
        npm install axios
        # or
        # yarn add axios
        ```
    -   **(Optional) Styling:** Libraries like Material-UI, Tailwind CSS, or Emotion for UI components and styling.

## 2. Project Structure (Example)

```
photo_map_project/
├── backend/
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ImageUpload.js
│   │   │   ├── MapDisplay.js
│   │   │   └── Navbar.js        (Optional)
│   │   ├── services/         # API call functions
│   │   │   └── api.js
│   │   ├── App.js            # Main application component
│   │   ├── index.js          # Entry point of the React app
│   │   └── App.css           # Main app styles (or other styling approaches)
│   ├── package.json
│   └── ... (other config files like .env for environment variables)
└── ... (markdown files)
```

## 3. Core Components

1.  **`ImageUpload.js` Component:**
    -   **Functionality:**
        -   Provides a file input field (`<input type="file" accept="image/*" />`).
        -   Handles file selection.
        -   Displays a preview of the selected image (optional).
        -   Triggers an upload action (e.g., calls a function passed via props).
    -   **State:** Selected file, preview URL (if any), loading status, error messages.

2.  **`MapDisplay.js` Component:**
    -   **Functionality:**
        -   Accepts latitude and longitude as props.
        -   Uses the chosen mapping library (e.g., `react-leaflet`) to render a map.
        -   Places a marker on the map at the given coordinates.
        -   Handles cases where no location is provided (e.g., shows a default view or a message).
    -   **Props:** `latitude`, `longitude`.

3.  **`App.js` (Main Application Component):**
    -   **Functionality:**
        -   Manages the overall application state (e.g., uploaded image data, extracted location, error messages).
        -   Renders the `ImageUpload` and `MapDisplay` components.
        -   Contains the logic to call the backend API via the `api.js` service when an image is selected/submitted.
        -   Updates the `MapDisplay` component with the location data received from the backend.
    -   **State:** Current image, current location (latitude, longitude), loading state, error messages from API.

## 4. API Integration (`services/api.js`)

-   Create a function to handle the image upload to the backend's `/api/upload_image` endpoint.
-   Use `axios.post()` with `FormData` to send the image file.
-   Handle API responses (success and error) and return data or throw errors appropriately.

    ```javascript
    // Example in services/api.js
    import axios from 'axios';

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'; // Backend URL

    export const uploadImage = async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await axios.post(`${API_URL}/upload_image`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data; // { latitude, longitude, message }
      } catch (error) {
        // Handle error (e.g., network error, server error)
        throw error.response ? error.response.data : new Error('Upload failed');
      }
    };
    ```

## 5. User Interface (UI) / User Experience (UX)

-   **Clear Instructions:** Guide the user on how to upload an image.
-   **Loading Indicators:** Show a spinner or message while the image is uploading and processing.
-   **Feedback Messages:** Display success or error messages clearly (e.g., "Location found!", "No GPS data in this image.", "Upload failed.").
-   **Responsive Design:** Ensure the application works well on different screen sizes (basic responsiveness).

## 6. Development Workflow

1.  **Component Creation:** Build individual components (`ImageUpload`, `MapDisplay`).
2.  **State Management:** Implement state handling in `App.js` or using a state management library (like Redux or Zustand for more complex apps, but likely overkill for this initial version).
3.  **API Service:** Create the `api.js` service for backend communication.
4.  **Integration:** Wire up components and API calls in `App.js`.
5.  **Styling:** Apply CSS or use a styling library for visual appeal.
6.  **Testing:**
    -   Run the backend server locally.
    -   Test the frontend in the browser by uploading images with and without GPS data.
    -   Check browser console for errors.
    -   Consider writing basic component tests (e.g., using React Testing Library).

## 7. Environment Variables

-   Use a `.env` file (e.g., `.env.local` for `create-react-app`) to store the backend API URL:
    ```
    REACT_APP_API_URL=http://localhost:5000/api
    ```

This plan provides a clear path for developing the React frontend.
