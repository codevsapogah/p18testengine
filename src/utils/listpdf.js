import { jsPDF } from 'jspdf';
import { levelTranslations } from '../data/programs';

// Transliterate Cyrillic to Latin
const transliterate = (text) => {
  const cyrillicToLatin = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya', 'қ': 'q', 'ғ': 'g', 'ң': 'ng', 'ү': 'u', 'ұ': 'u', 'һ': 'h', 'ә': 'a',
    'і': 'i', 'ө': 'o',
    
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'E', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu',
    'Я': 'Ya', 'Қ': 'Q', 'Ғ': 'G', 'Ң': 'Ng', 'Ү': 'U', 'Ұ': 'U', 'Һ': 'H', 'Ә': 'A',
    'І': 'I', 'Ө': 'O'
  };

  return text.split('').map(char => cyrillicToLatin[char] || char).join('');
};

// Create a safe filename
const createSafeFilename = (userData, type) => {
  if (!userData || !userData.user_name) return `p18_${type}`;
  
  // Transliterate name if it contains Cyrillic
  const hasCyrillic = /[а-яА-ЯёЁәіңғүұқҚӘІҢҒҮҰЇїЎў]/g.test(userData.user_name);
  const name = hasCyrillic ? transliterate(userData.user_name) : userData.user_name;
  
  // Remove special characters and spaces, replace with underscores
  const safeName = name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').toLowerCase();
  
  // Create date part: YYYY-MM-DD
  const date = new Date(userData.created_at);
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
  
  // Combine parts
  return `${safeName}_${datePart}_${type}_p18`;
};

// Format date as: day monthName year
const formatDate = (dateStr, language) => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const year = date.getFullYear();
  
  const monthsRu = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];
  
  const monthsKz = [
    'қаңтар', 'ақпан', 'наурыз', 'сәуір', 'мамыр', 'маусым', 
    'шілде', 'тамыз', 'қыркүйек', 'қазан', 'қараша', 'желтоқсан'
  ];
  
  const month = language === 'ru' ? monthsRu[date.getMonth()] : monthsKz[date.getMonth()];
  const suffix = language === 'ru' ? ' г.' : ' ж.';
  
  return `${day} ${month} ${year}${suffix}`;
};

export const generateListPDF = (userData, sortedPrograms, language, translations, id) => {
  try {
    console.log('Starting List PDF download...');
    
    if (!sortedPrograms || !userData) {
      throw new Error('No results available');
    }

    // Create filename
    const filename = createSafeFilename(userData, 'list');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      hotfixes: ['px_scaling'],
      encoding: 'UTF-8'
    });
    
    // Load and set Roboto font
    try {
      doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', 'Roboto', 'normal');
      doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf', 'Roboto', 'bold');
      doc.setFont('Roboto', 'normal');
      console.log('Fonts loaded successfully');
    } catch (fontError) {
      console.warn('Font loading error, using default font:', fontError);
      // Will use default font if Roboto fails to load
    }
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Colors from web version - align with data/programs.js
    const orange = [255, 97, 0];   // #FF6100 - elevated
    const yellow = [255, 217, 0];  // #FFD900 - medium
    const green = [22, 163, 74];   // #16A34A - low
    const red = [220, 38, 38];     // #DC2626 - high
    // eslint-disable-next-line no-unused-vars
    const blue = [63, 86, 217];    // Royal blue
    const lightBlue = [219, 234, 254]; // bg-blue-100
    const defaultColor = [100, 100, 100]; // Fallback gray color
    
    // Add logo in header - with error handling
    try {
      // Use a small embedded base64 P18 logo instead of external file
      const logoBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjEuMiAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjMtMDctMDFUMTU6NTk6MDcrMDY6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTA3LTAxVDE2OjA2OjQ4KzA2OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIzLTA3LTAxVDE2OjA2OjQ4KzA2OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjNlYjVkMjQ3LTQyYjctNDRiZC05OTQ2LTk3YzliZDhkMzVlNyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDozZWI1ZDI0Ny00MmI3LTQ0YmQtOTk0Ni05N2M5YmQ4ZDM1ZTciIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDozZWI1ZDI0Ny00MmI3LTQ0YmQtOTk0Ni05N2M5YmQ4ZDM1ZTciPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNlYjVkMjQ3LTQyYjctNDRiZC05OTQ2LTk3YzliZDhkMzVlNyIgc3RFdnQ6d2hlbj0iMjAyMy0wNy0wMVQxNTo1OTowNyswNjowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjIgKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+eNh/6QAABT1JREFUaIHVmntsU1Ucxz/n3t7e2w5KN7bBmINhBoMixAm+UBNffyiJJkZJfAYfASXRoImJ8YEaE/8xUf9QE41EjVGJD6KYICjyo5I4RKMoG3Mb60TYHNvaruv6xz1extr13tW1Gy/JTds953fO+Z3ze553SrLxUC/1MAxhJNY3WgLFQGMk1jfiOngqBx4UwmQn6cxMY5nKSFlqqgCnFj+lYM7ZxIFnDNKAYhkqd6K+AmwG4KFUgVJgJdCrK1BjoKoKsXu0BIoBBYGCxlSwFYjVZKFl9MwCT3QEioVGQEfB2gnAfNUhLRU5CQRUeWOJRQDbUkY0QGkz5HvoBQnACOCcLhQpPmZaBPHaLtQH2PvwLcXEwD2AyWgLZIPGANZ3UQbQ7dOksoE6TSBTFYQB1C4YmAW+7IL6wCG3O88JYOW4yoxRgIx7ld0CHQHUh9AXuMVlzq0BnLvQ0cEHRtSgSFgElMkpMYoIZYr9gZw3GfMOUFGvE9vhNm2EAYwYP2l0wDIUTgCNUmKhsF3t5ByJGQZDPY7wMrp++Ao0I0FmIHKX7qgz1+JHHZHl9qzRCrhxnQS6MxlFhveBUXXBJ1j0uFvXECbG7kKJa1u4AZ+TMRpgwN1+Ac22ZcuyjH5Ip4TYu9CwtNS1PVvwNRnDgBxnS2QDvjahKMCwOzAUFcj3YHDRZZFsD9UlQP5tqAhwG/WUcYm6Ecg3Ck02/BKqy37g+iSuLPiag1VAnSOLqZyZSvW9Aa+38LsGtXJdN4U7r2AFyv1M9RfVFd8lXZpAYdJXVd3wpdBlQO1+DqbKQlGdyblLFngcfBZAdZGGlpU0YHZu+cHZGCYgCs2rMJCCJQxUd/kHKRjg3ISGIcQEhFJ1m38n16ZGCCEEQmQglaJeWkAYQkogXS/53uckQbLx0N+Mk0uxcCnwHfANsAm4DGxBZXiJ+E8wFdgBnB/0fQVqV5qVUK8FmqBMIKZAiihwMEtJLgBvJj4fAiuBbVi8iOJpfnYk+M+xE/gCWIqKWNqB7cA6YC9CA4ZhiYkhwWEECEsQlOABWpDuGYp9QGu876vAT3HZs/G2vUBT/PsI8CCWhRuXCqGHhShMgEUdCpsq0IhSWELX4H7lNeBZ4D1HuzZgDfAisG9Y/ziwGHgbSDnKHgI2AAcQhHBZRJHIRG13UGISCoNQwMJAWgTJbpveLuDKCO1XcI7n61i8g2RwM/U+MAPYC/xD9vAcGMoAaQVELAQ+J7vXaJ41i7pHH2XKmWMcefnlnI16CtiYZ9/15G+MRcA2JOJ7DTLBDOBn4DEcJwlNLF6Md+lS6qZPJ3jhAoce3JVzfN+TLkAO8ClwPM9xtQIf5yg/FvgJiUdKPQQ8gdO+NLFkCbZhwOrVoydAHRrz0xxl24C7cghRB+xEinmaHmAS8Ed6xXCZLa2kJIeAT6JONgZoAGahNvKEBTQ2JtqbmoDMgw0dJDOVlcALOMkdgGGAwBkMIWYCN9JLtQNrcfZnC+YBi4a2SCb6+/k3eol2bW2i7fz53I2pAyzgI5zRVR9wB7AT+B6YMqTeMHdsMoFOYDeYRVwQDGKbJpF4+I2FCyESX+7U1dXlbEw3eoCHGX7UTeAM0AY8BXyQTGD79v/0Op2IMMf8vLYIu76+uHeiUmE/cA96cZUTg4t4WC7PTiwVtJCMKQ80nEfSh+ZROA0sBY4WSoAasR+4F/i9UIP8B9gH+kPbrJrsAAAAAElFTkSuQmCC';
      
      // Add the logo
      doc.addImage(logoBase64, 'PNG', margin, margin - 5, 15, 15);
      doc.link(margin, margin - 5, 15, 15, { url: 'https://p18.kz/' });
    } catch (logoError) {
      console.warn('Logo image could not be loaded:', logoError);
      // Continue without the logo - it's not critical
    }
    
    // Header with user info
    doc.setFillColor(239, 68, 68); // #EF4444
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Name and test info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('Roboto', 'bold');
    const headerText = language === 'ru' 
      ? `${userData.user_name}, вот ваши результаты теста P18`
      : `${userData.user_name}, сіздің P18 тестінің нәтижелері`;
    doc.text(headerText, margin, 15);
    
    // User info in header
    doc.setFontSize(12);
    doc.setFont('Roboto', 'normal');
    
    // Date
    const date = formatDate(userData.created_at, language);
    doc.text(date, margin, 25);
    
    // User email
    doc.text(`Email: ${userData.user_email}`, margin, 32);
    
    // Coach email if exists
    if (userData.coach_email) {
      doc.text(`Коуч: ${userData.coach_email}`, margin, 39);
    }
    
    let currentY = 55;

    // Title - High Results
    doc.setFontSize(20);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(44, 54, 78);
    doc.text(translations.title[language], pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 8;

    // High Scores (top 5 scores)
    const highScores = [...sortedPrograms]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    const cardWidth = (contentWidth - (4 * 4)) / 5;
    const cardHeight = cardWidth * 0.8; // Reduced height to save space

    // Get score level based on score value - match logic from data/programs.js
    const getScoreLevel = (score) => {
      if (score > 80) return 'high';       // red
      if (score >= 60) return 'elevated';  // orange
      if (score >= 40) return 'medium';    // yellow
      return 'low';                       // green
    };

    highScores.forEach((program, index) => {
      const x = margin + (index * (cardWidth + 4));
      
      // Set colors based on calculated level
      let bgColor, textColor;
      
      if (!program || typeof program.score !== 'number') {
        bgColor = defaultColor;
        textColor = [255, 255, 255];
      } else {
        const level = getScoreLevel(program.score);
        
        if (level === 'high') {
          bgColor = red;
          textColor = [255, 255, 255];
        } else if (level === 'elevated') {
          bgColor = orange;
          textColor = [255, 255, 255];
        } else if (level === 'medium') {
          bgColor = yellow;
          textColor = [0, 0, 0];
        } else { // low
          bgColor = green;
          textColor = [255, 255, 255];
        }
      }

      // Draw card
      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 3, 3, 'F');
      
      // Draw percentage
      doc.setFontSize(24); // Smaller font
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('Roboto', 'normal');
      doc.text(`${Math.round(program.score)}%`, x + cardWidth/2, currentY + (cardHeight/2) - 2, { align: 'center' });
      
      // Draw program name
      doc.setFontSize(7); // Smaller font
      doc.setFont('Roboto', 'normal');
      let progName = program[language] || '';
      const maxWidth = cardWidth - 4;
      
      const words = progName.split(' ');
      let lines = [];
      let currentLine = words[0] || '';
      
      for (let i = 1; i < words.length; i++) {
        const testLine = `${currentLine} ${words[i]}`;
        if (doc.getTextWidth(testLine) > maxWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
      
      const lineHeight = 3;
      let textY = currentY + cardHeight - (lines.length * lineHeight) - 3;
      lines.forEach(line => {
        doc.text(line, x + cardWidth/2, textY, { align: 'center' });
        textY += lineHeight;
      });
    });
    
    currentY += cardHeight + 10;

    // Title - All Results
    doc.setFontSize(20);
    doc.setFont('Roboto', 'bold');
    doc.text(translations.allResults[language], pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 8;
    
    // Draw list of all results
    const rowHeight = 8; // Reduced row height
    const col1 = margin;
    const nameWidth = 65;
    const col2 = col1 + nameWidth + 5;
    const barWidth = 50;
    const col3 = col2 + barWidth + 10;
    const col4 = col3 + 15;
    const pillWidth = 28;
    
    // Draw column headers
    doc.setFontSize(7);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(translations.program[language], col1, currentY);
    doc.text('%', col3, currentY, { align: 'center' });
    doc.text(translations.category[language], col4 + pillWidth/2, currentY, { align: 'center' });
    
    currentY += 5;
    
    // Set up colors for different levels with defaults - align with data/programs.js
    const levelColors = {
      low: green,
      medium: yellow,
      elevated: orange,
      high: red,
      default: defaultColor
    };
    
    const levelTextColors = {
      low: [255, 255, 255],
      medium: [0, 0, 0],
      elevated: [255, 255, 255],
      high: [255, 255, 255],
      default: [255, 255, 255]
    };
    
    // Keep original unsorted order
    sortedPrograms.forEach((program, index) => {
      if (!program) return; // Skip undefined programs
      
      // Draw program name
      doc.setFontSize(8);
      doc.setFont('Roboto', 'normal');
      doc.setTextColor(44, 54, 78);
      
      let progName = program[language] || '';
      if (doc.getTextWidth(progName) > nameWidth) {
        while (doc.getTextWidth(progName + "...") > nameWidth) {
          progName = progName.slice(0, -1);
        }
        progName += "...";
      }
      
      doc.text(progName, col1, currentY + 3);
      
      // Calculate score level
      const score = program.score || 0;
      const level = getScoreLevel(score);
      
      // Get the appropriate colors for the level
      const color = levelColors[level] || levelColors.default;
      const textColor = levelTextColors[level] || levelTextColors.default;
      
      // Draw progress bar
      const barHeight = 3.5;
      
      // Draw background bar (gray)
      doc.setFillColor(229, 231, 235);
      doc.roundedRect(col2, currentY + 1, barWidth, barHeight, 1.5, 1.5, 'F');
      
      // Fill progress with appropriate color
      doc.setFillColor(color[0], color[1], color[2]);
      const progressWidth = Math.min((score / 100) * barWidth, barWidth);
      doc.roundedRect(col2, currentY + 1, progressWidth, barHeight, 1.5, 1.5, 'F');
      
      // Draw percentage
      doc.setFontSize(8);
      doc.text(`${Math.round(score)}%`, col3, currentY + 3, { align: 'center' });
      
      // Draw level pill
      const pillHeight = 5;
      const pillY = currentY + 1;
      
      // Get localized level name from levelTranslations imported directly
      const categoryText = levelTranslations[level]?.[language] || level;
      
      // Draw pill background
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(col4, pillY - 1, pillWidth, pillHeight, 2, 2, 'F');
      
      // Draw pill text
      doc.setFont('Roboto', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.text(categoryText, col4 + pillWidth/2, pillY + 1.8, { align: 'center' });
      
      // Reset text color for next row
      doc.setTextColor(44, 54, 78);
      
      currentY += rowHeight;
    });
    
    // Footer with links
    const footerY = pageHeight - 25;
    
    // Add line break above permalink
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    // Results link with light blue background
    const resultUrl = `${window.location.origin}/results/list/${id}?lang=${language}`;
    const linkText = `${translations.permalink[language]} ${resultUrl}`;
    
    // Center the blue box horizontally
    const boxWidth = Math.min(pageWidth - 40, 180);
    const boxHeight = 12;
    const boxX = (pageWidth - boxWidth) / 2;
    const boxY = footerY - 4;
    
    // Draw light blue background
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'F');
    
    // Draw link text centered with two line breaks before
    doc.setTextColor(44, 54, 78);
    doc.setFontSize(9);
    doc.text(linkText, pageWidth / 2, footerY + 3, { align: 'center' });
    
    // Add P18 logo in footer (clickable)
    const logoSize = 8;
    const logoX = (pageWidth - logoSize) / 2;
    const logoY = footerY + 8;
    doc.addImage('/logo192.png', 'PNG', logoX, logoY, logoSize, logoSize);
    // Add clickable link to the logo
    doc.link(logoX, logoY, logoSize, logoSize, { url: 'https://p18.kz/' });

    // Save with custom filename
    doc.save(`${filename}.pdf`);
    console.log('List PDF saved successfully');
  } catch (error) {
    console.error('List PDF generation error:', error);
    throw error;
  }
};