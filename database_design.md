# Database Design: Photo Location Mapper

This document outlines the potential database design for the Photo Location Mapper application. For the Minimum Viable Product (MVP), a database might not be strictly necessary if images are processed on-the-fly and no data persistence is required beyond the session.

However, if we decide to store image metadata, user information, or allow users to save their mapped photos, a database would be essential.

## 1. Database Choice for Initial Version

-   **MVP Scope:** The current MVP focuses on uploading an image, extracting its GPS data, and displaying it on a map. To allow for potential storage of image metadata and to set a foundation for future enhancements like user galleries, we will incorporate a database from the initial phase.
-   **Decision:** We will use **SQLite** for the initial version. SQLite is a lightweight, file-based database that is easy to set up and integrate with Python (Flask), making it ideal for development and early-stage projects.

## 2. Potential Future Requirements (Requiring a Database)

If the application evolves, we might want to:

-   Allow users to create accounts and save their uploaded photos and map views.
-   Store historical uploads for a user.
-   Implement features like photo galleries or sharing.
-   Cache extracted EXIF data to avoid reprocessing.

## 3. Potential Database Schema (If Implemented)

If a database becomes necessary, here's a possible schema. We'll assume a relational database like PostgreSQL or SQLite for this example.

### Table: `users` (Placeholder for future user accounts)

While not in the immediate MVP, if user accounts are added, the schema might look like this:

-   `id` (INTEGER, Primary Key, Autoincrement)
-   `username` (TEXT, Unique, Not Null)
-   `email` (TEXT, Unique, Not Null)
-   `password_hash` (TEXT, Not Null)
-   `created_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP)
-   `updated_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP)

### Table: `images`

This table will store information about the uploaded images.

-   `id` (INTEGER, Primary Key, Autoincrement)
-   `original_filename` (TEXT, Not Null)
-   `storage_filename` (TEXT, Not Null, Unique) - A unique filename for storing the image on the server (e.g., using UUIDs to avoid collisions).
-   `uploaded_at` (TIMESTAMP, Not Null, Default: CURRENT_TIMESTAMP)
-   `latitude` (REAL, Nullable) - Storing as REAL for floating point precision.
-   `longitude` (REAL, Nullable) - Storing as REAL for floating point precision.
-   `address` (TEXT, Nullable) - For reverse geocoded address, if implemented.
-   `caption` (TEXT, Nullable)
-   `mime_type` (TEXT, Nullable)
-   `file_size_bytes` (INTEGER, Nullable)

*Note: For SQLite, `SERIAL` is typically `INTEGER PRIMARY KEY AUTOINCREMENT`. `VARCHAR` becomes `TEXT`, `DECIMAL` becomes `REAL` or `NUMERIC`.*

### Relationships

-   A `user` can have many `images` (One-to-Many).

## 4. Choice of Database System

-   **SQLite:** Good for simple projects, development, or applications where the database is embedded. Easy to set up.
-   **PostgreSQL:** A powerful, open-source object-relational database system with many features. Good for scalability and complex queries.
-   **MySQL:** Another popular open-source relational database.
-   **NoSQL (e.g., MongoDB):** Could be considered if the data model is less structured or if document storage is preferred, but a relational model seems appropriate for this type of data.

## 5. Data to Store (MVP Consideration)

If we were to store data even for a slightly enhanced MVP (e.g., just to keep a record of uploads without user accounts):

-   **Minimal `images` table:**
    -   `id`
    -   `original_filename`
    -   `uploaded_at`
    -   `latitude`
    -   `longitude`

## 6. Conclusion for Initial Development

For the initial phase, we will proceed **with SQLite as our database**. This will allow us to store image metadata. The backend will process uploaded images, store relevant information in the SQLite database, and return location data to the frontend. This approach provides a good foundation for future scalability and feature additions.
