import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
  import { getFirestore, type Firestore } from "firebase/firestore"
  import { getAuth, signInAnonymously, type Auth } from "firebase/auth"

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  /** True only when every required Firebase env var is present. */
  export const isFirebaseConfigured: boolean = Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId &&
      firebaseConfig.authDomain,
  )

  let app: FirebaseApp | null = null
  let db: Firestore | null = null
  let auth: Auth | null = null

  export function getDb(): Firestore | null {
    if (!isFirebaseConfigured) return null
    if (typeof window === "undefined") return null
    try {
      if (!app) {
        app = getApps().length ? getApp() : initializeApp(firebaseConfig)
      }
      if (!db) {
        db = getFirestore(app)
      }
      if (!auth) {
        auth = getAuth(app)
        signInAnonymously(auth).catch(err =>
          console.warn("[streakly] Anonymous auth failed:", err)
        )
      }
      return db
    } catch (err) {
      console.log("[v0] Firebase init failed, falling back to local storage:", err)
      return null
    }
  }
