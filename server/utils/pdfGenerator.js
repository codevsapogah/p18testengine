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
  if (!userData || !userData.user_name) return `p18_${type}_${Date.now()}.pdf`;
  
  // Transliterate name if it contains Cyrillic
  const hasCyrillic = /[а-яА-ЯёЁәіңғүұқҚӘІҢҒҮҰЇїЎў]/g.test(userData.user_name);
  const name = hasCyrillic ? transliterate(userData.user_name) : userData.user_name;
  
  // Remove special characters and spaces, replace with underscores
  const safeName = name.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_').toLowerCase();
  
  // Create date part: YYYY-MM-DD
  const date = userData.created_at ? new Date(userData.created_at) : new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');
  
  // Combine parts
  return `${safeName}_${datePart}_${type}_p18.pdf`;
};

// Format date as: day monthName year
const formatDate = (dateStr, language) => {
  const date = new Date(dateStr || new Date());
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
 * @param {string} language - 'ru' or 'kz'
 * @param {string} id - Quiz ID
 * @param {string} baseUrl - Base URL for permalinks
 * @returns {Buffer} - PDF buffer
 */
const generateGridPDF = (userData, language, id, baseUrl) => {
  try {
    console.log('[PDF] Starting PDF generation with proper fonts and formatting');
    
    if (!userData) {
      console.error('[PDF] userData is null or undefined');
      throw new Error('No user data available');
    }
    
    if (!userData.calculated_results) {
      console.error('[PDF] calculated_results is missing in userData');
      throw new Error('No calculated results available');
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
    
    console.log(`[PDF] Generated programsArray with ${programsArray.length} items`);
    
    // Create a sorted copy just for the top scores section
    const topScores = [...programsArray].sort((a, b) => b.score - a.score).slice(0, 5);

    // Create filename
    const filename = createSafeFilename(userData, 'grid');
    console.log(`[PDF] Using filename: ${filename}`);

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      hotfixes: ['px_scaling'],
      encoding: 'UTF-8'
    });
    
    // Try to load fonts
    let fontLoaded = false;
    let fontFamily = 'helvetica';
    
    try {
      const fontsDir = path.join(__dirname, '../fonts');
      console.log(`[PDF] Looking for fonts in directory: ${fontsDir}`);
      
      // Check if directory exists
      if (!fs.existsSync(fontsDir)) {
        console.warn(`[PDF] Fonts directory does not exist: ${fontsDir}`);
        fs.mkdirSync(fontsDir, { recursive: true });
        console.log(`[PDF] Created fonts directory: ${fontsDir}`);
      }
      
      // We'll use either Roboto or NotoSans fonts if available
      let regularPath, boldPath;
      
      // Try Roboto first
      regularPath = path.join(fontsDir, 'Roboto-Regular.ttf');
      boldPath = path.join(fontsDir, 'Roboto-Bold.ttf');
      
      if (fs.existsSync(regularPath) && fs.existsSync(boldPath)) {
        console.log('[PDF] Using Roboto fonts');
        
        const regularFont = fs.readFileSync(regularPath, { encoding: 'base64' });
        const boldFont = fs.readFileSync(boldPath, { encoding: 'base64' });
        
        doc.addFileToVFS('Roboto-Regular.ttf', regularFont);
        doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
        
        doc.addFileToVFS('Roboto-Bold.ttf', boldFont);
        doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
        
        fontFamily = 'Roboto';
        fontLoaded = true;
      } else {
        // Try NotoSans as backup
        regularPath = path.join(fontsDir, 'NotoSans-Regular.ttf');
        boldPath = path.join(fontsDir, 'NotoSans-Bold.ttf');
        
        if (fs.existsSync(regularPath) && fs.existsSync(boldPath)) {
          console.log('[PDF] Using NotoSans fonts');
          
          const regularFont = fs.readFileSync(regularPath, { encoding: 'base64' });
          const boldFont = fs.readFileSync(boldPath, { encoding: 'base64' });
          
          doc.addFileToVFS('NotoSans-Regular.ttf', regularFont);
          doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
          
          doc.addFileToVFS('NotoSans-Bold.ttf', boldFont);
          doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
          
          fontFamily = 'NotoSans';
          fontLoaded = true;
        } else {
          console.warn('[PDF] No custom fonts found, using helvetica');
        }
      }
    } catch (fontError) {
      console.error('[PDF] Error loading fonts:', fontError);
      // Continue with helvetica
    }
    
    // Set the font
    doc.setFont(fontFamily);
    console.log(`[PDF] Using font family: ${fontFamily}`);
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Colors
    const orange = [255, 97, 0];   // #FF6100 - elevated
    const yellow = [255, 217, 0];  // #FFD900 - medium
    const green = [22, 163, 74];   // #16A34A - low
    const red = [220, 38, 38];     // #DC2626 - high
    const purple = [107, 70, 193]; // #6B46C1 - primary brand color (replacing blue)
    const lightBlue = [219, 234, 254]; // bg-blue-100
    
    // Header with user info
    doc.setFillColor(purple[0], purple[1], purple[2]); // #6B46C1
    doc.rect(0, 0, pageWidth, 45, 'F');
    
    // Header text - user name and title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont(fontFamily, 'bold');
    
    // Safe headers for different languages
    const headerText = language === 'ru' 
      ? `Результаты теста P18: ${userData.user_name || 'Пользователь'}`
      : `P18 тестінің нәтижелері: ${userData.user_name || 'Қолданушы'}`;
       
    doc.text(headerText, margin, 20);
    
    // User info in header
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'normal');
    
    // Date
    const date = formatDate(userData.created_at, language);
    doc.text(date, margin, 30);
    
    // User email
    if (userData.user_email) {
      doc.text(`Email: ${userData.user_email}`, margin, 38);
    }
    
    // Content starts after header
    let currentY = 60;
    
    // Title - High Results
    doc.setFontSize(16);
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
      
      doc.setFontSize(20);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFont(fontFamily, 'normal');
      doc.text(`${program.score}%`, x + cardWidth/2, currentY + (cardHeight/2) - 5, { align: 'center' });
      
      doc.setFontSize(8);
      doc.setFont(fontFamily, 'normal');
      
      // Get program name in current language
      const progName = program[language] || `Program ${program.id}`;
      
      // Handle long program names with simple wrapping
      const wrappedText = doc.splitTextToSize(progName, cardWidth - 4);
      const textY = currentY + cardHeight/2 + 5;
      
      doc.text(wrappedText, x + cardWidth/2, textY, { align: 'center' });
    });

    currentY += cardHeight + 20;

    // All Results Title
    doc.setFontSize(16);
    doc.setFont(fontFamily, 'bold');
    doc.setTextColor(44, 54, 78);
    doc.text(pdfTranslations.allResults[language], pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;

    // Add results table instead of grid for reliability
    doc.autoTable({
      startY: currentY,
      head: [['Name', 'Score']],
      body: programsArray.map(p => [
        p[language], 
        `${p.score}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [107, 70, 193], textColor: [255, 255, 255] }
    });
    
    // Footer with links
    const footerY = pageHeight - 25;
    
    // Add line break above permalink
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    // Results link 
    const resultUrl = `${baseUrl}/results/grid/${id}?lang=${language}`;
    const linkText = `${pdfTranslations.permalink[language]} ${resultUrl}`;
    
    // Draw link text
    doc.setTextColor(44, 54, 78);
    doc.setFontSize(9);
    doc.text(linkText, pageWidth / 2, footerY, { align: 'center' });
    
    // Add P18 logo in footer
    doc.setTextColor(purple[0], purple[1], purple[2]);
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'bold');
    doc.text('P18', pageWidth / 2, footerY + 8, { align: 'center' });
    
    // Create buffer with proper error handling
    try {
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
      console.log(`[PDF] PDF generated successfully, buffer size: ${pdfBuffer.length} bytes`);
      return pdfBuffer;
    } catch (bufferError) {
      console.error('[PDF] Error creating buffer:', bufferError);
      throw new Error('Failed to create PDF buffer');
    }
  } catch (error) {
    console.error('[PDF] Error generating grid PDF:', error);
    throw error;
  }
};

module.exports = {
  generateGridPDF,
  createSafeFilename
}; 