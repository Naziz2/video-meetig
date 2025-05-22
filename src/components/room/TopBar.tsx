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
    <div className="fixed top-0 left-0 right-0 bg-secondary-100 dark:bg-secondary-800/95 backdrop-blur-sm text-secondary-900 dark:text-white p-4 flex items-center justify-between z-10 border-b border-secondary-200 dark:border-secondary-700">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <img 
            src={vividLogo} 
            alt="App Logo" 
            className="h-8 mr-3" 
          />
          <h1 className="text-lg font-semibold text-secondary-900 dark:text-white">Meeting: {roomId}</h1>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <select
          value={selectedLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-secondary-200 dark:bg-secondary-700 text-secondary-900 dark:text-white rounded-lg px-3 py-1.5 text-sm border border-secondary-300 dark:border-secondary-600 focus:ring-2 focus:ring-wolt-blue focus:border-transparent"
        >
          {languageOptions.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
        <button
          onClick={onShareClick}
          className="flex items-center space-x-2 px-4 py-2 bg-wolt-blue rounded-xl hover:bg-wolt-blue-dark"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
        <button
          onClick={onParticipantsToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-wolt-blue rounded-xl hover:bg-wolt-blue-dark"
        >
          <Users className="w-4 h-4" />
          <span>{participantsCount}</span>
        </button>
        <button
          onClick={onChatToggle}
          className="flex items-center space-x-2 px-4 py-2 bg-wolt-blue rounded-xl hover:bg-wolt-blue-dark"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
