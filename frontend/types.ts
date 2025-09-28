export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

export enum View {
  HOME = 'HOME',
  ENDPOINTS = 'ENDPOINTS',
  TREE = 'TREE',
  TEST = 'TEST',
}

export interface Parameter {
  id: string;
  name: string;
  constraints: string;
  optional: boolean;
}

export interface Endpoint {
  id:string;
  method: HttpMethod;
  path: string;
  description?: string;
  queryParams: Parameter[];
  bodyParams: Parameter[];
  serviceId?: string;
}

export interface Service {
  id: string;
  name: string;
  schema: string;
  aiDescription?: string;
}

export interface DbCredentials {
  host: string;
  port: string;
  user: string;
  pass: string;
  db: string;
}

export interface Project {
  name: string;
  dbCredentials: DbCredentials;
  services: Service[];
  endpoints: Endpoint[];
}

export interface TreeNode {
  name: string;
  endpoints: Endpoint[];
  children: { [key: string]: TreeNode };
}