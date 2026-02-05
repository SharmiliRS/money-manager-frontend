import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, Minus, TrendingUp, TrendingDown, Calendar, 
  Filter, Edit, RefreshCw, BarChart3, PieChart as PieChartIcon,
  ChevronDown, ChevronUp, Loader2, Search, Download,
  X, Eye
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import IncomeModal from "../components/IncomeModal";
import ExpenseModal from "../components/ExpenseModal";
import { Bar, Pie, Line } from "react-chartjs-2";
import "chart.js/auto";
import { Menu } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";

const Dashboard = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState("monthly");
  const [dashboardIncome, setDashboardIncome] = useState(0);
  const [dashboardExpense, setDashboardExpense] = useState(0);
  const [dashboardBalance, setDashboardBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [periodData, setPeriodData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categorySummary, setCategorySummary] = useState({ income: [], expense: [] });
  const [divisionSummary, setDivisionSummary] = useState({ income: [], expense: [] });
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [division, setDivision] = useState("all");
  const [category, setCategory] = useState("all");
  const [account, setAccount] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [transactionType, setTransactionType] = useState("both");

  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [transactionsPerPage] = useState(10);
  const [totalTransactions, setTotalTransactions] = useState(0);
  
  // Dropdown options
  const months = [
    { value: "all", label: "All Months" },
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = [
    { value: "all", label: "All Years" },
    ...Array.from({ length: new Date().getFullYear() - 2020 + 1 }, (_, i) => {
      const year = new Date().getFullYear() - i;
      return { value: year.toString(), label: year.toString() };
    }),
  ];

  const divisions = ["Personal", "Office"];
  const paymentMethods = ["Cash", "Bank Transfer", "Credit Card", "UPI", "Cheque", "Other"];
  const transactionTypes = ["both", "income", "expense"];
  const sortOptions = [
    { value: "date", label: "Date" },
    { value: "amount", label: "Amount" },
    { value: "category", label: "Category" },
  ];
  const sortOrders = [
    { value: "desc", label: "Newest/Desc" },
    { value: "asc", label: "Oldest/Asc" },
  ];

  const BASE_URL = "http://localhost:5000/api";

  // Fetch all necessary data
  useEffect(() => {
    fetchDashboardData();
    fetchRecentTransactions();
  }, [timeRange, currentPage]);

  // Fetch dashboard summary data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        console.error("No user email found");
        return;
      }

      // Fetch dashboard summary
      const dashboardResponse = await axios.get(`${BASE_URL}/dashboard/${userEmail}?period=${timeRange}`);
      const dashboard = dashboardResponse.data;
      
      setDashboardIncome(dashboard.summary.totalIncome || 0);
      setDashboardExpense(dashboard.summary.totalExpense || 0);
      setDashboardBalance(dashboard.summary.balance || 0);
      setCategorySummary({
        income: dashboard.categories.income || [],
        expense: dashboard.categories.expense || []
      });
      setDivisionSummary({
        income: dashboard.divisions.income || [],
        expense: dashboard.divisions.expense || []
      });
      
      // Fetch period data for charts
      const periodResponse = await axios.get(`${BASE_URL}/dashboard/period/${userEmail}?period=${timeRange}`);
      setPeriodData(periodResponse.data.data || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent transactions - show newest first
  const fetchRecentTransactions = async () => {
  try {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    // Don't pass any sort parameters, we'll sort locally
    const response = await axios.get(`${BASE_URL}/transactions/recent/${userEmail}?limit=${transactionsPerPage}&page=${currentPage}`);
    
    let transactionsData = [];
    
    if (response.data.recentTransactions) {
      transactionsData = response.data.recentTransactions;
      setTotalTransactions(response.data.total || transactionsData.length);
    } else {
      transactionsData = response.data || [];
      setTotalTransactions(transactionsData.length || 0);
    }
    
    // ALWAYS sort by date descending to show newest first
    // ALWAYS sort by date descending to show newest first
transactionsData.sort((a, b) => {
  const dateA = new Date(a.date || a.createdAt);
  const dateB = new Date(b.date || b.createdAt);
  
  // First, sort by date descending (newest first)
  if (dateB > dateA) return 1;
  if (dateB < dateA) return -1;
  
  // If dates are the same, sort by creation time (if available)
  const createdA = new Date(a.createdAt || 0);
  const createdB = new Date(b.createdAt || 0);
  if (createdB > createdA) return 1;
  if (createdB < createdA) return -1;
  
  // If creation time is same, sort by ID (if available)
  if (a._id && b._id) {
    return b._id.localeCompare(a._id);
  }
  
  return 0;
});

setTransactions(transactionsData);
    
  } catch (error) {
    console.error("Error fetching recent transactions:", error.message);
  }
};

  // Apply filters to get filtered transactions
const applyFilters = async (page = 1) => {
  try {
    setLoading(true);
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) return;

    const params = new URLSearchParams();
    
    // Add search query
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    // Add date range
    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }
    
    // Add month/year filters
    if (selectedMonth !== "all") {
      params.append('month', selectedMonth);
    }
    if (selectedYear !== "all") {
      params.append('year', selectedYear);
    }
    
    // Add other filters
    if (division !== "all") {
      params.append('division', division);
    }
    
    if (category !== "all") {
      params.append('category', category);
    }
    
    if (account !== "all") {
      params.append('account', account);
    }
    
    if (paymentMethod !== "all") {
      params.append('paymentMethod', paymentMethod);
    }
    
    if (transactionType !== "both") {
      params.append('type', transactionType);
    }
    
    // REMOVE sortBy and sortOrder from params - let API return data in any order
    // We'll always sort it locally by date descending
    
    // Add pagination parameters
    params.append('page', page);
    params.append('limit', transactionsPerPage);

    const response = await axios.get(`${BASE_URL}/transactions/${userEmail}?${params.toString()}`);
    
    let transactionsData = [];
    
    if (response.data.transactions) {
      transactionsData = response.data.transactions;
      setTotalTransactions(response.data.total || transactionsData.length);
    } else {
      transactionsData = response.data || [];
      setTotalTransactions(transactionsData.length || 0);
    }
    
    // ALWAYS sort by date descending to show newest first - NO MATTER WHAT
   transactionsData.sort((a, b) => {
  const dateA = new Date(a.date || a.createdAt);
  const dateB = new Date(b.date || b.createdAt);
  
  // First, sort by date descending (newest first)
  if (dateB > dateA) return 1;
  if (dateB < dateA) return -1;
  
  // If dates are the same, sort by creation time (if available)
  const createdA = new Date(a.createdAt || 0);
  const createdB = new Date(b.createdAt || 0);
  if (createdB > createdA) return 1;
  if (createdB < createdA) return -1;
  
  // If creation time is same, sort by ID (if available)
  if (a._id && b._id) {
    return b._id.localeCompare(a._id);
  }
  
  return 0;
});

setTransactions(transactionsData);
    setCurrentPage(page);
    setShowFilters(false);
    
  } catch (error) {
    console.error("Error applying filters:", error.message);
  } finally {
    setLoading(false);
  }
};
  const resetFilters = async () => {
  setSearchQuery("");
  setSelectedMonth("all");
  setSelectedYear("all");
  setStartDate("");
  setEndDate("");
  setDivision("all");
  setCategory("all");
  setAccount("all");
  setPaymentMethod("all");
  setTransactionType("both");
  // Remove sort states since they're not used
  setCurrentPage(1);
  
  await fetchRecentTransactions();
  setShowFilters(false);
};

  // Handle adding income
  const handleAddIncome = async () => {
    try {
      // Just refresh the data after modal handles the API call
      await Promise.all([fetchDashboardData(), fetchRecentTransactions()]);
      setIncomeModalOpen(false);
    } catch (error) {
      console.error("Error refreshing after adding income:", error.message);
    }
  };

  // Handle adding expense
  const handleAddExpense = async () => {
    try {
      // Just refresh the data after modal handles the API call
      await Promise.all([fetchDashboardData(), fetchRecentTransactions()]);
      setExpenseModalOpen(false);
    } catch (error) {
      console.error("Error refreshing after adding expense:", error.message);
    }
  };

  // Check if transaction can be edited
  const canEditTransaction = (createdAt) => {
    if (!createdAt) return false;
    const transactionTime = new Date(createdAt);
    const currentTime = new Date();
    const hoursDifference = (currentTime - transactionTime) / (1000 * 60 * 60);
    return hoursDifference <= 12;
  };

  // Export transactions to CSV
  const exportToCSV = () => {
    const headers = ["Date", "Type", "Description", "Category", "Division", "Account", "Payment Method", "Amount", "Notes"];
    const csvData = transactions.map(transaction => [
      new Date(transaction.date).toLocaleDateString(),
      transaction.type,
      transaction.source || transaction.description || "",
      transaction.category || "",
      transaction.division || "",
      transaction.account || "",
      transaction.paymentMethod || "",
      transaction.amount,
      transaction.notes || ""
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedMonth !== "all") count++;
    if (selectedYear !== "all") count++;
    if (startDate || endDate) count++;
    if (division !== "all") count++;
    if (category !== "all") count++;
    if (account !== "all") count++;
    if (paymentMethod !== "all") count++;
    if (transactionType !== "both") count++;
    if (searchQuery) count++;
    return count;
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Salary/Wages": "💼",
      "Food & Dining": "🍕",
      "Transportation": "🚗",
      "Shopping": "🛍️",
      "Entertainment": "🎬",
      "Bills & Utilities": "💡",
      "Health & Medical": "🏥",
      "Education": "📚",
      "Other": "💰"
    };
    return icons[categoryName] || "💰";
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    const icons = {
      "Cash": "💵",
      "Bank Transfer": "🏦",
      "Credit Card": "💳",
      "UPI": "📱",
      "Cheque": "📄",
      "Other": "🔹"
    };
    return icons[method] || "💰";
  };

  // Prepare chart data
  const trendChartData = {
    labels: periodData.map(item => item.period),
    datasets: [
      {
        label: "Income",
        data: periodData.map(item => item.income),
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Expenses",
        data: periodData.map(item => item.expense),
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Get top income categories
  const topIncomeCategories = categorySummary.income
    .slice(0, 4)
    .map(item => ({
      category: item._id || item.category,
      amount: item.total || item.amount,
      percentage: dashboardIncome > 0 ? ((item.total || item.amount) / dashboardIncome * 100).toFixed(1) : 0
    }));

  // Get top expense categories
  const topExpenseCategories = categorySummary.expense
    .slice(0, 4)
    .map(item => ({
      category: item._id || item.category,
      amount: item.total || item.amount,
      percentage: dashboardExpense > 0 ? ((item.total || item.amount) / dashboardExpense * 100).toFixed(1) : 0
    }));

  // Pagination logic
  const totalPages = Math.ceil(totalTransactions / transactionsPerPage);

  // Pagination handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    applyFilters(pageNumber);
  };

  // Render pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Previous button
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Previous
      </button>
    );
    
    // Page numbers
    if (totalPages <= 5) {
      // Show all pages if 5 or less
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 rounded-lg text-sm font-medium ${
              currentPage === i
                ? 'bg-[#0B666A] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {i}
          </button>
        );
      }
    } else {
      // Show first page
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className={`w-8 h-8 rounded-lg text-sm font-medium ${
            currentPage === 1
              ? 'bg-[#0B666A] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          1
        </button>
      );
      
      // Show ellipsis if needed
      if (currentPage > 3) {
        buttons.push(
          <span key="ellipsis1" className="px-1 text-gray-500">...</span>
        );
      }
      
      // Show pages around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          buttons.push(
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`w-8 h-8 rounded-lg text-sm font-medium ${
                currentPage === i
                  ? 'bg-[#0B666A] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {i}
            </button>
          );
        }
      }
      
      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        buttons.push(
          <span key="ellipsis2" className="px-1 text-gray-500">...</span>
        );
      }
      
      // Show last page
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className={`w-8 h-8 rounded-lg text-sm font-medium ${
            currentPage === totalPages
              ? 'bg-[#0B666A] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Next
      </button>
    );
    
    return buttons;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className={`transition-all duration-300 pt-4 ${
        isSidebarOpen ? "lg:pl-72 lg:pr-8" : "lg:pl-20 lg:pr-8"
      }`}>
        <div className={`px-4 lg:px-6 transition-all duration-300 ${
          isSidebarOpen ? "lg:max-w-7xl mx-auto" : "lg:max-w-8xl mx-auto"
        }`}>
          
          {/* Header with Hamburger */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {/* Left side with hamburger and title */}
              <div className="flex items-center gap-3">
                {/* Mobile Hamburger Button */}
                {isMobile && (
                  <button
                    onClick={toggleSidebar}
                    className="lg:hidden w-10 h-10 bg-gradient-to-r from-[#0B666A] to-emerald-600 rounded-xl shadow-sm flex items-center justify-center text-white hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95 mr-2"
                    aria-label="Toggle menu"
                  >
                    <Menu size={20} />
                  </button>
                )}
                
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-1">
                    Dashboard
                  </h1>
                  <p className="text-gray-600 hidden lg:block">
                    Welcome back! Here's your financial overview
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Total Income Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Income</h3>
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-emerald-600" />
                  </div>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-emerald-700 mb-2">
                  ₹{dashboardIncome.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} earnings
                </p>
              </div>

              {/* Total Expense Card */}
              <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 shadow-lg border border-red-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Total Expenses</h3>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <TrendingDown size={24} className="text-red-600" />
                  </div>
                </div>
                <p className="text-3xl lg:text-4xl font-bold text-red-700 mb-2">
                  ₹{dashboardExpense.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} spending
                </p>
              </div>

              {/* Net Balance Card */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 shadow-lg border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Net Balance</h3>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} className="text-blue-600" />
                  </div>
                </div>
                <p className={`text-3xl lg:text-4xl font-bold mb-2 ${
                  dashboardBalance >= 0 ? 'text-blue-700' : 'text-red-600'
                }`}>
                  ₹{dashboardBalance.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {dashboardBalance >= 0 ? 'Profit' : 'Loss'}
                </p>
              </div>
            </div>
          )}

          {/* Time Range Selector */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-xl p-1 shadow border border-gray-200 inline-flex">
              {['weekly', 'monthly', 'yearly'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-2 rounded-lg font-medium capitalize transition-all ${
                    timeRange === range
                      ? 'bg-[#0B666A] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Trend
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-sm text-gray-600">Income</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-gray-600">Expense</span>
                </div>
              </div>
            </div>
            {loading ? (
              <div className="h-80 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#0B666A]" />
              </div>
            ) : periodData.length > 0 ? (
              <div className="h-80">
                <Line
                  data={trendChartData}
                  options={{
                    maintainAspectRatio: false,
                    responsive: true,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                          label: (context) => `${context.dataset.label}: ₹${context.parsed.y.toLocaleString()}`
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: (value) => `₹${value.toLocaleString()}`
                        }
                      }
                    }
                  }}
                />
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-400">
                No trend data available for {timeRange} period
              </div>
            )}
          </div>

          {/* Category Insights */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">
              Category Insights
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Income Categories */}
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl p-6 shadow-lg border border-emerald-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Top Income Sources</h3>
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="text-emerald-600" />
                  </div>
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-50 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : topIncomeCategories.length > 0 ? (
                  <div className="space-y-4">
                    {topIncomeCategories.map((item, index) => (
                      <div key={item.category} className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-50 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            index === 0 ? 'bg-emerald-100 text-emerald-700' :
                            index === 1 ? 'bg-blue-100 text-blue-700' :
                            index === 2 ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            <span className="font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.category}</p>
                            <p className="text-xs text-gray-500">
                              {item.percentage}% of total income
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-700">₹{item.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No income data available
                  </div>
                )}
              </div>

              {/* Top Expense Categories */}
              <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 shadow-lg border border-red-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Top Expense Categories</h3>
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <TrendingDown size={20} className="text-red-600" />
                  </div>
                </div>
                
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-50 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : topExpenseCategories.length > 0 ? (
                  <div className="space-y-4">
                    {topExpenseCategories.map((item, index) => (
                      <div key={item.category} className="flex items-center justify-between p-3 bg-white rounded-xl border border-red-50 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            index === 0 ? 'bg-red-100 text-red-700' :
                            index === 1 ? 'bg-orange-100 text-orange-700' :
                            index === 2 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            <span className="font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.category}</p>
                            <p className="text-xs text-gray-500">
                              {item.percentage}% of total expenses
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-700">₹{item.amount.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No expense data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Division Breakdown */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Division Breakdown</h3>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="p-6 rounded-2xl border animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {divisionSummary.income.map((divisionItem) => (
                  <div key={`inc-${divisionItem._id}`} className="bg-gradient-to-r from-emerald-50 to-white p-6 rounded-2xl border border-emerald-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{divisionItem._id} Income</h4>
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <span className="text-emerald-600 font-bold">
                          {divisionItem._id === 'Office' ? 'O' : 'P'}
                        </span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700">₹{divisionItem.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {dashboardIncome > 0 ? `${((divisionItem.total / dashboardIncome) * 100).toFixed(1)}% of total income` : 'No income data'}
                    </p>
                  </div>
                ))}
                
                {divisionSummary.expense.map((divisionItem) => (
                  <div key={`exp-${divisionItem._id}`} className="bg-gradient-to-r from-red-50 to-white p-6 rounded-2xl border border-red-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">{divisionItem._id} Expenses</h4>
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-red-600 font-bold">
                          {divisionItem._id === 'Office' ? 'O' : 'P'}
                        </span>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-red-700">₹{divisionItem.total.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {dashboardExpense > 0 ? `${((divisionItem.total / dashboardExpense) * 100).toFixed(1)}% of total expenses` : 'No expense data'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search and Filters Bar */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-end items-start lg:items-center">
              {/* Filter and Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter size={18} />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-[#0B666A] text-white text-xs rounded-full">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
                
                <button
                  onClick={applyFilters}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#0B666A] text-white rounded-lg hover:bg-[#0B666A]/90 transition-colors"
                >
                  <RefreshCw size={18} />
                  Apply
                </button>
                
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Download size={18} />
                  Export
                </button>
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Filter Transactions</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <RefreshCw size={14} />
                      Reset All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Month and Year */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Month</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    >
                      {years.map((year) => (
                        <option key={year.value} value={year.value}>
                          {year.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Division and Category */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Division</label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Divisions</option>
                      {divisions.map((div) => (
                        <option key={div} value={div}>
                          {div}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Categories</option>
                      <optgroup label="─── Income Categories ───">
                        <option value="Salary/Wages">💼 Salary/Wages</option>
                        <option value="Freelance Work">💻 Freelance Work</option>
                        <option value="Business Profits">📈 Business Profits</option>
                        <option value="Investments">📊 Investments</option>
                        <option value="Rental Income">🏠 Rental Income</option>
                        <option value="Interest Earned">🏦 Interest Earned</option>
                        <option value="Bonuses & Commissions">🎯 Bonuses & Commissions</option>
                        <option value="Pension & Retirement Funds">👴 Pension & Retirement Funds</option>
                        <option value="Government Benefits">🏛️ Government Benefits</option>
                        <option value="Side Hustles">💪 Side Hustles</option>
                        <option value="Gifts & Donations Received">🎁 Gifts & Donations Received</option>
                        <option value="Tax Refunds">📄 Tax Refunds</option>
                        <option value="Royalties">📚 Royalties</option>
                        <option value="Scholarships & Grants">🎓 Scholarships & Grants</option>
                        <option value="Other Income">💰 Other Income</option>
                      </optgroup>
                      
                      <optgroup label="─── Expense Categories ───">
                        <option value="Food & Dining">🍕 Food & Dining</option>
                        <option value="Transportation">🚗 Transportation</option>
                        <option value="Shopping">🛍️ Shopping</option>
                        <option value="Entertainment">🎬 Entertainment</option>
                        <option value="Bills & Utilities">💡 Bills & Utilities</option>
                        <option value="Health & Medical">🏥 Health & Medical</option>
                        <option value="Education">📚 Education</option>
                        <option value="Rent/Mortgage">🏠 Rent/Mortgage</option>
                        <option value="Insurance">🛡️ Insurance</option>
                        <option value="Travel">✈️ Travel</option>
                        <option value="Personal Care">💇 Personal Care</option>
                        <option value="Gifts & Donations">🎁 Gifts & Donations</option>
                        <option value="Subscriptions">📱 Subscriptions</option>
                        <option value="Fuel">⛽ Fuel</option>
                        <option value="Loan">💳 Loan</option>
                        <option value="Other Expense">💰 Other Expense</option>
                      </optgroup>
                    </select>
                  </div>

                  {/* Transaction Type */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
                    <select
                      value={transactionType}
                      onChange={(e) => setTransactionType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    >
                      {transactionTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === "both" ? "All Transactions" : type.charAt(0).toUpperCase() + type.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Account and Payment Method */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Account</label>
                    <select
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Accounts</option>
                      <option value="Cash">Cash</option>
                      <option value="Primary Account">Primary Account</option>
                      <option value="Savings Account">Savings Account</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                    >
                      <option value="all">All Methods</option>
                      {paymentMethods.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  
                </div>

                {/* Active Filters Badges */}
                {getActiveFilterCount() > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-medium text-gray-700">Active Filters:</span>
                      <button
                        onClick={resetFilters}
                        className="text-sm text-[#0B666A] hover:text-[#0B666A]/80"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedMonth !== "all" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {months.find(m => m.value === selectedMonth)?.label}
                          <button onClick={() => setSelectedMonth("all")} className="text-blue-600 hover:text-blue-800">
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {selectedYear !== "all" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                          {selectedYear}
                          <button onClick={() => setSelectedYear("all")} className="text-blue-600 hover:text-blue-800">
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {division !== "all" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                          {division}
                          <button onClick={() => setDivision("all")} className="text-purple-600 hover:text-purple-800">
                            <X size={14} />
                          </button>
                        </span>
                      )}
                      {transactionType !== "both" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full">
                          {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
                          <button onClick={() => setTransactionType("both")} className="text-emerald-600 hover:text-emerald-800">
                            <X size={14} />
                          </button>
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Transactions Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Showing {transactions.length} of {totalTransactions} transactions
                  {getActiveFilterCount() > 0 && ` • ${getActiveFilterCount()} active filter(s)`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.location.href = '/transactions'}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[#0B666A] hover:text-[#0B666A]/80 hover:underline transition-colors"
                >
                  View All
                  <Eye size={16} />
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-xl animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Division
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Account
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                transaction.type === "income" ? "bg-emerald-100" : "bg-red-100"
                              }`}>
                                {transaction.type === "income" ? (
                                  <Plus size={16} className="text-emerald-600" />
                                ) : (
                                  <Minus size={16} className="text-red-600" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm">
                                  {transaction.source || transaction.description || "Transaction"}
                                </p>
                                <p className="text-xs text-gray-500 truncate max-w-xs">
                                  {transaction.notes || "No notes"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                              transaction.type === "income" 
                                ? "bg-emerald-100 text-emerald-800" 
                                : "bg-red-100 text-red-800"
                            }`}>
                              {transaction.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getCategoryIcon(transaction.category)}</span>
                              <span className="text-sm text-gray-900">{transaction.category || "Other"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              transaction.division === "Office" 
                                ? "bg-purple-100 text-purple-800" 
                                : "bg-blue-100 text-blue-800"
                            }`}>
                              {transaction.division || "Personal"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {transaction.account || "Cash"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getPaymentMethodIcon(transaction.paymentMethod)}</span>
                              <span>{transaction.paymentMethod || "Other"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className={`font-bold text-lg ${
                              transaction.type === "income" ? "text-emerald-700" : "text-red-700"
                            }`}>
                              {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.createdAt && canEditTransaction(transaction.createdAt) 
                                ? "Editable" 
                                : "View only"}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Component */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-700">
                      Page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderPaginationButtons()}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">No transactions found</div>
                <p className="text-gray-500 text-sm">
                  {getActiveFilterCount() > 0 
                    ? "Try adjusting your filters" 
                    : "Add your first transaction to get started"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
          <button
            onClick={() => setIncomeModalOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-[#0B666A] to-emerald-600 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-white group"
            aria-label="Add Income"
          >
            <Plus size={24} />
          </button>

          <button
            onClick={() => setExpenseModalOpen(true)}
            className="w-14 h-14 bg-gradient-to-r from-black to-gray-900 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-white group"
            aria-label="Add Expense"
          >
            <Minus size={24} />
          </button>
        </div>

        {/* Modals */}
        <IncomeModal
          isOpen={isIncomeModalOpen}
          onClose={() => setIncomeModalOpen(false)}
          onAddIncome={handleAddIncome}
        />
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => setExpenseModalOpen(false)}
          onAddExpense={handleAddExpense}
        />
      </main>
    </div>
  );
};

export default Dashboard;