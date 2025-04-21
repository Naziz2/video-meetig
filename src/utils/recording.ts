// Screen recording variables
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let stream: MediaStream | null = null;
let audioStream: MediaStream | null = null;
let isRecordingActive = false;
let isProcessingRecording = false; // Add a flag to track processing state
let permissionDeniedRecently = false; // Track recent permission denials

// Import the store to access the current user
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

// Function to initialize DOM elements when needed
function getElements() {
  const recordButton = document.getElementById('recordButton');
  const recordingStatus = document.getElementById('recordingStatus');
  const gridContainer = document.getElementById('gridContainer');
  
  return {
    recordButton,
    recordingStatus,
    gridContainer
  };
}

// Initialize event listeners when the DOM is ready
export function initRecording(): void {
  console.log('Initializing recording functionality...');
  
  // Try to attach listeners immediately
  attachEventListeners();
  
  // Also try again after a short delay to ensure DOM is fully loaded
  setTimeout(attachEventListeners, 1000);
}

function attachEventListeners(): void {
  const { recordButton } = getElements();
  
  if (recordButton) {
    console.log('Record button found, attaching event listeners');
    
    // Remove any existing listeners to prevent duplicates
    recordButton.removeEventListener('click', toggleRecording);
    
    // Add new listeners
    recordButton.addEventListener('click', toggleRecording);
  } else {
    console.error('Record button not found in the DOM');
  }
}

function toggleRecording(): void {
  // Prevent toggling while processing a recording
  if (isProcessingRecording) {
    console.log('Recording is currently being processed, please wait...');
    return;
  }
  
  // Prevent rapid permission requests if user recently denied
  if (permissionDeniedRecently) {
    const elements = getElements();
    if (elements.recordingStatus) {
      elements.recordingStatus.textContent = 'Permission was denied. Please wait before trying again.';
      
      // Clear the message after a few seconds
      setTimeout(() => {
        if (elements.recordingStatus) {
          elements.recordingStatus.textContent = '';
        }
      }, 3000);
    }
    return;
  }
  
  if (isRecordingActive) {
    stopRecording();
  } else {
    startRecording();
  }
}

function updateRecordButtonState(): void {
  const { recordButton } = getElements();
  
  if (recordButton) {
    if (isRecordingActive) {
      recordButton.classList.remove('bg-red-600', 'hover:bg-red-700');
      recordButton.classList.add('bg-slate-700', 'hover:bg-slate-600');
      
      // Update icon or text if needed
      const iconElement = recordButton.querySelector('svg');
      if (iconElement) {
        iconElement.classList.add('text-red-500');
      }
    } else {
      recordButton.classList.remove('bg-slate-700', 'hover:bg-slate-600');
      recordButton.classList.add('bg-red-600', 'hover:bg-red-700');
      
      // Update icon or text if needed
      const iconElement = recordButton.querySelector('svg');
      if (iconElement) {
        iconElement.classList.remove('text-red-500');
      }
    }
    
    // Disable the button during processing
    if (isProcessingRecording || permissionDeniedRecently) {
      recordButton.setAttribute('disabled', 'true');
      recordButton.classList.add('opacity-50', 'cursor-not-allowed');
    } else {
      recordButton.removeAttribute('disabled');
      recordButton.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
}

async function startRecording(): Promise<void> {
    if (isRecordingActive || isProcessingRecording) return;
    
    try {
        const elements = getElements();
        
        // Set recording state to processing while we request permissions
        isProcessingRecording = true;
        updateRecordButtonState();
        
        if (elements.recordingStatus) {
            elements.recordingStatus.textContent = 'Requesting screen capture...';
        }
        
        // First, request audio capture to avoid multiple permission dialogs
        try {
            audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });
        } catch (audioErr) {
            console.error('Error capturing audio:', audioErr);
            throw new Error('Microphone access is required for recording with audio.');
        }
        
        // Now request screen capture with specific constraints
        try {
            // Use a more specific displayMedia request to reduce prompts
            stream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    displaySurface: "browser",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 },
                    frameRate: { ideal: 30 }
                } as any, // Type assertion to handle non-standard properties
                audio: false,
                selfBrowserSurface: "include" as any, // Type assertion for non-standard property
                preferCurrentTab: true as any // Type assertion for non-standard property
            });
            
            // Check if user selected the right tab
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack && videoTrack.label) {
                console.log('Selected video source:', videoTrack.label);
                
                // If they didn't select a browser tab, show a hint
                if (!videoTrack.label.toLowerCase().includes('tab') && 
                    !videoTrack.label.toLowerCase().includes('browser')) {
                    if (elements.recordingStatus) {
                        elements.recordingStatus.textContent = 'Hint: Select a browser tab for best results';
                        setTimeout(() => {
                            if (elements.recordingStatus && elements.recordingStatus.textContent === 'Hint: Select a browser tab for best results') {
                                elements.recordingStatus.textContent = 'Recording...';
                            }
                        }, 3000);
                    }
                }
            }
        } catch (screenErr: any) {
            // Clean up audio stream if screen capture fails
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
                audioStream = null;
            }
            
            console.error('Error capturing screen:', screenErr);
            
            // Handle permission denied specifically
            if (screenErr.name === 'NotAllowedError') {
                permissionDeniedRecently = true;
                setTimeout(() => {
                    permissionDeniedRecently = false;
                    updateRecordButtonState();
                }, 5000); // Prevent requesting again for 5 seconds
                
                throw new Error('Screen capture permission was denied.');
            }
            
            throw new Error('Failed to capture screen. Please try again.');
        }
        
        // Set recording state
        isRecordingActive = true;
        isProcessingRecording = false;
        updateRecordButtonState();

        // Combine video and audio streams
        const combinedStream = new MediaStream([
            ...stream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        // Create media recorder with the combined stream
        mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm;codecs=vp9,opus',
            videoBitsPerSecond: 3000000 // 3 Mbps
        });

        // Clear previous chunks
        recordedChunks = [];

        // Handle data available event
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        // Handle stop event
        mediaRecorder.onstop = () => {
            console.log('MediaRecorder stopped, processing recording...');
            isProcessingRecording = true; // Set processing flag
            updateRecordButtonState();
            
            // Create a blob from the recorded chunks
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            
            // Create a file from the blob
            const now = new Date();
            const fileName = `recording-${now.toISOString().replace(/[:.]/g, '-')}.webm`;
            const file = new File([blob], fileName, { type: 'video/webm' });
            
            // Upload the recording
            uploadRecording(file);
            
            // Clean up streams
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            
            if (audioStream) {
                audioStream.getTracks().forEach(track => track.stop());
                audioStream = null;
            }
        };

        // Add track ended event listeners to handle if user stops sharing
        stream.getVideoTracks().forEach(track => {
            track.addEventListener('ended', () => {
                console.log('Video track ended by user');
                if (isRecordingActive) {
                    stopRecording();
                }
            });
        });

        // Start recording
        mediaRecorder.start(1000); // Capture in 1-second chunks
        
        // Update UI
        if (elements.recordingStatus) {
            elements.recordingStatus.textContent = 'Recording...';
            elements.recordingStatus.classList.add('recording');
        }
        
    } catch (err: any) {
        console.error('Error starting recording:', err);
        
        // Show specific error message to the user
        const elements = getElements();
        if (elements.recordingStatus) {
            elements.recordingStatus.textContent = err.message || 'Error starting recording';
            
            // Clear the error message after a few seconds
            setTimeout(() => {
                if (elements.recordingStatus && elements.recordingStatus.textContent.includes('Error')) {
                    elements.recordingStatus.textContent = '';
                }
            }, 5000);
        }
        
        // Reset recording state
        isRecordingActive = false;
        isProcessingRecording = false;
        updateRecordButtonState();
        
        // Clean up any streams that might have been created
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
        
        if (audioStream) {
            audioStream.getTracks().forEach(track => track.stop());
            audioStream = null;
        }
    }
}

function stopRecording(): void {
    if (!isRecordingActive || !mediaRecorder) return;
    
    // Update recording state
    isRecordingActive = false;
    isProcessingRecording = true; // Set processing flag
    updateRecordButtonState();
    
    // Stop the recording
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    
    // Update UI
    const elements = getElements();
    
    if (elements.recordingStatus) {
        elements.recordingStatus.textContent = 'Processing recording...';
        elements.recordingStatus.classList.remove('recording');
    }
}

function uploadRecording(file: File): void {
    const elements = getElements();
    
    if (elements.recordingStatus) {
        elements.recordingStatus.textContent = 'Uploading recording...';
    }
    
    // Get the room ID from the URL
    const urlParts = window.location.pathname.split('/');
    const channel = urlParts[urlParts.length - 1];
    
    // Create FormData for upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Use a valid upload preset - either use your own or use unsigned uploading
    formData.append('upload_preset', 'ml_default'); // Default unsigned upload preset
    formData.append('resource_type', 'video');
    formData.append('api_key', '468437437282978'); // Your Cloudinary API key
    
    // Add a timestamp and generate a signature if needed for your Cloudinary account
    const timestamp = Math.round((new Date()).getTime() / 1000);
    formData.append('timestamp', timestamp.toString());
    
    // Create XHR request
    const xhr = new XMLHttpRequest();
    
    // Replace 'demo' with your actual cloud name
    xhr.open('POST', 'https://api.cloudinary.com/v1_1/dbtnbqmw8/video/upload', true);
    
    // Track upload progress
    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable && elements.recordingStatus) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            elements.recordingStatus.textContent = `Uploading: ${percentComplete}%`;
        }
    };
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            console.log('Upload successful:', response);
            
            if (elements.recordingStatus) {
                elements.recordingStatus.textContent = 'Upload Complete';
            }
            
            // Add to grid
            addToGrid(response.secure_url, 'video', 'tab-recording');
            
            // Save recording information to database
            saveRecordingToDatabase(response.secure_url, response.bytes, response.duration, channel);
            
            // Clear status after a few seconds
            setTimeout(() => {
                if (elements.recordingStatus) {
                    elements.recordingStatus.textContent = '';
                }
                // Reset processing flag
                isProcessingRecording = false;
                updateRecordButtonState();
            }, 3000);
        } else {
            // Handle upload failure
            console.error('Upload failed:', xhr.responseText);
            
            if (elements.recordingStatus) {
                elements.recordingStatus.textContent = 'Upload Failed';
                
                // Add option to save locally instead
                const saveLocallyButton = document.createElement('button');
                saveLocallyButton.textContent = 'Save Recording Locally';
                saveLocallyButton.className = 'ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600';
                saveLocallyButton.onclick = () => saveRecordingLocally(file);
                elements.recordingStatus.appendChild(saveLocallyButton);
            }
            
            // Reset processing flag after a delay
            setTimeout(() => {
                isProcessingRecording = false;
                updateRecordButtonState();
            }, 1000);
        }
    };

    xhr.onerror = function() {
        console.error('Upload error occurred');
        
        if (elements.recordingStatus) {
            elements.recordingStatus.textContent = 'Upload Failed';
            
            // Add option to save locally instead
            const saveLocallyButton = document.createElement('button');
            saveLocallyButton.textContent = 'Save Recording Locally';
            saveLocallyButton.className = 'ml-2 px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600';
            saveLocallyButton.onclick = () => saveRecordingLocally(file);
            elements.recordingStatus.appendChild(saveLocallyButton);
        }
        
        // Reset processing flag after a delay
        setTimeout(() => {
            isProcessingRecording = false;
            updateRecordButtonState();
        }, 1000);
    };

    xhr.send(formData);
}

// Function to save recording locally when cloud upload fails
function saveRecordingLocally(file: File): void {
    const elements = getElements();
    
    // Create a download link
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download = file.name;
    
    // Append to document, click, and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Update UI
    if (elements.recordingStatus) {
        elements.recordingStatus.textContent = 'Recording saved locally';
        
        // Clear any buttons that might have been added
        while (elements.recordingStatus.firstChild && elements.recordingStatus.firstChild !== elements.recordingStatus.firstChild.nodeValue) {
            elements.recordingStatus.removeChild(elements.recordingStatus.firstChild);
        }
        
        // Clear status after a few seconds
        setTimeout(() => {
            if (elements.recordingStatus) {
                elements.recordingStatus.textContent = '';
            }
        }, 3000);
    }
    
    // Reset processing flag
    isProcessingRecording = false;
    updateRecordButtonState();
}

// Function to save recording information to the database
async function saveRecordingToDatabase(fileUrl: string, fileSize: number, duration: number, roomId: string): Promise<void> {
    try {
        const state = useStore.getState();
        const user = state.user;
        
        if (!user) {
            console.error('Cannot save recording: User not authenticated');
            return;
        }
        
        // Get meeting ID if available
        const { data: meetingData } = await supabase
            .from('meetings')
            .select('id')
            .eq('room_id', roomId)
            .limit(1);
            
        const meetingId = meetingData && meetingData.length > 0 ? meetingData[0].id : null;
        
        // Insert recording record
        const { error } = await supabase
            .from('recordings')
            .insert({
                meeting_id: meetingId,
                room_id: roomId,
                recorder_id: user.id,
                file_url: fileUrl,
                file_size: fileSize,
                duration: Math.round(duration || 0),
                format: 'mp4',
                created_at: new Date().toISOString()
            });
            
        if (error) {
            console.error('Error saving recording to database:', error);
        } else {
            console.log('Recording saved to database successfully');
        }
    } catch (err) {
        console.error('Error in saveRecordingToDatabase:', err);
    }
}

function addToGrid(mediaUrl: string, resourceType: string, fileName: string): void {
    const elements = getElements();
    
    if (!elements.gridContainer) return;
    
    // Create media item container
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    
    // Create info container
    const info = document.createElement('div');
    info.className = 'media-info';
    
    // Create title
    const title = document.createElement('div');
    title.className = 'media-title';
    title.textContent = fileName;
    
    // Create URL
    const url = document.createElement('div');
    url.className = 'media-url';
    url.textContent = mediaUrl;
    
    // Create type indicator
    const type = document.createElement('div');
    type.className = 'media-type';
    type.textContent = resourceType.toUpperCase();
    
    // Assemble the media item
    info.appendChild(title);
    info.appendChild(url);
    info.appendChild(type);
    mediaItem.appendChild(info);
    
    // Add to grid (prepend to show newest first)
    elements.gridContainer.insertBefore(mediaItem, elements.gridContainer.firstChild);
}