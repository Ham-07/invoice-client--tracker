export const IS_DEMO = import.meta.env.VITE_MODE === 'demo'
export const LOCKED_PAGES = IS_DEMO ? ['getpaid', 'payments', 'reports', 'backup'] : []