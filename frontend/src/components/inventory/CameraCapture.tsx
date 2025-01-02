'use client'

import React, { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { VideoDevice } from './types';

interface CameraCaptureProps {
  onImageCapture: (image: string) => void;
}

const CAMERA_PREFERENCE_KEY = 'preferred-camera-id';

export default function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 5)}...`
          }));
        
        setVideoDevices(videoInputs);
        
        // Get the preferred camera from localStorage
        const preferredCameraId = localStorage.getItem(CAMERA_PREFERENCE_KEY);
        
        if (preferredCameraId && videoInputs.some(device => device.deviceId === preferredCameraId)) {
          // If the preferred camera exists in the available devices, use it
          setSelectedDevice(preferredCameraId);
        } else if (videoInputs.length > 1) {
          // If there are multiple cameras but no stored preference, default to the second camera
          setSelectedDevice(videoInputs[1].deviceId);
          localStorage.setItem(CAMERA_PREFERENCE_KEY, videoInputs[1].deviceId);
        } else if (videoInputs.length > 0) {
          // Otherwise use the first available camera
          setSelectedDevice(videoInputs[0].deviceId);
          localStorage.setItem(CAMERA_PREFERENCE_KEY, videoInputs[0].deviceId);
        }
      } catch (err) {
        console.error('Error getting video devices:', err);
      }
    };

    getVideoDevices();
  }, []);

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId);
    localStorage.setItem(CAMERA_PREFERENCE_KEY, deviceId);
  };

  const handleCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onImageCapture(imageSrc);
    }
  };

  return (
    <div className="space-y-4">
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