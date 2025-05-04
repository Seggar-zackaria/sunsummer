/**
 * An Array of all the public routes in the application
 * @type {Array<string>}
 * @example
 * export const publicRoutes = [
 *  '/',
 * '/login',
 * ]
 */
export const publicRoutes = [
    "/",
    "/auth/new-verification",
    ];

/** 
 * An Array of all the auth routes in the app that needs authentication
 * these routes will redirect logged in users to /setting
 * @type {Array<string>}
 *
 */

export const authRoutes = [
    "/auth/login",
    "/auth/register",
    '/auth/error',
    "/auth/forgot-password",
    "/auth/reset-password",
    
];

/**
 * the prefix for api authe routes
 * these with this prefix will be used for the api authentication
 * @type {string}
 *
 */
export const apiAuthPrefix = "/api/auth";

/**
 * the default redirect path after login
 * @type {string}
 *
 * ]
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
