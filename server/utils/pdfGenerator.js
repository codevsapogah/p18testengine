const { jsPDF } = require('jspdf');
require('jspdf-autotable');
const fs = require('fs');
const path = require('path');

// Program names mapping from programs.js
const programs = [
  { id: 1, ru: 'Эмоциональный голод', kz: 'Эмоционалды аштық' },
  { id: 2, ru: 'Покинутость', kz: 'Тастанды' },
  { id: 3, ru: 'Использование', kz: 'Пайдалану' },
  { id: 4, ru: 'Отверженность', kz: 'Қабылданбау' },
  { id: 5, ru: 'Поломанность', kz: 'Сынық' },
  { id: 6, ru: 'Провал', kz: 'Сәтсіздік' },
  { id: 7, ru: 'Беспомощность', kz: 'Дәрменсіздік' },
  { id: 8, ru: 'Пророчество', kz: 'Болжам' },
  { id: 9, ru: 'Растворение', kz: 'Басқаға еру' },
  { id: 10, ru: 'Подчинение', kz: 'Бағыну' },
  { id: 11, ru: 'Самопожертвование', kz: 'Өзін құрбан ету' },
  { id: 12, ru: 'Эмоциональная ингибиция', kz: 'Эмоцияны ұстау' },
  { id: 13, ru: 'Перфекционизм', kz: 'Перфекционизм' },
  { id: 14, ru: 'Надменность', kz: 'Менмендік' },
  { id: 15, ru: 'Отсутствие дисциплины', kz: 'Дисциплина жоқтығы' },
  { id: 16, ru: 'Поиск признания', kz: 'Мойындалуды іздеу' },
  { id: 17, ru: 'Пессимизм', kz: 'Пессимизм' },
  { id: 18, ru: 'Инструкции', kz: 'Ережелер' }
];

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
  if (score >= 75) return 'high';
  if (score >= 50) return 'elevated';
  if (score >= 25) return 'medium';
  return 'low';
};

// Translations for PDF
const translations = {
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
  const program = programs.find(p => p.id === id);
  return program ? program[language] : `Program ${id}`;
};

/**
 * Generate a PDF buffer with grid-style results visualization
 */
const generateGridPDF = (userData, language, id, baseUrl) => {
  try {
    if (!userData || !userData.calculated_results) {
      throw new Error('No results available');
    }

    // Convert results into programs array
    const programsArray = Object.entries(userData.calculated_results).map(([key, value]) => {
      const programId = parseInt(key.replace('program_', ''), 10);
      return {
        id: programId,
        ru: getProgramName(programId, 'ru'),
        kz: getProgramName(programId, 'kz'),
        score: Math.round(value),
        category: getScoreLevel(Math.round(value))
      };
    });

    // Create filename
    const filename = createSafeFilename(userData, 'grid');

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      hotfixes: ['px_scaling'],
      encoding: 'UTF-8'
    });

    // Set default font to helvetica since we can't load custom fonts in browser
    const fontFamily = 'helvetica';
    doc.setFont(fontFamily);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    
    // Colors from web version
    const categoryColors = {
      low: [22, 163, 74],      // #16A34A - green
      medium: [255, 217, 0],   // #FFD900 - yellow
      elevated: [255, 97, 0],  // #FF6100 - orange
      high: [220, 38, 38]      // #DC2626 - red
    };
    
    const purple = [107, 70, 193]; // #6B46C1
    const lightBlue = [219, 234, 254]; // bg-blue-100

    // Header with user info
    doc.setFillColor(purple[0], purple[1], purple[2]);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(fontFamily, 'bold');
    const headerText = language === 'ru' 
      ? `${userData.user_name}, вот ваши результаты теста P18`
      : `${userData.user_name}, сіздің P18 тестінің нәтижелері`;
    doc.text(headerText, margin, 20);

    // User info
    doc.setFontSize(12);
    doc.setFont(fontFamily, 'normal');
    doc.text(formatDate(userData.created_at, language), margin, 30);
    doc.text(`Email: ${userData.user_email}`, margin, 38);
    if (userData.coach_email) {
      doc.text(`${language === 'ru' ? 'Коуч' : 'Коуч'}: ${userData.coach_email}`, margin, 46);
    }

    let currentY = 60;

    // High Results section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont(fontFamily, 'bold');
    doc.text(translations.title[language], pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;

    // Top 5 scores grid
    const topScores = [...programsArray].slice(0, 5);
    const cardWidth = (contentWidth - (4 * 4)) / 5;
    const cardHeight = cardWidth;

    topScores.forEach((program, index) => {
      const x = margin + (index * (cardWidth + 4));
      
      // Card background
      const color = categoryColors[program.category];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(x, currentY, cardWidth, cardHeight, 3, 3, 'F');
      
      // Calculate center positions
      const centerX = x + cardWidth/2;
      const centerY = currentY + cardHeight/2;
      
      // Draw percentage
      doc.setTextColor(program.category === 'medium' ? 0 : 255, program.category === 'medium' ? 0 : 255, program.category === 'medium' ? 0 : 255);
      doc.setFontSize(30);
      doc.setFont(fontFamily, 'bold');
      doc.text(`${program.score}%`, centerX, currentY + cardHeight * 0.4, { align: 'center' });
      
      // Draw level text pill
      doc.setFontSize(9);
      doc.setFont(fontFamily, 'normal');
      const levelText = language === 'ru' ? getCategoryText(program.category, 'ru') : getCategoryText(program.category, 'kz');
      const levelTextWidth = doc.getTextWidth(levelText) + 8;
      const levelTextHeight = 2.5;
      const levelTextX = x + (cardWidth - levelTextWidth) / 2;
      const levelTextY = currentY + cardHeight * 0.55;
      
      // Draw border around level text matching text color
      doc.setDrawColor(program.category === 'medium' ? 0 : 255, program.category === 'medium' ? 0 : 255, program.category === 'medium' ? 0 : 255);
      doc.setLineWidth(0.2);
      doc.roundedRect(levelTextX, levelTextY - 1.5, levelTextWidth, levelTextHeight + 2, 1.5, 1.5, 'S');
      doc.text(levelText, centerX, levelTextY + 1.5, { align: 'center' });
      
      // Draw program name at bottom with text wrapping
      doc.setFontSize(9);
      doc.setFont(fontFamily, 'normal');
      const progName = program[language];
      const maxWidth = cardWidth - 4;
      const wrappedProgName = doc.splitTextToSize(progName, maxWidth);
      doc.text(wrappedProgName, centerX, currentY + cardHeight * 0.8, { align: 'center' });
    });

    currentY += cardHeight + 20;

    // All Results section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont(fontFamily, 'bold');
    doc.text(translations.allResults[language], pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;

    // All results grid
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

      // Card background
      const color = categoryColors[program.category];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(gridX, gridY, smallCardWidth, smallCardHeight, 3, 3, 'F');
      
      // Calculate center positions
      const centerX = gridX + smallCardWidth/2;
      const centerY = gridY + smallCardHeight/2;
      
      // Draw percentage
      doc.setTextColor(program.category === 'medium' ? 0 : 255, program.category === 'medium' ? 0 : 255, program.category === 'medium' ? 0 : 255);
      doc.setFontSize(22);
      doc.setFont(fontFamily, 'bold');
      doc.text(`${program.score}%`, centerX, gridY + smallCardHeight * 0.4, { align: 'center' });
      
      // Draw level text pill
      doc.setFontSize(6);
      doc.setFont(fontFamily, 'normal');
      const smallLevelText = language === 'ru' ? getCategoryText(program.category, 'ru') : getCategoryText(program.category, 'kz');
      const levelTextWidth = doc.getTextWidth(smallLevelText) + 6;
      const levelTextHeight = 1.5;
      const levelTextX = gridX + (smallCardWidth - levelTextWidth) / 2;
      const levelTextY = gridY + smallCardHeight * 0.55;
      
      // Draw border around level text matching text color
      doc.setDrawColor(program.category === 'medium' ? 0 : 255, program.category === 'medium' ? 0 : 255, program.category === 'medium' ? 0 : 255);
      doc.setLineWidth(0.2);
      doc.roundedRect(levelTextX, levelTextY - 1, levelTextWidth, levelTextHeight + 2, 1, 1, 'S');
      doc.text(smallLevelText, centerX, levelTextY + 1.4, { align: 'center' });
      
      // Draw program name at bottom with text wrapping
      doc.setFontSize(8);
      doc.setFont(fontFamily, 'normal');
      const progName = program[language];
      const maxWidth = smallCardWidth - 4;
      const wrappedProgName = doc.splitTextToSize(progName, maxWidth);
      doc.text(wrappedProgName, centerX, gridY + smallCardHeight * 0.8, { align: 'center' });

      gridX += smallCardWidth + 4;
    });

    // Footer
    const footerY = pageHeight - 25;
    
    // Add line break
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8);
    
    // Results link with light blue background
    const resultUrl = `${baseUrl}/results/grid/${id}?lang=${language}`;
    const linkText = `${translations.permalink[language]} ${resultUrl}`;
    
    // Draw light blue background
    const boxWidth = Math.min(pageWidth - 40, 180);
    const boxHeight = 12;
    const boxX = (pageWidth - boxWidth) / 2;
    const boxY = footerY - 4;
    
    doc.setFillColor(lightBlue[0], lightBlue[1], lightBlue[2]);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 2, 2, 'F');
    
    // Add permalink text
    doc.setTextColor(44, 54, 78);
    doc.setFontSize(9);
    doc.text(linkText, pageWidth / 2, footerY + 3, { align: 'center' });
    
    // Add P18 logo
    doc.setTextColor(purple[0], purple[1], purple[2]);
    doc.setFontSize(10);
    doc.setFont(fontFamily, 'bold');
    doc.text('P18', pageWidth / 2, footerY + 12, { align: 'center' });

    return Buffer.from(doc.output('arraybuffer'));
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

module.exports = {
  generateGridPDF,
  createSafeFilename
}; 