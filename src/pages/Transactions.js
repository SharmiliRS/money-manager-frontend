import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import IncomeModal from "../components/IncomeModal";
import ExpenseModal from "../components/ExpenseModal";
import { 
  Plus, Minus, ChevronLeft, ChevronRight, Filter, Calendar, 
  RefreshCw, Download, Building, User, Wallet, CreditCard,
  Edit, Trash2, AlertCircle, Search, X, Eye, Menu
} from "lucide-react";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const Transactions = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isIncomeModalOpen, setIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState("both");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  
  const transactionsPerPage = 10;
  const userEmail = localStorage.getItem("userEmail");
  const BASE_URL = "http://localhost:5000/api";

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

  const divisions = [
    { value: "all", label: "All Divisions" },
    { value: "Personal", label: "Personal", icon: <User size={14} /> },
    { value: "Office", label: "Office", icon: <Building size={14} /> },
  ];

  const paymentMethods = [
    { value: "all", label: "All Methods" },
    { value: "Cash", label: "Cash", icon: "💵" },
    { value: "Bank Transfer", label: "Bank Transfer", icon: "🏦" },
    { value: "Credit Card", label: "Credit Card", icon: "💳" },
    { value: "UPI", label: "UPI", icon: "📱" },
    { value: "Cheque", label: "Cheque", icon: "📄" },
    { value: "Other", label: "Other", icon: "🔹" }
  ];

  useEffect(() => {
    if (!userEmail) {
      setError("User not found. Please log in.");
      setLoading(false);
      return;
    }
    fetchTransactions();
    fetchCategories();
    fetchAccounts();
  }, [userEmail]);

 const fetchTransactions = async () => {
  try {
    setLoading(true);
    setError("");
    
    // Build query parameters
    const params = new URLSearchParams();
    
    if (dateRange.startDate && dateRange.endDate) {
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
    }
    
    if (selectedType && selectedType !== "both") {
      params.append('type', selectedType);
    }
    
    if (selectedDivision !== "all") {
      params.append('division', selectedDivision);
    }
    
    if (selectedCategory !== "all") {
      params.append('category', selectedCategory);
    }
    
    if (selectedAccount !== "all") {
      params.append('account', selectedAccount);
    }
    
    if (selectedPaymentMethod !== "all") {
      params.append('paymentMethod', selectedPaymentMethod);
    }
    
    if (selectedMonth !== "all") {
      // Create date range for selected month
      const year = selectedYear !== "all" ? selectedYear : new Date().getFullYear();
      const monthStart = `${year}-${selectedMonth.padStart(2, '0')}-01`;
      const monthEnd = `${year}-${selectedMonth.padStart(2, '0')}-${new Date(year, selectedMonth, 0).getDate()}`;
      params.append('startDate', monthStart);
      params.append('endDate', monthEnd);
    } else if (selectedYear !== "all") {
      // Create date range for selected year
      params.append('startDate', `${selectedYear}-01-01`);
      params.append('endDate', `${selectedYear}-12-31`);
    }

    const url = `${BASE_URL}/transactions/${userEmail}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await axios.get(url);
    
    let transactionsData = response.data.transactions || response.data;
    
    // FIXED: Improved sorting by date and time (newest first)
   // Alternative: More robust sorting that ensures proper chronological order
const sortedTransactions = transactionsData.sort((a, b) => {
  // Create timestamp A
  let timestampA = new Date(a.date).getTime();
  if (a.time) {
    const [hours, minutes, seconds] = a.time.split(':');
    timestampA += (parseInt(hours || 0) * 3600000) + 
                  (parseInt(minutes || 0) * 60000) + 
                  (parseInt(seconds || 0) * 1000);
  }
  
  // Create timestamp B
  let timestampB = new Date(b.date).getTime();
  if (b.time) {
    const [hours, minutes, seconds] = b.time.split(':');
    timestampB += (parseInt(hours || 0) * 3600000) + 
                  (parseInt(minutes || 0) * 60000) + 
                  (parseInt(seconds || 0) * 1000);
  }
  
  // If timestamps are equal, use creation time or ID for tie-breaking
  if (timestampA === timestampB) {
    // Try creation timestamp first
    if (a.createdAt && b.createdAt) {
      const createdA = new Date(a.createdAt).getTime();
      const createdB = new Date(b.createdAt).getTime();
      if (createdA !== createdB) {
        return createdB - createdA; // Newer creation first
      }
    }
    
    // Use ID as last resort for consistent ordering
    if (a._id && b._id) {
      return b._id.localeCompare(a._id);
    }
  }
  
  // Newest first
  return timestampB - timestampA;
});
    
    // Apply search filter if exists
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = sortedTransactions.filter(item => 
        (item.source && item.source.toLowerCase().includes(searchLower)) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        (item.notes && item.notes.toLowerCase().includes(searchLower)) ||
        (item.category && item.category.toLowerCase().includes(searchLower))
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(sortedTransactions);
    }
    
    setTransactions(sortedTransactions);
    
    // Debug log to check the order
    console.log("Sorted transactions (first 5):", sortedTransactions.slice(0, 5).map(t => ({
      date: t.date,
      time: t.time,
      type: t.type,
      source: t.source,
      createdAt: t.createdAt
    })));
    
  } catch (err) {
    console.error("Error fetching transactions:", err);
    setError("Failed to fetch transactions. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/categories/${userEmail}?type=Both`);
      if (response.data && response.data.length > 0) {
        setCategories(response.data.map(cat => ({
          value: cat.name,
          label: cat.name
        })));
      }
    } catch (error) {
      console.log("Could not fetch categories:", error.message);
    }
  };

  // Fetch accounts from backend
  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/accounts/${userEmail}`);
      if (response.data && response.data.length > 0) {
        setAccounts(response.data.map(acc => ({
          value: acc.accountName,
          label: acc.accountName
        })));
      }
    } catch (error) {
      console.log("Could not fetch accounts:", error.message);
    }
  };

  // Handle search
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const filtered = transactions.filter(item => 
          (item.source && item.source.toLowerCase().includes(searchLower)) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.notes && item.notes.toLowerCase().includes(searchLower)) ||
          (item.category && item.category.toLowerCase().includes(searchLower))
        );
        setFilteredTransactions(filtered);
        setCurrentPage(1);
      } else {
        setFilteredTransactions(transactions);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchTerm, transactions]);

  // Handle adding income/expense
  const handleAddIncome = async () => {
    await fetchTransactions();
    setSuccess("Income added successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleAddExpense = async () => {
    await fetchTransactions();
    setSuccess("Expense added successfully!");
    setTimeout(() => setSuccess(""), 3000);
  };

  // Check if transaction can be edited (within 12 hours)
  const canEditTransaction = (createdAt) => {
    if (!createdAt) return false;
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    return new Date(createdAt) > twelveHoursAgo;
  };

  // Handle editing transaction (within 12 hours)
  const handleEditTransaction = (transaction) => {
    const canEdit = canEditTransaction(transaction.createdAt);
    if (!canEdit) {
      setError("Cannot edit transaction after 12 hours of creation.");
      return;
    }
    
    setEditingTransaction(transaction);
    if (transaction.type === "income") {
      setIncomeModalOpen(true);
    } else {
      setExpenseModalOpen(true);
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (transaction) => {
    const canEdit = canEditTransaction(transaction.createdAt);
    if (!canEdit) {
      setError("Cannot delete transaction after 12 hours of creation.");
      return;
    }
    setTransactionToDelete(transaction);
    setShowDeleteModal(true);
  };

  // Handle actual delete
  const handleDeleteConfirm = async () => {
    if (!transactionToDelete) return;
    
    try {
      const endpoint = transactionToDelete.type === "income" ? "income" : "expense";
      const response = await axios.delete(`${BASE_URL}/${endpoint}/${transactionToDelete._id}`);
      
      if (response.data.message) {
        setSuccess("Transaction deleted successfully!");
        await fetchTransactions();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setError("Cannot delete transaction after 12 hours of creation.");
      } else {
        setError("Failed to delete transaction.");
      }
    } finally {
      setShowDeleteModal(false);
      setTransactionToDelete(null);
    }
  };

  // Calculate pagination
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction);
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetFilters = () => {
    setSelectedType("both");
    setSelectedMonth("all");
    setSelectedYear("all");
    setSelectedDivision("all");
    setSelectedCategory("all");
    setSelectedAccount("all");
    setSelectedPaymentMethod("all");
    setDateRange({ startDate: "", endDate: "" });
    setSearchTerm("");
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = ["Type", "Date", "Time", "Source", "Category", "Division", "Account", "Payment Method", "Amount", "Notes"];
    const csvData = filteredTransactions.map(item => [
      item.type,
      new Date(item.date).toLocaleDateString(),
      item.time || "",
      item.source || "",
      item.category || "",
      item.division || "",
      item.account || "",
      item.paymentMethod || "",
      item.amount,
      item.notes || ""
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

  // Get category icon
  const getCategoryIcon = (category) => {
    const incomeIcons = {
      "Salary/Wages": "💼",
      "Freelance Work": "💻",
      "Business Profits": "📈",
      "Investments": "📊",
      "Rental Income": "🏠"
    };
    
    const expenseIcons = {
      "Food & Dining": "🍕",
      "Transportation": "🚗",
      "Shopping": "🛍️",
      "Entertainment": "🎬",
      "Health & Medical": "🏥"
    };
    
    return incomeIcons[category] || expenseIcons[category] || "💰";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />
      
      {/* Main Content Area */}
      <main className={`transition-all duration-300 pt-4 ${
        isSidebarOpen ? "lg:pl-72" : "lg:pl-20"
      }`}>
        <div className="px-4 lg:px-6 transition-all duration-300 max-w-7xl mx-auto">
          
          {/* Header with Hamburger */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              {/* Mobile Hamburger Button */}
              {isMobile && (
                <button
                  onClick={toggleSidebar}
                  className="lg:hidden w-10 h-10 bg-gradient-to-r from-[#0B666A] to-emerald-600 rounded-xl shadow-sm flex items-center justify-center text-white hover:shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
                  aria-label="Toggle menu"
                >
                  <Menu size={20} />
                </button>
              )}
              
              <div>
                <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1">
                  Transaction History
                </h1>
                <p className="text-gray-600 hidden lg:block">
                  View and manage all your financial transactions
                </p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <p className="text-emerald-700 flex items-center gap-2">
                <AlertCircle size={16} />
                {success}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle size={16} />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search transactions by description, category, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0B666A]/20 focus:border-[#0B666A] outline-none transition-all duration-300"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
            {/* Filters Header */}
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <div className="flex items-center gap-3">
                <Filter size={20} className="text-[#0B666A]" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Advanced Filters</h3>
                  <p className="text-sm text-gray-500">Filter transactions by multiple criteria</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetFilters();
                    fetchTransactions();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw size={16} />
                  Reset All
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetchTransactions();
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0B666A] text-white rounded-lg hover:bg-[#0B666A]/90 transition-colors"
                >
                  <Filter size={16} />
                  Apply Filters
                </button>
                {showFilters ? (
                  <ChevronLeft className="transform rotate-90 text-gray-500" size={20} />
                ) : (
                  <ChevronLeft className="transform -rotate-90 text-gray-500" size={20} />
                )}
              </div>
            </div>

            {/* Filters Content */}
            {showFilters && (
              <div className="p-6 pt-0 border-t border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Date Range
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                            placeholder="Start Date"
                          />
                        </div>
                        <div>
                          <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                            placeholder="End Date"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Month & Year */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Month
                        </label>
                        <select
                          value={selectedMonth}
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                        >
                          {months.map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Year
                        </label>
                        <select
                          value={selectedYear}
                          onChange={(e) => setSelectedYear(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                        >
                          {years.map((year) => (
                            <option key={year.value} value={year.value}>
                              {year.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Type and Division */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                        >
                          <option value="both">All Types</option>
                          <option value="income">Income</option>
                          <option value="expense">Expense</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Division
                        </label>
                        <select
                          value={selectedDivision}
                          onChange={(e) => setSelectedDivision(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                        >
                          {divisions.map((division) => (
                            <option key={division.value} value={division.value}>
                              {division.icon} {division.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Category and Account */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                        >
                          <option value="all">All Categories</option>
                          {categories.map((category) => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account
                        </label>
                        <select
                          value={selectedAccount}
                          onChange={(e) => setSelectedAccount(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                        >
                          <option value="all">All Accounts</option>
                          {accounts.map((account) => (
                            <option key={account.value} value={account.value}>
                              {account.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={selectedPaymentMethod}
                        onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl"
                      >
                        {paymentMethods.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.icon} {method.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B666A]"></div>
              <p className="mt-2 text-gray-600">Loading transactions...</p>
            </div>
          )}

          {/* Transactions Table */}
          {!loading && !error && (
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-8 border border-gray-200">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">All Transactions</h3>
                  <p className="text-sm text-gray-500">
                    Showing {filteredTransactions.length} transactions
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Download size={16} />
                    Export CSV
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Type
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Date & Time
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-[150px]">
                        Description
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Category
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Division
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Account
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Payment
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Amount
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentTransactions.length > 0 ? (
                      currentTransactions.map((item, index) => {
                        const canEdit = canEditTransaction(item.createdAt);
                        
                        return (
                          <tr key={item._id || index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                item.type === "income" 
                                  ? "bg-emerald-100 text-emerald-800" 
                                  : "bg-red-100 text-red-800"
                              }`}>
                                {item.type?.charAt(0).toUpperCase() + item.type?.slice(1) || "Transaction"}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="font-medium">
                                {new Date(item.date).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {item.time ? item.time.substring(0, 5) : "N/A"}
                              </div>
                            </td>
                            <td className="px-3 py-4 text-sm text-gray-900">
                              <div className="font-medium truncate max-w-[150px]" title={item.source || item.description || "No description"}>
                                {item.source || item.description || "No description"}
                              </div>
                              {item.notes && (
                                <div className="text-xs text-gray-500 truncate max-w-[150px]" title={item.notes}>
                                  {item.notes}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <span className="text-sm">{getCategoryIcon(item.category)}</span>
                                <span className="text-xs font-medium text-gray-700 truncate max-w-[100px]">
                                  {item.category || item.source || "N/A"}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded text-xs ${
                                item.division === "Office" 
                                  ? "bg-purple-100 text-purple-800" 
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                                {item.division?.charAt(0).toUpperCase() + item.division?.slice(1) || "Personal"}
                              </span>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-1">
                                <Wallet size={14} className="text-gray-400 flex-shrink-0" />
                                <span className="truncate max-w-[80px]">{item.account || "N/A"}</span>
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-1">
                                <span className="flex-shrink-0">{getPaymentMethodIcon(item.paymentMethod)}</span>
                                <span className="truncate max-w-[80px]">{item.paymentMethod || "N/A"}</span>
                              </div>
                            </td>
                            <td className={`px-3 py-4 whitespace-nowrap text-sm font-medium ${
                              item.type === "income" ? "text-emerald-700" : "text-red-700"
                            }`}>
                              <div className="flex items-center gap-1">
                                <span>{item.type === "income" ? "+" : "-"}</span>
                                <span>₹{item.amount?.toLocaleString() || "0"}</span>
                              </div>
                            </td>
                            <td className="px-3 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditTransaction(item)}
                                  disabled={!canEdit}
                                  className={`p-1.5 rounded-lg ${
                                    canEdit
                                      ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  } transition-colors`}
                                  title={canEdit ? "Edit (within 12 hours)" : "Cannot edit after 12 hours"}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(item)}
                                  disabled={!canEdit}
                                  className={`p-1.5 rounded-lg ${
                                    canEdit
                                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  } transition-colors`}
                                  title={canEdit ? "Delete (within 12 hours)" : "Cannot delete after 12 hours"}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="9" className="px-6 py-12 text-center">
                          <div className="text-gray-400 mb-2">No transactions found</div>
                          <p className="text-gray-500 text-sm">
                            {selectedType !== "both" || selectedMonth !== "all" || selectedYear !== "all" || searchTerm
                              ? "Try adjusting your filters or search"
                              : "Add your first transaction to get started"}
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredTransactions.length > 0 && (
                <div className="flex flex-col lg:flex-row items-center justify-between mt-6 pt-6 border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-500">
                    Showing {indexOfFirstTransaction + 1} to {Math.min(indexOfLastTransaction, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                              currentPage === pageNum
                                ? "bg-[#0B666A] text-white"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="px-1 text-gray-400">...</span>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                              currentPage === totalPages
                                ? "bg-[#0B666A] text-white"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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
          onClose={() => {
            setIncomeModalOpen(false);
            setEditingTransaction(null);
          }}
          onAddIncome={handleAddIncome}
          editingIncome={editingTransaction?.type === "income" ? editingTransaction : null}
        />
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setExpenseModalOpen(false);
            setEditingTransaction(null);
          }}
          onAddExpense={handleAddExpense}
          editingExpense={editingTransaction?.type === "expense" ? editingTransaction : null}
        />
        
        {/* Delete Confirmation Modal */}
        {showDeleteModal && transactionToDelete && (
          <DeleteConfirmationModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setTransactionToDelete(null);
            }}
            onConfirm={handleDeleteConfirm}
            title="Delete Transaction"
            message={`Are you sure you want to delete this ${transactionToDelete.type} transaction? This action cannot be undone.`}
            transactionType={transactionToDelete.type}
            transactionDetails={{
              amount: transactionToDelete.amount,
              category: transactionToDelete.category,
              date: transactionToDelete.date
            }}
          />
        )}
      </main>
    </div>
  );
};

export default Transactions;