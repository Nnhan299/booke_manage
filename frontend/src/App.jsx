import React, { useState, useEffect } from 'react';
import { BookOpen, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import Login from './components/Login';
import FilterPanel from './components/FilterPanel';
import BookList from './components/BookList';
import BookFormModal from './components/BookFormModal';
import BookDetailModal from './components/BookDetailModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import { 
  loginAPI, logoutAPI, fetchBooksAPI, 
  createBookAPI, updateBookAPI, deleteBookAPI 
} from './services/api';

function App() {
  // Trạng thái xác thực
  const [token, setToken] = useState(localStorage.getItem('accessToken') || null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Trạng thái danh sách sách
  const [books, setBooks] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Phân trang & Tìm kiếm
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  
  // Tham số tìm kiếm hiện tại dùng để tải dữ liệu
  const [activeTitle, setActiveTitle] = useState('');
  const [activeAuthor, setActiveAuthor] = useState('');

  // Trạng thái Modal & Form
  const [modalType, setModalType] = useState(null); // 'add' (thêm), 'edit' (sửa), 'detail' (chi tiết), 'delete' (xóa)
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Trạng thái Form Sách
  const [formData, setFormData] = useState({
    title: '', author: '', price: '', quantity: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Trạng thái Thông báo
  const [alerts, setAlerts] = useState([]);

  // Lắng nghe thay đổi trạng thái xác thực toàn cục
  useEffect(() => {
    const handleAuthChange = () => setToken(localStorage.getItem('accessToken') || null);
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Tải danh sách sách
  useEffect(() => {
    if (token) {
      loadBooks();
    }
  }, [token, currentPage, pageSize, activeTitle, activeAuthor]);

  const addAlert = (message, type = 'success') => {
    const id = Date.now();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setAlerts((prev) => prev.filter((alert) => alert.id !== id)), 4000);
  };

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params = { page: currentPage, page_size: pageSize };
      if (activeTitle) params.title = activeTitle;
      if (activeAuthor) params.author = activeAuthor;

      const data = await fetchBooksAPI(params);
      setBooks(data.results);
      setCount(data.count);
    } catch (err) {
      console.error(err);
      addAlert('Không thể tải danh sách sách từ máy chủ.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!username.trim() || !password.trim()) {
      setLoginError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    setLoginLoading(true);
    try {
      const data = await loginAPI(username.trim(), password.trim());
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      setToken(data.access);
      addAlert('Chào mừng trở lại! Đăng nhập thành công.', 'success');
      setUsername('');
      setPassword('');
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.status === 401 ? 'Tên đăng nhập hoặc mật khẩu không hợp lệ.' : 'Không thể kết nối đến máy chủ.');
      addAlert('Xác thực thất bại.', 'danger');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && token) {
        await logoutAPI(refreshToken);
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setToken(null);
      setBooks([]);
      addAlert('Đăng xuất thành công.', 'success');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setActiveTitle(searchTitle.trim());
    setActiveAuthor(searchAuthor.trim());
    setCurrentPage(1);
  };

  const handleResetSearch = () => {
    setSearchTitle(''); setSearchAuthor('');
    setActiveTitle(''); setActiveAuthor('');
    setCurrentPage(1);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Tiêu đề là bắt buộc.';
    if (!formData.author.trim()) errors.author = 'Tác giả là bắt buộc.';
    if (formData.price === '' || isNaN(formData.price)) errors.price = 'Giá phải là một số hợp lệ.';
    else if (parseFloat(formData.price) < 0) errors.price = 'Giá không thể là số âm.';
    if (formData.quantity === '' || isNaN(formData.quantity)) errors.quantity = 'Số lượng phải là một số.';
    else if (!Number.isInteger(Number(formData.quantity)) || parseInt(formData.quantity) < 0) errors.quantity = 'Số lượng phải là một số nguyên dương.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddModal = () => {
    setFormData({ title: '', author: '', price: '', quantity: '' });
    setFormErrors({});
    setModalType('add');
  };

  const openEditModal = (book) => {
    setFormData({ title: book.title, author: book.author, price: book.price.toString(), quantity: book.quantity.toString() });
    setSelectedBook(book);
    setFormErrors({});
    setModalType('edit');
  };

  const openDetailModal = (book) => { setSelectedBook(book); setModalType('detail'); };
  const openDeleteModal = (book) => { setSelectedBook(book); setModalType('delete'); };

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
      if (modalType === 'add') {
        await createBookAPI(bookPayload);
        addAlert(`Đã thêm sách "${bookPayload.title}" thành công!`);
      } else if (modalType === 'edit') {
        await updateBookAPI(selectedBook.id, bookPayload);
        addAlert(`Đã cập nhật sách "${bookPayload.title}" thành công!`);
      }
      setModalType(null);
      loadBooks();
    } catch (err) {
      console.error(err);
      addAlert('Đã xảy ra lỗi khi lưu thông tin sách.', 'danger');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteBookAPI(selectedBook.id);
      addAlert(`Đã xóa sách "${selectedBook.title}" thành công!`);
      setModalType(null);
      loadBooks();
    } catch (err) {
      console.error(err);
      addAlert('Không thể xóa sách.', 'danger');
    }
  };

  const totalPages = Math.ceil(count / pageSize) || 1;

  if (!token) {
    return (
      <Login 
        handleLogin={handleLogin} loginError={loginError} loginLoading={loginLoading}
        username={username} setUsername={setUsername} password={password} setPassword={setPassword}
        alerts={alerts}
      />
    );
  }

  return (
    <div className="app-container">
      <div className="alert-container">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert alert-${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
        ))}
      </div>

      <header className="app-header">
        <h1 className="header-title"><BookOpen size={28} style={{ color: 'var(--accent-light)' }} /> Quản lý thư viện</h1>
        <div className="user-badge">
          <span className="username">Chào mừng trở lại, User</span>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm"><LogOut size={16} /> Đăng xuất</button>
        </div>
      </header>

      <FilterPanel 
        searchTitle={searchTitle} setSearchTitle={setSearchTitle}
        searchAuthor={searchAuthor} setSearchAuthor={setSearchAuthor}
        handleSearch={handleSearch} handleResetSearch={handleResetSearch}
        pageSize={pageSize} setPageSize={setPageSize}
        setCurrentPage={setCurrentPage} openAddModal={openAddModal}
      />

      <BookList 
        loading={loading} books={books}
        openDetailModal={openDetailModal} openEditModal={openEditModal} openDeleteModal={openDeleteModal}
        handleResetSearch={handleResetSearch}
        currentPage={currentPage} setCurrentPage={setCurrentPage}
        totalPages={totalPages} count={count}
      />

      <BookFormModal 
        modalType={modalType} setModalType={setModalType}
        formData={formData} setFormData={setFormData}
        formErrors={formErrors} handleFormSubmit={handleFormSubmit}
      />

      <BookDetailModal 
        modalType={modalType} setModalType={setModalType}
        selectedBook={selectedBook} openEditModal={openEditModal}
      />

      <DeleteConfirmModal 
        modalType={modalType} setModalType={setModalType}
        selectedBook={selectedBook} handleDeleteConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default App;
