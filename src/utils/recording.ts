// Screen recording variables
let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let stream: MediaStream | null = null;
let audioStream: MediaStream | null = null;
let isRecordingActive = false;

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
  
  // And one more time after a longer delay just to be sure
  setTimeout(attachEventListeners, 3000);
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
  }
}

async function startRecording(): Promise<void> {
    if (isRecordingActive) return;
    
    try {
        const elements = getElements();
        
        // Set recording state
        isRecordingActive = true;
        updateRecordButtonState();
        
        // Request tab capture with specific constraints
        stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                mediaSource: 'browser',
                width: { ideal: 1920 },
                height: { ideal: 1080 },
                displaySurface: 'browser',
                logicalSurface: true,
                cursor: 'always'
            },
            audio: false, // We'll handle audio separately
            preferCurrentTab: true, // Prefer the current tab
            selfBrowserSurface: 'include', // Include the current tab
            systemAudio: 'exclude' // Exclude system audio
        });

        // Request audio capture
        audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: 44100
            }
        });

        // Combine video and audio streams
        const combinedStream = new MediaStream([
            ...stream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        // Create media recorder with the combined stream
        mediaRecorder = new MediaRecorder(combinedStream, {
            mimeType: 'video/webm;codecs=vp9,opus',
            videoBitsPerSecond: 2500000 // 2.5 Mbps
        });

        // Handle data available event
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };

        // Handle stop event
        mediaRecorder.onstop = () => {
            if (!stream || !audioStream) return;
            
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            
            // Create a file from the blob
            const file = new File([blob], 'tab-recording.webm', { type: 'video/webm' });
            
            // Upload the recording to Cloudinary
            uploadRecording(file);
            
            // Clean up
            recordedChunks = [];
            stream.getTracks().forEach(track => track.stop());
            audioStream.getTracks().forEach(track => track.stop());
        };

        // Start recording
        mediaRecorder.start(1000); // Collect data every second
        
        // Update UI
        if (elements.recordingStatus) {
            elements.recordingStatus.textContent = 'Recording...';
            elements.recordingStatus.classList.add('recording');
        }
        
    } catch (err) {
        console.error('Error starting recording:', err);
        alert('Error starting recording. Please make sure you have granted the necessary permissions.');
        
        // Reset recording state
        isRecordingActive = false;
        updateRecordButtonState();
    }
}

function stopRecording(): void {
    if (!isRecordingActive || !mediaRecorder || mediaRecorder.state === 'inactive') return;
    
    // Update recording state
    isRecordingActive = false;
    updateRecordButtonState();
    
    // Stop the recording
    if (mediaRecorder.state !== 'inactive') {
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
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    formData.append('api_key', '468437437282978');
    formData.append('timestamp', String(Math.floor(Date.now() / 1000)));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/dbtnbqmw8/video/upload`, true);

    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable && elements.recordingStatus) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            elements.recordingStatus.textContent = `Uploading: ${percentComplete}%`;
        }
    };

    xhr.onload = function() {
        if (xhr.status === 200 && elements.recordingStatus) {
            const response = JSON.parse(xhr.responseText);
            elements.recordingStatus.textContent = 'Upload Complete!';
            
            // Add to grid without showing preview
            addToGrid(response.secure_url, 'video', 'tab-recording');
            
            // Clear status after a few seconds
            setTimeout(() => {
                if (elements.recordingStatus) {
                    elements.recordingStatus.textContent = '';
                }
            }, 3000);
        } else if (elements.recordingStatus) {
            elements.recordingStatus.textContent = 'Upload Failed';
            console.error('Upload failed:', xhr.responseText);
            
            // Clear status after a few seconds
            setTimeout(() => {
                if (elements.recordingStatus) {
                    elements.recordingStatus.textContent = '';
                }
            }, 3000);
        }
    };

    xhr.onerror = function() {
        if (elements.recordingStatus) {
            elements.recordingStatus.textContent = 'Upload Failed';
            console.error('Upload error occurred');
            
            // Clear status after a few seconds
            setTimeout(() => {
                if (elements.recordingStatus) {
                    elements.recordingStatus.textContent = '';
                }
            }, 3000);
        }
    };

    xhr.send(formData);
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