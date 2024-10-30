// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA65qJvmgillMyz48Z1NAjAkyNgskgiWtA",
  authDomain: "kineurademo.firebaseapp.com",
  projectId: "kineurademo",
  storageBucket: "kineurademo.appspot.com",
  messagingSenderId: "703229325220",
  appId: "1:703229325220:web:90fb310e0fad07c6399b31",
  measurementId: "G-WQY2MYYKM0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export the configuration
export default firebaseConfig;

