import React from 'react';
import { BookOpen, User, Lock, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

function Login({ 
  handleLogin, 
  loginError, 
  loginLoading, 
  username, 
  setUsername, 
  password, 
  setPassword,
  alerts 
}) {
  return (
    <div className="login-wrapper">
      <div className="login-card">
        <BookOpen size={48} className="btn-primary" style={{ padding: '8px', borderRadius: '12px', margin: '0 auto 1.5rem auto' }} />
        <h2 className="login-title">Book Manager</h2>
        <p className="login-subtitle">Please sign in to access the system</p>
        
        {loginError && (
          <div className="alert alert-danger" style={{ marginBottom: '1.5rem', animation: 'none', position: 'static', maxWidth: 'none' }}>
            <AlertCircle size={18} />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '2.5rem' }} 
                placeholder="admin" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loginLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-control" 
                style={{ paddingLeft: '2.5rem' }} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loginLoading}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.8rem', marginTop: '1rem' }}
            disabled={loginLoading}
          >
            {loginLoading ? (
              <>
                <RefreshCw className="spinner" style={{ width: '18px', height: '18px' }} />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>

      <div className="alert-container">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert alert-${alert.type}`}>
            {alert.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Login;
