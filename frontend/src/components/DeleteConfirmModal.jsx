import React from 'react';
import { X, AlertCircle } from 'lucide-react';

function DeleteConfirmModal({ 
  modalType, 
  setModalType, 
  selectedBook, 
  handleDeleteConfirm 
}) {
  if (modalType !== 'delete' || !selectedBook) return null;

  return (
    <div className="modal-overlay" onClick={() => setModalType(null)}>
      <div className="modal-content confirm-delete" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: 'none' }}>
          <h3 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={22} />
            Confirm Deletion
          </h3>
          <button className="modal-close-btn" onClick={() => setModalType(null)}>
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body" style={{ paddingTop: '0.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.4' }}>
            Are you sure you want to delete the book <strong>"{selectedBook.title}"</strong>? 
            This action is permanent and cannot be undone.
          </p>
        </div>

        <div className="modal-footer" style={{ borderTop: 'none' }}>
          <button onClick={() => setModalType(null)} className="btn btn-secondary">
            Cancel
          </button>
          <button onClick={handleDeleteConfirm} className="btn btn-danger">
            Delete Book
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
