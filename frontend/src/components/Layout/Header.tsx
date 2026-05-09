import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import styles from './Header.module.css';

export function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? `${styles.link} ${styles.linkActive}` : styles.link;

  return (
    <header className={styles.header}>
      <NavLink to="/articles" className={styles.brand}>
        Knowledge Wiki
      </NavLink>

      <nav className={styles.nav}>
        <NavLink to="/articles" className={linkClass}>
          記事一覧
        </NavLink>
        {isAuthenticated && (
          <NavLink to="/articles/new" className={linkClass}>
            新規作成
          </NavLink>
        )}
        {isAdmin && (
          <NavLink to="/admin/users" className={linkClass}>
            ユーザー管理
          </NavLink>
        )}
      </nav>

      <div className={styles.user}>
        {isAuthenticated ? (
          <>
            <span>
              {user?.username}
              {isAdmin && <span className={styles.badge}>ADMIN</span>}
            </span>
            <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
              ログアウト
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className={styles.link}>
              ログイン
            </NavLink>
            <NavLink to="/register" className={styles.link}>
              登録
            </NavLink>
          </>
        )}
      </div>
    </header>
  );
}
