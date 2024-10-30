import React, { useState } from 'react';
import { User, PlusCircle } from 'lucide-react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const MainView = ({ profiles, navigateToProfile, user, fetchProfiles }) => {
  const [newProfileName, setNewProfileName] = useState('');
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  const startAddingProfile = () => setIsAddingProfile(true);

  const cancelAddingProfile = () => {
    setIsAddingProfile(false);
    setNewProfileName('');
  };

  const addNewProfile = async () => {
    if (newProfileName.trim() && user) {
      const db = getFirestore();
      await addDoc(collection(db, `users/${user.uid}/profiles`), {
        name: newProfileName.trim(),
        createdAt: new Date()
      });
      fetchProfiles(user.uid);
      setIsAddingProfile(false);
      setNewProfileName('');
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {profiles.map((profile) => (
          <div 
            key={profile.id} 
            className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors border border-blue-500"
            onClick={() => navigateToProfile(profile.id)}
          >
            <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center border-2 border-blue-400">
              <User size={64} className="text-blue-300" />
            </div>
            <p className="mt-4 text-lg font-semibold text-blue-300">{profile.name}</p>
          </div>
        ))}

        {isAddingProfile ? (
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center border border-blue-500">
            <input
              type="text"
              value={newProfileName}
              onChange={(e) => setNewProfileName(e.target.value)}
              placeholder="Enter profile name"
              className="mb-4 p-2 bg-gray-700 text-blue-100 rounded border border-blue-400 focus:outline-none focus:border-blue-300"
            />
            <div className="flex space-x-2">
              <button
                onClick={addNewProfile}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Add
              </button>
              <button
                onClick={cancelAddingProfile}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div
            className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors border border-blue-500"
            onClick={startAddingProfile}
          >
            <h2 className="text-xl font-bold mb-4 text-blue-300">Add New</h2>
            <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center border-2 border-blue-400">
              <PlusCircle size={64} className="text-blue-300" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainView;