import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { Component as ComponentType, HttpMethod } from '../types';
import { AiIcon, DatabaseIcon, PlusIcon, FolderIcon, ChevronRightIcon, TrashIcon } from '../components/icons';

interface TreeNode {
    segment: string;
    fullPath: string;
    children: Map<string, TreeNode>;
    endpoints: ComponentType[];
}

const MethodBadge: React.FC<{ method: HttpMethod }> = ({ method }) => {
    const colorMap: Record<HttpMethod, string> = {
        GET: 'bg-green-500/20 text-green-400',
        POST: 'bg-blue-500/20 text-blue-400',
        PUT: 'bg-yellow-500/20 text-yellow-400',
        PATCH: 'bg-orange-500/20 text-orange-400',
        DELETE: 'bg-red-500/20 text-red-400',
    };
    return (
        <span className={`px-2 py-1 text-xs font-bold rounded-md ${colorMap[method]}`}>{method}</span>
    );
};

const TreeViewNode: React.FC<{ node: TreeNode, level: number }> = ({ node, level }) => {
    const navigate = useNavigate();
    const { deleteComponent } = useAppContext();

    const handleDelete = (e: React.MouseEvent, endpoint: ComponentType) => {
        e.stopPropagation();
        if (window.confirm(`Are you sure you want to delete the endpoint: ${endpoint.method} ${endpoint.route}?`)) {
            deleteComponent(endpoint.componentId, endpoint.serviceId);
        }
    };

    return (
        <div style={{ paddingLeft: `${level * 1.5}rem` }}>
            {/* Render the folder for the current segment */}
            <div className="flex items-center space-x-2 py-1 text-gray-400">
                <FolderIcon className="w-5 h-5" />
                <span className="font-mono">{node.segment}</span>
            </div>

            <div className="border-l border-gray-700" style={{ marginLeft: '0.625rem' }}>
                {/* Render endpoints terminating at this level */}
                <div className="pl-6 space-y-1 py-1">
                    {node.endpoints.map(endpoint => (
                        <div 
                            key={endpoint.componentId}
                            onClick={() => navigate(`/service/${endpoint.serviceId}/endpoint/${endpoint.componentId}`)}
                            className="group flex items-center justify-between p-2 rounded-md hover:bg-gray-700/50 cursor-pointer transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3">
                                    <MethodBadge method={endpoint.method} />
                                    <span className="font-mono text-sm text-gray-300 truncate" title={endpoint.route}>{endpoint.route}</span>
                                </div>
                                {endpoint.description && (
                                    <p className="text-xs text-gray-400 mt-1 truncate" title={endpoint.description}>
                                        {endpoint.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={(e) => handleDelete(e, endpoint)}
                                className="ml-4 p-1 rounded-md text-gray-500 hover:text-red-500 hover:bg-gray-600/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Delete endpoint"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Render child nodes recursively */}
                {Array.from(node.children.values()).map(childNode => (
                    <TreeViewNode key={childNode.fullPath} node={childNode} level={0} />
                ))}
            </div>
        </div>
    );
};

const ServiceDetailPage: React.FC = () => {
    const { serviceId } = useParams();
    const { services, components } = useAppContext();
    const navigate = useNavigate();
    
    const service = services.find(s => s.serviceId === Number(serviceId));

    const endpointTree = useMemo(() => {
        if (!service) return null;
        const rootComponent = components.get(service.parentComponentId);
        if (!rootComponent) return null;

        const basePath = rootComponent.route;
        const root: TreeNode = { segment: basePath, fullPath: basePath, children: new Map(), endpoints: [] };
        
        const serviceComponents = Array.from(components.values()).filter(c => c.serviceId === service.serviceId);

        for (const component of serviceComponents) {
            // Skip the root component itself from being processed as a child
            if (component.componentId === rootComponent.componentId) continue;
             
            if (!component.route.startsWith(basePath)) continue;

            const relativeRoute = component.route.substring(basePath.length);

            // If the route is the base path itself, add it to the root's endpoints
            if (relativeRoute === '' || relativeRoute === '/') {
                 root.endpoints.push(component);
                 continue;
            }

            const segments = relativeRoute.slice(1).split('/'); 
            let currentNode = root;

            segments.forEach((segment, index) => {
                const isLastSegment = index === segments.length - 1;
                const pathSegment = segment || '/';
                
                if (!currentNode.children.has(pathSegment)) {
                     const newPath = `${currentNode.fullPath === '/' ? '' : currentNode.fullPath}/${pathSegment}`;
                    currentNode.children.set(pathSegment, {
                        segment: pathSegment,
                        fullPath: newPath,
                        children: new Map(),
                        endpoints: [],
                    });
                }
                
                currentNode = currentNode.children.get(pathSegment)!;
                
                if (isLastSegment) {
                    currentNode.endpoints.push(component);
                }
            });
        }
        return root;
    }, [service, components]);


    if (!service) {
        return (
            <div className="text-center">
                <h1 className="text-2xl font-bold text-red-500">Service not found</h1>
                <Link to="/dashboard" className="text-blue-500 hover:underline mt-4 inline-block">
                    Return to Dashboard
                </Link>
            </div>
        );
    }
    
    const breadcrumbs = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: service.name, href: '#' }
    ];

    const handleCreateEndpoint = () => {
        navigate(`/service/${service.serviceId}/endpoint/new`);
    };

    return (
        <div>
            <nav className="flex mb-6" aria-label="Breadcrumb">
                <ol role="list" className="flex items-center space-x-2">
                    {breadcrumbs.map((crumb, index) => (
                        <li key={crumb.name}>
                            <div className="flex items-center">
                                {index > 0 && <ChevronRightIcon className="flex-shrink-0 h-5 w-5 text-gray-500" aria-hidden="true" />}
                                <Link to={crumb.href} className={`ml-2 text-sm font-medium ${index === breadcrumbs.length - 1 ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}>
                                    {crumb.name}
                                 </Link>
                            </div>
                        </li>
                    ))}
                </ol>
            </nav>

            <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-700">
                    <div className="flex items-center space-x-4">
                        {service.isAiAgent ? <AiIcon className="w-10 h-10 text-blue-400" /> : <DatabaseIcon className="w-10 h-10 text-green-400" />}
                        <div>
                            <h1 className="text-3xl font-bold">{service.name}</h1>
                            <p className="text-md text-gray-400">
                                {service.isAiAgent ? "AI Generated Service" : `Schema: ${service.schemaTableName}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleCreateEndpoint}
                        className="flex items-center px-4 py-2 font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create Endpoint
                    </button>
                </div>
                
                <div className="mt-4">
                    {endpointTree && (Array.from(endpointTree.children.values()).length > 0 || endpointTree.endpoints.length > 0) ? (
                        <TreeViewNode node={endpointTree} level={0} />
                    ) : (
                        <div className="text-center text-sm text-gray-500 py-8">
                            No endpoints created yet. Click "Create Endpoint" to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailPage;