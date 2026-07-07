import { describe, it, expect } from 'vitest';
import { sanitizeInput, isValidEmail, isValidPhone, isSafeText } from '../utils/validation';

describe('Input Sanitization & Security Validation', () => {
  describe('sanitizeInput', () => {
    it('should escape HTML special characters to prevent XSS', () => {
      const unsafe = '<script>alert("xss")</script>';
      const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
      expect(sanitizeInput(unsafe)).toBe(expected);
    });

    it('should handle normal strings without modifying them', () => {
      expect(sanitizeInput('Hello World')).toBe('Hello World');
    });

    it('should return empty string for non-string types', () => {
      expect(sanitizeInput(null as any)).toBe('');
      expect(sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('should approve correct email structures', () => {
      expect(isValidEmail('citizen@gmail.com')).toBe(true);
      expect(isValidEmail('support.service@municipality.gov')).toBe(true);
    });

    it('should reject malformed email structures', () => {
      expect(isValidEmail('citizen@gmail')).toBe(false);
      expect(isValidEmail('citizen.gmail.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should approve valid phone digits and formats', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1 555-019-2831')).toBe(true);
    });

    it('should reject invalid alphanumeric or too short phones', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('phone-number')).toBe(false);
    });
  });

  describe('isSafeText', () => {
    it('should approve standard safe paragraphs', () => {
      const res = isSafeText('I would like to report a pothole on Main Street near the bus stop.');
      expect(res.isValid).toBe(true);
    });

    it('should block inputs containing script tags', () => {
      const res = isSafeText('Please help me <script>console.log("hack")</script>');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('malicious');
    });

    it('should block inputs containing SQL commands', () => {
      const res = isSafeText('SELECT * FROM Users WHERE id = 1');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('malicious');
    });

    it('should block empty text submissions', () => {
      const res = isSafeText('   ');
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('cannot be empty');
    });
  });
});
