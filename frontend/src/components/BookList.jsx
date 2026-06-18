import React from 'react';
import { BookOpen, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

function BookList({ 
  loading, 
  books, 
  openDetailModal, 
  openEditModal, 
  openDeleteModal, 
  handleResetSearch,
  currentPage,
  setCurrentPage,
  totalPages,
  count
}) {
  if (loading) {
    return (
      <div className="table-wrapper">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span>Loading database records...</span>
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="table-wrapper">
        <div className="empty-state">
          <BookOpen size={48} style={{ color: 'var(--text-muted)' }} />
          <h3>No books found</h3>
          <p>We couldn't find any book records matching your criteria. Try adjusting your filters.</p>
          <button onClick={handleResetSearch} className="btn btn-secondary btn-sm" style={{ marginTop: '0.5rem' }}>
            Clear Search Filters
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="table-wrapper">
        <table className="book-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Title</th>
              <th style={{ width: '25%' }}>Author</th>
              <th style={{ width: '12%' }}>Price</th>
              <th style={{ width: '10%' }}>Quantity</th>
              <th style={{ width: '13%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td className="book-title-cell">{book.title}</td>
                <td className="book-author-cell">{book.author}</td>
                <td>
                  <span className="badge badge-price">
                    ${parseFloat(book.price).toFixed(2)}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-qty ${book.quantity <= 5 ? 'low' : ''}`}>
                    {book.quantity} pcs
                  </span>
                </td>
                <td className="actions-cell" style={{ justifyContent: 'center' }}>
                  <button 
                    onClick={() => openDetailModal(book)} 
                    className="btn btn-secondary btn-sm" 
                    title="View Details"
                    style={{ padding: '0.35rem' }}
                  >
                    <Eye size={15} style={{ color: 'var(--info)' }} />
                  </button>
                  <button 
                    onClick={() => openEditModal(book)} 
                    className="btn btn-secondary btn-sm" 
                    title="Edit Book"
                    style={{ padding: '0.35rem' }}
                  >
                    <Edit size={15} style={{ color: 'var(--warning)' }} />
                  </button>
                  <button 
                    onClick={() => openDeleteModal(book)} 
                    className="btn btn-secondary btn-sm" 
                    title="Delete Book"
                    style={{ padding: '0.35rem' }}
                  >
                    <Trash2 size={15} style={{ color: 'var(--danger)' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="pagination-info">
          Trang <strong>{currentPage}</strong> / {totalPages} (Tổng cộng {count} bản ghi)
        </div>
        
        <div className="pagination-pages">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem' }}
          >
            <ChevronLeft size={16} />
            Trước
          </button>

          <span className="page-indicator">
            Trang {currentPage} / {totalPages}
          </span>

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="btn btn-secondary btn-sm"
            style={{ padding: '0.5rem' }}
          >
            Sau
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </>
  );
}

export default BookList;
