import React, { useState, useEffect } from 'react';
import { requestDeviceAsync } from 'react-bluetooth';

const BluetoothModal = ({ isOpen, onClose, onDeviceSelect }) => {
  const [devices, setDevices] = useState([]);
  const [isScanning, setIsScanning] = useState(false);

  const startScanning = async () => {
    setIsScanning(true);
    try {
      const result = await requestDeviceAsync({
        acceptAllDevices: true,
        optionalServices: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b'] // Replace with your service UUID
      });
      if (result.type === 'success') {
        setDevices(prevDevices => [...prevDevices, result.device]);
      }
    } catch (error) {
      console.error('Error scanning for devices:', error);
    }
    setIsScanning(false);
  };

  const handleDeviceSelect = (device) => {
    onDeviceSelect(device);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      setDevices([]);
      startScanning();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
  <div className="bg-white p-6 rounded-lg shadow-lg w-96">
    <h2 className="text-2xl font-bold mb-4 text-gray-800">Available Devices</h2>
    {devices.length === 0 ? (
      <p className="text-gray-600">No devices found. {isScanning ? 'Scanning...' : ''}</p>
    ) : (
      <ul>
        {devices.map((device, index) => (
          <li 
            key={index} 
            className="cursor-pointer hover:bg-gray-100 p-2 rounded text-gray-800"
            onClick={() => handleDeviceSelect(device)}
          >
            {device.name || `Unknown Device ${index + 1}`}
          </li>
        ))}
      </ul>
    )}
    <div className="mt-4 flex justify-between">
      <button 
        onClick={startScanning} 
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        disabled={isScanning}
      >
        {isScanning ? 'Scanning...' : 'Scan Again'}
      </button>
      <button 
        onClick={onClose}
        className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
      >
        Close
      </button>
    </div>
  </div>
</div>
  );
};

export default BluetoothModal;