export const JWT_OFFSET_SECONDS: number = 60;

export const LOGIN_URL_REGEX: RegExp = new RegExp('.*\\/auth\\/login$');
export const REGISTER_URL_REGEX: RegExp = new RegExp('.*\\/auth\\/register$');
export const REFRESH_TOKEN_URL_REGEX: RegExp = new RegExp('.*\\/auth\\/refresh$');

export const PHONE_NUMBER_PATTERN: RegExp = new RegExp('^[- +()0-9]{10,15}$');
export const IMPACT_RADIUS_PATTERN: RegExp = new RegExp('^\\d*(.\\d{1,2})?$');

export const LENGTH_8: number = 8;
export const LENGTH_50: number = 50;
export const LENGTH_1000: number = 1000;

export const MIN_RADIUS: number = 1;
export const MAX_RADIUS: number = 10_000;
export const MAX_YEARS_INTERVAL: number = 2;
export const PAGE_SIZE: number = 10;

export const MIN_IMPACT_RADIUS: number = 0.00;
export const MAX_IMPACT_RADIUS: number = 1000.00;
