export const logger = {
    debug: (...args: any[]) => {
        if (process.env.NODE_ENV === 'development') {
            console.log('[DEBUG]', ...args);
        }
    },
    error: (...args: any[]) => {
        console.error('[ERROR]', ...args);
    },
    info: (...args: any[]) => {
        console.log('[INFO]', ...args);
    },
    warn: (...args: any[]) => {
        console.warn('[WARN]', ...args);
    }
}; 