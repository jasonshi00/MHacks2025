import React, { useState } from 'react';
import type { DbCredentials } from '../types';

interface ProjectCreationProps {
  onCreateProject: (name: string, dbCredentials: DbCredentials) => void;
}

const ProjectCreation: React.FC<ProjectCreationProps> = ({ onCreateProject }) => {
  const [projectName, setProjectName] = useState('My API Project');
  const [creds, setCreds] = useState<DbCredentials>({
    host: 'localhost',
    port: '5432',
    user: 'postgres',
    pass: '',
    db: 'mydb'
  });

  const handleCredChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreds({ ...creds, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim() && Object.values(creds).every(val => val.trim())) {
      onCreateProject(projectName, creds);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-10 bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
        <h1 className="text-2xl font-bold text-gray-800 text-center">WORKFLOW APP</h1>
        <p className="text-gray-500 text-center mb-8">Create a New Project Workflow</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
              placeholder="My Awesome API"
            />
          </div>
          
          <div className="border-t border-gray-200 pt-4 space-y-4">
             <h3 className="text-lg font-semibold text-gray-700 text-center">PostgreSQL Credentials</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Host</label>
                    <input type="text" name="host" value={creds.host} onChange={handleCredChange} className="mt-1 block w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Port</label>
                    <input type="text" name="port" value={creds.port} onChange={handleCredChange} className="mt-1 block w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <input type="text" name="user" value={creds.user} onChange={handleCredChange} className="mt-1 block w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="pass" value={creds.pass} onChange={handleCredChange} className="mt-1 block w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Database</label>
                <input type="text" name="db" value={creds.db} onChange={handleCredChange} className="mt-1 block w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500" />
             </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreation;