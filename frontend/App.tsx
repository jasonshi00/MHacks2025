
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
// Fix: Correctly import useAppContext from hooks directory
import { AppProvider } from './context/AppContext';
import { useAppContext } from './hooks/useAppContext';
import ConfigureDbPage from './pages/ConfigureDbPage';
import HomePage from './pages/HomePage';
import EndpointEditorPage from './pages/EndpointEditorPage';
import CreateEndpointPage from './pages/CreateEndpointPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import Layout from './components/Layout';

const AppRoutes: React.FC = () => {
    const { userDb } = useAppContext();

    return (
        <Routes>
            <Route path="/" element={
                userDb ? <Navigate to="/dashboard" /> : <ConfigureDbPage />
            } />
            <Route path="/configure" element={<ConfigureDbPage />} />
            {userDb && (
                <>
                    <Route path="/dashboard" element={<HomePage />} />
                    <Route path="/service/:serviceId" element={<ServiceDetailPage />} />
                    <Route path="/service/:serviceId/endpoint/new" element={<CreateEndpointPage />} />
                    <Route path="/service/:serviceId/endpoint/:componentId" element={<EndpointEditorPage />} />
                </>
            )}
            <Route path="*" element={<Navigate to={userDb ? "/dashboard" : "/configure"} />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <HashRouter>
                <Layout>
                    <AppRoutes />
                </Layout>
            </HashRouter>
        </AppProvider>
    );
};

export default App;