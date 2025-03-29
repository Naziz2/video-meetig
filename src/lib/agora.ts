import AgoraRTC from 'agora-rtc-sdk-ng';

// Your Agora app configuration
export const appId = import.meta.env.VITE_AGORA_APP_ID || '';

// Initialize the Agora client
export const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

// Function to get Agora token from your token server
export const getAgoraToken = async (channelName: string, userName: string, sessionId: string): Promise<string> => {
  // For testing: return the hardcoded token
  return "0060146cc8be73b4b24b20485c2131e2f12IADCLCH4QjWc95DVo70vf95oUTL6sIoyixA5Jp5t5g4PXgx+f9gO+bz6IgBpY9Itfq/kZwQAAQAObONnAgAObONnAwAObONnBAAObONn";
  
  try {
    const response = await fetch(`http://localhost:3001/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channelName,
        userName,
        sessionId
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to get Agora token');
    }
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('Error getting Agora token:', error);
    throw error;
  }
};
