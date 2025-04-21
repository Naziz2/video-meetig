import React, { useState } from 'react';
import { testSupabaseConnection, formatTestResults } from '../utils/supabaseTest';
import { isSupabaseConfigured } from '../lib/supabase';

const SupabaseTest: React.FC = () => {
  const [results, setResults] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isSupabaseConfigured()) {
        setError('Supabase is not properly configured. Please check your environment variables.');
        setLoading(false);
        return;
      }
      
      const testResults = await testSupabaseConnection();
      setResults(formatTestResults(testResults));
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      
      <button
        onClick={runTest}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {loading ? 'Testing...' : 'Test Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <p className="font-bold">Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      {results && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Test Results:</h3>
          <pre className="p-3 bg-gray-100 rounded whitespace-pre-wrap overflow-auto max-h-96">
            {results}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
