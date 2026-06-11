# Snapora Backend

This is the backend API for Snapora - a visual platform for sharing creative images.

## Features

- User authentication (registration and login)
- Image upload and management
- Image browsing and search
- Like functionality
- User profiles

## Technologies Used

- Node.js
- Express.js
- SQLite (for demonstration purposes)
- JSON Web Tokens (JWT) for authentication
- Bcrypt for password hashing
- Multer for file uploads

## Setup Instructions

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the server:
   ```
   npm start
   ```

   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/register` - Register a new user
- `POST /api/login` - Login user

### Images
- `GET /api/images` - Get all images (paginated)
- `POST /api/upload` - Upload a new image (requires authentication)
- `POST /api/images/:id/like` - Like an image (requires authentication)

### Users
- `GET /api/profile` - Get user profile (requires authentication)
- `GET /api/user/:id/images` - Get images for a specific user (paginated)

## Database

The application uses SQLite for data storage. The database file (`snapora.db`) will be created automatically when you start the server for the first time.

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
```

## File Storage

Uploaded images are stored in the `uploads/` directory within the backend folder.

## Testing

You can test the API endpoints using tools like Postman or curl.

Example curl request for user registration:
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'