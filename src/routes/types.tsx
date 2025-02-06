import { RouteObject } from 'react-router-dom';

export interface RouteObjectWithMeta extends Omit<RouteObject, 'children'> {
    children?: RouteObjectWithMeta[];
    meta?: {
        icon?: string;
        title?: string;
        requiredPermissions?: string[];
    };
}