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

export default function CameraCapture({ onImageCapture }: CameraCaptureProps) {
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [focusMode, setFocusMode] = useState<'auto' | 'manual'>(() => 
    localStorage.getItem(FOCUS_MODE_KEY) as 'auto' | 'manual' || 'auto'
  );
  const [focusDistance, setFocusDistance] = useState<number>(() => 
    Number(localStorage.getItem(FOCUS_DISTANCE_KEY)) || 0
  );
  const [focusCapabilities, setFocusCapabilities] = useState<{
    supported: boolean;
    min?: number;
    max?: number;
    step?: number;
  }>({ supported: true, min: 0, max: 1, step: 0.1 });
  
  const webcamRef = useRef<Webcam>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices
          .filter(device => device.kind === 'videoinput')
          .map(device => ({
            deviceId: device.deviceId,
            label: device.label || `Camera ${device.deviceId.slice(0, 5)}...`
          }));
        
        setVideoDevices(videoInputs);
        
        const preferredCameraId = localStorage.getItem(CAMERA_PREFERENCE_KEY);
        const deviceIdToUse = preferredCameraId && 
          videoInputs.some(device => device.deviceId === preferredCameraId)
          ? preferredCameraId
          : videoInputs.length > 1 
            ? videoInputs[1].deviceId 
            : videoInputs[0]?.deviceId;

        if (deviceIdToUse) {
          setSelectedDevice(deviceIdToUse);
          localStorage.setItem(CAMERA_PREFERENCE_KEY, deviceIdToUse);

          // Initialize the stream with saved focus preferences
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: deviceIdToUse,
              advanced: [{
                focusMode: focusMode,
                focusDistance: focusMode === 'manual' ? focusDistance : undefined
              }]
            }
          });
          
          streamRef.current = stream;
        }
      } catch (err) {
        console.error('Error initializing camera:', err);
      }
    };

    initializeCamera();
  }, []);

  const handleDeviceSelect = async (deviceId: string) => {
    setSelectedDevice(deviceId);
    localStorage.setItem(CAMERA_PREFERENCE_KEY, deviceId);
    
    // Check focus capabilities when device changes
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId,
          advanced: [{
            focusMode: 'manual',
            focusDistance: 0
          }]
        }
      });
      
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      console.log('Camera capabilities:', capabilities);
      
      // Force enable focus controls even if not reported as supported
      setFocusCapabilities({
        supported: true,
        min: capabilities.focusDistance?.min || 0,
        max: capabilities.focusDistance?.max || 1,
        step: capabilities.focusDistance?.step || 0.1
      });

      streamRef.current = stream;
    } catch (error) {
      console.error('Error checking focus capabilities:', error);
      // Still show controls even if check fails
      setFocusCapabilities({
        supported: true,
        min: 0,
        max: 1,
        step: 0.1
      });
    }
  };

  const handleFocusModeChange = async (mode: 'auto' | 'manual') => {
    setFocusMode(mode);
    localStorage.setItem(FOCUS_MODE_KEY, mode);
    
    if (!streamRef.current) return;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    try {
      await videoTrack.applyConstraints({
        advanced: [{
          focusMode: mode,
          focusDistance: mode === 'manual' ? focusDistance : undefined
        }]
      });
      console.log('Applied focus mode:', mode);
    } catch (error) {
      console.error('Error changing focus mode:', error);
    }
  };

  const handleFocusDistanceChange = async (distance: number) => {
    console.log('Setting focus distance:', distance);
    setFocusDistance(distance);
    localStorage.setItem(FOCUS_DISTANCE_KEY, String(distance));
    
    if (!streamRef.current || focusMode !== 'manual') return;

    const videoTrack = streamRef.current.getVideoTracks()[0];
    try {
      await videoTrack.applyConstraints({
        advanced: [{
          focusDistance: distance
        }]
      });
      console.log('Applied focus distance:', distance);
    } catch (error) {
      console.error('Error changing focus distance:', error);
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
      
      {focusCapabilities.supported && (
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
          
          {focusMode === 'manual' && focusCapabilities.min !== undefined && focusCapabilities.max !== undefined && (
            <div className="flex items-center space-x-2">
              <span>Focus Distance:</span>
              <input
                type="range"
                min={focusCapabilities.min}
                max={focusCapabilities.max}
                step={focusCapabilities.step || 0.1}
                value={focusDistance}
                onChange={(e) => handleFocusDistanceChange(Number(e.target.value))}
                className="flex-grow"
              />
            </div>
          )}
        </div>
      )}
      
      <div className="relative">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            deviceId: selectedDevice,
            advanced: [{
              focusMode: focusMode,
              focusDistance: focusMode === 'manual' ? focusDistance : undefined
            }]
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
