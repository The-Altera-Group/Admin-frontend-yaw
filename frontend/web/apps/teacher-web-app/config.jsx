// TEACHER WEB APP CONFIGURATION FILE
export const TEACHER_APP_CONFIG = {
    // API SETTINGS
    API: {
        BASE_URL: import.meta.env.VITE_API_BASE_URL,
    },
    // AUTHENTICATION SETTINGS
    AUTH: {
        LOGIN: import.meta.env.VITE_TEACHER_LOGIN,
        FORGOT_PASSWORD: import.meta.env.VITE_TEACHER_FORGOT_PASSWORD,
        RESET_PASSWORD: import.meta.env.VITE_TEACHER_RESET_PASSWORD,
        LOGOUT: import.meta.env.VITE_TEACHER_LOGOUT,
        REFRESH_TOKEN: import.meta.env.VITE_TEACHER_REFRESH_TOKEN,
    },
    // DASHBOARD SETTINGS
    DASHBOARD: {
        FETCH_DASHBOARD_DATA: import.meta.env.VITE_TEACHER_DASHBOARD,
        UPDATE_PROFILE: import.meta.env.VITE_TEACHER_UPDATE_PROFILE,
    },
    // GENERAL SETTINGS
    SETTINGS: {
        APP_NAME: 'Altera Teacher Portal',
        SUPPORT_EMAIL: 'bGxN5@example.com',
    },
}