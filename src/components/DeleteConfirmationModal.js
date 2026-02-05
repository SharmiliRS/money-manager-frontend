import React from "react";
import { AlertTriangle, X } from "lucide-react";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Transaction",
  message = "Are you sure you want to delete this transaction?",
  transactionType = "transaction",
  transactionDetails = {}
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${transactionType === "income" ? "bg-red-100 text-red-600" : "bg-red-100 text-red-600"}`}>
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              {message}
            </p>
            
            {transactionDetails.amount && (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <span className={`font-bold ${transactionType === "income" ? "text-red-600" : "text-red-600"}`}>
                    ₹{transactionDetails.amount?.toLocaleString()}
                  </span>
                </div>
                {transactionDetails.category && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Category:</span>
                    <span className="font-medium text-gray-900">{transactionDetails.category}</span>
                  </div>
                )}
                {transactionDetails.date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(transactionDetails.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-gray-500 mb-6">
              Note: Transactions can only be deleted within 12 hours of creation.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-colors shadow-sm"
            >
              Delete Transaction
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;