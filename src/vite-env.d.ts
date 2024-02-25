interface ImportMetaEnv {
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_PRIVATE_KEY_ID: string;
  readonly VITE_FIREBASE_PRIVATE_KEY: string;
  readonly VITE_FIREBASE_EMAIL: string;
  readonly VITE_CLIENT_ID: string;
  readonly VITE_CLIENT_CERT_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
