/**
 * Sanitizes an input string by escaping HTML characters to prevent XSS attacks.
 */
export function sanitizeInput(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates whether an email address format is correct.
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates whether a phone number matches standard patterns (e.g., 10 digits or international formats).
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  // Matches optional +, followed by 10 to 15 digits, allowing spaces, dashes, or parentheses
  const phoneRegex = /^\+?(\d[\d-. ]{8,14}\d)$/;
  return phoneRegex.test(phone.trim());
}

/**
 * Validates text length and checks for obvious malicious SQL/Script inject keywords.
 */
export function isSafeText(text: string, maxLength: number = 2000): { isValid: boolean; error?: string } {
  if (!text || text.trim() === '') {
    return { isValid: false, error: 'Input cannot be empty.' };
  }

  if (text.length > maxLength) {
    return { isValid: false, error: `Input exceeds maximum length of ${maxLength} characters.` };
  }

  const lowerText = text.toLowerCase();
  const injectionPatterns = [
    '<script',
    'javascript:',
    'onload=',
    'onerror=',
    'onclick=',
    'union select',
    'insert into',
    'drop table',
    'select * from'
  ];

  for (const pattern of injectionPatterns) {
    if (lowerText.includes(pattern)) {
      return { isValid: false, error: 'Potential malicious content detected.' };
    }
  }

  return { isValid: true };
}
