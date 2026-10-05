# BadmintonAI Coach - Frontend

Modern, high-performance Expo / React Native web interface for BadmintonAI Coach, featuring real-time 2D pose estimation overlay, frame-by-frame scrubber, and deterministic biomechanical scorecard.

## Connected Backend
The frontend connects to the backend deployed on Render at:
`https://backendtenis.onrender.com/api`

### Environment Configuration
To point to a custom backend URL, set the `EXPO_PUBLIC_API_URL` environment variable:
```bash
EXPO_PUBLIC_API_URL=https://backendtenis.onrender.com/api
```
*(If left unset on localhost, it automatically connects to `http://localhost:8000/api`. On remote domains, it automatically connects to `https://backendtenis.onrender.com/api`)*

## Local Development
```bash
npm install
npm run web
```

## Production Build & Deployment
### Deploy on GitHub Pages
This repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`).
1. Go to repository **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. Push to `main` or trigger the workflow under the **Actions** tab.

### Deploy on Vercel or Netlify
1. Connect this repository on Vercel/Netlify.
2. Build command: `npm run build:web`
3. Output directory: `dist`
4. Set environment variable: `EXPO_PUBLIC_API_URL=https://backendtenis.onrender.com/api`
