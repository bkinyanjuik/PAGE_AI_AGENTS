import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/Dashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize websocket connection and data fetching
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="space-y-8">
        <header>
          <h1 className="text-4xl font-bold gradient-text">Agent Control Center</h1>
          <p className="text-gray-400 mt-2">Monitoring and managing AI agents in real-time</p>
        </header>
        
        <Dashboard />
      </div>
    </Layout>
  );
}

export default App;
