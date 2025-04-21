import React from 'react';
import { X, Check, UserPlus } from 'lucide-react';
import { JoinRequest } from '../types/room';

interface JoinRequestPopupProps {
  request: JoinRequest;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export const JoinRequestPopup: React.FC<JoinRequestPopupProps> = ({
  request,
  onApprove,
  onReject
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-slate-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4 animate-in fade-in duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-full">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">Join Request</h3>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-slate-300 mb-4">
            <span className="font-semibold text-white">{request.userName}</span> is requesting to join your meeting.
          </p>
          <p className="text-sm text-slate-400">
            Request received {new Date(request.timestamp).toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => onReject(request.id)}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
            <span>Decline</span>
          </button>
          <button
            onClick={() => onApprove(request.id)}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
          >
            <Check className="h-4 w-4" />
            <span>Approve</span>
          </button>
        </div>
      </div>
    </div>
  );
};
