import {
  MAX_COMMENT_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PASSWORD_LENGTH,
  MAX_RADIUS,
  MAX_USER_NAME_LENGTH,
  MAX_YEARS_INTERVAL,
  MIN_PASSWORD_LENGTH,
  MIN_RADIUS
} from './constants';

// Auth
export const ERR_MSG_EMAIL_REQUIRED: string = 'The email is required';
export const ERR_MSG_INVALID_EMAIL: string = 'Invalid email';
export const ERR_MSG_EMAIL_LENGTH: string = 'The email must not exceed ' + MAX_EMAIL_LENGTH + ' characters';
export const ERR_MSG_PASSWORD_REQUIRED: string = 'The password is required';
export const ERR_MSG_PASSWORD_LENGTH: string = 'The password must have between ' + MIN_PASSWORD_LENGTH + ' and ' + MAX_PASSWORD_LENGTH + ' characters';
export const ERR_MSG_CONFIRMATION_PASSWORD_REQUIRED: string = 'The confirmation password is required';
export const ERR_MSG_DIFFERENT_PASSWORDS: string = 'The passwords do not match';

// Profile
export const ERR_MSG_FIRST_NAME_REQUIRED: string = 'The first name is required';
export const ERR_MSG_FIRST_NAME_LENGTH: string = 'The first name must not exceed ' + MAX_USER_NAME_LENGTH + ' characters';
export const ERR_MSG_LAST_NAME_REQUIRED: string = 'The last name is required';
export const ERR_MSG_LAST_NAME_LENGTH: string = 'The last name must not exceed ' + MAX_USER_NAME_LENGTH + ' characters';
export const ERR_MSG_PHONE_NUMBER_REQUIRED: string = 'The phone number is required';
export const ERR_MSG_PHONE_PATTERN: string = 'The phone number does not match the expected format';

// New event
export const ERR_MSG_TAG_REQUIRED: string = 'The tag is required';
export const ERR_MSG_SEVERITY_REQUIRED: string = 'The severity is required';
export const ERR_MSG_IMAGE_REQUIRED: string = 'The image is required';
export const ERR_MSG_DESCRIPTION_LENGTH: string = 'The description must not exceed ' + MAX_DESCRIPTION_LENGTH + ' characters';
export const ERR_MSG_PROFILE_FIRST_NAME_REQUIRED: string = 'The profile first name is required';
export const ERR_MSG_PROFILE_LAST_NAME_REQUIRED: string = 'The profile last name is required';
export const ERR_MSG_PROFILE_PHONE_NUMBER_REQUIRED: string = 'The profile phone number is required';

// Filter
export const ERR_MSG_RADIUS_REQUIRED: string = 'The radius is required';
export const ERR_MSG_MIN_RADIUS: string = 'The radius must be greater or equal to ' + MIN_RADIUS;
export const ERR_MSG_MAX_RADIUS: string = 'The radius must be less or equal to ' + MAX_RADIUS;
export const ERR_MSG_START_DATE_REQUIRED: string = 'The start date is required';
export const ERR_MSG_END_DATE_REQUIRED: string = 'The end date is required';
export const ERR_MSG_END_DATE_AFTER_START_DATE: string = 'The end date must be after the start date';
export const ERR_MSG_DATES_YEARS_INTERVAL: string = 'The time interval must not exceed ' + MAX_YEARS_INTERVAL + ' years';
export const ERR_MSG_MIN_TAG_REQUIRED: string = 'At least one tag is required';
export const ERR_MSG_MIN_SEVERITY_REQUIRED: string = 'At least one severity is required';

// Comment
export const ERR_MSG_COMMENT_REQUIRED: string = 'The comment is required';
export const ERR_MSG_COMMENT_LENGTH: string = 'The comment must not exceed ' + MAX_COMMENT_LENGTH + ' characters';
