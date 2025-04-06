# Firebase Configuration for AIvestor

This document explains how to properly set up Firebase in your frontend code when deploying to Render.

## Firebase Configuration

The Firebase configuration provided in your `.env` file needs to be properly imported in your React application.

### 1. Create/Update Firebase Configuration File

Create or update the file `finai-assistant/src/firebase/firebase.js` with the following content:

```javascript
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBPBnfM88z60GNrjWBEI__bf0F2Zh2UNqs",
  authDomain: "aivestor-5b849.firebaseapp.com",
  projectId: "aivestor-5b849",
  storageBucket: "aivestor-5b849.firebasestorage.app",
  messagingSenderId: "550291891510",
  appId: "1:550291891510:web:54f6a790c0fbcb68cabf97",
  measurementId: "G-YMQY82CE4D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  client_id: "1079895264057-jt31pt273m5t5nulunpis261ukeg2ecp.apps.googleusercontent.com"
});

export { auth, db, googleProvider, analytics };
export default app;
```

### 2. Environment Variables in Render

When deploying to Render, make sure to set up the following environment variables in your frontend service:

- `REACT_APP_API_URL`: URL of your backend API service (e.g., https://aivestor-api.onrender.com)
- `REACT_APP_FIREBASE_API_KEY`: AIzaSyBPBnfM88z60GNrjWBEI__bf0F2Zh2UNqs
- `REACT_APP_FIREBASE_AUTH_DOMAIN`: aivestor-5b849.firebaseapp.com
- `REACT_APP_FIREBASE_PROJECT_ID`: aivestor-5b849
- `REACT_APP_FIREBASE_STORAGE_BUCKET`: aivestor-5b849.firebasestorage.app
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`: 550291891510
- `REACT_APP_FIREBASE_APP_ID`: 1:550291891510:web:54f6a790c0fbcb68cabf97
- `REACT_APP_FIREBASE_MEASUREMENT_ID`: G-YMQY82CE4D

### 3. Using Environment Variables (Alternative Approach)

Alternatively, you can modify your Firebase configuration to use environment variables:

```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};
```

This approach is more secure as it keeps your API keys out of your codebase.

## Important Notes

1. Never expose your Firebase API keys in client-side code in a production environment.
2. Set up Firebase Authentication security rules to restrict access to your data.
3. Consider using environment variables for all API keys instead of hardcoding them.
4. Firebase Analytics may not work properly in all environments - handle this gracefully in your code.
