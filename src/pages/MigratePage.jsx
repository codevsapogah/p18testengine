import React, { useState } from 'react';
import { migrateCalculatedResults, testMigrateSingle } from '../utils/migrateCalculatedResults';
import { fixQuizData } from '../utils/fixQuizData';
import { debugProgramData } from '../utils/debugProgramData';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const MigratePage = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [testId, setTestId] = useState('');
  const [testResults, setTestResults] = useState(null);
  const [testError, setTestError] = useState(null);
  const [fixResults, setFixResults] = useState(null);
  const [fixError, setFixError] = useState(null);
  const [debugResults, setDebugResults] = useState(null);
  const [debugError, setDebugError] = useState(null);

  const handleMigrate = async () => {
    if (running) return;
    
    setRunning(true);
    setResults(null);
    setError(null);
    
    try {
      const migrationResults = await migrateCalculatedResults();
      setResults(migrationResults);
      setRunning(false);
    } catch (err) {
      setError(err.message || 'Migration failed');
      setRunning(false);
    }
  };

  const handleTestSingle = async (e) => {
    e.preventDefault();
    if (!testId.trim() || running) return;
    
    setRunning(true);
    setTestResults(null);
    setTestError(null);
    
    try {
      const singleResult = await testMigrateSingle(testId.trim());
      setTestResults(singleResult);
      setRunning(false);
    } catch (err) {
      setTestError(err.message || 'Test failed');
      setRunning(false);
    }
  };
  
  const handleFixData = async () => {
    if (running) return;
    
    setRunning(true);
    setFixResults(null);
    setFixError(null);
    
    try {
      const fixedResults = await fixQuizData();
      setFixResults(fixedResults);
      setRunning(false);
    } catch (err) {
      setFixError(err.message || 'Data repair failed');
      setRunning(false);
    }
  };
  
  const handleDebugData = () => {
    if (running) return;
    
    setRunning(true);
    setDebugResults(null);
    setDebugError(null);
    
    try {
      const debug = debugProgramData();
      setDebugResults(debug);
      setRunning(false);
      
      if (!debug.success) {
        setDebugError(debug.error);
      }
    } catch (err) {
      setDebugError(err.message || 'Debug failed');
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-10">
        {/* Debug Data Section */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-6">
          <h1 className="text-2xl font-bold mb-4">Data Diagnostics</h1>
          <p className="mb-4 text-gray-700">
            Check program data structure to identify root causes of calculation failures.
            This is the first step in troubleshooting migration issues.
          </p>
          
          <button
            onClick={handleDebugData}
            disabled={running}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              running ? 'bg-gray-500' : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {running ? 'Checking Data...' : 'Debug Program Data'}
          </button>

          {debugError && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
              {debugError}
            </div>
          )}

          {debugResults && (
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-lg">Program Data Structure:</h3>
              
              {!debugResults.usingRealData && (
                <div className="mb-3 p-2 bg-amber-100 border-l-4 border-amber-500 text-amber-700">
                  ⚠️ <span className="font-medium">Using fallback program data</span> - 
                  Your real program data appears to be missing or invalid. Calculations will use fallback data.
                </div>
              )}
              
              {!debugResults.usingRealQuestions && (
                <div className="mb-3 p-2 bg-amber-100 border-l-4 border-amber-500 text-amber-700">
                  ⚠️ <span className="font-medium">Using fallback questions data</span> - 
                  Your real questions data appears to be missing or invalid. Calculations will use fallback questions.
                </div>
              )}
              
              {debugResults.success ? (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <p className="font-medium text-green-700 mb-2">✅ Program data structure is valid</p>
                  <div className="space-y-1 text-sm">
                    <p>Total programs: {debugResults.summary.totalPrograms}</p>
                    <p>Total questions: {debugResults.summary.totalQuestions}</p>
                    <p>Invalid programs: {debugResults.summary.invalidPrograms}</p>
                  </div>
                  
                  {debugResults.invalidPrograms && (
                    <div className="mt-3">
                      <p className="font-medium text-amber-700">⚠️ Some programs have issues:</p>
                      <ul className="list-disc pl-5 text-sm mt-1 text-amber-700">
                        {debugResults.invalidPrograms.map((prog, idx) => (
                          <li key={idx}>
                            Program {prog.id || 'unknown'}: {prog.issues.join(', ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                  <p className="font-medium text-red-700 mb-2">❌ Program data structure is invalid</p>
                  <p className="text-red-700">{debugResults.error}</p>
                  
                  {debugResults.details && (
                    <div className="mt-3 p-2 bg-red-100 rounded overflow-auto max-h-40 text-xs font-mono">
                      {JSON.stringify(debugResults.details, null, 2)}
                    </div>
                  )}
                  
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="font-medium text-amber-700">Potential solution:</p>
                    <p className="text-sm mt-1">
                      Check your data files in the src/data directory - make sure programData.js and questions.js
                      are properly formatted and exporting the correct data.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Repair Data Section */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-6">
          <h1 className="text-2xl font-bold mb-4">Data Repair Utility</h1>
          <p className="mb-4 text-gray-700">
            This utility fixes common problems with quiz result data structures before migration.
            Run this first if your migration is failing.
          </p>
          
          <button
            onClick={handleFixData}
            disabled={running}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              running ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {running ? 'Repairing Data...' : 'Fix Quiz Data'}
          </button>

          {fixError && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
              {fixError}
            </div>
          )}

          {fixResults && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Repair Results:</h3>
              <ul className="space-y-1">
                <li className="text-green-600">Fixed entries: {fixResults.fixedCount}</li>
                <li className="text-blue-600">Skipped entries: {fixResults.skipCount}</li>
                <li className="text-red-600">Failed entries: {fixResults.errorCount}</li>
              </ul>
              
              <div className="mt-3 text-sm text-gray-600">
                {fixResults.fixedCount > 0 ? (
                  <p>Successfully repaired some entries. Now try running the migration.</p>
                ) : (
                  <p>No entries needed repair. If migration is still failing, try the test tool below.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Migration Section */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto mb-6">
          <h1 className="text-2xl font-bold mb-6">Migration Utility</h1>
          <p className="mb-4 text-gray-700">
            This utility will migrate existing quiz results to include pre-calculated results.
            This will improve performance for users viewing their results.
          </p>
          
          <button
            onClick={handleMigrate}
            disabled={running}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              running ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {running ? 'Running Migration...' : 'Run Migration'}
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}

          {results && (
            <div className="mt-6">
              <h2 className="text-xl font-medium mb-2">Migration Results</h2>
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p>Successfully updated: <span className="font-medium text-green-600">{results.successCount}</span></p>
                <p>Failed updates: <span className="font-medium text-red-600">{results.errorCount}</span></p>
              </div>
              
              {results.errorDetails && results.errorDetails.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Error Details:</h3>
                  <div className="bg-red-50 p-3 rounded-md border border-red-200 max-h-60 overflow-y-auto">
                    <ul className="list-disc pl-5 space-y-1">
                      {results.errorDetails.map((err, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">ID {err.id}:</span> {err.reason}
                        </li>
                      ))}
                    </ul>
                    {results.errorCount > results.errorDetails.length && (
                      <p className="mt-2 text-sm text-gray-600 italic">
                        ...and {results.errorCount - results.errorDetails.length} more errors
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="text-md font-medium mb-1">Debugging Steps:</h3>
                <ol className="list-decimal pl-5 text-sm space-y-1">
                  <li>Check your browser console for detailed error logs</li>
                  <li>Try repairing the data using the tool above</li>
                  <li>Test single quiz entries using the tool below</li>
                </ol>
              </div>
            </div>
          )}
        </div>
        
        {/* Single Quiz Test Section */}
        <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-4">Test Single Quiz</h2>
          <p className="mb-4 text-gray-700">
            Test calculation on a single quiz result to diagnose issues.
            Enter a quiz ID from your database.
          </p>
          
          <form onSubmit={handleTestSingle} className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                placeholder="Enter quiz ID"
                className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={running}
              />
              <button
                type="submit"
                disabled={running || !testId.trim()}
                className={`px-4 py-2 rounded-lg text-white font-medium ${
                  running || !testId.trim() ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                Test
              </button>
            </div>
          </form>
          
          {testError && (
            <div className="p-3 bg-red-100 text-red-800 rounded-md mb-4">
              {testError}
            </div>
          )}
          
          {testResults && (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="font-medium mb-2">
                Test Results for ID: <span className="text-blue-600">{testResults.id}</span>
              </div>
              
              {testResults.success ? (
                <div className="text-green-700">
                  <p className="mb-2">✅ Calculation successful!</p>
                  <p>Programs calculated: {testResults.programCount}</p>
                  <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                    {JSON.stringify(testResults.calculatedResults, null, 2).substring(0, 200)}...
                  </div>
                </div>
              ) : (
                <div className="text-red-700">
                  <p className="mb-2">❌ Calculation failed!</p>
                  <p>Error: {testResults.error}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MigratePage; 