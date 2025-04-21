import React from 'react';
import TranscriptsTest from '../components/TranscriptsTest';
import { Link } from 'react-router-dom';

const TranscriptsTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link to="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Transcripts Table Connection Test</h1>
      <p className="mb-4 dark:text-white">
        This page allows you to test the connection to the transcripts table in your Supabase database.
        You can add new transcripts, view existing ones, and delete them to verify the functionality.
      </p>
      
      <TranscriptsTest />
    </div>
  );
};

export default TranscriptsTestPage;
