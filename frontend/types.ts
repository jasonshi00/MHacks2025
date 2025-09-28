
export interface UserDb {
  dbName: string;
  username: string;
  password: string;
  host: string;
  port: string;
}

export interface DbSchema {
  tableName: string;
  attributes: Record<string, string>; 
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface RouteParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  optional: boolean;
}

export interface Component {
  componentId: number;
  route: string;
  method: HttpMethod;
  serviceId: number;
  children: number[];
  attributes?: Record<string, any>;
  description?: string;
}

export interface Service {
  serviceId: number;
  name: string;
  parentComponentId: number;
  schemaTableName?: string;
  isAiAgent: boolean;
}