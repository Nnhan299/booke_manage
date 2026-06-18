import React from 'react';
import { X, Edit } from 'lucide-react';

function BookDetailModal({ 
  modalType, 
  setModalType, 
  selectedBook, 
  openEditModal 
}) {
  if (modalType !== 'detail' || !selectedBook) return null;

  return (
    <div className="modal-overlay" onClick={() => setModalType(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Book Details</h3>
          <button className="modal-close-btn" onClick={() => setModalType(null)}>
            <X size={18} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-label">ID:</div>
            <div className="detail-value">{selectedBook.id}</div>
            
            <div className="detail-label">Title:</div>
            <div className="detail-value">{selectedBook.title}</div>
            
            <div className="detail-label">Author:</div>
            <div className="detail-value">{selectedBook.author}</div>
            
            <div className="detail-label">Price:</div>
            <div className="detail-value" style={{ color: 'var(--accent-light)' }}>
              ${parseFloat(selectedBook.price).toFixed(2)}
            </div>
            
            <div className="detail-label">Quantity:</div>
            <div className="detail-value">
              <span className={`badge badge-qty ${selectedBook.quantity <= 5 ? 'low' : ''}`}>
                {selectedBook.quantity} items
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={() => setModalType(null)} className="btn btn-secondary">
            Close
          </button>
          <button 
            onClick={() => {
              setModalType(null);
              setTimeout(() => openEditModal(selectedBook), 150);
            }} 
            className="btn btn-primary"
          >
            <Edit size={16} />
            Edit Info
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookDetailModal;
