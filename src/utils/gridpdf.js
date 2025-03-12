import { jsPDF } from 'jspdf';
// eslint-disable-next-line no-unused-vars
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

// Get score level based on score value - match logic from data/programs.js
const getScoreLevel = (score) => {
  if (score > 80) return 'high';       // red
  if (score >= 60) return 'elevated';  // orange
  if (score >= 40) return 'medium';    // yellow
  return 'low';                        // green
};

export const generateGridPDF = (userData, sortedPrograms, language, translations, id) => {
  try {
    console.log('Starting Grid PDF download...');
    
    if (!sortedPrograms || !userData) {
      throw new Error('No results available');
    }

    // Create filename
    const filename = createSafeFilename(userData, 'grid');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      hotfixes: ['px_scaling'],
      encoding: 'UTF-8'
    });

    // Set default font to Roboto
    doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf', 'Roboto', 'normal');
    doc.addFont('https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAw.ttf', 'Roboto', 'bold');
    doc.setFont('Roboto');
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Colors from web version
    const orange = [255, 97, 0];   // #FF6100 - elevated
    const yellow = [255, 217, 0];  // #FFD900 - medium
    const green = [22, 163, 74];   // #16A34A - low
    const red = [220, 38, 38];     // #DC2626 - high
    // eslint-disable-next-line no-unused-vars
    const purple = [107, 70, 193]; // #6B46C1 - primary brand color (replacing blue)
    const lightBlue = [219, 234, 254]; // bg-blue-100
    
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
    
    // Initialize content starting position
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
      currentY = 75;
    } else {
      // Original single line
      doc.text(headerText, margin, 15);
      
      // Original content start position
      currentY = 65;
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
    
    currentY += 15;

    // High Scores Grid (top 5 scores)
    const highScores = [...sortedPrograms]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const cardWidth = (contentWidth - (4 * 4)) / 5;
    const cardHeight = cardWidth;

    highScores.forEach((program, index) => {
      const x = margin + (index * (cardWidth + 4));
      
      // Get level and colors based on score
      const level = getScoreLevel(program.score);
      let bgColor, textColor;
      
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

      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 3, 3, 'F');
      
      doc.setFontSize(30);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('Roboto', 'normal');
      doc.text(`${program.score}%`, x + cardWidth/2, currentY + (cardHeight/2) + 2, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont('Roboto', 'normal');
      let progName = program[language];
      const maxWidth = cardWidth - 4;
      
      const words = progName.split(' ');
      let lines = [];
      let currentLine = words[0];
      
      for (let i = 1; i < words.length; i++) {
        const testLine = `${currentLine} ${words[i]}`;
        if (doc.getTextWidth(testLine) <= maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);

      const lineHeight = 3;
      // eslint-disable-next-line no-unused-vars
      const totalTextHeight = lines.length * lineHeight;
      let textY = currentY + cardHeight/2 + 8;

      lines.forEach(line => {
        doc.text(line, x + cardWidth/2, textY, { align: 'center' });
        textY += lineHeight;
      });
    });

    currentY += cardHeight + 20;

    // All Results Title
    doc.setFontSize(20);
    doc.setFont('Roboto', 'bold');
    doc.setTextColor(44, 54, 78);
    doc.text(translations.allResults[language], pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;

    // All Results Grid
    const gridColumns = 6;
    const smallCardWidth = (contentWidth - ((gridColumns - 1) * 4)) / gridColumns;
    const smallCardHeight = smallCardWidth;
    let gridX = margin;
    let gridY = currentY;

    sortedPrograms.forEach((program, index) => {
      if (index > 0 && index % gridColumns === 0) {
        gridX = margin;
        gridY += smallCardHeight + 4;
      }

      // Get level and colors based on score
      const level = getScoreLevel(program.score);
      let bgColor, textColor;
      
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

      doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
      doc.roundedRect(gridX, gridY, smallCardWidth, smallCardHeight, 3, 3, 'F');
      
      doc.setFontSize(22);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont('Roboto', 'normal');
      doc.text(`${program.score}%`, gridX + smallCardWidth/2, gridY + (smallCardHeight/2) + 1, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont('Roboto', 'normal');
      let progName = program[language];
      const maxWidth = smallCardWidth - 4;
      
      const words = progName.split(' ');
      let lines = [];
      let currentLine = words[0];
      
      for (let i = 1; i < words.length; i++) {
        const testLine = `${currentLine} ${words[i]}`;
        if (doc.getTextWidth(testLine) <= maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = words[i];
        }
      }
      lines.push(currentLine);

      const lineHeight = 2.5;
      // eslint-disable-next-line no-unused-vars
      const totalTextHeight = lines.length * lineHeight;
      let textY = gridY + smallCardHeight/2 + 5;

      lines.forEach(line => {
        doc.text(line, gridX + smallCardWidth/2, textY, { align: 'center' });
        textY += lineHeight;
      });

      gridX += smallCardWidth + 4;
    });

    // Footer with links
    const footerY = pageHeight - 25;
    
    // Add line break above permalink
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    // Results link with light blue background
    const resultUrl = `${window.location.origin}/results/grid/${id}?lang=${language}`;
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
    doc.setTextColor(107, 70, 193); // #6B46C1
    doc.setFontSize(10);
    doc.setFont('Roboto', 'bold');
    doc.text('P18', pageWidth / 2, footerY + 12, { align: 'center' });
    doc.link(logoX, logoY, logoSize, logoSize, { url: 'https://p18.kz/' });
    doc.setTextColor(44, 54, 78); // Reset text color

    // Save with custom filename
    doc.save(`${filename}.pdf`);
    console.log('Grid PDF saved successfully');
  } catch (error) {
    console.error('Grid PDF generation error:', error);
    throw error;
  }
}; 