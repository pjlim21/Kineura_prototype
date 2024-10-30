import React, { useState } from 'react';
import { Menu, Bluetooth } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';
import BluetoothModal from './BluetoothModal';

const TopBar = ({ user, setIsSigningUp, navigateToProfile, connectedDevice, setConnectedDevice, setCurrentView }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBluetoothModalOpen, setIsBluetoothModalOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const signOutUser = async () => {
    const auth = getAuth();
    await signOut(auth);
  };

  const handleDeviceSelect = async (selectedDevice) => {
    try {
      await selectedDevice.gatt.connect();
      console.log('Connected to', selectedDevice.name);
      setConnectedDevice(selectedDevice);
      setIsBluetoothModalOpen(false);
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (connectedDevice && connectedDevice.gatt.connected) {
        await connectedDevice.gatt.disconnect();
      }
      setConnectedDevice(null);
      console.log('Disconnected from device');
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  return (
    <div className="bg-gray-900 p-4 flex justify-between items-center border-b border-blue-500">
      <button onClick={toggleMenu} className="text-blue-400 hover:text-blue-300">
        <Menu size={24} />
      </button>
      <button 
        onClick={() => connectedDevice ? handleDisconnect() : setIsBluetoothModalOpen(true)} 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center"
      >
        <Bluetooth size={20} className="mr-2" />
        {connectedDevice ? 'Disconnect' : 'Pair Device'}
      </button>
      <BluetoothModal 
        isOpen={isBluetoothModalOpen}
        onClose={() => setIsBluetoothModalOpen(false)}
        onDeviceSelect={handleDeviceSelect}
      />

      {user ? (
        <button onClick={() => navigateToProfile('myProfile')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
          My Profile
        </button>
      ) : (
        <button onClick={() => setIsSigningUp(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors">
          Sign In/Create Account
        </button>
      )}
      {menuOpen && (
        <div className="absolute top-full left-0 bg-gray-800 shadow-lg z-10">
          <ul className="py-2">
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-blue-300" 
              onClick={() => setCurrentView("presentation")}>
            Presentation Mode
            </li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-blue-300">Option 1</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-blue-300">Option 2</li>
            <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-blue-300">Option 3</li>
            {user && (
              <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer text-blue-300" onClick={signOutUser}>
                Sign Out
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TopBar;