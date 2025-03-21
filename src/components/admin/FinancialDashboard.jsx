import React, { useState, useEffect, useContext, useCallback } from 'react';
import { LanguageContext } from '../../contexts/LanguageContext';
import { supabase } from '../../supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const translations = {
  financialDashboard: {
    ru: 'Финансовая панель',
    kz: 'Қаржы панелі'
  },
  totalRevenue: {
    ru: 'Общий доход',
    kz: 'Жалпы табыс'
  },
  transactionsByMonth: {
    ru: 'Транзакции по месяцам',
    kz: 'Айлар бойынша транзакциялар'
  },
  transactionsByCoach: {
    ru: 'Транзакции по коучам',
    kz: 'Коучтар бойынша транзакциялар'
  },
  transactions: {
    ru: 'Транзакции',
    kz: 'Транзакциялар'
  },
  status: {
    ru: 'Статус',
    kz: 'Күйі'
  },
  amount: {
    ru: 'Сумма',
    kz: 'Сома'
  },
  client: {
    ru: 'Клиент',
    kz: 'Клиент'
  },
  product: {
    ru: 'Продукт',
    kz: 'Өнім'
  },
  coach: {
    ru: 'Коуч',
    kz: 'Коуч'
  },
  paymentMethod: {
    ru: 'Способ оплаты',
    kz: 'Төлем әдісі'
  },
  date: {
    ru: 'Дата',
    kz: 'Күні'
  },
  loading: {
    ru: 'Загрузка...',
    kz: 'Жүктелуде...'
  },
  noTransactions: {
    ru: 'Транзакции не найдены',
    kz: 'Транзакциялар табылмады'
  },
  search: {
    ru: 'Поиск',
    kz: 'Іздеу'
  },
  filterByDate: {
    ru: 'Фильтр по дате',
    kz: 'Күн бойынша сүзу'
  },
  startDate: {
    ru: 'Начальная дата',
    kz: 'Бастапқы күні'
  },
  endDate: {
    ru: 'Конечная дата',
    kz: 'Соңғы күні'
  },
  apply: {
    ru: 'Применить',
    kz: 'Қолдану'
  },
  reset: {
    ru: 'Сбросить',
    kz: 'Қайта орнату'
  },
  currency: {
    ru: 'Валюта',
    kz: 'Валюта'
  }
};

const FinancialDashboard = () => {
  const { language } = useContext(LanguageContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [chartData, setChartData] = useState([]);

  const calculateTotalRevenue = (data) => {
    const total = data.reduce((sum, transaction) => {
      if (transaction.status === 'completed' || transaction.status === 'paid') {
        return sum + (transaction.amount || 0);
      }
      return sum;
    }, 0);
    
    setTotalRevenue(total);
  };

  const prepareChartData = (data) => {
    // Group transactions by month
    const monthlyData = data.reduce((acc, transaction) => {
      if (!transaction.created_at) return acc;
      
      const date = new Date(transaction.created_at);
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      if (!acc[key]) {
        acc[key] = { month: key, amount: 0, count: 0 };
      }
      
      if (transaction.status === 'completed' || transaction.status === 'paid') {
        acc[key].amount += (transaction.amount || 0);
        acc[key].count += 1;
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    const chartData = Object.values(monthlyData).sort((a, b) => {
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA - dateB;
    });
    
    setChartData(chartData);
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // eslint-disable-next-line react-hooks/exhaustive-deps
      setTransactions(data || []);
      calculateTotalRevenue(data);
      prepareChartData(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleFilterApply = () => {
    // Filter transactions based on search query and date range
    fetchTransactions().then(() => {
      let filtered = [...transactions];
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          transaction => 
            (transaction.client_name && transaction.client_name.toLowerCase().includes(query)) ||
            (transaction.client_email && transaction.client_email.toLowerCase().includes(query)) ||
            (transaction.product_name && transaction.product_name.toLowerCase().includes(query)) ||
            (transaction.coach_name && transaction.coach_name.toLowerCase().includes(query))
        );
      }
      
      // Apply date filters
      if (startDate) {
        const start = new Date(startDate);
        filtered = filtered.filter(
          transaction => new Date(transaction.created_at) >= start
        );
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999); // End of day
        filtered = filtered.filter(
          transaction => new Date(transaction.created_at) <= end
        );
      }
      
      setTransactions(filtered);
      calculateTotalRevenue(filtered);
      prepareChartData(filtered);
    });
  };

  const handleFilterReset = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    fetchTransactions();
  };

  const filteredTransactions = transactions;

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {translations.financialDashboard[language]}
          </h2>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                {translations.search[language]}
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={handleSearchChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder={translations.search[language]}
              />
            </div>
            
            <div className="md:col-span-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                {translations.startDate[language]}
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={handleStartDateChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="md:col-span-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                {translations.endDate[language]}
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={handleEndDateChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            
            <div className="md:col-span-1 flex items-end space-x-2">
              <button
                onClick={handleFilterApply}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {translations.apply[language]}
              </button>
              <button
                onClick={handleFilterReset}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {translations.reset[language]}
              </button>
            </div>
          </div>
          
          {/* Revenue Overview */}
          <div className="bg-indigo-50 p-4 rounded-lg mb-6">
            <h3 className="font-medium text-indigo-800 mb-2">
              {translations.totalRevenue[language]}
            </h3>
            <p className="text-2xl font-bold text-indigo-900">
              {totalRevenue.toLocaleString()} ₸
            </p>
          </div>
          
          {/* Charts */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">
              {translations.transactionsByMonth[language]}
            </h3>
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} ₸`} />
                  <Legend />
                  <Bar dataKey="amount" name={translations.amount[language]} fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Transactions Table */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">
              {translations.transactions[language]}
            </h3>
            
            {loading ? (
              <div className="text-center py-4">{translations.loading[language]}</div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-4 text-gray-500">{translations.noTransactions[language]}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.client[language]}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.product[language]}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.coach[language]}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.amount[language]}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.status[language]}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.paymentMethod[language]}
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {translations.date[language]}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium text-gray-900">{transaction.client_name}</div>
                          <div className="text-gray-500">{transaction.client_email}</div>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.product_name}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.coach_name}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm">
                          <div className="font-medium text-gray-900">
                            {transaction.amount?.toLocaleString()} {transaction.currency || '₸'}
                          </div>
                          {transaction.exchange_rate && (
                            <div className="text-xs text-gray-500">
                              Rate: {transaction.exchange_rate}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                            transaction.status === 'completed' || transaction.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.payment_method}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard; 