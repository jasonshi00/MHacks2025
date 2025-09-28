import React, { useState, useMemo, useEffect } from 'react';
import { HTTP_METHODS } from '../constants';
import { HttpMethod, type Parameter, type Endpoint, type Service } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import CodeDisplay from './CodeDisplay';

interface EndpointsViewProps {
    services: Service[];
    editingEndpoint: Endpoint | null;
    onEndpointCreated: (endpoint: Endpoint) => void;
    onUpdateEndpoint: (endpoint: Endpoint) => void;
    onCancelEdit: () => void;
    initialBasePath: string | null;
    generatedCode: string | null;
    isGeneratingCode: boolean;
}

interface ParamInputGroupProps {
    params: Parameter[];
    title: string;
    type: 'query' | 'body';
    onAddParam: (type: 'query' | 'body') => void;
    onUpdateParam: (id: string, field: keyof Parameter, value: string | boolean, type: 'query' | 'body') => void;
    onRemoveParam: (id: string, type: 'query' | 'body') => void;
}

const ParamInputGroup: React.FC<ParamInputGroupProps> = ({
    params,
    title,
    type,
    onAddParam,
    onUpdateParam,
    onRemoveParam,
}) => (
    <div className="space-y-3">
        <div className="flex items-center">
            <h4 className="font-semibold text-gray-700">{title}</h4>
            <button onClick={() => onAddParam(type)} className="ml-2 p-1 bg-indigo-200 text-indigo-700 rounded-full hover:bg-indigo-300">
                <PlusIcon className="w-4 h-4" />
            </button>
        </div>
        {params.map(param => (
            <div key={param.id} className="grid grid-cols-[1fr,1fr,auto,auto] gap-2 items-center">
                <input type="text" placeholder="Name" value={param.name} onChange={e => onUpdateParam(param.id, 'name', e.target.value, type)} className="flex-1 px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                <input type="text" placeholder="Constraints?" value={param.constraints} onChange={e => onUpdateParam(param.id, 'constraints', e.target.value, type)} className="flex-1 px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500" />
                
                {type === 'query' ? (
                     <label className="flex items-center space-x-1 text-sm text-gray-600 justify-self-center px-2">
                        <input 
                            type="checkbox"
                            checked={param.optional}
                            onChange={(e) => onUpdateParam(param.id, 'optional', e.target.checked, type)}
                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                        />
                        <span>Optional</span>
                    </label>
                ) : <div />}

                <button onClick={() => onRemoveParam(param.id, type)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full">
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </div>
        ))}
    </div>
);


const EndpointsView: React.FC<EndpointsViewProps> = ({ services, editingEndpoint, onEndpointCreated, onUpdateEndpoint, onCancelEdit, initialBasePath, generatedCode, isGeneratingCode }) => {
    const [selectedMethod, setSelectedMethod] = useState<HttpMethod | null>(null);
    const [basePath, setBasePath] = useState('/api/v1/');
    const [description, setDescription] = useState('');
    const [queryParams, setQueryParams] = useState<Parameter[]>([]);
    const [bodyParams, setBodyParams] = useState<Parameter[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    
    const isEditing = editingEndpoint !== null;

    useEffect(() => {
        if (editingEndpoint) {
            setSelectedMethod(editingEndpoint.method);
            setDescription(editingEndpoint.description || '');
            setQueryParams(editingEndpoint.queryParams);
            setBodyParams(editingEndpoint.bodyParams);
            setSelectedServiceId(editingEndpoint.serviceId || '');
            
            const paramParts = editingEndpoint.queryParams
                .filter(p => p.name.trim() !== '')
                .map(p => `/:${p.name.trim()}${p.optional ? '?' : ''}`)
                .join('');
                
            const extractedBasePath = paramParts && editingEndpoint.path.endsWith(paramParts)
                ? editingEndpoint.path.substring(0, editingEndpoint.path.length - paramParts.length)
                : editingEndpoint.path;
            setBasePath(extractedBasePath);
        } else {
            resetFormState(initialBasePath || undefined);
        }
    }, [editingEndpoint, initialBasePath]);

    const generatedPath = useMemo(() => {
        const queryPart = queryParams
            .filter(p => p.name.trim() !== '')
            .map(p => `/:${p.name.trim()}${p.optional ? '?' : ''}`)
            .join('');
        const cleanedBasePath = basePath.endsWith('/') && queryPart ? basePath.slice(0, -1) : basePath;
        return `${cleanedBasePath}${queryPart}`;
    }, [basePath, queryParams]);
    
    const resetFormState = (path = '/api/v1/') => {
        setSelectedMethod(null);
        setBasePath(path);
        setDescription('');
        setQueryParams([]);
        setBodyParams([]);
        setSelectedServiceId('');
    };

    const handleMethodSelect = (method: HttpMethod) => {
        onCancelEdit();
        setSelectedMethod(method);
        
        if (initialBasePath) {
            setBasePath(initialBasePath);
        } else {
            setBasePath('/api/v1/');
        }
        
        setDescription('');
        setQueryParams([]);
        setBodyParams([]);
        setSelectedServiceId('');
    };

    const addParam = (type: 'query' | 'body') => {
        const newParam: Parameter = { id: `param-${Date.now()}`, name: '', constraints: '', optional: false };
        if (type === 'query') {
            setQueryParams([...queryParams, newParam]);
        } else {
            setBodyParams([...bodyParams, newParam]);
        }
    };
    
    const updateParam = (id: string, field: keyof Parameter, value: string | boolean, type: 'query' | 'body') => {
        const updater = (params: Parameter[]) => params.map(p => p.id === id ? {...p, [field]: value} : p);
        if (type === 'query') {
            setQueryParams(updater);
        } else {
            setBodyParams(updater);
        }
    };

    const removeParam = (id: string, type: 'query' | 'body') => {
        if(type === 'query') {
            setQueryParams(queryParams.filter(p => p.id !== id));
        } else {
            setBodyParams(bodyParams.filter(p => p.id !== id));
        }
    }

    const handleSubmit = () => {
        if (!selectedMethod) return;

        const endpointData = {
            method: selectedMethod,
            path: generatedPath,
            description,
            queryParams,
            bodyParams,
            serviceId: selectedServiceId || undefined,
        };

        if (isEditing && editingEndpoint) {
            const updatedEndpoint: Endpoint = {
                ...editingEndpoint,
                ...endpointData,
            };
            onUpdateEndpoint(updatedEndpoint);
        } else {
            const newEndpoint: Endpoint = {
                id: `endpoint-${Date.now()}`,
                ...endpointData,
            };
            onEndpointCreated(newEndpoint);
        }
    };

    const handleCancel = () => {
        onCancelEdit();
        if(!isEditing) {
            resetFormState();
        }
    };

    const handleDragStart = (e: React.DragEvent, method: HttpMethod) => {
        e.dataTransfer.setData('text/plain', method);
    };
    
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(true);
    };
    
    const handleDragLeave = () => {
        setIsDraggingOver(false);
    };
    
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        const method = e.dataTransfer.getData('text/plain') as HttpMethod;
        if (Object.values(HttpMethod).includes(method)) {
            handleMethodSelect(method);
        }
    };

    const showForm = selectedMethod || isEditing;

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="md:w-1/4 lg:w-1/5">
                <div className="p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Endpoints</h3>
                    <div className="space-y-2">
                        {HTTP_METHODS.map(method => (
                            <button key={method} 
                                draggable={true}
                                onDragStart={(e) => handleDragStart(e, method)}
                                onClick={() => handleMethodSelect(method)} 
                                className={`w-full text-left font-semibold py-2 px-4 rounded-lg transition-all duration-200 cursor-grab active:cursor-grabbing ${selectedMethod === method && !isEditing ? 'bg-indigo-600 text-white shadow' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'}`}>
                                {method}
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            <section 
                className="flex-1 transition-all duration-300"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragLeave={handleDragLeave}
            >
            {showForm ? (
                <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Method</label>
                            <input type="text" value={selectedMethod || ''} readOnly className="w-full px-4 py-2 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg font-mono" />
                        </div>
                         <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Service (Optional)</label>
                             <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} className="w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">
                                <option value="">None</option>
                                {services.map(service => (
                                    <option key={service.id} value={service.id}>{service.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-600 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Describe what this endpoint does. E.g., 'Fetches a list of all active users and their profiles.'"
                            className="w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                            rows={3}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-600 mb-1">Base Path</label>
                        <input type="text" value={basePath} onChange={e => setBasePath(e.target.value)} className="w-full px-4 py-2 bg-gray-50 text-gray-900 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 font-mono" />
                        <label className="block text-sm font-bold text-gray-600 mt-2 mb-1">Full Generated Path</label>
                        <input type="text" value={generatedPath} readOnly className="w-full px-4 py-2 bg-gray-200 text-gray-700 border border-gray-300 rounded-lg font-mono" />
                    </div>
                    <div className="space-y-6">
                        <ParamInputGroup 
                            params={queryParams} 
                            title="Query Parameters" 
                            type="query"
                            onAddParam={addParam}
                            onUpdateParam={updateParam}
                            onRemoveParam={removeParam}
                        />
                        <ParamInputGroup 
                            params={bodyParams} 
                            title="Body Parameters" 
                            type="body" 
                            onAddParam={addParam}
                            onUpdateParam={updateParam}
                            onRemoveParam={removeParam}
                        />
                    </div>
                    <div className="mt-8 flex justify-end items-center gap-4">
                        <button onClick={handleCancel} className="py-2 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors">
                           {isEditing ? 'Cancel' : 'Clear'}
                        </button>
                        <button onClick={handleSubmit} className="py-2 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105">
                            {isEditing ? 'Update Endpoint' : 'Add Endpoint'}
                        </button>
                    </div>

                    {(generatedCode || isGeneratingCode) && <CodeDisplay code={generatedCode} isLoading={isGeneratingCode} />}
                </div>
            ) : (
                 <div className={`p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg text-center h-full flex flex-col justify-center items-center border-2 border-dashed transition-all duration-300 ${isDraggingOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}>
                    <h3 className="text-lg font-semibold text-gray-700">Select a method or drag one here to create a new endpoint.</h3>
                    {initialBasePath && <p className="text-gray-500 mt-2">Selected base path: <span className="font-mono text-indigo-600">{initialBasePath}</span></p>}
                 </div>
            )}
            </section>
        </div>
    );
};

export default EndpointsView;