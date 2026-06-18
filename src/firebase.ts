import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBgMavSd8mQy39obqoMELgvdQ1XBXNVvyc",
  authDomain: "url-shortener-606b9.firebaseapp.com",
  databaseURL: "https://url-shortener-606b9-default-rtdb.firebaseio.com",
  projectId: "url-shortener-606b9",
  storageBucket: "url-shortener-606b9.firebasestorage.app",
  appId: "1:215221668181:android:d429fa127c8aa150f8c7dc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export default app;
