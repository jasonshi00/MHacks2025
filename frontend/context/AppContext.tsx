import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { UserDb, DbSchema, Service, Component, HttpMethod } from '../types';

interface AppContextType {
  userDb: UserDb | null;
  schemas: DbSchema[];
  services: Service[];
  components: Map<number, Component>;
  setDbConfig: (config: UserDb, fetchedSchemas: DbSchema[]) => void;
  addService: (service: Omit<Service, 'serviceId' | 'parentComponentId'>, rootComponent: Omit<Component, 'componentId' | 'serviceId' | 'children'>, aiComponents?: Omit<Component, 'componentId' | 'serviceId' | 'children'>[]) => void;
  addComponent: (serviceId: number, newComponentData: Omit<Component, 'componentId' | 'serviceId' | 'children'>) => void;
  updateComponent: (componentId: number, updatedData: Partial<Pick<Component, 'route' | 'method' | 'attributes' | 'description'>>) => void;
  deleteComponent: (componentId: number, serviceId: number) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userDb, setUserDb] = useState<UserDb | null>(null);
  const [schemas, setSchemas] = useState<DbSchema[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [components, setComponents] = useState<Map<number, Component>>(new Map());

  const setDbConfig = (config: UserDb, fetchedSchemas: DbSchema[]) => {
    setUserDb(config);
    setSchemas(fetchedSchemas);
  };
  
  const addService = useCallback((serviceData: Omit<Service, 'serviceId' | 'parentComponentId'>, rootComponentData: Omit<Component, 'componentId' | 'serviceId' | 'children'>, aiComponentsData: Omit<Component, 'componentId' | 'serviceId' | 'children'>[] = []) => {
    setServices(prevServices => {
        const nextServiceId = (prevServices[prevServices.length - 1]?.serviceId ?? 0) + 1;
        
        let nextComponentId = Array.from(components.keys()).reduce((max, id) => Math.max(max, id), 0) + 1;
        
        const newRootComponent: Component = {
            ...rootComponentData,
            componentId: nextComponentId,
            serviceId: nextServiceId,
            children: [],
        };
        nextComponentId++;

        const newService: Service = {
            ...serviceData,
            serviceId: nextServiceId,
            parentComponentId: newRootComponent.componentId,
        };

        const newAiComponents: Component[] = aiComponentsData.map((comp, index) => {
            const componentId = nextComponentId + index;
            return {
                ...comp,
                componentId: componentId,
                serviceId: nextServiceId,
                children: [] // Assuming flat structure from AI for now
            };
        });

        newRootComponent.children = newAiComponents.map(c => c.componentId);

        setComponents(prevComponents => {
            const newMap = new Map(prevComponents);
            newMap.set(newRootComponent.componentId, newRootComponent);
            newAiComponents.forEach(c => newMap.set(c.componentId, c));
            return newMap;
        });

        return [...prevServices, newService];
    });
  }, [components]);

  const addComponent = useCallback((serviceId: number, newComponentData: Omit<Component, 'componentId' | 'serviceId' | 'children'>) => {
    setComponents(prevComponents => {
      const service = services.find(s => s.serviceId === serviceId);
      if (!service) {
        console.error(`Service with ID ${serviceId} not found.`);
        return prevComponents;
      }
  
      const parentComponent = prevComponents.get(service.parentComponentId);
      if (!parentComponent) {
        console.error(`Parent component for service ID ${serviceId} not found.`);
        return prevComponents;
      }
      
      const newMap = new Map(prevComponents);
      const nextComponentId = Array.from(newMap.keys()).reduce((max, id) => Math.max(max, id), 0) + 1;
  
      const newComponent: Component = {
        ...newComponentData,
        componentId: nextComponentId,
        serviceId: serviceId,
        children: [],
      };
      newMap.set(nextComponentId, newComponent);
  
      const updatedParent: Component = {
        ...parentComponent,
        children: [...parentComponent.children, nextComponentId],
      };
      newMap.set(parentComponent.componentId, updatedParent);
  
      return newMap;
    });
  }, [services]);
  
  const updateComponent = useCallback((componentId: number, updatedData: Partial<Pick<Component, 'route' | 'method' | 'attributes' | 'description'>>) => {
    setComponents(prevComponents => {
      const newMap = new Map(prevComponents);
      const existingComponent = newMap.get(componentId);

      if (existingComponent) {
        const updatedComponent: Component = {
          ...existingComponent,
          ...updatedData,
        };
        newMap.set(componentId, updatedComponent);
        return newMap;
      }

      console.warn(`Attempted to update a component that does not exist: ID ${componentId}`);
      return prevComponents;
    });
  }, []);

  const deleteComponent = useCallback((componentId: number, serviceId: number) => {
    setComponents(prevComponents => {
        const service = services.find(s => s.serviceId === serviceId);
        if (!service) {
            console.error(`Service with ID ${serviceId} not found during delete.`);
            return prevComponents;
        }

        const newMap = new Map(prevComponents);
        const parentComponent = newMap.get(service.parentComponentId);

        if (parentComponent) {
            const updatedParent = {
                ...parentComponent,
                children: parentComponent.children.filter(id => id !== componentId),
            };
            newMap.set(parentComponent.componentId, updatedParent);
        }

        newMap.delete(componentId);
        return newMap;
    });
}, [services]);


  return (
    <AppContext.Provider value={{ userDb, schemas, services, components, setDbConfig, addService, addComponent, updateComponent, deleteComponent }}>
      {children}
    </AppContext.Provider>
  );
};