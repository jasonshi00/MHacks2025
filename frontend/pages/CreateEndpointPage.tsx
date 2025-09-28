
import React, { useState, FormEvent, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { ChevronRightIcon, LoaderIcon, PlusIcon, TrashIcon } from '../components/icons';
import { HttpMethod, RouteParameter } from '../types';

type RouteParameterWithId = RouteParameter & { id: string };
const paramTypes: RouteParameter['type'][] = ['string', 'number', 'boolean'];

const CreateEndpointPage: React.FC = () => {
    const { serviceId } = useParams();
    const { services, components, addComponent } = useAppContext();
    const navigate = useNavigate();
    
    const service = services.find(s => s.serviceId === Number(serviceId));
    const rootComponent = service ? components.get(service.parentComponentId) : undefined;
    const basePath = rootComponent ? rootComponent.route : '';

    const [relativeRoute, setRelativeRoute] = useState('/');
    const [parameters, setParameters] = useState<RouteParameterWithId[]>([]);
    const [method, setMethod] = useState<HttpMethod>('GET');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const fullRouteDisplay = useMemo(() => {
        let finalRelativePath = relativeRoute.trim();
        
        if (finalRelativePath.endsWith('/') && finalRelativePath.length > 1) {
            finalRelativePath = finalRelativePath.slice(0, -1);
        }
        if (finalRelativePath === '/') finalRelativePath = '';
        
        if (!finalRelativePath.startsWith('/') && finalRelativePath) {
             finalRelativePath = '/' + finalRelativePath;
        }

        if (basePath.endsWith('/') && finalRelativePath.startsWith('/')) {
            return `${basePath.slice(0, -1)}${finalRelativePath}`;
        }
        if (!basePath.endsWith('/') && !finalRelativePath.startsWith('/')) {
            return `${basePath}/${finalRelativePath}`;
        }
        return `${basePath}${finalRelativePath}`;
    }, [basePath, relativeRoute]);

    const handleAddParameter = () => {
        const newParamName = `param${parameters.length + 1}`;
        const newParam: RouteParameterWithId = {
            id: crypto.randomUUID(),
            name: newParamName,
            type: 'string',
            optional: false,
        };
        setParameters(prev => [...prev, newParam]);
        setRelativeRoute(prev => {
            const trimmed = prev.endsWith('/') && prev.length > 1 ? prev.slice(0, -1) : (prev === '/' ? '' : prev);
            return `${trimmed}/:${newParamName}`;
        });
    };

    const handleParameterChange = (id: string, field: keyof RouteParameter, value: string | boolean) => {
        let oldSegment = '';
        let newSegment = '';
        
        const newParameters = parameters.map(p => {
            if (p.id === id) {
                oldSegment = `/:${p.name}${p.optional ? '?' : ''}`;
                const updatedParam = { ...p, [field]: value };
                newSegment = `/:${updatedParam.name}${updatedParam.optional ? '?' : ''}`;
                return updatedParam;
            }
            return p;
        });
        
        setParameters(newParameters);

        if ((field === 'name' || field === 'optional') && oldSegment && newSegment) {
            setRelativeRoute(prev => prev.replace(oldSegment, newSegment));
        }
    };

    const handleRemoveParameter = (id: string) => {
        const paramToRemove = parameters.find(p => p.id === id);
        if (!paramToRemove) return;

        setParameters(prev => prev.filter(p => p.id !== id));
        setRelativeRoute(prev => prev.replace(`/:${paramToRemove.name}${paramToRemove.optional ? '?' : ''}`, ''));
    };
    
    if (!service) {
        return <div className="text-center"><h1 className="text-2xl font-bold text-red-500">Service not found</h1><Link to="/dashboard" className="text-blue-500 hover:underline mt-4 inline-block">Return to Dashboard</Link></div>;
    }
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const finalAttributes = {
            parameters: parameters.map(({ id, ...rest }) => rest),
            response: { message: 'success' } // Default response
        };

        addComponent(Number(serviceId), {
            route: fullRouteDisplay,
            method,
            description,
            attributes: finalAttributes,
        });

        setTimeout(() => {
            setIsSaving(false);
            navigate(`/service/${service.serviceId}`);
        }, 500);
    };

    const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

    return (
        <div>
            <nav className="flex mb-6" aria-label="Breadcrumb">
                <ol role="list" className="flex items-center space-x-2">
                    <li><div><Link to="/dashboard" className="text-gray-400 hover:text-gray-200">Dashboard</Link></div></li>
                    <li><div className="flex items-center"><ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-500" /><Link to={`/service/${service.serviceId}`} className="ml-2 text-sm font-medium text-gray-400 hover:text-gray-200">{service.name}</Link></div></li>
                    <li><div className="flex items-center"><ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-500" /><span className="ml-2 text-sm font-medium text-white">Create Endpoint</span></div></li>
                 </ol>
            </nav>

            <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
                <h1 className="text-3xl font-bold mb-1">Create New Endpoint for {service.name}</h1>
                <p className="text-gray-400 mb-6 font-mono text-sm break-all">Full route: {fullRouteDisplay}</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         <div className="md:col-span-2">
                             <label htmlFor="route" className="block text-sm font-medium text-gray-400 mb-2">Relative Route</label>
                             <div className="flex items-center bg-gray-900 border border-gray-700 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                                 <span className="pl-3 text-gray-500 font-mono">{basePath}</span>
                                 <input id="route" type="text" value={relativeRoute} onChange={(e) => setRelativeRoute(e.target.value)} className="w-full font-mono p-3 bg-transparent border-0 focus:outline-none focus:ring-0" placeholder="/"/>
                             </div>
                         </div>
                         <div>
                            <label htmlFor="method" className="block text-sm font-medium text-gray-400 mb-2">Method</label>
                            <select id="method" value={method} onChange={(e) => setMethod(e.target.value as HttpMethod)} className="w-full font-mono p-3 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {httpMethods.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                        <textarea
                            id="description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Retrieves a specific user by their unique ID."
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">URL Parameters</label>
                        <div className="space-y-3 p-4 bg-gray-900/50 border border-gray-700 rounded-md">
                            {parameters.map((param) => (
                                <div key={param.id} className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-5"><input type="text" value={param.name} onChange={e => handleParameterChange(param.id, 'name', e.target.value)} placeholder="paramName" className="w-full font-mono text-sm p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"/></div>
                                    <div className="col-span-4"><select value={param.type} onChange={e => handleParameterChange(param.id, 'type', e.target.value)} className="w-full font-mono text-sm p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500">{paramTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                    <div className="col-span-2 flex items-center justify-center"><label className="flex items-center space-x-2 text-sm cursor-pointer"><input type="checkbox" checked={param.optional} onChange={e => handleParameterChange(param.id, 'optional', e.target.checked)} className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"/><span>Opt.</span></label></div>
                                    <div className="col-span-1"><button type="button" onClick={() => handleRemoveParameter(param.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-700"><TrashIcon className="w-4 h-4"/></button></div>
                                </div>
                            ))}
                             <button type="button" onClick={handleAddParameter} className="w-full flex items-center justify-center space-x-2 mt-3 px-4 py-2 text-sm font-semibold text-white bg-blue-600/50 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <PlusIcon className="w-4 h-4" /><span>Add Parameter</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-end pt-4 space-x-4">
                        <Link to={`/service/${service.serviceId}`} className="px-6 py-2 border border-gray-600 text-sm font-medium rounded-md hover:bg-gray-700">Cancel</Link>
                        <button type="submit" disabled={isSaving} className="group relative flex justify-center py-2 px-6 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {isSaving ? (<><LoaderIcon className="w-5 h-5 mr-2" />Creating...</>) : "Create Endpoint"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEndpointPage;
