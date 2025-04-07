import React, { useState } from 'react';
import { runDatabaseMigration } from '../../utils/databaseMigration';

/**
 * Admin page for migrating the database to the standardized schema
 */
const DatabaseMigration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  // Add a log message
  const addLog = (message, isError = false) => {
    setLogs(prevLogs => [...prevLogs, { message, isError, timestamp: new Date().toISOString() }]);
  };

  // Run the migration
  const handleMigration = async () => {
    if (isLoading) return;

    // Confirm before proceeding
    const confirmed = window.confirm(
      "WARNING: This will migrate all data to the new standardized schema. " +
      "This process cannot be undone. Are you sure you want to proceed?"
    );

    if (!confirmed) return;

    setIsLoading(true);
    setResult(null);
    setLogs([]);
    addLog("Starting database migration...");

    try {
      // Override console.log and console.error to capture logs
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      console.log = (...args) => {
        originalConsoleLog(...args);
        addLog(args.join(' '));
      };

      console.error = (...args) => {
        originalConsoleError(...args);
        addLog(args.join(' '), true);
      };

      // Run the migration
      const migrationResult = await runDatabaseMigration();
      setResult(migrationResult);

      // Restore console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      addLog(migrationResult.success 
        ? "Migration completed successfully!" 
        : `Migration failed: ${migrationResult.message}`
      );
    } catch (error) {
      setResult({ success: false, message: error.message });
      addLog(`Migration error: ${error.message}`, true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Database Migration</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Standardize Database Schema</h2>
        
        <p className="mb-4">
          This tool will migrate all data to the standardized schema defined in the documentation.
          The migration will:
        </p>
        
        <ul className="list-disc pl-6 mb-6 space-y-2">
          <li>Convert all database paths to use the standardized structure</li>
          <li>Standardize field names (using English naming conventions)</li>
          <li>Ensure consistent data formats across all collections</li>
          <li>Maintain all existing relationships between entities</li>
        </ul>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> This process cannot be undone. Make sure you have a backup of your data before proceeding.
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleMigration}
          disabled={isLoading}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Migrating...' : 'Start Migration'}
        </button>
      </div>
      
      {/* Results section */}
      {result && (
        <div className={`bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 ${
          result.success ? 'border-green-500' : 'border-red-500'
        }`}>
          <h2 className="text-xl font-semibold mb-4">Migration Result</h2>
          <p className={result.success ? 'text-green-600' : 'text-red-600'}>
            {result.message}
          </p>
        </div>
      )}
      
      {/* Logs section */}
      {logs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Migration Logs</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
            {logs.map((log, index) => (
              <div key={index} className={`mb-1 ${log.isError ? 'text-red-400' : 'text-green-300'}`}>
                <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseMigration;
