import React from 'react';
import type { Service } from '../types';
import { SCHEMA_OPTIONS } from '../constants';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface HomeViewProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
}

const HomeView: React.FC<HomeViewProps> = ({ services, setServices }) => {
  const addService = () => {
    const newService: Service = {
      id: `service-${Date.now()}`,
      name: '',
      schema: SCHEMA_OPTIONS[0],
      aiDescription: '',
    };
    setServices([...services, newService]);
  };

  const updateService = (id: string, field: keyof Service, value: string) => {
    setServices(
      services.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const removeService = (id: string) => {
    setServices(services.filter((service) => service.id !== id));
  };

  return (
    <div className="flex justify-center">
        <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Services</h2>
                <button
                    onClick={addService}
                    className="flex items-center justify-center w-10 h-10 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-transform transform hover:scale-110 shadow"
                    aria-label="Add Service"
                >
                    <PlusIcon />
                </button>
            </div>
            <div className="space-y-4">
                {services.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No services defined. Click '+' to add one.</p>
                ) : (
                    services.map((service) => (
                        <div key={service.id} className="flex flex-col gap-3 p-4 border border-gray-200 rounded-lg">
                            <div className="grid grid-cols-[1fr,1fr,auto] gap-4 items-center">
                                <input
                                    type="text"
                                    placeholder="Service Name"
                                    value={service.name}
                                    onChange={(e) => updateService(service.id, 'name', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                <select
                                    value={service.schema}
                                    onChange={(e) => updateService(service.id, 'schema', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    {SCHEMA_OPTIONS.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={() => removeService(service.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
                                    aria-label="Delete service"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                            {service.schema === 'Use AI Agent' && (
                                <textarea
                                    placeholder="Describe what this AI-powered service should do..."
                                    value={service.aiDescription || ''}
                                    onChange={(e) => updateService(service.id, 'aiDescription', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={3}
                                />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};

export default HomeView;