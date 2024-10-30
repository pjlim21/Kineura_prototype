import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import firebaseConfig from "./firebaseConfig.jsx";
import TopBar from "./TopBar.jsx";
import MainView from "./MainView.jsx";
import ProfileView from "./ProfileView.jsx";
import AuthView from "./AuthView.jsx";
import PresentationView from './PresentationView.jsx';

const App = () => {
  const [currentView, setCurrentView] = useState("main");
  const [currentProfile, setCurrentProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [user, setUser] = useState(null);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchProfiles(user.uid);
      } else {
        setProfiles([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchProfiles = async (userId) => {
    const db = getFirestore();
    const profilesSnapshot = await getDocs(
      collection(db, `users/${userId}/profiles`),
    );
    const profilesData = profilesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProfiles(profilesData);
  };

  const navigateToProfile = (profileId) => {
    setCurrentProfile(profileId);
    setCurrentView("profile");
  };

  const navigateToMain = () => {
    setCurrentView("main");
    setCurrentProfile(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <TopBar
        user={user}
        setIsSigningUp={setIsSigningUp}
        navigateToProfile={navigateToProfile}
        connectedDevice={connectedDevice}
        setConnectedDevice={setConnectedDevice}
        setCurrentView={setCurrentView}
      />
      {!user && isSigningUp ? (
        <AuthView setIsSigningUp={setIsSigningUp} />
      ) : currentView === "main" ? (
        <MainView
          profiles={profiles}
          navigateToProfile={navigateToProfile}
          user={user}
          fetchProfiles={fetchProfiles}
          connectedDevice={connectedDevice}
        />
      ) : currentView === "presentation" ? (
        <PresentationView
          connectedDevice={connectedDevice}
          navigateToMain={() => setCurrentView("main")}
        />
      ): (
        <ProfileView
          currentProfile={currentProfile}
          navigateToMain={navigateToMain}
          connectedDevice={connectedDevice}
        />
      )}
    </div>
  );
};

export default App;