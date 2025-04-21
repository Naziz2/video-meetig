import { supabase, isSupabaseConfigured } from '../lib/supabase';

// List of all tables in the database
const tables = [
  'profiles',
  'meetings',
  'recordings',
  'avatars',
  'transcripts',
  'speech_messages',
  'messages'
];

/**
 * Tests connection to Supabase and all tables
 * @returns Object with test results
 */
export const testSupabaseConnection = async () => {
  const results: Record<string, any> = {
    isConfigured: isSupabaseConfigured(),
    connectionTest: false,
    tableTests: {}
  };

  // Test basic connection
  try {
    // Removed 'data' from destructuring since it's not used
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    
    if (error) {
      results.connectionTest = {
        success: false,
        error: error.message
      };
    } else {
      results.connectionTest = {
        success: true,
        message: 'Successfully connected to Supabase'
      };
    }
  } catch (error: any) {
    results.connectionTest = {
      success: false,
      error: error.message || 'Unknown error occurred'
    };
  }

  // Test each table
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        results.tableTests[table] = {
          success: false,
          error: error.message
        };
      } else {
        results.tableTests[table] = {
          success: true,
          message: `Successfully connected to ${table} table`,
          count: data
        };
      }
    } catch (error: any) {
      results.tableTests[table] = {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  return results;
};

/**
 * Formats the test results into a readable string
 * @param results The test results from testSupabaseConnection
 * @returns Formatted string with test results
 */
export const formatTestResults = (results: Record<string, any>): string => {
  let output = '=== Supabase Connection Test Results ===\n\n';
  
  // Configuration status
  output += `Configuration Status: ${results.isConfigured ? '✅ Properly configured' : '❌ Not properly configured'}\n\n`;
  
  // Connection test
  if (results.connectionTest.success) {
    output += `Connection Test: ✅ ${results.connectionTest.message}\n\n`;
  } else {
    output += `Connection Test: ❌ Failed - ${results.connectionTest.error}\n\n`;
  }
  
  // Table tests
  output += '=== Table Connection Tests ===\n\n';
  
  for (const [table, result] of Object.entries(results.tableTests)) {
    const testResult = result as { success: boolean; message?: string; error?: string; count?: any };
    
    if (testResult.success) {
      output += `${table}: ✅ ${testResult.message}\n`;
    } else {
      output += `${table}: ❌ Failed - ${testResult.error}\n`;
    }
  }
  
  return output;
};
