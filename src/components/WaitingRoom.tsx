import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { JoinRequest } from '../types/room';

interface WaitingRoomProps {
  roomId: string;
  userName: string;
  userId: string;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ roomId, userName, userId }) => {
  const navigate = useNavigate();
  const { joinRequests, setCredentials } = useStore();
  const [status, setStatus] = useState<'waiting' | 'approved' | 'rejected'>('waiting');
  const [waitTime, setWaitTime] = useState(0);

  // Helper function to get join requests from localStorage
  const getJoinRequestsFromLocalStorage = (): JoinRequest[] => {
    const requests = localStorage.getItem('joinRequests');
    return requests ? JSON.parse(requests) : [];
  };

  // Log props on mount
  useEffect(() => {
    console.log('WaitingRoom mounted:', { roomId, userName, userId });
    console.log('Initial join requests in waiting room:', joinRequests);
    
    // Check localStorage for existing request status
    const localStorageRequests = getJoinRequestsFromLocalStorage();
    console.log('Join requests from localStorage in WaitingRoom:', localStorageRequests);
    
    const userRequest = localStorageRequests.find(req => req.id === userId);
    console.log('User request from localStorage:', userRequest);
    
    if (userRequest && userRequest.status !== 'pending') {
      setStatus(userRequest.status);
    }
  }, []);

  // Poll for status updates from localStorage
  useEffect(() => {
    console.log('Setting up polling for request status updates');
    
    const checkRequestStatus = () => {
      const localStorageRequests = getJoinRequestsFromLocalStorage();
      const userRequest = localStorageRequests.find(req => req.id === userId);
      
      console.log('Polling - User request:', userRequest);
      
      if (userRequest) {
        if (userRequest.status === 'approved' && status !== 'approved') {
          console.log('Request approved (from polling), redirecting to room');
          setStatus('approved');
          
          // Set credentials for joining the room
          const appId = localStorage.getItem('appId') || import.meta.env.VITE_AGORA_APP_ID;
          setCredentials(appId, roomId, null);
          
          // Wait a moment to show the approved message before redirecting
          setTimeout(() => {
            navigate(`/room/${roomId}`);
          }, 2000);
        } else if (userRequest.status === 'rejected' && status !== 'rejected') {
          console.log('Request rejected (from polling)');
          setStatus('rejected');
        }
      }
    };
    
    // Check immediately
    checkRequestStatus();
    
    // Then check every 2 seconds
    const interval = setInterval(checkRequestStatus, 2000);
    
    return () => clearInterval(interval);
  }, [userId, roomId, navigate, status, setCredentials]);

  // Check for request status updates from store
  useEffect(() => {
    console.log('Join requests updated in waiting room:', joinRequests);
    const userRequest = joinRequests.find(req => req.id === userId);
    console.log('User request found in store:', userRequest);
    
    if (userRequest) {
      if (userRequest.status === 'approved' && status !== 'approved') {
        console.log('Request approved (from store), redirecting to room');
        setStatus('approved');
        
        // Set credentials for joining the room
        const appId = localStorage.getItem('appId') || import.meta.env.VITE_AGORA_APP_ID;
        setCredentials(appId, roomId, null);
        
        // Wait a moment to show the approved message before redirecting
        setTimeout(() => {
          navigate(`/room/${roomId}`);
        }, 2000);
      } else if (userRequest.status === 'rejected' && status !== 'rejected') {
        console.log('Request rejected (from store)');
        setStatus('rejected');
      }
    }
  }, [joinRequests, userId, roomId, navigate, status, setCredentials]);

  // Update wait time
  useEffect(() => {
    const interval = setInterval(() => {
      setWaitTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const formatWaitTime = () => {
    const minutes = Math.floor(waitTime / 60);
    const seconds = waitTime % 60;
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex flex-col items-center text-center">
          {status === 'waiting' && (
            <>
              <div className="bg-blue-500 p-3 rounded-full mb-4">
                <Clock className="h-8 w-8 text-white animate-pulse" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Waiting for approval</h2>
              <p className="text-slate-300 mb-6">
                Your request to join this meeting as <span className="font-semibold">{userName}</span> has been sent to the host. Please wait while they review it.
              </p>
              <div className="bg-slate-700 px-4 py-2 rounded-md mb-6">
                <p className="text-sm text-slate-300">
                  Waiting time: <span className="text-white font-mono">{formatWaitTime()}</span>
                </p>
              </div>
            </>
          )}

          {status === 'approved' && (
            <>
              <div className="bg-green-500 p-3 rounded-full mb-4">
                <Check className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Request Approved!</h2>
              <p className="text-slate-300 mb-6">
                Welcome, <span className="font-semibold">{userName}</span>! You're being redirected to the meeting room...
              </p>
            </>
          )}

          {status === 'rejected' && (
            <>
              <div className="bg-red-500 p-3 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Request Declined</h2>
              <p className="text-slate-300 mb-6">
                Sorry, <span className="font-semibold">{userName}</span>. The host has declined your request to join this meeting.
              </p>
              <button
                onClick={() => navigate('/')}
                className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Return to Home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
