import React, { useState, useContext } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import Header from '../common/Header';
import Footer from '../common/Footer';

const consentText = {
  ru: {
    title: 'Согласие',
    content: `Результаты тестирования будут отправлены вам и вашему коучу по электронной почте. Важно понимать, что тесты не диагностируют наличие расстройств или отклонений. Только профессиональный коуч, прошедший специальную подготовку, может правильно интерпретировать эти результаты. Некорректное толкование может привести к ошибочным выводам. На следующей встрече ваш коуч поможет вам разобраться в результатах и определить оптимальное направление для дальнейшей работы.`,
    checkbox: 'Я согласен с условиями',
    button: 'Начать тест'
  },
  kz: {
    title: 'Келісім',
    content: `Тестілеу нәтижелері сізге және сіздің коучыңызға электронды пошта арқылы жіберіледі. Тесттер бұзылыстарды немесе ауытқуларды анықтамайтынын түсіну маңызды. Бұл нәтижелерді тек арнайы дайындықтан өткен кәсіби коуч қана дұрыс түсіндіре алады. Дұрыс емес түсіндіру қате қорытындыларға әкелуі мүмкін. Келесі кездесуде сіздің коучыңыз сізге нәтижелерді түсінуге және әрі қарай жұмыс істеудің тиімді бағытын анықтауға көмектеседі.`,
    checkbox: 'Мен шарттармен келісемін',
    button: 'Тестті бастау'
  }
};

const ConsentForm = ({ onAccept }) => {
  const { language } = useContext(LanguageContext);
  const [accepted, setAccepted] = useState(false);
  
  const handleCheckboxChange = (e) => {
    setAccepted(e.target.checked);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (accepted) {
      onAccept();
    }
  };
  
  const text = consentText[language];
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">{text.title}</h2>
          
          <div className="bg-gray-50 p-4 rounded mb-6">
            <p className="text-gray-700 whitespace-pre-line">{text.content}</p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={handleCheckboxChange}
                  className="w-5 h-5 text-blue-600"
                  required
                />
                <span className="ml-2 text-gray-700">{text.checkbox}</span>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={!accepted}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                accepted ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {text.button}
            </button>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ConsentForm;