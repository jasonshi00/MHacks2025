
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import CreateServiceModal from '../components/CreateServiceModal';
import { PlusIcon, AiIcon, DatabaseIcon, ChevronRightIcon } from '../components/icons';
import { Service } from '../types';

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
    const { components } = useAppContext();
    const rootComponent = components.get(service.parentComponentId);
    const endpointCount = rootComponent ? rootComponent.children.length : 0;

    return (
        <Link to={`/service/${service.serviceId}`} className="block bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-700/50 transition-all duration-300 group">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    {service.isAiAgent ? <AiIcon className="w-8 h-8 text-blue-400" /> : <DatabaseIcon className="w-8 h-8 text-green-400" />}
                    <div>
                        <h3 className="text-xl font-bold text-white">{service.name}</h3>
                        <p className="text-sm text-gray-400">
                            {service.isAiAgent ? "AI Generated" : `Schema: ${service.schemaTableName}`}
                        </p>
                    </div>
                </div>
                <ChevronRightIcon className="w-6 h-6 text-gray-500 group-hover:text-white transition-colors" />
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
                 <p className="text-sm text-gray-400">{endpointCount} {endpointCount === 1 ? 'endpoint' : 'endpoints'}</p>
            </div>
        </Link>
    );
};


const HomePage: React.FC = () => {
    const { services } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Services Dashboard</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Create Service
                </button>
            </div>

            {services.length === 0 ? (
                <div className="text-center py-16 px-6 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                    <h2 className="text-2xl font-semibold text-white">No Services Yet</h2>
                    <p className="mt-2 text-gray-400">Click on "Create Service" to begin building your first API workflow.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map(service => (
                       <ServiceCard key={service.serviceId} service={service} />
                    ))}
                </div>
            )}
            
            <CreateServiceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default HomePage;