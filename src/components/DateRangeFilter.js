// components/DateRangeFilter.jsx
import React, { useState } from 'react';
import { Filter } from 'lucide-react';

const DateRangeFilter = ({ onFilter }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [division, setDivision] = useState('all');
  const [category, setCategory] = useState('all');

  const handleApply = () => {
    if (!startDate && !endDate && division === 'all' && category === 'all') {
      // If no filters are selected, still trigger the filter with empty values
      onFilter({ startDate: '', endDate: '', division: 'all', category: 'all' });
    } else {
      onFilter({
        startDate,
        endDate,
        division,
        category
      });
    }
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setDivision('all');
    setCategory('all');
    onFilter({ startDate: '', endDate: '', division: 'all', category: 'all' });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow border mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter size={18} className="text-[#0B666A]" />
        <h3 className="font-semibold text-gray-800">Advanced Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Division
          </label>
          <select
            value={division}
            onChange={(e) => setDivision(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Divisions</option>
            <option value="personal">Personal</option>
            <option value="office">Office</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="food">Food</option>
            <option value="transport">Transport</option>
            <option value="shopping">Shopping</option>
            <option value="entertainment">Entertainment</option>
            <option value="bills">Bills</option>
            <option value="salary">Salary</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-[#0B666A] text-white rounded-lg hover:bg-[#0B666A]/90"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default DateRangeFilter;