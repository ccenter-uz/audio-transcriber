import { describe, it, expect } from 'vitest';
import { parseToken, isTokenExpired } from './auth';

describe('Auth utilities', () => {
  const mockValidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJhZG1pbiIsImV4cCI6OTk5OTk5OTk5OSwiaWF0IjoxNTE2MjM5MDIyfQ.2ZqkFoJ1BTqU2YjOGBE3gOSoCXY7zy8vyB-u8TZ6BPE';
  const mockExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTUxNjIzOTAyMiwiaWF0IjoxNTE2MjM5MDIyfQ.h0NX8fTKaynXVuZGtUH0mUGgJB8A8MOuBmJ4GVxDKbg';

  describe('parseToken', () => {
    it('should correctly parse a valid token', () => {
      const result = parseToken(mockValidToken);
      expect(result).toEqual({
        id: '123',
        role: 'admin'
      });
    });

    it('should throw error for invalid token', () => {
      expect(() => parseToken('invalid-token')).toThrow('Invalid token format');
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid token', () => {
      expect(isTokenExpired(mockValidToken)).toBe(false);
    });

    it('should return true for expired token', () => {
      expect(isTokenExpired(mockExpiredToken)).toBe(true);
    });

    it('should return true for invalid token', () => {
      expect(isTokenExpired('invalid-token')).toBe(true);
    });
  });
});