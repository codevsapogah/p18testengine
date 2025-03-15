export const programs = [
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

export const getScoreLevel = (score) => {
  if (score > 75) return 'high';       // red
  if (score >= 50) return 'elevated';  // orange
  if (score >= 25) return 'medium';    // yellow
  return 'low';                        // green
};

export const levelColors = {
  high: '#DC2626', // red
  elevated: '#ff6100', // orange
  medium: '#ffd900', // yellow
  low: '#16A34A' // green
};

export const levelTextColors = {
  high: '#ffffff', // white text for red
  elevated: '#ffffff', // white text for orange
  medium: '#000000', // black text for yellow
  low: '#ffffff' // white text for green
};

export const levelTranslations = {
  high: {
    ru: 'Высокий',
    kz: 'Өте жоғары'
  },
  elevated: {
    ru: 'Повышенный',
    kz: 'Жоғары'
  },
  medium: {
    ru: 'Средний',
    kz: 'Орташа'
  },
  low: {
    ru: 'Пониженный',
    kz: 'Төмен'
  }
}; 