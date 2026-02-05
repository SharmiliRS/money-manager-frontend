import React from "react";
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const DashboardCharts = ({ incomes, expenses, transactions }) => {
  // Example data for Pie Chart
  const pieData = [
    { name: 'Income', value: incomes.reduce((acc, curr) => acc + curr.amount, 0) },
    { name: 'Expense', value: expenses.reduce((acc, curr) => acc + curr.amount, 0) }
  ];

  return (
    <div style={{ marginTop: "30px" }}>
      <h4>Summary</h4>
      
      <PieChart width={300} height={300}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#82ca9d"
          label
        />
        <Tooltip />
      </PieChart>

      <h4>Transactions Over Time</h4>

      <LineChart width={600} height={300} data={transactions}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
      </LineChart>
    </div>
  );
};

export default DashboardCharts;
