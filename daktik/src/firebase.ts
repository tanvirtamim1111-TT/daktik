import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setLogLevel, initializeFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getStorage } from 'firebase/storage';

import firebaseConfig from '../firebase-applet-config.json';
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Use initializeFirestore to include experimental force long polling
// This helps in environments where WebSockets might be unstable or blocked
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId || '(default)');

export let messaging: any = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  } else {
    console.warn("Firebase Messaging is not supported in this environment.");
  }
}).catch(console.error);

export const storage = getStorage(app);

// Suppress Firestore verbose offline warnings
setLogLevel('error');

async function testConnection(retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      // Use getDocFromServer to bypass local cache and force a network check
      await getDocFromServer(doc(db, 'test', 'connection'));
      console.log("Firebase connected successfully");
      return;
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // If it's the last retry, log the final error
      if (i === retries - 1) {
        console.warn("Firebase connection retry limit reached. The application may be in offline mode.");
        if (errorMessage.includes('the client is offline') || 
            errorMessage.includes('Could not reach Cloud Firestore backend') ||
            errorMessage.includes('unavailable')) {
          console.error("Firebase Connection Status: UNAVAILABLE. This is usually due to network restrictions or the Firebase project still being provisioned.");
        } else {
          console.error("Firebase Error:", errorMessage);
        }
      } else {
        // Log retry attempt for visibility
        console.log(`Retrying Firebase connection... (${i + 1}/${retries}) - Reason: ${errorMessage.split('\n')[0]}`);
        
        // Exponential backoff: 2s, 4s, 8s, 16s...
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}

// Only run connection test in browser
if (typeof window !== 'undefined') {
  testConnection();
}
