import React, { useState, useEffect } from 'react';
import type { Project, Service, Endpoint } from '../types';
import { View } from '../types';
import { NAV_ITEMS } from '../constants';
import HomeView from './HomeView';
import EndpointsView from './EndpointsView';
import TreeView from './TreeView';
import TestView from './TestView';
import { generateFlaskCode } from '../utils/codeGenerator';

interface MainEditorProps {
  project: Project;
}

const MainEditor: React.FC<MainEditorProps> = ({ project: initialProject }) => {
  const [activeView, setActiveView] = useState<View>(View.HOME);
  const [services, setServices] = useState<Service[]>(initialProject.services);
  const [endpoints, setEndpoints] = useState<Endpoint[]>(initialProject.endpoints);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [editingEndpoint, setEditingEndpoint] = useState<Endpoint | null>(null);
  const [initialBasePath, setInitialBasePath] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  
  useEffect(() => {
    const generateCode = async () => {
      if (editingEndpoint) {
        setIsGeneratingCode(true);
        try {
          const code = await generateFlaskCode(editingEndpoint, services);
          setActiveCode(code);
        } catch (error) {
          console.error("Failed to generate code:", error);
          setActiveCode(`# Code generation failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          setIsGeneratingCode(false);
        }
      } else {
        setActiveCode(null);
      }
    };
    generateCode();
  }, [editingEndpoint, services]);

  useEffect(() => {
    setDbStatus('connecting');
    const timer = setTimeout(() => {
      if (initialProject.dbCredentials.pass.toLowerCase() === 'fail') {
        setDbStatus('failed');
      } else {
        setDbStatus('connected');
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [initialProject.dbCredentials]);

  const handleRemoveEndpoint = (id: string) => {
    setEndpoints(endpoints.filter(ep => ep.id !== id));
    if (editingEndpoint?.id === id) {
      setEditingEndpoint(null);
    }
  };

  const handleStartEdit = (endpoint: Endpoint) => {
    setInitialBasePath(null);
    setEditingEndpoint(endpoint);
    setActiveView(View.ENDPOINTS);
  };

  const handleStartEditPath = (path: string) => {
    setEditingEndpoint(null);
    setInitialBasePath(path);
    setActiveView(View.ENDPOINTS);
  };

  const handleEndpointCreated = (newEndpoint: Endpoint) => {
    setEndpoints(prevEndpoints => [...prevEndpoints, newEndpoint]);
    setEditingEndpoint(newEndpoint);
  };

  const handleUpdateEndpoint = (updatedEndpoint: Endpoint) => {
    setEndpoints(endpoints.map(ep => ep.id === updatedEndpoint.id ? updatedEndpoint : ep));
    setEditingEndpoint(updatedEndpoint); // Keep it in edit mode
  };
  
  const handleCancelEdit = () => {
    setEditingEndpoint(null);
  };


  const renderView = () => {
    switch (activeView) {
      case View.HOME:
        return <HomeView services={services} setServices={setServices} />;
      case View.ENDPOINTS:
        return (
          <EndpointsView 
            services={services}
            editingEndpoint={editingEndpoint}
            onEndpointCreated={handleEndpointCreated}
            onUpdateEndpoint={handleUpdateEndpoint}
            onCancelEdit={handleCancelEdit}
            initialBasePath={initialBasePath}
            generatedCode={activeCode}
            isGeneratingCode={isGeneratingCode}
          />
        );
      case View.TREE:
        return (
          <TreeView 
            endpoints={endpoints} 
            services={services} 
            onRemoveEndpoint={handleRemoveEndpoint} 
            onEditEndpoint={handleStartEdit}
            onEditPath={handleStartEditPath}
          />
        );
      case View.TEST:
        return <TestView code={activeCode} endpoint={editingEndpoint} isGeneratingCode={isGeneratingCode} />;
      default:
        return <HomeView services={services} setServices={setServices} />;
    }
  };
  
  const statusIndicator = {
    connecting: { text: 'Connecting...', color: 'bg-gray-400', textColor: 'text-gray-600' },
    connected: { text: 'Connected', color: 'bg-green-500', textColor: 'text-green-700' },
    failed: { text: 'Connection Failed', color: 'bg-red-500', textColor: 'text-red-700' },
  };

  return (
    <div 
      className="min-h-screen p-4 sm:p-6 lg:p-8"
      style={{
        backgroundColor: '#F7F8FC',
        backgroundImage: 'radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)',
        backgroundSize: '2rem 2rem',
      }}
    >
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-800 uppercase">
            Project: {initialProject.name}
          </h1>
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
            <div className={`w-3 h-3 rounded-full ${statusIndicator[dbStatus].color} animate-pulse`} />
            <span className={`text-sm font-semibold ${statusIndicator[dbStatus].textColor}`}>
                {statusIndicator[dbStatus].text}
            </span>
          </div>
        </div>

        <nav className="bg-white p-1.5 rounded-lg shadow-md mt-4 sm:mt-0">
          <ul className="flex items-center space-x-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => {
                    if (item.id !== View.ENDPOINTS && item.id !== View.TEST) {
                      handleCancelEdit();
                      setInitialBasePath(null);
                    }
                    setActiveView(item.id);
                  }}
                  className={`px-6 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${
                    activeView === item.id
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-gray-600 hover:bg-indigo-100'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main>
        {renderView()}
      </main>
    </div>
  );
};

export default MainEditor;