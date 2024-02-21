import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  type: "service_account",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  private_key_id: import.meta.env.VITE_FIREBASE_PRIVATE_KEY_ID,
  private_key: import.meta.env.VITE_FIREBASE_PRIVATE_KEY,
  client_email: import.meta.env.VITE_FIREBASE_EMAIL,
  client_id: import.meta.env.VITE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-7tjr8%40wikipage-2a587.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { app, db };
