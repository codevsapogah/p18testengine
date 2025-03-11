const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');
const path = require('path');

// Program names mapping
const programNames = {
  1: { ru: 'Эмоциональный голод', kz: 'Эмоционалды аштық' },
  2: { ru: 'Покинутость', kz: 'Тастанды' },
  3: { ru: 'Использование', kz: 'Пайдалану' },
  4: { ru: 'Отверженность', kz: 'Қабылданбау' },
  5: { ru: 'Поломанность', kz: 'Сынық' },
  6: { ru: 'Провал', kz: 'Сәтсіздік' },
  7: { ru: 'Беспомощность', kz: 'Дәрменсіздік' },
  8: { ru: 'Пророчество', kz: 'Болжам' },
  9: { ru: 'Растворение', kz: 'Басқаға еру' },
  10: { ru: 'Подчинение', kz: 'Бағыну' },
  11: { ru: 'Самопожертвование', kz: 'Өзін құрбан ету' },
  12: { ru: 'Эмоциональная ингибиция', kz: 'Эмоцияны ұстау' },
  13: { ru: 'Перфекционизм', kz: 'Перфекционизм' },
  14: { ru: 'Надменность', kz: 'Менмендік' },
  15: { ru: 'Отсутствие дисциплины', kz: 'Дисциплина жоқтығы' },
  16: { ru: 'Поиск признания', kz: 'Мойындалуды іздеу' },
  17: { ru: 'Пессимизм', kz: 'Пессимизм' },
  18: { ru: 'Инструкции', kz: 'Ережелер' }
};

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

// Get score level based on score value
const getScoreLevel = (score) => {
  if (score > 80) return 'high';       // red
  if (score >= 60) return 'elevated';  // orange
  if (score >= 40) return 'medium';    // yellow
  return 'low';                        // green
};

// Translations for PDF
const pdfTranslations = {
  title: {
    ru: 'Высокие результаты',
    kz: 'Жоғары нәтижелер'
  },
  allResults: {
    ru: 'Все результаты',
    kz: 'Барлық нәтижелер'
  },
  permalink: {
    ru: 'Постоянная ссылка на результаты:',
    kz: 'Нәтижелерге тұрақты сілтеме:'
  }
};

// Get program name by ID
const getProgramName = (id, language) => {
  if (programNames[id] && programNames[id][language]) {
    return programNames[id][language];
  }
  return `Program ${id}`;
};

/**
 * Generate a PDF buffer with grid-style results visualization
 * @param {Object} userData - User data object
 * @param {Array} sortedPrograms - Programs data with scores
 * @param {string} language - 'ru' or 'kz'
 * @param {string} id - Quiz ID
 * @param {string} baseUrl - Base URL for permalinks
 * @returns {Buffer} - PDF buffer
 */
const generateGridPDF = (userData, language, id, baseUrl) => {
  try {
    console.log('Generating Grid PDF...');
    
    if (!userData || !userData.calculated_results) {
      throw new Error('No results available');
    }

    // Convert results into programs array (without sorting for all results)
    const programsArray = Object.entries(userData.calculated_results || {}).map(([key, data]) => {
      // Try to parse the key as a number for program ID
      const programId = parseInt(key, 10);
      return {
        id: programId,
        ru: isNaN(programId) ? key : getProgramName(programId, 'ru'),
        kz: isNaN(programId) ? key : getProgramName(programId, 'kz'),
        score: Math.round(data.score || 0),
      };
    });
    
    // Create a sorted copy just for the top scores section
    const topScores = [...programsArray].sort((a, b) => b.score - a.score).slice(0, 5);

    // Create filename using the same function as gridpdf.js
    const filename = createSafeFilename(userData, 'grid');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      hotfixes: ['px_scaling'],
      encoding: 'UTF-8'
    });
    
    // Load fonts from local files
    let fontLoaded = false;
    try {
      const fontsDir = path.join(__dirname, '../fonts');
      
      // Check if Roboto font files exist
      const robotoRegularPath = path.join(fontsDir, 'Roboto-Regular.ttf');
      const robotoBoldPath = path.join(fontsDir, 'Roboto-Bold.ttf');
      
      if (fs.existsSync(robotoRegularPath)) {
        const robotoRegularFont = fs.readFileSync(robotoRegularPath, { encoding: 'base64' });
        doc.addFileToVFS('Roboto-Regular.ttf', robotoRegularFont);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        
        if (fs.existsSync(robotoBoldPath)) {
          const robotoBoldFont = fs.readFileSync(robotoBoldPath, { encoding: 'base64' });
          doc.addFileToVFS('Roboto-Bold.ttf', robotoBoldFont);
          doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
        }
        
        // Set default font to Roboto if available
        doc.setFont('Roboto');
        fontLoaded = true;
        console.log('Using Roboto fonts from local files');
      } else {
        // Fallback to helvetica if Roboto is not available
        console.log('Roboto fonts not found, using helvetica');
        doc.setFont('helvetica');
      }
    } catch (fontError) {
      console.warn('Error loading fonts:', fontError);
      // Fallback to helvetica
      doc.setFont('helvetica');
    }
    
    // Store the font name to use throughout the document
    const fontFamily = fontLoaded ? 'Roboto' : 'helvetica';
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Colors from web version
    const orange = [255, 97, 0];   // #FF6100 - elevated
    const yellow = [255, 217, 0];  // #FFD900 - medium
    const green = [22, 163, 74];   // #16A34A - low
    const red = [220, 38, 38];     // #DC2626 - high
    const blue = [42, 20, 204];    // #2a14cc - Royal blue
    const lightBlue = [219, 234, 254]; // bg-blue-100
    
    // Add logo in header - simpler text-based approach
    try {
      doc.setTextColor(blue[0], blue[1], blue[2]);
      doc.setFontSize(12);
      doc.setFont(fontFamily, 'bold');
      doc.text('P18', margin + 5, margin, { align: 'center' });
      doc.setTextColor(255, 255, 255); // Reset text color
    } catch (logoError) {
      console.warn('Logo text error:', logoError);
    }
    
    // Name and test info
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(fontFamily, 'bold');
    const headerText = language === 'ru' 
      ? `${userData.user_name}, вот ваши результаты теста P18`
      : `${userData.user_name}, сіздің P18 тестінің нәтижелері`;
       
    // Check if text is too long for the page width and wrap if needed
    const maxWidth = pageWidth - (margin * 2);
    const textWidth = doc.getTextWidth(headerText);
    
    // Header with user info - adjust height based on content wrapping
    const headerHeight = textWidth > maxWidth ? 55 : 45; // Taller header when text wraps
    doc.setFillColor(blue[0], blue[1], blue[2]); // #2a14cc
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
    doc.setFont(fontFamily, 'normal');
    
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
    doc.setFont(fontFamily, 'bold');
    doc.setTextColor(44, 54, 78);
    doc.text(pdfTranslations.title[language], pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;

    // High Scores Grid (top 5 scores)
    const cardWidth = (contentWidth - (4 * 4)) / 5;
    const cardHeight = cardWidth;

    topScores.forEach((program, index) => {
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
      doc.setFont(fontFamily, 'normal');
      doc.text(`${program.score}%`, x + cardWidth/2, currentY + (cardHeight/2) + 2, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont(fontFamily, 'normal');
      let progName = program[language];
      const maxWidth = cardWidth - 4;
      
      // Handle long program names
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
      let textY = currentY + cardHeight/2 + 8;

      lines.forEach(line => {
        doc.text(line, x + cardWidth/2, textY, { align: 'center' });
        textY += lineHeight;
      });
    });

    currentY += cardHeight + 20;

    // All Results Title
    doc.setFontSize(20);
    doc.setFont(fontFamily, 'bold');
    doc.setTextColor(44, 54, 78);
    doc.text(pdfTranslations.allResults[language], pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;

    // All Results Grid - using original order, not sorted
    const gridColumns = 6;
    const smallCardWidth = (contentWidth - ((gridColumns - 1) * 4)) / gridColumns;
    const smallCardHeight = smallCardWidth;
    let gridX = margin;
    let gridY = currentY;

    programsArray.forEach((program, index) => {
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
      doc.setFont(fontFamily, 'normal');
      doc.text(`${program.score}%`, gridX + smallCardWidth/2, gridY + (smallCardHeight/2) + 1, { align: 'center' });
      
      doc.setFontSize(7);
      doc.setFont(fontFamily, 'normal');
      let progName = program[language];
      const maxWidth = smallCardWidth - 4;
      
      // Handle long program names
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
    const resultUrl = `${baseUrl}/results/grid/${id}?lang=${language}`;
    const linkText = `${pdfTranslations.permalink[language]} ${resultUrl}`;
    
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
    
    // Add P18 logo in footer
    doc.setTextColor(blue[0], blue[1], blue[2]);
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'bold');
    doc.text('P18', pageWidth / 2, footerY + 12, { align: 'center' });
    // Add clickable link to the P18 logo
    const logoHeight = 8;
    const logoWidth = 15;
    const logoX = (pageWidth - logoWidth) / 2;
    const logoY = footerY + 8;
    doc.link(logoX, logoY, logoWidth, logoHeight, { url: 'https://p18.kz' });
    doc.setTextColor(44, 54, 78); // Reset text color

    // Return PDF as buffer
    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Grid PDF generation error:', error);
    throw error;
  }
};

module.exports = {
  generateGridPDF,
  createSafeFilename
}; 