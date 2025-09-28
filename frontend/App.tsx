import React, { useState } from 'react';
import type { Project, DbCredentials } from './types';
import ProjectCreation from './components/ProjectCreation';
import MainEditor from './components/MainEditor';

const App: React.FC = () => {
  const [project, setProject] = useState<Project | null>(null);

  const handleCreateProject = (name: string, dbCredentials: DbCredentials) => {
    setProject({
      name,
      dbCredentials,
      services: [],
      endpoints: [],
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      {project ? (
        <MainEditor project={project} />
      ) : (
        <ProjectCreation onCreateProject={handleCreateProject} />
      )}
    </div>
  );
};

export default App;