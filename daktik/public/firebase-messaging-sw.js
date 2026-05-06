importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

const firebaseConfig = {
  projectId: "gen-lang-client-0688246202",
  appId: "1:404291330543:web:1523a80b6776874d79d61a",
  apiKey: "AIzaSyDCHG3f112LpvajFoVi7yib7Rv3S7tKxpk",
  authDomain: "gen-lang-client-0688246202.firebaseapp.com",
  messagingSenderId: "404291330543",
  storageBucket: "gen-lang-client-0688246202.firebasestorage.app"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification?.title || 'নতুন নোটিফিকেশন';
  const notificationOptions = {
    body: payload.notification?.body || 'আপনার জন্য একটি নতুন বার্তা আছে।',
    icon: '/icon.png', // Make sure to have an icon.png in public folder
    badge: '/icon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
