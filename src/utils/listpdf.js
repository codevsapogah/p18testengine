import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
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

export const generateListPDF = async (userData, sortedPrograms, language, translations, id) => {
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
    const purple = [107, 70, 193]; // #6B46C1 - primary brand color (replacing blue)
    const lightBlue = [219, 234, 254]; // bg-blue-100
    const defaultColor = [100, 100, 100]; // Fallback gray color
    
    // Add logo in header - simpler text-based approach
    try {
      // Use text-based logo instead of image
      doc.setTextColor(107, 70, 193); // #6B46C1
      doc.setFontSize(12);
      doc.setFont('Roboto', 'bold');
      doc.text('P18', margin + 5, margin, { align: 'center' });
      doc.link(margin, margin - 5, 15, 15, { url: 'https://p18.kz/' });
      doc.setTextColor(255, 255, 255); // Reset text color
    } catch (logoError) {
      console.warn('Logo text error:', logoError);
      // Continue without the logo - it's not critical
    }
    
    // Name and test info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('Roboto', 'bold');
    const headerText = language === 'ru' 
      ? `${userData.user_name}, вот ваши результаты теста P18`
      : `${userData.user_name}, сіздің P18 тестінің нәтижелері`;
    
    // Check if text is too long for the page width and wrap if needed
    const maxWidth = pageWidth - (margin * 2);
    const textWidth = doc.getTextWidth(headerText);
    
    // Header with user info - adjust height based on content wrapping
    const headerHeight = textWidth > maxWidth ? 55 : 45; // Taller header when text wraps
    doc.setFillColor(107, 70, 193); // #6B46C1
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // Initialize the content start position
    let currentY;
    
    if (textWidth > maxWidth) {
      // Split the text into name and message parts
      const namePart = userData.user_name;
      const messagePart = language === 'ru' 
        ? "вот ваши результаты теста P18"
        : "сіздің P18 тестінің нәтижелері";
        
      // Write name on first line
      doc.text(namePart, margin, 15);
      // Write message on second line
      doc.text(messagePart, margin, 25);
      
      // Adjust content start position for wrapped header
      currentY = 65;
    } else {
      // Original single line
      doc.text(headerText, margin, 15);
      
      // Original content start position
      currentY = 55;
    }
    
    // User info in header
    doc.setFontSize(12);
    doc.setFont('Roboto', 'normal');
    
    // Date - adjust Y position based on whether header was wrapped
    const dateY = textWidth > maxWidth ? 35 : 25;
    const date = formatDate(userData.created_at, language);
    doc.text(date, margin, dateY);
    
    // User email - adjust Y position
    const emailY = textWidth > maxWidth ? 42 : 32;
    doc.text(`Email: ${userData.user_email}`, margin, emailY);
    
    // Coach email if exists - adjust Y position
    if (userData.coach_email) {
      const coachY = textWidth > maxWidth ? 49 : 39;
      doc.text(`Коуч: ${userData.coach_email}`, margin, coachY);
    }
    
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
      if (score > 75) return 'high';       // red
      if (score >= 50) return 'elevated';  // orange
      if (score >= 25) return 'medium';    // yellow
      return 'low';                        // green
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
    
    // Use text instead of image for footer logo
    doc.setTextColor(107, 70, 193);
    doc.setFontSize(10);
    doc.setFont('Roboto', 'bold');
    doc.text('P18', pageWidth / 2, footerY + 12, { align: 'center' });
    doc.link(logoX, logoY, logoSize, logoSize, { url: 'https://p18.kz/' });
    doc.setTextColor(44, 54, 78); // Reset text color

    // Save with custom filename
    doc.save(`${filename}.pdf`);
    console.log('List PDF saved successfully');
  } catch (error) {
    console.error('List PDF generation error:', error);
    throw error;
  }
};