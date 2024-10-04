export const JWT_OFFSET_SECONDS: number = 60;

export const LOGIN_URL_REGEX: RegExp = new RegExp('.*\\/auth\\/login$');
export const REGISTER_URL_REGEX: RegExp = new RegExp('.*\\/auth\\/register$');
export const REFRESH_TOKEN_URL_REGEX: RegExp = new RegExp('.*\\/auth\\/refresh$');

export const PHONE_NUMBER_REGEX: RegExp = new RegExp('^[- +()0-9]{10,20}$');

export const MIN_PASSWORD_LENGTH: number = 8;
export const MAX_PASSWORD_LENGTH: number = 40;
export const MAX_EMAIL_LENGTH: number = 50;
export const MAX_USER_NAME_LENGTH: number = 25;
export const MAX_COMMENT_LENGTH: number = 1000;
export const MAX_DESCRIPTION_LENGTH: number = 1000;

export const MIN_RADIUS: number = 1;
export const MAX_RADIUS: number = 10_000;
export const MAX_YEARS_INTERVAL: number = 2;
export const PAGE_SIZE: number = 20;

export const EVENT_IMAGE_FILE_PREFIX: string = 'event_';
export const USER_IMAGE_FILE_PREFIX: string = 'user_';
