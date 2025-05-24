# NoteMate Frontend

This is the frontend for NoteMate, a platform for sharing and accessing study materials.

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
VITE_API_BASE_URL=/api  # For development
# For production deployment, use the full URL of your backend:
# VITE_API_BASE_URL=https://note-mate-backend.onrender.com/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Set the following build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add the environment variables from `.env.production`
5. Deploy!

## Important Notes

- The frontend uses Firebase for authentication
- API calls use environment variables for the base URL, making it easy to switch between development and production environments
- Remember to update the CORS settings in the backend if you deploy to a different domain
