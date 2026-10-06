import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBzjcqE64iZqsPBc5gscqgZ-fp0JLEPaVE",
  authDomain: "codevault-c58a0.firebaseapp.com",
  projectId: "codevault-c58a0",
  storageBucket: "codevault-c58a0.firebasestorage.app",
  messagingSenderId: "1051182021166",
  appId: "1:1051182021166:web:8843e72685ce33948efdbf",
  measurementId: "G-T4GM6Y5GZH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth & GitHub Provider
export const auth = getAuth(app);
export const githubProvider = new GithubAuthProvider();

// Scopes required for CodeVault to sync problem solutions to GitHub
githubProvider.addScope('read:user');
githubProvider.addScope('user:email');
githubProvider.addScope('repo');

export default app;
