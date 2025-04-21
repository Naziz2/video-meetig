import React from 'react';
import SupabaseTest from '../components/SupabaseTest';
import { Link } from 'react-router-dom';

const SupabaseTestPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Link to="/" className="text-blue-500 hover:underline">
          ← Back to Home
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Supabase Database Connection Test</h1>
      <p className="mb-4">
        This page tests the connection to all tables in your Supabase database. 
        Click the button below to run the test and see the results.
      </p>
      
      <SupabaseTest />
    </div>
  );
};

export default SupabaseTestPage;
