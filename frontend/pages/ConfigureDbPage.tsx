
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { connectAndFetchSchemas } from '../services/dbService';
import { DatabaseIcon, LoaderIcon } from '../components/icons';

const ConfigureDbPage: React.FC = () => {
    const [dbName, setDbName] = useState('mydatabase');
    const [username, setUsername] = useState('user');
    const [password, setPassword] = useState('password');
    const [host, setHost] = useState('localhost');
    const [port, setPort] = useState('5432');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setDbConfig } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const config = { dbName, username, password, host, port };
            const schemas = await connectAndFetchSchemas(config);
            setDbConfig(config, schemas);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to connect to the database. Please check the details and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "appearance-none relative block w-full px-3 py-2 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm";

    return (
        <div className="flex items-center justify-center py-12">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-2xl">
                <div className="text-center">
                    <DatabaseIcon className="w-16 h-16 mx-auto text-blue-500" />
                    <h1 className="mt-4 text-3xl font-extrabold text-white">Configure Your Database</h1>
                    <p className="mt-2 text-sm text-gray-400">Connect to your PostgreSQL database to get started.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="dbName" className="sr-only">Database Name</label>
                            <input id="dbName" name="dbName" type="text" required className={`${inputClass} rounded-t-md`} placeholder="Database Name" value={dbName} onChange={(e) => setDbName(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input id="username" name="username" type="text" required className={inputClass} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </div>
                        <div>
                            <label htmlFor="password"className="sr-only">Password</label>
                            <input id="password" name="password" type="password" required className={inputClass} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="flex space-x-4">
                            <div className="w-2/3">
                               <label htmlFor="host" className="sr-only">Host</label>
                               <input id="host" name="host" type="text" required className={`${inputClass} rounded-bl-md`} placeholder="Host" value={host} onChange={(e) => setHost(e.target.value)} />
                            </div>
                            <div className="w-1/3">
                                <label htmlFor="port" className="sr-only">Port</label>
                                <input id="port" name="port" type="text" required className={`${inputClass} rounded-br-md`} placeholder="Port" value={port} onChange={(e) => setPort(e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <LoaderIcon className="w-5 h-5 mr-2" />
                                    Connecting...
                                </>
                            ) : "Connect & Fetch Schemas"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ConfigureDbPage;