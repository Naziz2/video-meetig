import { useState, useEffect } from 'react';
import { initRecording } from '../utils/recording';

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStatus, setRecordingStatus] = useState('');

  // Initialize recording functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Initializing recording functionality');
      initRecording();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Monitor recording status element to update our state
  useEffect(() => {
    const statusObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
          const statusElement = document.getElementById('recordingStatus');
          if (statusElement) {
            const status = statusElement.textContent || '';
            setRecordingStatus(status);
            
            // Update recording state based on status text
            if (status.includes('Recording...')) {
              setIsRecording(true);
            } else if (status === '' || status.includes('Upload Complete') || status.includes('Processing recording...')) {
              setIsRecording(false);
            }
          }
        }
      });
    });

    const statusElement = document.getElementById('recordingStatus');
    if (statusElement) {
      statusObserver.observe(statusElement, { 
        characterData: true, 
        childList: true,
        subtree: true 
      });
    }

    return () => {
      statusObserver.disconnect();
    };
  }, []);

  const toggleRecording = () => {
    const recordButton = document.getElementById('recordButton');
    if (recordButton) {
      recordButton.click();
    }
  };

  return {
    isRecording,
    recordingStatus,
    toggleRecording
  };
};
