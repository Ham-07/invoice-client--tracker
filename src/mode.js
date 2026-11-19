export const IS_DEMO = __APP_MODE__ === 'demo'
export const LOCKED_PAGES = IS_DEMO ? ['getpaid', 'payments', 'reports', 'backup'] : []