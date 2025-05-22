# Project Overview: Photo Location Mapper

## 1. Introduction

This document outlines the plan for developing a web application that allows users to upload a photograph, extracts its geolocation data (if available), and displays the location where the photo was taken on an interactive map.

## 2. Goals

-   Develop a user-friendly interface for uploading images.
-   Implement a backend service to process uploaded images and extract EXIF (Exchangeable Image File Format) data, specifically GPS coordinates.
-   Display the extracted location on a map interface (e.g., Google Maps, Leaflet, Mapbox).
-   Ensure basic security and data privacy for uploaded images.
-   Create a scalable architecture for potential future enhancements.

## 3. Technology Stack

-   **Backend:** Python (Flask or FastAPI for the API framework)
    -   Libraries: Pillow (or similar) for image processing and EXIF data extraction.
-   **Frontend:** React (JavaScript library for building user interfaces)
    -   Libraries: A mapping library (e.g., React Leaflet, Google Maps React), Axios (for API calls).
-   **Database:** (Optional, for storing image metadata and user information if needed in later stages) - Potentially PostgreSQL or SQLite for simplicity initially.
-   **Version Control:** Git & GitHub (or similar).

## 4. Project Phases

1.  **Planning & Design (Current Phase):** Defining requirements, technology stack, and project roadmap.
2.  **Backend Development:** Setting up the Python server, API endpoints for image upload, EXIF extraction logic.
3.  **Frontend Development:** Building the React UI components for image upload, map display, and interaction with the backend.
4.  **Integration:** Connecting the frontend and backend components.
5.  **Testing:** Unit tests, integration tests, and user acceptance testing.
6.  **Deployment:** Deploying the application to a hosting platform.

## 5. Key Features (Initial Version)

-   Image upload functionality.
-   Automatic extraction of GPS coordinates from image EXIF data.
-   Display of a single photo's location on an interactive map.
-   Clear error handling if no GPS data is found or if the image format is unsupported.
