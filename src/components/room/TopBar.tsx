import React from 'react';
import { Share2, Users, MessageSquare } from 'lucide-react';
// Import the logo using Vite's asset handling
import vividLogo from '../../assets/images/logo.png';

interface TopBarProps {
  roomId: string | undefined;
  selectedLanguage: string;
  languageOptions: { code: string; name: string }[];
  participantsCount: number;
  onLanguageChange: (language: string) => void;
  onShareClick: () => void;
  onParticipantsToggle: () => void;
  onChatToggle: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  roomId,
  selectedLanguage,
  languageOptions,
  participantsCount,
  onLanguageChange,
  onShareClick,
  onParticipantsToggle,
  onChatToggle
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm text-white p-4 flex items-center justify-between z-10 border-b border-slate-700">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <img 
            src={vividLogo} 
            alt="App Logo" 
            className="h-8 mr-3" 
          />
          <h1 className="text-lg font-semibold text-slate-100">Meeting: {roomId}</h1>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-slate-700 text-white rounded-lg px-3 py-1.5 text-sm border border-slate-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          {languageOptions.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <button
          onClick={onShareClick}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
        <button
          onClick={onParticipantsToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700"
        >
          <Users className="w-4 h-4" />
          <span>{participantsCount}</span>
        </button>
        <button
          onClick={onChatToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
