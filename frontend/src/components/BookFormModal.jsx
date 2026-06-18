import React from 'react';
import { X } from 'lucide-react';

function BookFormModal({ 
  modalType, 
  setModalType, 
  formData, 
  setFormData, 
  formErrors, 
  handleFormSubmit 
}) {
  if (modalType !== 'add' && modalType !== 'edit') return null;

  return (
    <div className="modal-overlay" onClick={() => setModalType(null)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{modalType === 'add' ? 'Add New Book' : 'Edit Book Details'}</h3>
          <button className="modal-close-btn" onClick={() => setModalType(null)}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Book Title</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter book title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
              {formErrors.title && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{formErrors.title}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Author Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Enter author name"
                value={formData.author}
                onChange={(e) => setFormData({...formData, author: e.target.value})}
              />
              {formErrors.author && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{formErrors.author}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="form-control" 
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
                {formErrors.price && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{formErrors.price}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
                {formErrors.quantity && <span style={{ color: 'var(--danger)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' }}>{formErrors.quantity}</span>}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={() => setModalType(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {modalType === 'add' ? 'Add Book' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BookFormModal;
