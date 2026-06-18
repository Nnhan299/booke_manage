import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BookOpen, Search, Plus, Edit, Trash2, Eye, 
  ChevronLeft, ChevronRight, LogOut, Lock, User, 
  X, AlertCircle, CheckCircle, RefreshCw 
} from 'lucide-react';
import Login from './components/Login';

const API_BASE_URL = 'http://127.0.0.1:8000';

// Setup axios interceptors for handling 401 Unauthorized globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      window.dispatchEvent(new Event('auth-change'));
    }
    return Promise.reject(error);
  }
);

function App() {
  // Authentication state
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Books State
  const [books, setBooks] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Pagination & Filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  
  // Active search params used for fetching (updates only on "Search" click)
  const [activeTitle, setActiveTitle] = useState('');
  const [activeAuthor, setActiveAuthor] = useState('');

  // Modals & Forms state
  const [modalType, setModalType] = useState(null); // 'add', 'edit', 'detail', 'delete'
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Book Form State
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    quantity: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Notifications State
  const [alerts, setAlerts] = useState([]);

  // Listen for global auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      setToken(localStorage.getItem('accessToken') || null);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Fetch books when token, page, page size, or active filters change
  useEffect(() => {
    if (token) {
      fetchBooks();
    }
  }, [token, currentPage, pageSize, activeTitle, activeAuthor]);

  // Alert notifier helper
  const addAlert = (message, type = 'success') => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
    }, 4000);
  };

  // Fetch books list from API
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      // Construct URL parameters
      const params = new URLSearchParams({
        page: currentPage,
        page_size: pageSize
      });
      
      if (activeTitle) params.append('title', activeTitle);
      if (activeAuthor) params.append('author', activeAuthor);

      const response = await axios.get(`${API_BASE_URL}/api/books/?${params.toString()}`, config);
      setBooks(response.data.results);
      setCount(response.data.count);
    } catch (err) {
      console.error(err);
      addAlert('Failed to load books from server.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!username.trim() || !password.trim()) {
      setLoginError('Please enter both username and password.');
      return;
    }

    setLoginLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/token/`, {
        username: username.trim(),
        password: password.trim()
      });
      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(accessToken);
      addAlert('Welcome back! Login successful.', 'success');
      // Clear credentials form fields
      setUsername('');
      setPassword('');
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setLoginError('Invalid username or password.');
      } else {
        setLoginError('Could not connect to authentication server.');
      }
      addAlert('Authentication failed.', 'danger');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && token) {
        await axios.post(`${API_BASE_URL}/api/logout/`, { refresh_token: refreshToken }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setBooks([]);
      addAlert('Successfully logged out.', 'success');
    }
  };

  // Handle Search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setActiveTitle(searchTitle.trim());
    setActiveAuthor(searchAuthor.trim());
    setCurrentPage(1); // Reset to page 1 on new search
  };

  // Reset Filters
  const handleResetSearch = () => {
    setSearchTitle('');
    setSearchAuthor('');
    setActiveTitle('');
    setActiveAuthor('');
    setCurrentPage(1);
  };

  // Validate form inputs
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.author.trim()) errors.author = 'Author is required.';
    
    if (formData.price === '' || isNaN(formData.price)) {
      errors.price = 'Price must be a valid number.';
    } else if (parseFloat(formData.price) < 0) {
      errors.price = 'Price cannot be negative.';
    }

    if (formData.quantity === '' || isNaN(formData.quantity)) {
      errors.quantity = 'Quantity must be an integer.';
    } else if (!Number.isInteger(Number(formData.quantity)) || parseInt(formData.quantity) < 0) {
      errors.quantity = 'Quantity must be a positive integer.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Add Book Modal
  const openAddModal = () => {
    setFormData({
      title: '',
      author: '',
      price: '',
      quantity: ''
    });
    setFormErrors({});
    setModalType('add');
  };

  // Open Edit Book Modal
  const openEditModal = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price.toString(),
      quantity: book.quantity.toString()
    });
    setSelectedBook(book);
    setFormErrors({});
    setModalType('edit');
  };

  // Open Details Modal
  const openDetailModal = (book) => {
    setSelectedBook(book);
    setModalType('detail');
  };

  // Open Delete Modal
  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setModalType('delete');
  };

  // Handle Book Form Submit (Add or Edit)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const bookPayload = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity)
    };

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (modalType === 'add') {
        await axios.post(`${API_BASE_URL}/api/books/`, bookPayload, config);
        addAlert(`Added book "${bookPayload.title}" successfully!`);
      } else if (modalType === 'edit') {
        await axios.put(`${API_BASE_URL}/api/books/${selectedBook.id}/`, bookPayload, config);
        addAlert(`Updated book "${bookPayload.title}" successfully!`);
      }
      setModalType(null);
      fetchBooks();
    } catch (err) {
      console.error(err);
      addAlert('An error occurred while saving the book.', 'danger');
    }
  };

  // Handle Delete Book API call
  const handleDeleteConfirm = async () => {
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.delete(`${API_BASE_URL}/api/books/${selectedBook.id}/`, config);
      addAlert(`Deleted book "${selectedBook.title}" successfully!`);
      setModalType(null);
      fetchBooks();
    } catch (err) {
      console.error(err);
      addAlert('Failed to delete the book.', 'danger');
    }
  };

  // Pagination helper parameters
  const totalPages = Math.ceil(count / pageSize) || 1;

  // Render Login view if unauthenticated
  if (!token) {
    return (
      <Login 
        handleLogin={handleLogin}
        loginError={loginError}
        loginLoading={loginLoading}
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        alerts={alerts}
      />
    );
  }

  // Render Dashboard view if authenticated
  return (
    <div className="app-container">
      {/* Notifications overlay */}
      <div className="alert-container">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert alert-${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="app-header">
        <h1 className="header-title">
          <BookOpen size={28} style={{ color: 'var(--accent-light)' }} />
          Book Management Portal
        </h1>
        <div className="user-badge">
          <span className="username">Welcome back, User</span>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Filters and Controls */}
      <div className="control-panel">
        <form onSubmit={handleSearch} className="filter-grid">
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search Title</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '2.2rem', paddingRight: '1rem', paddingTop: '0.55rem', paddingBottom: '0.55rem' }} 
                placeholder="Type book title..."
                value={searchTitle}
                onChange={(e) => setSearchTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Search Author</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '2.2rem', paddingRight: '1rem', paddingTop: '0.55rem', paddingBottom: '0.55rem' }} 
                placeholder="Type author name..."
                value={searchAuthor}
                onChange={(e) => setSearchAuthor(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.55rem 1rem' }}>
              Filter
            </button>
            <button type="button" onClick={handleResetSearch} className="btn btn-secondary" style={{ padding: '0.55rem 1rem' }}>
              Reset
            </button>
          </div>
        </form>

        <div className="actions-row">
          <div className="page-size-selector">
            <span>Show per page:</span>
            <select 
              value={pageSize} 
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1); // Go back to page 1 on size change
              }} 
              className="select-control"
            >
              <option value={20}>20 records</option>
              <option value={100}>100 records</option>
            </select>
          </div>

          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} />
            Add New Book
          </button>
        </div>
      </div>

      {/* Book List Content Area */}
      {loading ? (
        <div className="table-wrapper">
          <div className="loading-overlay">
            <div className="spinner"></div>
            <span>Loading database records...</span>
          </div>
        </div>
      ) : books.length > 0 ? (
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
      ) : (
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
      )}

      {/* Pagination Controls */}
      {!loading && books.length > 0 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing Page <strong>{currentPage}</strong> of {totalPages} ({count} total records)
          </div>
          
          <div className="pagination-pages">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem' }}
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            <span className="page-indicator">
              Page {currentPage} / {totalPages}
            </span>

            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.5rem' }}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add/Edit Form Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
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
      )}

      {/* 2. Detail Modal */}
      {modalType === 'detail' && selectedBook && (
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
      )}

      {/* 3. Confirm Delete Modal */}
      {modalType === 'delete' && selectedBook && (
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
      )}
    </div>
  );
}

export default App;
