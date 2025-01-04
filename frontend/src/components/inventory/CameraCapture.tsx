// frontend/src/components/inventory/CameraCapture.tsx
// Camera component with V4L2 focus control support for Devuan Linux
// Focus range based on v4l2-ctl -d /dev/video0 --list-ctrls documentation

'use client'

import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { VideoDevice } from './types';

interface CameraCaptureProps {
  onImageCapture: (image: string) => void;
}

const CAMERA_PREFERENCE_KEY = 'preferred-camera-id';
const FOCUS_MODE_KEY = 'preferred-focus-mode';
const FOCUS_DISTANCE_KEY = 'preferred-focus-distance';

// Camera control constants based on v4l2 documentation
const FOCUS_CONTROL = {
  MIN: 0,
  MAX: 40,
  STEP: 1,
  DEFAULT: 0,
  MACRO: 40  // Value for close-up shots (3cm)
};

// Call v4l2-ctl command through a backend endpoint
const setV4L2Focus = async (devicePath: string, focusValue: number) => {
  try {
    const response = await fetch('http://localhost:5000/api/camera/set-focus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        device: devicePath,
        focus: focusValue
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to set focus');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error setting focus:', error);
    throw error;
  }
};

export default function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [focusMode, setFocusMode] = useState<'auto' | 'manual'>(() => 
    localStorage.getItem(FOCUS_MODE_KEY) as 'auto' | 'manual' || 'auto'
  );
  const [focusDistance, setFocusDistance] = useState<number>(() => 
    Number(localStorage.getItem(FOCUS_DISTANCE_KEY)) || 40  // Default to 40 as per your command
  );
  const [devicePath, setDevicePath] = useState<string>('/dev/video0');
  const [error, setError] = useState<string | null>(null);
  
  const webcamRef = useRef<Webcam>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices
          .filter(device => device.kind === 'videoinput')
          .map((device, index) => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${index}`,
            path: `/dev/video${index}` // Assuming the device order matches v4l2
          }));
        
        setVideoDevices(videoInputs);
        
        const preferredCameraId = localStorage.getItem(CAMERA_PREFERENCE_KEY);
        const deviceIdToUse = preferredCameraId && 
          videoInputs.some(device => device.deviceId === preferredCameraId)
          ? preferredCameraId
          : videoInputs[0]?.deviceId;

        if (deviceIdToUse) {
          setSelectedDevice(deviceIdToUse);
          const selectedVideoDevice = videoInputs.find(d => d.deviceId === deviceIdToUse);
          if (selectedVideoDevice) {
            setDevicePath(selectedVideoDevice.path);
          }
          localStorage.setItem(CAMERA_PREFERENCE_KEY, deviceIdToUse);

          // Initialize the stream
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: deviceIdToUse,
            }
          });
          
          streamRef.current = stream;

          // Set initial focus based on stored mode
          if (focusMode === 'manual') {
            await setV4L2Focus(selectedVideoDevice?.path || '/dev/video0', focusDistance);
          }
        }
      } catch (err) {
        console.error('Error initializing camera:', err);
        setError('Error initializing camera. Please check permissions.');
      }
    };

    initializeCamera();
  }, []);

  const handleDeviceSelect = async (deviceId: string) => {
    try {
      setSelectedDevice(deviceId);
      localStorage.setItem(CAMERA_PREFERENCE_KEY, deviceId);
      
      const selectedVideoDevice = videoDevices.find(d => d.deviceId === deviceId);
      if (selectedVideoDevice) {
        setDevicePath(selectedVideoDevice.path);
      }

      // Get new stream for selected device
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId }
      });
      
      streamRef.current = stream;

      // Apply current focus settings to new device
      if (focusMode === 'manual') {
        await setV4L2Focus(selectedVideoDevice?.path || '/dev/video0', focusDistance);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error changing device:', error);
      setError('Failed to switch camera device');
    }
  };

  const handleFocusModeChange = async (mode: 'auto' | 'manual') => {
    try {
      setFocusMode(mode);
      localStorage.setItem(FOCUS_MODE_KEY, mode);
      
      if (mode === 'manual') {
        await setV4L2Focus(devicePath, focusDistance);
      } else {
        // For auto mode, set a very high value that triggers auto-focus
        await setV4L2Focus(devicePath, 0);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error changing focus mode:', error);
      setError('Failed to change focus mode');
    }
  };

  const handleFocusDistanceChange = async (distance: number) => {
    try {
      console.log('Setting focus distance:', distance);
      setFocusDistance(distance);
      localStorage.setItem(FOCUS_DISTANCE_KEY, String(distance));
      
      if (focusMode === 'manual') {
        await setV4L2Focus(devicePath, distance);
      }
      
      setError(null);
    } catch (error) {
      console.error('Error changing focus distance:', error);
      setError('Failed to set focus distance');
    }
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onImageCapture(imageSrc);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}

      {videoDevices.length > 0 && (
        <select
          className="w-full p-2 border rounded-lg bg-white"
          value={selectedDevice}
          onChange={(e) => handleDeviceSelect(e.target.value)}
        >
          {videoDevices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      )}
      
      <div className="space-y-2">
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={focusMode === 'auto'}
              onChange={() => handleFocusModeChange('auto')}
            />
            <span>Auto Focus</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              checked={focusMode === 'manual'}
              onChange={() => handleFocusModeChange('manual')}
            />
            <span>Manual Focus</span>
          </label>
        </div>
        
	{focusMode === 'manual' && (
	  <div className="space-y-2">
	    <div className="flex items-center space-x-2">
	      <span>Focus Distance:</span>
	      <input
		type="range"
		min={FOCUS_CONTROL.MIN}
		max={FOCUS_CONTROL.MAX}
		step={FOCUS_CONTROL.STEP}
		value={focusDistance}
		onChange={(e) => handleFocusDistanceChange(Number(e.target.value))}
		className="flex-grow"
	      />
	      <span className="w-12 text-center">{focusDistance}</span>
	    </div>
	    <div className="flex justify-between text-sm text-gray-500">
	      <span>Far</span>
	      <span>Close (3cm)</span>
	    </div>
	    <button
	      className="w-full px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
	      onClick={() => handleFocusDistanceChange(FOCUS_CONTROL.MACRO)}
	    >
	      Set Macro Focus (3cm)
	    </button>
	  </div>
	)}
      </div>
      
      <div className="relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            deviceId: selectedDevice
          }}
          className="w-full rounded-lg"
        />
        <button
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-500 text-white rounded-lg"
          onClick={handleCapture}
        >
          Capture
        </button>
      </div>
    </div>
  );
}
