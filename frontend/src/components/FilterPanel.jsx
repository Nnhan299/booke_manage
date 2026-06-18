import React from 'react';
import { Search, Plus } from 'lucide-react';

function FilterPanel({ 
  searchTitle, 
  setSearchTitle, 
  searchAuthor, 
  setSearchAuthor, 
  handleSearch, 
  handleResetSearch, 
  pageSize, 
  setPageSize, 
  setCurrentPage, 
  openAddModal 
}) {
  return (
    <div className="control-panel">
      <form onSubmit={handleSearch} className="filter-grid">
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tìm theo Tiêu đề</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2.2rem', paddingRight: '1rem', paddingTop: '0.55rem', paddingBottom: '0.55rem' }} 
              placeholder="Nhập tiêu đề sách..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Tìm theo Tác giả</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-control" 
              style={{ paddingLeft: '2.2rem', paddingRight: '1rem', paddingTop: '0.55rem', paddingBottom: '0.55rem' }} 
              placeholder="Nhập tên tác giả..."
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.55rem 1rem' }}>
            Lọc
          </button>
          <button type="button" onClick={handleResetSearch} className="btn btn-secondary" style={{ padding: '0.55rem 1rem' }}>
            Hủy lọc
          </button>
        </div>
      </form>

      <div className="actions-row">
        <div className="page-size-selector">
          <span>Hiển thị:</span>
          <select 
            value={pageSize} 
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1); // Quay lại trang 1 khi thay đổi số lượng hiển thị
            }} 
            className="select-control"
          >
            <option value={20}>20 bản ghi</option>
            <option value={100}>100 bản ghi</option>
          </select>
        </div>

        <button onClick={openAddModal} className="btn btn-primary">
          <Plus size={18} />
          Thêm sách mới
        </button>
      </div>
    </div>
  );
}

export default FilterPanel;
