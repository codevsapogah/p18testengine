import React from 'react';
import { Link } from 'react-router-dom';

const translations = {
  name: {
    ru: 'Имя',
    kz: 'Аты-жөні'
  },
  email: {
    ru: 'Электронная почта',
    kz: 'Электрондық пошта'
  },
  phone: {
    ru: 'Телефон',
    kz: 'Телефон'
  },
  date: {
    ru: 'Дата',
    kz: 'Күні'
  },
  actions: {
    ru: 'Действия',
    kz: 'Әрекеттер'
  },
  viewResult: {
    ru: 'Просмотр результата',
    kz: 'Нәтижені қарау'
  },
  reviewed: {
    ru: 'Разбор проведен',
    kz: 'Талдау жүргізілді'
  },
  noClients: {
    ru: 'Клиенты не найдены',
    kz: 'Клиенттер табылмады'
  }
};

const ClientList = ({ clients, language, onReviewStatusChange }) => {
  if (clients.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        {translations.noClients[language]}
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {translations.name[language]}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {translations.email[language]}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {translations.phone[language]}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {translations.date[language]}
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {translations.actions[language]}
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              {translations.reviewed[language]}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {client.user_name || '—'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {client.user_email || '—'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {client.user_phone || '—'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {new Date(client.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <Link
                  to={`/coach/results/${client.id}`}
                  className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                >
                  {translations.viewResult[language]}
                </Link>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <input
                  type="checkbox"
                  checked={!!client.review_status}
                  onChange={() => onReviewStatusChange(client.id, !client.review_status)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientList;