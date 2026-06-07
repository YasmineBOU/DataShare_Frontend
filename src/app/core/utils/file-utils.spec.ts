import { getIconByExtension, getIconByStatus, formatFileSize, getExpirationDaysMessage } from './file-utils';

describe('file-utils', () => {

  describe('getIconByExtension', () => {
    it('should return icon for known extension', () => {
      const icon = getIconByExtension('document.pdf');

      expect(icon).toBeTruthy();
      expect(typeof icon).toBe('string');
    });

    it('should return default icon for unknown extension', () => {
      const defaultIcon = getIconByExtension('file.unknownExtension');

      expect(defaultIcon).toBeTruthy();
      expect(typeof defaultIcon).toBe('string');
    });

    it('should be case-insensitive for extension', () => {
      expect(getIconByExtension('file.PDF')).toBe(getIconByExtension('file.pdf'));
      expect(getIconByExtension('file.TXT')).toBe(getIconByExtension('file.txt'));
    });

    it('should handle files with multiple dots', () => {
      const icon = getIconByExtension('archive.tar.gz');
      expect(icon).toBeTruthy();
    });
  });

  describe('getIconByStatus', () => {
    it('should return icon for known status', () => {
      const icon = getIconByStatus('safe');
      expect(icon).toBeTruthy();
    });

    it('should return default icon for unknown status', () => {
      const icon = getIconByStatus('unknownstatus');
      expect(icon).toBeTruthy();
    });
  });

  describe('formatFileSize', () => {
    it('should return "0 octets" for 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0 octets');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(512)).toBe('512 octets');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 Ko');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 Mo');
    });

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 Go');
    });

    it('should respect decimals parameter', () => {
      expect(formatFileSize(1500, 0)).toBe('1 Ko');
      expect(formatFileSize(1500, 2)).toBe('1.46 Ko');
    });
  });

  describe('getExpirationDaysMessage', () => {
    it('should return "aujourd\'hui" for today', () => {
      const today = new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(); // in 6 hours
      const [msg, days] = getExpirationDaysMessage(today);
      expect(msg).toBe('aujourd\'hui');
      expect(days).toBe(0);
    });

    it('should return "demain" for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 1000 * 3600 * 30).toISOString(); // in 30 hours
      const [msg, days] = getExpirationDaysMessage(tomorrow);
      expect(msg).toBe('demain');
      expect(days).toBe(1);
    });

    it('should return plural days message for more than 1 day', () => {
      const inFiveDays = new Date(Date.now() + 1000 * 3600 * 24 * 5).toISOString();
      const [msg, days] = getExpirationDaysMessage(inFiveDays);
      expect(msg).toBe('dans 5 jours');
      expect(days).toBe(5);
    });
  });
});