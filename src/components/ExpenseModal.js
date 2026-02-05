import { useState, useEffect, useCallback } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import { Minus, Calendar, FileText, CreditCard, Tag, TrendingDown, AlertCircle, Building, User, Wallet, Edit } from "lucide-react";
 // Predefined categories if API fails
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
    "Other"
  ];

  const defaultAccounts = ["Cash", "Primary Account", "Savings Account"];
  const divisions = ["Personal", "Office"];
  const paymentMethods = ["Cash", "Bank Transfer", "Credit Card", "UPI", "Cheque", "Other"];
const ExpenseModal = ({ isOpen, onClose, onAddExpense, editingExpense }) => {
  const [expenseData, setExpenseData] = useState({
    email: localStorage.getItem("userEmail") || "",
    source: "",
    amount: "",
    paymentMethod: "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    notes: "",
    division: "Personal",
    category: "",
    account: "Cash"
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories and accounts from API
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]);

 

  const BASE_URL = "http://localhost:5000/api";



  // Fetch categories from backend
const fetchCategories = useCallback(async (email) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/categories/${email}?type=Expense`
    );

    if (response.data && response.data.length > 0) {
      setCategories(response.data.map(cat => cat.name));
    } else {
      setCategories(defaultExpenseCategories);
    }
  } catch (error) {
    console.log("Using default categories:", error.message);
    setCategories(defaultExpenseCategories);
  }
}, []);



  // Fetch accounts from backend
const fetchAccounts = useCallback(async (email) => {
  try {
    const response = await axios.get(`${BASE_URL}/accounts/${email}`);
    if (response.data && response.data.length > 0) {
      setAccounts(response.data.map(acc => acc.accountName));
    } else {
      setAccounts(defaultAccounts);
    }
  } catch (error) {
    console.log("Using default accounts:", error.message);
    setAccounts(defaultAccounts);
  }
}, []);

  // Reset form when editingExpense changes
useEffect(() => {
  const userEmail = localStorage.getItem("userEmail");

  if (userEmail) {
    setExpenseData(prev => ({ ...prev, email: userEmail }));
    fetchCategories(userEmail);
    fetchAccounts(userEmail);
  }

  // Pre-fill form if editing
  if (editingExpense) {
    setExpenseData({
      email: editingExpense.email || userEmail || "",
      source: editingExpense.source || "",
      amount: editingExpense.amount || "",
      paymentMethod: editingExpense.paymentMethod || "",
      date:
        editingExpense.date ||
        new Date().toISOString().split("T")[0],
      time:
        editingExpense.time ||
        new Date().toLocaleTimeString("en-IN", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit"
        }),
      notes: editingExpense.notes || "",
      division: editingExpense.division || "Personal",
      category: editingExpense.category || "",
      account: editingExpense.account || "Cash"
    });
  }
}, [editingExpense, fetchCategories, fetchAccounts]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpenseData({ ...expenseData, [name]: value });
    
    // Clear messages
    if (error) setError("");
    if (success) setSuccess("");
    
    // Validation for amount
    if (name === "amount" && parseFloat(value) < 0) {
      setError("Amount cannot be negative!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      setError("Please log in to continue");
      setLoading(false);
      return;
    }

    // Validate required fields
    const requiredFields = ['source', 'amount', 'paymentMethod', 'date', 'category', 'account', 'division'];
    const missingFields = requiredFields.filter(field => !expenseData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    if (parseFloat(expenseData.amount) <= 0) {
      setError("Amount must be greater than 0");
      setLoading(false);
      return;
    }

    // Prepare payload according to backend structure
    const payload = {
      email: userEmail,
      source: expenseData.source,
      amount: parseFloat(expenseData.amount),
      paymentMethod: expenseData.paymentMethod,
      date: expenseData.date,
      time: expenseData.time || new Date().toLocaleTimeString('en-IN', { hour12: false }),
      notes: expenseData.notes || "",
      division: expenseData.division,
      category: expenseData.category,
      account: expenseData.account
    };

    console.log("📤 Sending expense data:", payload);

    try {
      let response;
      
      if (editingExpense && editingExpense._id) {
        // Update existing expense
        console.log("Updating expense:", editingExpense._id);
        response = await axios.put(`${BASE_URL}/expense/${editingExpense._id}`, payload, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        console.log("✅ Expense updated successfully:", response.data);
        setSuccess("✅ Expense updated successfully!");
      } else {
        // Add new expense
        response = await axios.post(`${BASE_URL}/expense/minus`, payload, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        console.log("✅ Expense added successfully:", response.data);
        setSuccess("✅ Expense added successfully!");
      }
      
      // Call parent callback to refresh dashboard data
      if (onAddExpense) {
        onAddExpense();
      }

      // Reset form and close after delay
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);

    } catch (error) {
      console.error("❌ Error saving expense:", error);
      
      if (error.response) {
        // Server responded with error
        const errorMessage = error.response.data.error || error.response.data.message || "Failed to save expense";
        
        // Check if it's an edit restriction error
        if (error.response.status === 403 && errorMessage.includes("12 hours")) {
          setError("Cannot edit expense after 12 hours of creation.");
        } else {
          setError(`Error: ${errorMessage}`);
        }
      } else if (error.request) {
        // Request made but no response
        setError("No response from server. Please check if backend is running on port 5000.");
      } else {
        // Something else happened
        setError("Failed to save expense. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setExpenseData({
      email: localStorage.getItem("userEmail") || "",
      source: "",
      amount: "",
      paymentMethod: "",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      notes: "",
      division: "Personal",
      category: "",
      account: "Cash"
    });
    setError("");
    setSuccess("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal show={isOpen} onHide={handleClose} centered size="lg">
      <Modal.Header
        closeButton
        className="border-0"
        style={{
          background: editingExpense ? "linear-gradient(to right, #F59E0B, #FBBF24)" : "linear-gradient(to right, #E63946, #FF6B6B)",
          color: "white",
          padding: "1.5rem",
        }}
      >
        <div className="d-flex align-items-center w-100">
          <div className="w-10 h-10 bg-white/20 rounded-xl d-flex align-items-center justify-content-center me-3">
            {editingExpense ? (
              <Edit size={24} className="text-white" />
            ) : (
              <TrendingDown size={24} className="text-white" />
            )}
          </div>
          <div className="flex-grow-1">
            <Modal.Title className="fw-bold fs-4 mb-1">
              {editingExpense ? "Edit Expense" : "Add Expense"}
            </Modal.Title>
            <p className="mb-0 opacity-90" style={{ fontSize: "0.9rem" }}>
              {editingExpense ? "Update your expense details" : "Record your expense with all details"}
            </p>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body style={{ 
        backgroundColor: "#FEF2F2",
        padding: "2rem",
      }}>
        <Form onSubmit={handleSubmit}>
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4">
              <div className="alert alert-success d-flex align-items-start" role="alert">
                <AlertCircle size={20} className="me-2 flex-shrink-0 mt-1" />
                <div className="fw-semibold">{success}</div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4">
              <div className="alert alert-danger d-flex align-items-start" role="alert">
                <AlertCircle size={20} className="me-2 flex-shrink-0 mt-1" />
                <div className="fw-semibold">{error}</div>
              </div>
            </div>
          )}

          {/* Edit Mode Warning */}
          {editingExpense && (
            <div className="mb-4">
              <div className="alert alert-warning d-flex align-items-start" role="alert">
                <AlertCircle size={20} className="me-2 flex-shrink-0 mt-1" />
                <div>
                  <strong>Editing Mode:</strong> You can only edit this expense within 12 hours of creation.
                  {editingExpense.createdAt && (
                    <div className="text-sm mt-1">
                      Created: {new Date(editingExpense.createdAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="row g-4">
            {/* Expense Description/Source */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <FileText size={16} className="me-2 text-#E63946" />
                  Expense Description
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    name="source"
                    placeholder="What was this expense for?"
                    value={expenseData.source}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#E63946/20 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      padding: "0.75rem 1rem 0.75rem 3rem",
                    }}
                  />
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                </div>
              </Form.Group>
            </div>

            {/* Amount */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <Minus size={16} className="me-2 text-#E63946" />
                  Amount (₹)
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <InputGroup className="shadow-sm rounded-xl">
                  <InputGroup.Text 
                    className="bg-white border-gray-300 border-end-0 text-#E63946 fw-semibold"
                    style={{ borderRight: "none" }}
                  >
                    ₹
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    value={expenseData.amount}
                    onChange={handleChange}
                    required
                    min="0.01"
                    step="0.01"
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#E63946/20"
                    style={{ borderLeft: "none" }}
                  />
                </InputGroup>
              </Form.Group>
            </div>

            {/* Category */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <Tag size={16} className="me-2 text-#E63946" />
                  Category
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Select
                    name="category"
                    value={expenseData.category}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#E63946/20 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      padding: "0.75rem 1rem 0.75rem 3rem",
                    }}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Form.Select>
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                    <Tag size={18} className="text-gray-400" />
                  </div>
                </div>
              </Form.Group>
            </div>

            {/* Division */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  {expenseData.division === "Office" ? (
                    <Building size={16} className="me-2 text-#E63946" />
                  ) : (
                    <User size={16} className="me-2 text-#E63946" />
                  )}
                  Division
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Select
                    name="division"
                    value={expenseData.division}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#E63946/20 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      padding: "0.75rem 1rem 0.75rem 3rem",
                    }}
                  >
                    {divisions.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </Form.Select>
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                    {expenseData.division === "Office" ? (
                      <Building size={18} className="text-gray-400" />
                    ) : (
                      <User size={18} className="text-gray-400" />
                    )}
                  </div>
                </div>
              </Form.Group>
            </div>

            {/* Payment Method */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <CreditCard size={16} className="me-2 text-#E63946" />
                  Payment Method
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Select
                    name="paymentMethod"
                    value={expenseData.paymentMethod}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#E63946/20 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      padding: "0.75rem 1rem 0.75rem 3rem",
                    }}
                  >
                    <option value="">Select Method</option>
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </Form.Select>
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                    <CreditCard size={18} className="text-gray-400" />
                  </div>
                </div>
              </Form.Group>
            </div>

            {/* Account */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <Wallet size={16} className="me-2 text-#E63946" />
                  Account
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Select
                    name="account"
                    value={expenseData.account}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#E63946/20 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      padding: "0.75rem 1rem 0.75rem 3rem",
                    }}
                  >
                    <option value="">Select Account</option>
                    {accounts.map((account) => (
                      <option key={account} value={account}>
                        {account}
                      </option>
                    ))}
                  </Form.Select>
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                    <Wallet size={18} className="text-gray-400" />
                  </div>
                </div>
              </Form.Group>
            </div>

            {/* Date */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <Calendar size={16} className="me-2 text-#E63946" />
                  Date
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="date"
                    name="date"
                    value={expenseData.date}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#E63946/20 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      padding: "0.75rem 1rem 0.75rem 3rem",
                    }}
                  />
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                </div>
              </Form.Group>
            </div>

            {/* Time */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <Calendar size={16} className="me-2 text-#E63946" />
                  Time
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="time"
                    name="time"
                    value={expenseData.time}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#E63946/20 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      padding: "0.75rem 1rem 0.75rem 3rem",
                    }}
                  />
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                </div>
              </Form.Group>
            </div>

            {/* Notes */}
            <div className="col-12">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <FileText size={16} className="me-2 text-#E63946" />
                  Notes (Optional)
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    as="textarea"
                    name="notes"
                    rows={3}
                    placeholder="Additional details about this expense..."
                    value={expenseData.notes}
                    onChange={handleChange}
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#E63946/20 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      padding: "0.75rem 1rem 0.75rem 3rem",
                      resize: "none",
                    }}
                  />
                  <div className="position-absolute top-0 start-0 ms-3 mt-3">
                    <FileText size={18} className="text-gray-400" />
                  </div>
                </div>
                <Form.Text className="text-muted">
                  Add any additional information about this expense.
                </Form.Text>
              </Form.Group>
            </div>
          </div>

          {/* Footer Buttons */}
          <Modal.Footer className="border-0 pt-4 px-0">
            <Button
              variant="light"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl fw-semibold border-gray-300"
              style={{
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #E5E7EB",
              }}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="px-4 py-2 rounded-xl fw-semibold"
              style={{
                background: editingExpense ? "linear-gradient(to right, #F59E0B, #FBBF24)" : "linear-gradient(to right, #E63946, #FF6B6B)",
                border: "none",
                color: "white",
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {editingExpense ? "Updating Expense..." : "Adding Expense..."}
                </>
              ) : (
                <>
                  {editingExpense ? <Edit size={18} className="me-2" /> : <Minus size={18} className="me-2" />}
                  {editingExpense ? "Update Expense" : "Add Expense"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>

      <style jsx global>{`
        .focus-ring-#E63946/20:focus {
          border-color: #E63946 !important;
          box-shadow: 0 0 0 0.25rem rgba(230, 57, 70, 0.1) !important;
        }
        
        .rounded-xl {
          border-radius: 0.75rem !important;
        }
        
        .border-gray-300 {
          border-color: #E5E7EB !important;
        }
        
        .text-#E63946 {
          color: #E63946 !important;
        }
        
        .form-control-lg {
          font-size: 1rem !important;
          height: calc(3rem + 2px) !important;
        }
        
        .form-control-lg:focus {
          box-shadow: 0 0 0 3px rgba(230, 57, 70, 0.1) !important;
          border-color: #E63946 !important;
        }
        
        .modal-content {
          border-radius: 1rem !important;
          border: none !important;
          overflow: hidden !important;
        }
        
        .modal-header .btn-close {
          filter: invert(1) brightness(200%);
          opacity: 0.8;
        }
        
        .modal-header .btn-close:hover {
          opacity: 1;
        }
        
        /* Custom select arrow */
        select.form-control-lg {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 16px 12px;
          padding-right: 3rem !important;
        }
      `}</style>
    </Modal>
  );
};

export default ExpenseModal;