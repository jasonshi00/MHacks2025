import React, { ReactNode } from 'react';
import { Link, useLocation, useMatch } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { ApiIcon, LayoutDashboardIcon, PencilIcon } from './icons';

const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { userDb, services, components } = useAppContext();
    const location = useLocation();

    // Check if the current route matches the endpoint editor pattern
    const editorMatch = useMatch('/service/:serviceId/endpoint/:componentId');
    
    const tabs = [];

    // Always show the Services/Dashboard tab if the user is logged in
    if (userDb) {
        tabs.push({
            name: 'Services',
            href: '/dashboard',
            current: location.pathname === '/dashboard',
            icon: LayoutDashboardIcon
        });
    }
    
    // If we are on an editor page, add a contextual tab for it
    if (editorMatch) {
        const { serviceId, componentId } = editorMatch.params;
        const component = components.get(Number(componentId));
        
        const tabName = component ? `Edit: ${component.route}` : 'Edit Endpoint';

        tabs.push({
            name: tabName,
            href: editorMatch.pathname,
            current: true, // The editor tab is only visible when it's the current page
            icon: PencilIcon
        });
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <Link to={userDb ? "/dashboard" : "/configure"} className="flex items-center space-x-3 text-xl font-bold text-white hover:text-blue-400 transition-colors duration-300">
                        <ApiIcon className="w-8 h-8" />
                        <span>API Workflow Generator</span>
                    </Link>
                </nav>
            </header>

            {/* Tabs Navigation */}
            {userDb && tabs.length > 0 && (
                 <div className="border-b border-gray-700">
                    <div className="container mx-auto px-6">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <Link
                                    key={tab.name}
                                    to={tab.href}
                                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        tab.current
                                            ? 'border-blue-500 text-blue-400'
                                            : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                                    }`}
                                    aria-current={tab.current ? 'page' : undefined}
                                >
                                    <tab.icon
                                        className={`-ml-0.5 mr-2 h-5 w-5 ${
                                            tab.current ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-300'
                                        }`}
                                        aria-hidden="true"
                                    />
                                    <span>{tab.name}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            <main className="container mx-auto px-6 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;