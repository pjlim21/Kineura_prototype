import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Maximize, Minimize, ArrowLeft } from 'lucide-react';

const PresentationView = ({ connectedDevice, navigateToMain }) => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [currentValue, setCurrentValue] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const totalSlides = 10; // Update this with your actual number of slides

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
      }
    };

    setupBluetooth();

    // Setup fullscreen change listener
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      if (characteristic) {
        characteristic.stopNotifications();
        characteristic.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      }
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [connectedDevice]);

  const handleCharacteristicValueChanged = (event) => {
    const value = new TextDecoder().decode(event.target.value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      setCurrentValue(numericValue);
    }
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(curr => curr + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(curr => curr - 1);
    }
  };

  const getBarColor = (value) => {
    const hue = ((100 - value) * 120) / 100;
    return `hsl(${hue}, 100%, 50%)`;
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const presentationContainer = document.getElementById('presentation-container');
        if (presentationContainer) {
          await presentationContainer.requestFullscreen();
        }
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          nextSlide();
          break;
        case 'ArrowLeft':
          previousSlide();
          break;
        case 'f':
        case 'F':
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            document.exitFullscreen();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, isFullscreen]);

  return (
    <div 
      id="presentation-container"
      className={`h-screen w-screen flex bg-gray-900 ${isFullscreen ? 'fixed top-0 left-0 z-50' : ''}`}
    >
      {/* Muscle activation bar */}
      <div className={`${isFullscreen ? 'w-16' : 'w-24'} h-full p-4 bg-gray-800 flex flex-col`}>
        <div className="flex-grow relative w-full bg-gray-700 rounded-full">
          <div 
            className="absolute bottom-0 w-full rounded-full transition-all duration-300"
            style={{
              height: `${currentValue}%`,
              backgroundColor: getBarColor(currentValue)
            }}
          />
        </div>
        <div className="text-white text-center mt-2">
          {currentValue.toFixed(1)}%
        </div>
      </div>

      {/* Main presentation area */}
      <div className="flex-grow flex flex-col">
        {/* Navigation bar - only shown when not in fullscreen */}
        {!isFullscreen && (
          <div className="flex justify-between items-center p-4 bg-gray-800">
            <button
              onClick={navigateToMain}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            <div className="flex items-center space-x-4">
              <button
                onClick={previousSlide}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                disabled={currentSlide === 1}
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-white">Slide {currentSlide} / {totalSlides}</span>
              <button
                onClick={nextSlide}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
                disabled={currentSlide === totalSlides}
              >
                <ChevronRight size={24} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded ml-4"
              >
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>
        )}

        {/* PowerPoint embed */}
        <div className="flex-grow p-4">
          <iframe
            src="https://livejohnshopkins-my.sharepoint.com/personal/plim11_jh_edu/_layouts/15/Doc.aspx?sourcedoc={233436a3-3c3d-4b8f-a67f-294e2ab78bfc}&amp;action=embedview&amp;wdAr=1.7777777777777777"
            className="w-full h-full border-none"
            title="PowerPoint Presentation"
          />
        </div>
      </div>

      {/* Fullscreen controls overlay - only shown briefly when in fullscreen */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 flex items-center space-x-4 bg-gray-800 bg-opacity-50 p-2 rounded opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-blue-300"
          >
            <Minimize size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default PresentationView;


