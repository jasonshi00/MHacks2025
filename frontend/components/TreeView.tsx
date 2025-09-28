import React, { useMemo } from 'react';
import type { Endpoint, TreeNode, Service } from '../types';
import TrashIcon from './icons/TrashIcon';

interface TreeViewProps {
  endpoints: Endpoint[];
  services: Service[];
  onRemoveEndpoint: (id: string) => void;
  onEditEndpoint: (endpoint: Endpoint) => void;
  onEditPath: (path: string) => void;
}

const buildTree = (endpoints: Endpoint[]): TreeNode => {
  const root: TreeNode = { name: 'API Root', children: {}, endpoints: [] };
  endpoints.forEach(endpoint => {
    // Ensure path starts with a slash and remove it for splitting
    const path = endpoint.path.startsWith('/') ? endpoint.path.substring(1) : endpoint.path;
    const parts = path.split('/').filter(p => p);
    
    let currentNode = root;
    parts.forEach(part => {
      if (!currentNode.children[part]) {
        currentNode.children[part] = { name: part, children: {}, endpoints: [] };
      }
      currentNode = currentNode.children[part];
    });
    currentNode.endpoints.push(endpoint);
  });
  return root;
};

const MethodBadge: React.FC<{ method: string }> = ({ method }) => {
    const colors: { [key: string]: string } = {
        GET: 'bg-green-100 text-green-800',
        POST: 'bg-blue-100 text-blue-800',
        PUT: 'bg-yellow-100 text-yellow-800',
        PATCH: 'bg-orange-100 text-orange-800',
        DELETE: 'bg-red-100 text-red-800',
    };
    return (
        <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${colors[method] || 'bg-gray-100 text-gray-800'}`}>
            {method}
        </span>
    );
};


const Node: React.FC<{ 
    node: TreeNode; 
    level: number; 
    pathPrefix: string;
    services: Service[]; 
    onRemoveEndpoint: (id: string) => void; 
    onEditEndpoint: (endpoint: Endpoint) => void;
    onEditPath: (path: string) => void;
}> = ({ node, level, pathPrefix, services, onRemoveEndpoint, onEditEndpoint, onEditPath }) => {
  const isRoot = level === 0;
  const hasChildren = Object.keys(node.children).length > 0;
  const currentPath = `${pathPrefix}/${node.name}`;

  return (
    <div className={`${!isRoot ? 'ml-8 pl-6 border-l-2 border-indigo-200' : ''}`}>
        {!isRoot && (
            <div className="relative mb-2">
                <div className="absolute -left-[25px] top-2.5 w-6 border-t-2 border-indigo-200"></div>
                <div 
                  className="p-3 bg-slate-800 text-white rounded-lg inline-block shadow-md cursor-pointer transition-transform hover:scale-105"
                  onDoubleClick={() => onEditPath(currentPath)}
                >
                    <h3 className="font-bold">/{node.name}</h3>
                </div>
            </div>
        )}
      
      {node.endpoints.length > 0 && (
        <div className="ml-8 pl-6 border-l-2 border-dotted border-gray-400 py-2 space-y-2">
            <div className="absolute -left-px top-0 h-full"></div>
            {node.endpoints.map(ep => {
                const service = services.find(s => s.id === ep.serviceId);
                return (
                    <div 
                        key={ep.id} 
                        onDoubleClick={() => onEditEndpoint(ep)}
                        className="relative flex items-center gap-3 group p-1 rounded-md hover:bg-indigo-50 cursor-pointer transition-colors"
                    >
                        <div className="absolute -left-[25px] top-[15px] w-6 border-t-2 border-dotted border-gray-400"></div>
                        <MethodBadge method={ep.method} />
                        <span className="font-mono text-sm text-gray-600">{ep.path}</span>
                        {service && <span className="text-xs text-indigo-600 font-semibold">({service.name})</span>}
                         <button
                            onClick={(e) => { e.stopPropagation(); onRemoveEndpoint(ep.id);}}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-all opacity-0 group-hover:opacity-100"
                            aria-label="Delete endpoint"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                )
            })}
        </div>
      )}

      {hasChildren && (
        <div className="pt-2">
          {Object.values(node.children).map((child: TreeNode) => (
            <Node key={child.name} node={child} level={level + 1} pathPrefix={isRoot ? '' : currentPath} services={services} onRemoveEndpoint={onRemoveEndpoint} onEditEndpoint={onEditEndpoint} onEditPath={onEditPath} />
          ))}
        </div>
      )}
    </div>
  );
};


const TreeView: React.FC<TreeViewProps> = ({ endpoints, services, onRemoveEndpoint, onEditEndpoint, onEditPath }) => {
  const tree = useMemo(() => buildTree(endpoints), [endpoints]);

  return (
    <div className="p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Endpoint Tree</h2>
      {endpoints.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No endpoints created yet. Go to 'ENDPOINT' to add some.</p>
      ) : (
        <div className="relative">
          <Node node={tree} level={0} pathPrefix="" services={services} onRemoveEndpoint={onRemoveEndpoint} onEditEndpoint={onEditEndpoint} onEditPath={onEditPath}/>
        </div>
      )}
    </div>
  );
};

export default TreeView;