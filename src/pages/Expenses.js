import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { useSidebar } from "../context/SidebarContext";
import ExpenseModal from "../components/ExpenseModal";
import { Bar, Pie } from "react-chartjs-2";
import "chart.js/auto";
import {
  TrendingUp,
  TrendingDown,
  Filter,
  Minus,
  DollarSign,
  PieChart as PieChartIcon,
  Wallet,
  Building,
  CreditCard,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Download,
  Edit,
  Trash2,
  AlertTriangle,
  Tag,
  FileText,
} from "lucide-react";
import axios from "axios";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

const Expenses = () => {
  const { isSidebarOpen } = useSidebar();
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseData, setExpenseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [editingExpense, setEditingExpense] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const BASE_URL = "https://money-manager-backend-1-8wqn.onrender.com/api";
  const userEmail = localStorage.getItem("userEmail");

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
  // Handle opening delete confirmation modal
  const handleOpenDeleteModal = (expense) => {
    const canEdit = canEditTransaction(expense.createdAt);
    if (!canEdit) {
      setError("Cannot delete expense after 12 hours of creation.");
      return;
    }
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  };

  // Handle actual deletion after confirmation
  const handleConfirmDelete = async () => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/expense/${expenseToDelete._id}`,
      );
      if (response.data.message) {
        setSuccess("Expense deleted successfully!");
        await fetchExpenseData();
        await fetchSummary();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        setError("Cannot delete expense after 12 hours of creation.");
      } else {
        setError("Failed to delete expense.");
      }
    } finally {
      setDeleteModalOpen(false);
      setExpenseToDelete(null);
    }
  };
  // Default categories
  const defaultExpenseCategories = [
    "Food & Dining",
    "Transportation",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Health & Medical",
    "Education",
    "Rent/Mortgage",
    "Insurance",
    "Travel",
    "Personal Care",
    "Gifts & Donations",
    "Subscriptions",
    "Fuel",
    "Loan",
    "Other",
  ];

  const defaultAccounts = ["Cash", "Primary Account", "Savings Account"];
  const divisions = ["Personal", "Office"];
  const paymentMethods = [
    "Cash",
    "Bank Transfer",
    "Credit Card",
    "UPI",
    "Cheque",
    "Other",
  ];

  useEffect(() => {
    if (userEmail) {
      fetchExpenseData();
      fetchCategories();
      fetchAccounts();
      fetchSummary();
    }
  }, []);

  // Fetch expense data with filters
  const fetchExpenseData = async () => {
    try {
      if (!userEmail) {
        setError("User not logged in. Please log in to view expense details.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      // Build query parameters
      const params = new URLSearchParams();

      if (dateRange.startDate && dateRange.endDate) {
        params.append("startDate", dateRange.startDate);
        params.append("endDate", dateRange.endDate);
      }

      if (selectedDivision !== "all") {
        params.append("division", selectedDivision);
      }

      if (selectedCategory && selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      if (selectedAccount && selectedAccount !== "all") {
        params.append("account", selectedAccount);
      }

      if (selectedPaymentMethod !== "all") {
        params.append("paymentMethod", selectedPaymentMethod);
      }

      if (selectedMonth !== "all") {
        // Create date range for selected month
        const year =
          selectedYear !== "all" ? selectedYear : new Date().getFullYear();
        const monthStart = `${year}-${selectedMonth.padStart(2, "0")}-01`;
        const monthEnd = `${year}-${selectedMonth.padStart(2, "0")}-${new Date(year, selectedMonth, 0).getDate()}`;
        params.append("startDate", monthStart);
        params.append("endDate", monthEnd);
      } else if (selectedYear !== "all") {
        // Create date range for selected year
        params.append("startDate", `${selectedYear}-01-01`);
        params.append("endDate", `${selectedYear}-12-31`);
      }

      const url = `${BASE_URL}/expense/${userEmail}${params.toString() ? "?" + params.toString() : ""}`;
      const response = await axios.get(url);

      console.log("Fetched expense data:", response.data);
      setExpenseData(response.data);
    } catch (error) {
      console.error("Error fetching expense data:", error);
      setError("Failed to load expense data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/categories/${userEmail}?type=Expense`,
      );
      if (response.data && response.data.length > 0) {
        setCategories(response.data.map((cat) => cat.name));
      } else {
        setCategories(defaultExpenseCategories);
      }
    } catch (error) {
      console.log("Using default categories:", error.message);
      setCategories(defaultExpenseCategories);
    }
  };

  // Fetch accounts from backend
  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/accounts/${userEmail}`);
      if (response.data && response.data.length > 0) {
        setAccounts(response.data.map((acc) => acc.accountName));
      } else {
        setAccounts(defaultAccounts);
      }
    } catch (error) {
      console.log("Using default accounts:", error.message);
      setAccounts(defaultAccounts);
    }
  };

  // Fetch summary data
  const fetchSummary = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/expense/summary/${userEmail}`,
      );
      setSummaryData(response.data);
    } catch (error) {
      console.log("Could not fetch summary:", error.message);
    }
  };

  // Handle adding expense
  const handleAddExpense = async (newExpense) => {
    try {
      await fetchExpenseData();
      await fetchSummary();
      setSuccess("Expense added successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to refresh expense data.");
    }
  };

  // Handle editing expense (within 12 hours)
  const handleEditExpense = async (expense) => {
    const canEdit = canEditTransaction(expense.createdAt);
    if (!canEdit) {
      setError("Cannot edit expense after 12 hours of creation.");
      return;
    }
    setEditingExpense(expense);
    setExpenseModalOpen(true);
  };

  // Check if transaction can be edited (within 12 hours)
  const canEditTransaction = (createdAt) => {
    if (!createdAt) return false;
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    return new Date(createdAt) > twelveHoursAgo;
  };

  // Filter expense data based on selected filters
  const filteredExpenseData = expenseData.filter((expense) => {
    const expenseDate = new Date(expense.date);
    const month = (expenseDate.getMonth() + 1).toString();
    const year = expenseDate.getFullYear().toString();

    const monthMatch = selectedMonth === "all" || month === selectedMonth;
    const yearMatch = selectedYear === "all" || year === selectedYear;
    const categoryMatch =
      !selectedCategory ||
      selectedCategory === "all" ||
      expense.category === selectedCategory ||
      expense.source === selectedCategory;
    const accountMatch =
      !selectedAccount ||
      selectedAccount === "all" ||
      expense.account === selectedAccount;
    const divisionMatch =
      !selectedDivision ||
      selectedDivision === "all" ||
      expense.division === selectedDivision;
    const paymentMethodMatch =
      !selectedPaymentMethod ||
      selectedPaymentMethod === "all" ||
      expense.paymentMethod === selectedPaymentMethod;

    return (
      monthMatch &&
      yearMatch &&
      categoryMatch &&
      accountMatch &&
      divisionMatch &&
      paymentMethodMatch
    );
  });

  // Calculate totals
  const totalExpense = filteredExpenseData.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );
  const avgExpense =
    filteredExpenseData.length > 0
      ? (totalExpense / filteredExpenseData.length).toFixed(2)
      : 0;

  // Group expense by category
  const expenseByCategory = filteredExpenseData.reduce((acc, expense) => {
    const category = expense.category || expense.source || "Other";
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {});

  // Group expense by account
  const expenseByAccount = filteredExpenseData.reduce((acc, expense) => {
    const account = expense.account || "Cash";
    acc[account] = (acc[account] || 0) + expense.amount;
    return acc;
  }, {});

  // Group expense by division
  const expenseByDivision = filteredExpenseData.reduce((acc, expense) => {
    const division = expense.division || "Personal";
    acc[division] = (acc[division] || 0) + expense.amount;
    return acc;
  }, {});

  // Group expense by payment method
  const expenseByPaymentMethod = filteredExpenseData.reduce((acc, expense) => {
    const method = expense.paymentMethod || "Other";
    acc[method] = (acc[method] || 0) + expense.amount;
    return acc;
  }, {});

  // Get top expense categories
  const topExpenseCategories = Object.entries(expenseByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage:
        totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(1) : 0,
    }));

  // Reset filters
  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedMonth("all");
    setSelectedYear("all");
    setSelectedAccount("all");
    setSelectedDivision("all");
    setSelectedPaymentMethod("all");
    setDateRange({ startDate: "", endDate: "" });
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = [
      "Date",
      "Time",
      "Source",
      "Category",
      "Division",
      "Account",
      "Payment Method",
      "Amount",
      "Notes",
    ];
    const csvData = filteredExpenseData.map((expense) => [
      new Date(expense.date).toLocaleDateString(),
      expense.time || "",
      expense.source || "",
      expense.category || "",
      expense.division || "",
      expense.account || "",
      expense.paymentMethod || "",
      expense.amount,
      expense.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  // Chart data
  const barChartData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        label: "Expense Amount",
        data: Object.values(expenseByCategory),
        backgroundColor: [
          "#E63946",
          "#FF6B6B",
          "#FF9F1C",
          "#FFD166",
          "#06D6A0",
          "#118AB2",
          "#7209B7",
        ],
        borderColor: "#E63946",
        borderWidth: 1,
      },
    ],
  };

  const pieChartData = {
    labels: Object.keys(expenseByCategory),
    datasets: [
      {
        data: Object.values(expenseByCategory),
        backgroundColor: [
          "#E63946",
          "#FF6B6B",
          "#FF9F1C",
          "#FFD166",
          "#06D6A0",
          "#118AB2",
          "#7209B7",
          "#EF4444",
          "#F97316",
          "#EAB308",
          "#84CC16",
          "#06B6D4",
          "#8B5CF6",
          "#EC4899",
        ],
        hoverOffset: 8,
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  // Get category icon
  const getCategoryIcon = (categoryName) => {
    const icons = {
      "Food & Dining": "🍕",
      Transportation: "🚗",
      Shopping: "🛍️",
      Entertainment: "🎬",
      "Bills & Utilities": "💡",
      "Health & Medical": "🏥",
      Education: "📚",
      "Rent/Mortgage": "🏠",
      Insurance: "🛡️",
      Travel: "✈️",
      "Personal Care": "💇",
      "Gifts & Donations": "🎁",
      Subscriptions: "📱",
      Fuel: "⛽",
      Loan: "💳",
      Other: "🔹",
    };
    return icons[categoryName] || "💰";
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    const icons = {
      Cash: "💵",
      "Bank Transfer": "🏦",
      "Credit Card": "💳",
      UPI: "📱",
      Cheque: "📄",
      Other: "🔹",
    };
    return icons[method] || "💰";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar />

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 pt-4 ${
          isSidebarOpen ? "lg:pl-72 lg:pr-8" : "lg:pl-20 lg:pr-8"
        }`}
      >
        <div
          className={`px-4 lg:px-6 transition-all duration-300 ${
            isSidebarOpen ? "lg:max-w-7xl mx-auto" : "lg:max-w-8xl mx-auto"
          }`}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl lg:text-4xl font-bold text-gray-900 lg:mb-2 mb-0 ml-5 text-center lg:text-left">
              Expense Dashboard
            </h1>
            <p className="text-gray-600 hidden lg:block text-center lg:text-left">
              Track and analyze your spending habits and categories
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <p className="text-emerald-700 flex items-center gap-2">
                <TrendingUp size={16} />
                {success}
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle size={20} />
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E63946]"></div>
              <p className="mt-2 text-gray-600">Loading expense data...</p>
            </div>
          )}

          {/* Stats Cards */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Expense Card */}
                <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-4 shadow-sm border border-red-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Total Expense
                    </h3>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <DollarSign size={18} className="text-red-600" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-red-700 mb-1">
                    ₹{totalExpense.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    From {filteredExpenseData.length} transactions
                  </p>
                </div>

                {/* Average Expense Card */}
                <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-4 shadow-sm border border-orange-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Average Expense
                    </h3>
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingDown size={18} className="text-orange-600" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-orange-700 mb-1">
                    ₹{avgExpense.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Per transaction</p>
                </div>

                {/* Categories Card */}
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-4 shadow-sm border border-purple-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Expense Categories
                    </h3>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Tag size={18} className="text-purple-600" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-purple-700 mb-1">
                    {Object.keys(expenseByCategory).length}
                  </p>
                  <p className="text-xs text-gray-500">Unique categories</p>
                </div>

                {/* Top Category Card */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-4 shadow-sm border border-blue-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Top Category
                    </h3>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp size={18} className="text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-blue-700 mb-1 truncate">
                    {topExpenseCategories[0]?.category || "N/A"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {topExpenseCategories[0]
                      ? `${topExpenseCategories[0].percentage}% of total`
                      : "No data"}
                  </p>
                </div>
              </div>

              {/* REPLACED: Expense by Accounts Section (instead of Top Expense Categories) */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Expense by Accounts
                  </h3>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Download size={14} />
                    Export CSV
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(expenseByAccount).map(([account, amount]) => {
                    const percentage =
                      totalExpense > 0
                        ? ((amount / totalExpense) * 100).toFixed(1)
                        : 0;

                    return (
                      <div
                        key={account}
                        className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                              <Wallet size={18} className="text-red-600" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {account}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {percentage}% of total
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-red-700">
                          ₹{amount.toLocaleString()}
                        </p>
                        <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* If no accounts have expenses yet */}
                  {Object.keys(expenseByAccount).length === 0 && (
                    <div className="col-span-3 text-center py-6">
                      <Wallet className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-gray-500">
                        No expense data by accounts yet
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {/* All Filters in One Section */}
          {!loading && !error && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
              {/* Filters Header */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors gap-3"
                onClick={() => setShowFilters(!showFilters)}
              >
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  <Filter size={18} className="text-[#E63946]" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Filters
                    </h3>
                    <p className="text-xs text-gray-500">
                      Filter your expense transactions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap mt-2 sm:mt-0 w-full sm:w-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetFilters();
                      fetchExpenseData();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <RefreshCw size={14} />
                    Reset All
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchExpenseData();
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#E63946] hover:text-[#E63946]/80 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <RefreshCw size={14} />
                    Apply Filters
                  </button>
                  {showFilters ? (
                    <ChevronUp size={18} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-500" />
                  )}
                </div>
              </div>

              {/* Filters Content */}
              {showFilters && (
                <div className="p-4 pt-0 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Date Range */}
                    <div className="sm:col-span-2 lg:col-span-3">
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Date Range
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) =>
                            setDateRange({
                              ...dateRange,
                              startDate: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg"
                          placeholder="Start Date"
                        />
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) =>
                            setDateRange({
                              ...dateRange,
                              endDate: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg"
                          placeholder="End Date"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg"
                      >
                        <option value="all">All Categories</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {getCategoryIcon(category)} {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Month */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Month
                      </label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg"
                      >
                        {months.map((month) => (
                          <option key={month.value} value={month.value}>
                            {month.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Year */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Year
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg"
                      >
                        {years.map((year) => (
                          <option key={year.value} value={year.value}>
                            {year.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Account */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Account
                      </label>
                      <select
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg"
                      >
                        <option value="all">All Accounts</option>
                        {accounts.map((account) => (
                          <option key={account} value={account}>
                            {account}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Division */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Division
                      </label>
                      <select
                        value={selectedDivision}
                        onChange={(e) => setSelectedDivision(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg"
                      >
                        <option value="all">All Divisions</option>
                        {divisions.map((division) => (
                          <option key={division} value={division}>
                            {division === "Office"
                              ? "🏢 Office"
                              : "👤 Personal"}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={selectedPaymentMethod}
                        onChange={(e) =>
                          setSelectedPaymentMethod(e.target.value)
                        }
                        className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg"
                      >
                        <option value="all">All Methods</option>
                        {paymentMethods.map((method) => (
                          <option key={method} value={method}>
                            {getPaymentMethodIcon(method)} {method}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Expense Analytics Section */}
          {!loading && !error && filteredExpenseData.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center lg:text-left">
                Expense Analytics
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Expense by Category Bar Chart */}
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Expense by Category
                    </h3>
                    <BarChart3 size={18} className="text-[#E63946]" />
                  </div>
                  <div className="h-64">
                    <Bar
                      data={barChartData}
                      options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) =>
                                `₹${context.raw.toLocaleString()}`,
                            },
                          },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value) => `₹${value.toLocaleString()}`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Expense Distribution Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Expense Distribution
                    </h3>
                    <PieChartIcon size={18} className="text-red-600" />
                  </div>
                  <div className="h-64">
                    <Pie
                      data={pieChartData}
                      options={{
                        maintainAspectRatio: false,
                        responsive: true,
                        plugins: {
                          legend: {
                            position: "right",
                            labels: {
                              padding: 8,
                              usePointStyle: true,
                              font: { size: 10 },
                            },
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const label = context.label || "";
                                const value = context.raw || 0;
                                const percentage =
                                  totalExpense > 0
                                    ? Math.round((value / totalExpense) * 100)
                                    : 0;
                                return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
                              },
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Division & Payment Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Division Breakdown */}
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Expense by Division
                    </h3>
                    <Building size={18} className="text-purple-600" />
                  </div>
                  <div className="space-y-4">
                    {Object.entries(expenseByDivision).map(
                      ([division, amount], index) => {
                        const percentage =
                          totalExpense > 0
                            ? ((amount / totalExpense) * 100).toFixed(1)
                            : 0;

                        return (
                          <div key={division} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    division === "Office"
                                      ? "bg-purple-100 text-purple-600"
                                      : "bg-blue-100 text-blue-600"
                                  }`}
                                >
                                  {division === "Office" ? "🏢" : "👤"}
                                </div>
                                <span className="text-sm font-medium text-gray-900 capitalize">
                                  {division}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">
                                  ₹{amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {percentage}%
                                </p>
                              </div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  division === "Office"
                                    ? "bg-purple-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Payment Method Breakdown */}
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      Expense by Payment Method
                    </h3>
                    <CreditCard size={18} className="text-cyan-600" />
                  </div>
                  <div className="space-y-4">
                    {Object.entries(expenseByPaymentMethod).map(
                      ([method, amount], index) => {
                        const percentage =
                          totalExpense > 0
                            ? ((amount / totalExpense) * 100).toFixed(1)
                            : 0;

                        return (
                          <div key={method} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                  <span className="text-lg">
                                    {getPaymentMethodIcon(method)}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {method}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">
                                  ₹{amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {percentage}%
                                </p>
                              </div>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-cyan-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expense Transactions Table */}
          {!loading && !error && filteredExpenseData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Expense Transactions
                  </h3>
                  <p className="text-xs text-gray-500">
                    Showing {filteredExpenseData.length} of {expenseData.length}{" "}
                    transactions
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-red-700">
                      ₹{totalExpense.toLocaleString()}
                    </span>{" "}
                    total
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenseData.map((expense, index) => {
                      const canEdit = canEditTransaction(expense.createdAt);

                      return (
                        <tr
                          key={expense._id || index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div>
                              {new Date(expense.date).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {expense.time || "00:00"}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-[150px] truncate">
                            <div className="flex items-center gap-2">
                              <FileText size={14} className="text-gray-400" />
                              {expense.source ||
                                expense.description ||
                                "Expense"}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium flex items-center gap-1 w-fit">
                              <span className="text-sm">
                                {getCategoryIcon(
                                  expense.category || expense.source,
                                )}
                              </span>
                              {expense.category || expense.source || "Other"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                expense.division === "office" ||
                                expense.division === "Office"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {expense.division?.charAt(0).toUpperCase() +
                                expense.division?.slice(1) || "Personal"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <Wallet size={14} className="text-gray-400" />
                              <span>{expense.account || "Cash"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center gap-1">
                              <span>
                                {getPaymentMethodIcon(expense.paymentMethod)}
                              </span>
                              <span>{expense.paymentMethod || "Other"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-red-700">
                            ₹{expense.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditExpense(expense)}
                                disabled={!canEdit}
                                className={`p-1 rounded ${
                                  canEdit
                                    ? "text-blue-600 hover:bg-blue-50"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                                title={
                                  canEdit
                                    ? "Edit (within 12 hours)"
                                    : "Cannot edit after 12 hours"
                                }
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteModal(expense)}
                                disabled={!canEdit}
                                className={`p-1 rounded ${
                                  canEdit
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-gray-400 cursor-not-allowed"
                                }`}
                                title={
                                  canEdit
                                    ? "Delete (within 12 hours)"
                                    : "Cannot delete after 12 hours"
                                }
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty State for Transactions */}
          {!loading && !error && filteredExpenseData.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-200 text-center">
              <div className="text-gray-400 mb-4 text-6xl">💰</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Expense Transactions Found
              </h3>
              <p className="text-gray-500 mb-4">
                {selectedMonth !== "all" ||
                selectedYear !== "all" ||
                selectedCategory ||
                dateRange.startDate
                  ? "Try adjusting your filters or add new expense transactions"
                  : "Add your first expense transaction to get started"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => setExpenseModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-[#E63946] to-red-500 text-white font-medium rounded-lg hover:shadow transition-all duration-300 flex items-center gap-2"
                >
                  <Minus size={16} />
                  Add Expense
                </button>
                {(selectedMonth !== "all" ||
                  selectedYear !== "all" ||
                  selectedCategory ||
                  dateRange.startDate) && (
                  <button
                    onClick={resetFilters}
                    className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating Action Buttons */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
          <button
            onClick={() => setExpenseModalOpen(true)}
            className="w-12 h-12 bg-gradient-to-r from-[#E63946] to-red-500 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center text-white"
            aria-label="Add Expense"
          >
            <Minus size={20} />
          </button>
        </div>

        {/* Modals */}
        <ExpenseModal
          isOpen={isExpenseModalOpen}
          onClose={() => {
            setExpenseModalOpen(false);
            setEditingExpense(null);
          }}
          onAddExpense={handleAddExpense}
          editingExpense={editingExpense}
        />
        {/* Delete Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setExpenseToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Expense"
          message="Are you sure you want to delete this expense? This action cannot be undone."
          transactionType="expense"
          transactionDetails={{
            amount: expenseToDelete?.amount,
            category: expenseToDelete?.category || expenseToDelete?.source,
            date: expenseToDelete?.date,
          }}
        />
      </main>
    </div>
  );
};

export default Expenses;
