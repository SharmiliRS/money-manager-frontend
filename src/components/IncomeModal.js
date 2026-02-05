import { useState, useEffect,useCallback } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import axios from "axios";
import { DollarSign, Calendar, FileText, CreditCard, Wallet, TrendingUp, Building, User, Tag, Clock, Edit, AlertCircle } from "lucide-react";
 // Predefined categories if API fails
  const defaultIncomeCategories = [
    "Salary/Wages",
    "Freelance Work",
    "Business Profits",
    "Investments",
    "Rental Income",
    "Interest Earned",
    "Bonuses & Commissions",
    "Pension & Retirement Funds",
    "Government Benefits",
    "Side Hustles",
    "Gifts & Donations Received",
    "Tax Refunds",
    "Royalties",
    "Scholarships & Grants",
    "Other"
  ];

  const defaultAccounts = ["Cash", "Primary Account", "Savings Account", "Investment Account"];
  const divisions = ["Personal", "Office"];
  const paymentMethods = ["Cash", "Bank Transfer", "Credit Card", "UPI", "Cheque", "Other"];
const IncomeModal = ({ isOpen, onClose, onAddIncome, editingIncome }) => {
  const [incomeData, setIncomeData] = useState({
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

  // Populate form when editingIncome changes
  useEffect(() => {
    if (editingIncome) {
      console.log("Editing income data:", editingIncome);
      setIncomeData({
        email: editingIncome.userEmail || localStorage.getItem("userEmail") || "",
        source: editingIncome.source || "",
        amount: editingIncome.amount || "",
        paymentMethod: editingIncome.paymentMethod || "",
        date: editingIncome.date || new Date().toISOString().split('T')[0],
        time: editingIncome.time || new Date().toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        notes: editingIncome.notes || "",
        division: editingIncome.division || "Personal",
        category: editingIncome.category || "",
        account: editingIncome.account || "Cash"
      });
    } else {
      // Reset form for new income
      setIncomeData({
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
    }
  }, [editingIncome]);

 

  // Fetch categories from backend
  const fetchCategories = useCallback(async (email) => {
    try {
      const response = await axios.get(`${BASE_URL}/categories/${email}?type=Income`);
      if (response.data && response.data.length > 0) {
        setCategories(response.data.map(cat => cat.name));
      } else {
        setCategories(defaultIncomeCategories);
      }
    } catch (error) {
      console.log("Using default income categories:", error.message);
      setCategories(defaultIncomeCategories);
    }
  },[]);

  // Fetch accounts from backend
  const fetchAccounts =useCallback( async (email) => {
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
  },[]);
useEffect(() => {
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail) {
    fetchCategories(userEmail);
    fetchAccounts(userEmail);
  }
}, [fetchCategories, fetchAccounts]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setIncomeData({ ...incomeData, [name]: value });
    
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
    const missingFields = requiredFields.filter(field => !incomeData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    if (parseFloat(incomeData.amount) <= 0) {
      setError("Amount must be greater than 0");
      setLoading(false);
      return;
    }

    // Prepare payload according to backend structure
    const payload = {
      email: userEmail,
      source: incomeData.source,
      amount: parseFloat(incomeData.amount),
      paymentMethod: incomeData.paymentMethod,
      date: incomeData.date,
      time: incomeData.time || new Date().toLocaleTimeString('en-IN', { hour12: false }),
      notes: incomeData.notes || "",
      division: incomeData.division,
      category: incomeData.category,
      account: incomeData.account
    };

    console.log("📤 Sending income data:", payload);
    console.log("Editing income ID:", editingIncome?._id);

    try {
      let response;
      
      if (editingIncome) {
        // Update existing income
        response = await axios.put(`${BASE_URL}/income/${editingIncome._id}`, payload, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        console.log("✅ Income updated successfully:", response.data);
        setSuccess("✅ Income updated successfully!");
      } else {
        // Add new income
        response = await axios.post(`${BASE_URL}/income/add`, payload, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        console.log("✅ Income added successfully:", response.data);
        setSuccess("✅ Income added successfully!");
      }
      
      // Call parent callback to refresh dashboard data
      if (onAddIncome) {
        onAddIncome();
      }

      // Reset form and close after delay
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);

    } catch (error) {
      console.error("❌ Error saving income:", error);
      
      if (error.response) {
        // Server responded with error
        setError(`Error: ${error.response.data.error || error.response.data.message || "Failed to save income"}`);
      } else if (error.request) {
        // Request made but no response
        setError("No response from server. Please check if backend is running on port 5000.");
      } else {
        // Something else happened
        setError("Failed to save income. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setIncomeData({
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
      {/* Header with Hero Theme */}
      <Modal.Header
        closeButton
        className="border-0"
        style={{
          background: "linear-gradient(to right, #0B666A, #119DA4)",
          color: "white",
          padding: "1.5rem",
        }}
      >
        <div className="d-flex align-items-center w-100">
          <div className="w-10 h-10 bg-white/20 rounded-xl d-flex align-items-center justify-content-center me-3">
            {editingIncome ? <Edit size={24} className="text-white" /> : <TrendingUp size={24} className="text-white" />}
          </div>
          <div className="flex-grow-1">
            <Modal.Title className="fw-bold fs-4 mb-1">
              {editingIncome ? "Edit Income" : "Add Income"}
            </Modal.Title>
            <p className="mb-0 opacity-90" style={{ fontSize: "0.9rem" }}>
              {editingIncome ? "Update your income details" : "Record your income with all details"}
            </p>
          </div>
        </div>
      </Modal.Header>

      {/* Edit Mode Warning */}
      {editingIncome && (
        <div className="mt-3 px-3">
          <div className="alert alert-warning d-flex align-items-start mx-3" role="alert" style={{ borderRadius: "0.75rem" }}>
            <AlertCircle size={20} className="me-2 flex-shrink-0 mt-1" />
            <div>
              <strong>Editing Mode:</strong> You can only edit this income within 12 hours of creation.
              {editingIncome.createdAt && (
                <div className="text-sm mt-1">
                  Created: {new Date(editingIncome.createdAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Body with Hero Theme */}
      <Modal.Body style={{ 
        backgroundColor: "#F0F9FF",
        padding: editingIncome ? "1rem 2rem 2rem" : "2rem",
      }}>
        <Form onSubmit={handleSubmit}>
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4">
              <div className="alert alert-success d-flex align-items-start" role="alert">
                <TrendingUp size={20} className="me-2 flex-shrink-0 mt-1" />
                <div className="fw-semibold">{success}</div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4">
              <div className="alert alert-danger d-flex align-items-start" role="alert">
                <TrendingUp size={20} className="me-2 flex-shrink-0 mt-1" />
                <div className="fw-semibold">{error}</div>
              </div>
            </div>
          )}

          <div className="row g-4">
            {/* Income Source */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <FileText size={16} className="me-2 text-#0B666A" />
                  Income Source
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="text"
                    name="source"
                    placeholder="Where did this income come from?"
                    value={incomeData.source}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#0B666A/20 rounded-xl shadow-sm"
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
                  <DollarSign size={16} className="me-2 text-#0B666A" />
                  Amount (₹)
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <InputGroup className="shadow-sm rounded-xl">
                  <InputGroup.Text 
                    className="bg-white border-gray-300 border-end-0 text-#0B666A fw-semibold"
                    style={{ borderRight: "none" }}
                  >
                    ₹
                  </InputGroup.Text>
                  <Form.Control
                    type="number"
                    name="amount"
                    placeholder="0.00"
                    value={incomeData.amount}
                    onChange={handleChange}
                    required
                    min="0.01"
                    step="0.01"
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#0B666A/20"
                    style={{ borderLeft: "none" }}
                  />
                </InputGroup>
              </Form.Group>
            </div>

            {/* Category */}
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <Tag size={16} className="me-2 text-#0B666A" />
                  Category
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Select
                    name="category"
                    value={incomeData.category}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#0B666A/20 rounded-xl shadow-sm"
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
                  {incomeData.division === "Office" ? (
                    <Building size={16} className="me-2 text-#0B666A" />
                  ) : (
                    <User size={16} className="me-2 text-#0B666A" />
                  )}
                  Division
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Select
                    name="division"
                    value={incomeData.division}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#0B666A/20 rounded-xl shadow-sm"
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
                    {incomeData.division === "Office" ? (
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
                  <CreditCard size={16} className="me-2 text-#0B666A" />
                  Payment Method
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Select
                    name="paymentMethod"
                    value={incomeData.paymentMethod}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#0B666A/20 rounded-xl shadow-sm"
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
                  <Wallet size={16} className="me-2 text-#0B666A" />
                  Account
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Select
                    name="account"
                    value={incomeData.account}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#0B666A/20 rounded-xl shadow-sm"
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
                  <Calendar size={16} className="me-2 text-#0B666A" />
                  Date
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="date"
                    name="date"
                    value={incomeData.date}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#0B666A/20 rounded-xl shadow-sm"
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
                  <Clock size={16} className="me-2 text-#0B666A" />
                  Time
                  <span className="text-danger ms-1">*</span>
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type="time"
                    name="time"
                    value={incomeData.time}
                    onChange={handleChange}
                    required
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#0B666A/20 rounded-xl shadow-sm"
                    style={{
                      backgroundColor: "white",
                      border: "1px solid #E5E7EB",
                      padding: "0.75rem 1rem 0.75rem 3rem",
                    }}
                  />
                  <div className="position-absolute top-50 start-0 translate-middle-y ms-3">
                    <Clock size={18} className="text-gray-400" />
                  </div>
                </div>
              </Form.Group>
            </div>

            {/* Notes */}
            <div className="col-12">
              <Form.Group>
                <Form.Label className="fw-semibold text-gray-700 mb-2">
                  <FileText size={16} className="me-2 text-#0B666A" />
                  Notes (Optional)
                </Form.Label>
                <div className="position-relative">
                  <Form.Control
                    as="textarea"
                    name="notes"
                    rows={3}
                    placeholder="Additional details about this income..."
                    value={incomeData.notes}
                    onChange={handleChange}
                    className="form-control-lg border-gray-300 focus-ring focus-ring-#0B666A/20 rounded-xl shadow-sm"
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
                  Add any additional information about this income.
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
                background: "linear-gradient(to right, #0B666A, #119DA4)",
                border: "none",
                color: "white",
              }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {editingIncome ? "Updating Income..." : "Adding Income..."}
                </>
              ) : (
                <>
                  {editingIncome ? <Edit size={18} className="me-2" /> : <TrendingUp size={18} className="me-2" />}
                  {editingIncome ? "Update Income" : "Add Income"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>

      {/* Custom CSS for better styling */}
      <style jsx global>{`
        .focus-ring-#0B666A/20:focus {
          border-color: #0B666A !important;
          box-shadow: 0 0 0 0.25rem rgba(11, 102, 106, 0.1) !important;
        }
        
        .rounded-xl {
          border-radius: 0.75rem !important;
        }
        
        .border-gray-300 {
          border-color: #E5E7EB !important;
        }
        
        .text-#0B666A {
          color: #0B666A !important;
        }
        
        .form-control-lg {
          font-size: 1rem !important;
          height: calc(3rem + 2px) !important;
        }
        
        .form-control-lg:focus {
          box-shadow: 0 0 0 3px rgba(11, 102, 106, 0.1) !important;
          border-color: #0B666A !important;
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

export default IncomeModal;