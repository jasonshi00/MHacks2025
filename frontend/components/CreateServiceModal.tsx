import React, { useState, FormEvent } from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { generateServiceEndpoints } from '../services/geminiService';
import { LoaderIcon } from './icons';
import { Component } from '../types';

interface CreateServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateServiceModal: React.FC<CreateServiceModalProps> = ({ isOpen, onClose }) => {
  const { schemas, addService } = useAppContext();
  const [serviceName, setServiceName] = useState('');
  const [source, setSource] = useState('schema');
  const [selectedSchema, setSelectedSchema] = useState(schemas[0]?.tableName || '');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        if (!serviceName.trim()) {
            throw new Error("Service name cannot be empty.");
        }

        const isAi = source === 'ai';
        const serviceData = {
            name: serviceName,
            isAiAgent: isAi,
            schemaTableName: isAi ? undefined : selectedSchema,
        };
        
        const basePath = '/' + serviceName.trim().toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^a-z0-9-]/g, ''); // Remove invalid chars

        const rootComponent = {
            route: basePath,
            method: 'GET' as const,
        };
        
        let childComponents: Omit<Component, 'componentId' | 'serviceId' | 'children'>[] = [];

        if (isAi) {
            if (!aiPrompt) {
              throw new Error("AI prompt cannot be empty.");
            }
            const generatedEndpoints = await generateServiceEndpoints(aiPrompt);
            childComponents = generatedEndpoints.map(comp => ({
                ...comp,
                route: `${basePath}${comp.route.startsWith('/') ? comp.route : `/${comp.route}`}`
            }));
        }
        
        addService(serviceData, rootComponent, childComponents);
        
        // Reset form and close modal
        setServiceName('');
        setSource('schema');
        setAiPrompt('');
        setSelectedSchema(schemas[0]?.tableName || '');
        onClose();

    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg p-8 border border-gray-700">
        <h2 className="text-2xl font-bold mb-6">Create New Service</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="serviceName" className="block text-sm font-medium text-gray-400 mb-2">Service Name</label>
            <input type="text" id="serviceName" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-400 mb-2">Service Source</label>
            <div className="flex space-x-4">
                <button type="button" onClick={() => setSource('schema')} className={`w-full py-2 rounded-md ${source === 'schema' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>From Schema</button>
                <button type="button" onClick={() => setSource('ai')} className={`w-full py-2 rounded-md ${source === 'ai' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>AI Agent</button>
            </div>
          </div>
          
          {source === 'schema' ? (
            <div className="mb-4">
              <label htmlFor="schema" className="block text-sm font-medium text-gray-400 mb-2">Database Schema</label>
              <select id="schema" value={selectedSchema} onChange={(e) => setSelectedSchema(e.target.value)} required className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                {schemas.map(s => <option key={s.tableName} value={s.tableName}>{s.tableName}</option>)}
              </select>
            </div>
          ) : (
            <div className="mb-4">
              <label htmlFor="aiPrompt" className="block text-sm font-medium text-gray-400 mb-2">AI Prompt</label>
              <textarea id="aiPrompt" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} required rows={4} placeholder="e.g., 'a user management API with endpoints for create, read, update, and delete.'" className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 flex items-center">
              {isLoading && <LoaderIcon className="w-5 h-5 mr-2" />}
              {isLoading ? 'Creating...' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateServiceModal;