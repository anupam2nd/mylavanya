
/**
 * Utility functions for synthetic email generation and handling
 */

export const SYNTHETIC_EMAIL_DOMAIN = '@member.mylavanya.com';
export const COUNTRY_CODE = '91';

/**
 * Generate synthetic email from phone number
 * Format: +91{phoneNumber}@member.mylavanya.com
 */
export const generateSyntheticEmail = (phoneNumber: string): string => {
  const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove all non-digits
  return `${COUNTRY_CODE}${cleanPhone}${SYNTHETIC_EMAIL_DOMAIN}`;
};

/**
 * Check if an email is a synthetic email
 */
export const isSyntheticEmail = (email: string): boolean => {
  return email.includes(SYNTHETIC_EMAIL_DOMAIN);
};

/**
 * Extract phone number from synthetic email
 */
export const extractPhoneFromSyntheticEmail = (syntheticEmail: string): string => {
  if (!isSyntheticEmail(syntheticEmail)) {
    return '';
  }
  
  const parts = syntheticEmail.split('@')[0];
  return parts.replace(COUNTRY_CODE, '');
};

/**
 * Determine if input is email or phone number
 */
export const isEmailInput = (input: string): boolean => {
  return input.includes('@') && !isSyntheticEmail(input);
};

/**
 * Determine if input is phone number
 */
export const isPhoneInput = (input: string): boolean => {
  const cleanInput = input.replace(/\D/g, '');
  return cleanInput.length === 10 && /^\d{10}$/.test(cleanInput);
};

/**
 * Convert user input to appropriate format for authentication
 * If phone number: convert to synthetic email
 * If email: use as is
 */
export const convertToAuthFormat = (input: string): string => {
  const trimmedInput = input.trim();
  
  if (isPhoneInput(trimmedInput)) {
    return generateSyntheticEmail(trimmedInput);
  }
  
  return trimmedInput.toLowerCase();
};
