import { HttpMethod, View } from './types';

export const NAV_ITEMS = [
    { id: View.HOME, label: 'HOME' },
    { id: View.ENDPOINTS, label: 'ENDPOINT' },
    { id: View.TREE, label: 'TREE' },
    { id: View.TEST, label: 'TEST' },
];

export const HTTP_METHODS = [
    HttpMethod.GET,
    HttpMethod.POST,
    HttpMethod.PUT,
    HttpMethod.DELETE,
    HttpMethod.PATCH,
];

export const SCHEMA_OPTIONS = ['Users', 'Products', 'Orders', 'Reviews', 'Use AI Agent'];