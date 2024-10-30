import React, { useState, useEffect } from 'react';
import { User, Disc } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAuth, signOut } from 'firebase/auth';

const ProfileView = ({ currentProfile, navigateToMain, connectedDevice }) => {
  const [chartData, setChartData] = useState([]);
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let characteristic;

    const setupBluetooth = async () => {
      if (connectedDevice && connectedDevice.gatt.connected) {
        try {
          console.log('Setting up BLE notifications...');
          const service = await connectedDevice.gatt.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b');
          characteristic = await service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8');
          await characteristic.startNotifications();
          characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
          console.log('Notifications started');
        } catch (error) {
          console.error('Error setting up BLE notifications:', error);
        }
      } else {
        console.log('Device not connected');
      }
    };

    setupBluetooth();

    return () => {
      if (characteristic) {
        characteristic.stopNotifications();
        characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        console.log('Notifications stopped');
      }
    };
  }, [connectedDevice]);

  const handleCharacteristicValueChanged = (event) => {
    const value = new TextDecoder().decode(event.target.value);
    console.log('Received value:', value);
    const numericValue = parseFloat(value);
    
    if (!isNaN(numericValue)) {
      setCurrentValue(numericValue);
      const now = new Date();
      setChartData(prevData => {
        const newData = [...prevData, { time: now.getTime(), value: numericValue }];
        const thirtySecondsAgo = now.getTime() - 30000;
        return newData.filter(item => item.time >= thirtySecondsAgo);
      });
    } else {
      console.error('Received non-numeric value:', value);
    }
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigateToMain();
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900 text-white">
      <div className="flex justify-between items-center p-4 bg-gray-800">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center mr-3 border border-blue-400">
            <User size={24} className="text-blue-300" />
          </div>
          <h1 className="text-xl font-bold text-blue-300">Profile {currentProfile}</h1>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={navigateToMain}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors text-sm"
          >
            Back to Main
          </button>
          <button 
            onClick={handleSignOut}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center text-sm"
          >
            <Disc size={16} className="mr-2" />
            Record
          </button>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col p-4">
        <p className="text-xl text-blue-300 mb-2">Current Value: {currentValue.toFixed(2)}</p>
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF" 
                tickFormatter={(unixTime) => new Date(unixTime).toLocaleTimeString()} 
                domain={['dataMin', 'dataMax']}
                type="number"
              />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #3B82F6' }}
                itemStyle={{ color: '#93C5FD' }}
                labelFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;