/**
 * Format date to localized string
 * 
 * @param {string|Date} date - Date to format
 * @param {string} locale - Locale for formatting (e.g., 'ru', 'kz')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, locale = 'ru') => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      };
      
      // Map our language codes to browser locales
      const localeMap = {
        'ru': 'ru-RU',
        'kz': 'kk-KZ'
      };
      
      return dateObj.toLocaleDateString(localeMap[locale] || localeMap['ru'], options);
    } catch (error) {
      console.error('Error formatting date:', error);
      return typeof date === 'string' ? date : date.toString();
    }
  };
  
  /**
   * Format percentage number
   * 
   * @param {number} value - Value to format
   * @param {number} decimals - Number of decimal places
   * @returns {string} Formatted percentage
   */
  export const formatPercentage = (value, decimals = 0) => {
    try {
      return `${value.toFixed(decimals)}%`;
    } catch (error) {
      console.error('Error formatting percentage:', error);
      return `${value}%`;
    }
  };
  
  /**
   * Truncate text with ellipsis
   * 
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length before truncation
   * @returns {string} Truncated text
   */
  export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return `${text.substring(0, maxLength)}...`;
  };