import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { scoreCategories } from '../data/programData';
import { programs } from '../data/programs';

/**
 * Generate and download PDF with test results
 * 
 * @param {Object} userData - User data from Supabase
 * @param {Object} results - Calculated test results
 * @param {string} language - Current language (ru/kz)
 */
export const generatePDF = (userData, results, language) => {
  const doc = new jsPDF();
  
  // Set default font
  doc.setFont('helvetica', 'normal');
  
  // Translations
  const translations = {
    title: {
      ru: 'Результаты теста P18',
      kz: 'P18 тестінің нәтижелері'
    },
    user: {
      ru: 'Пользователь',
      kz: 'Қолданушы'
    },
    date: {
      ru: 'Дата',
      kz: 'Күні'
    },
    email: {
      ru: 'Email',
      kz: 'Email'
    },
    coachEmail: {
      ru: 'Email коуча',
      kz: 'Коуч email'
    },
    program: {
      ru: 'Программа',
      kz: 'Бағдарлама'
    },
    score: {
      ru: 'Балл',
      kz: 'Балл'
    },
    category: {
      ru: 'Категория',
      kz: 'Санат'
    },
    highResults: {
      ru: 'Высокие результаты',
      kz: 'Жоғары нәтижелер'
    },
    increasedResults: {
      ru: 'Повышенные результаты',
      kz: 'Жоғарылатылған нәтижелер'
    },
    averageResults: {
      ru: 'Средние результаты',
      kz: 'Орташа нәтижелер'
    },
    reducedResults: {
      ru: 'Пониженные результаты',
      kz: 'Төмен нәтижелер'
    },
    allResults: {
      ru: 'Все результаты',
      kz: 'Барлық нәтижелер'
    },
    description: {
      ru: 'Описание',
      kz: 'Сипаттама'
    },
    examples: {
      ru: 'Примеры проявления',
      kz: 'Мысалдар'
    },
    footer: {
      ru: 'Результаты теста отправлены на ваш email и email коуча.',
      kz: 'Тест нәтижелері сіздің email-ге және коучтың email-не жіберілді.'
    }
  };
  
  // Helper function to get program name
  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.name[language] : '';
  };
  
  // Helper function to get program description
  const getProgramDescription = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.description[language] : '';
  };
  
  // Helper function to get program examples
  const getProgramExamples = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program ? program.examples[language] : '';
  };
  
  // Helper function to get category name
  const getCategoryName = (category) => {
    return scoreCategories[category][language];
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
  
  // Title
  doc.setFontSize(16);
  doc.text(translations.title[language], 105, 20, { align: 'center' });
  
  // User info
  doc.setFontSize(12);
  doc.text(`${translations.user[language]}: ${userData.user_name || '—'}`, 14, 35);
  doc.text(`${translations.date[language]}: ${formatDate(userData.created_at, language)}`, 14, 42);
  doc.text(`${translations.email[language]}: ${userData.user_email || '—'}`, 14, 49);
  doc.text(`${translations.coachEmail[language]}: ${userData.coach_email || '—'}`, 14, 56);
  
  // Results table
  doc.autoTable({
    startY: 65,
    head: [[
      translations.program[language], 
      translations.score[language], 
      translations.category[language]
    ]],
    body: results.all.map(program => [
      getProgramName(program.id),
      `${program.score}%`,
      getCategoryName(program.category)
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185], textColor: [255, 255, 255] },
    styles: { halign: 'center' },
    columnStyles: { 0: { halign: 'left' } }
  });
  
  let y = doc.lastAutoTable.finalY + 15;
  
  // Add detailed description for top programs
  doc.setFontSize(14);
  doc.text(translations.highResults[language], 14, y);
  
  y += 10;
  
  // If we have high or increased results, add them with descriptions
  const significantPrograms = [
    ...results.byCategory.high,
    ...results.byCategory.increased.slice(0, 3) // Add top 3 increased if there are any
  ].slice(0, 5); // Limit to 5 programs
  
  for (const program of significantPrograms) {
    // Check if we need a new page
    if (y > 250) {
      doc.addPage();
      y = 15;
    }
    
    // Program name and score
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${getProgramName(program.id)} - ${program.score}% (${getCategoryName(program.category)})`, 14, y);
    
    y += 7;
    
    // Description
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const descriptionLines = doc.splitTextToSize(getProgramDescription(program.id), 180);
    doc.text(descriptionLines, 14, y);
    
    y += descriptionLines.length * 5 + 5;
    
    // Examples (if they exist)
    const examples = getProgramExamples(program.id);
    if (examples) {
      const exampleLines = doc.splitTextToSize(examples, 180);
      doc.text(exampleLines, 14, y);
      
      y += exampleLines.length * 5 + 10;
    } else {
      y += 5;
    }
  }
  
  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    
    // Footer text
    doc.text(
      translations.footer[language], 
      doc.internal.pageSize.getWidth() / 2, 
      doc.internal.pageSize.getHeight() - 10, 
      { align: 'center' }
    );
    
    // Page number
    doc.text(
      `${i} / ${pageCount}`, 
      doc.internal.pageSize.getWidth() - 20, 
      doc.internal.pageSize.getHeight() - 10
    );
  }
  
  // Save the PDF
  doc.save(`P18_Results_${userData.user_name ? userData.user_name.replace(/\s+/g, '_') : 'User'}.pdf`);
};