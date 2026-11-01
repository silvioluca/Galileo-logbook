import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuAccountAperto, setMenuAccountAperto] = useState(false);
  const accountRef = useRef(null);
  const { user, loading, signIn, signOut } = useAuth();

  useEffect(() => {
    if (!menuAccountAperto) return undefined;
    const onClickFuori = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setMenuAccountAperto(false);
      }
    };
    document.addEventListener('mousedown', onClickFuori);
    return () => document.removeEventListener('mousedown', onClickFuori);
  }, [menuAccountAperto]);

  return (
    <header className="navbar">
      <div className="container">
        <NavLink to="/" className="navbar-brand" onClick={() => setOpen(false)}>
          🜛 Galileo Logbook
        </NavLink>
        <ul className={`navbar-links${open ? ' open' : ''}`}>
          <li>
            <NavLink to="/" end onClick={() => setOpen(false)}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/schede" onClick={() => setOpen(false)}>
              Schede
            </NavLink>
          </li>
          <li>
            <NavLink to="/storia" onClick={() => setOpen(false)}>
              Storia
            </NavLink>
          </li>
          <li>
            <NavLink to="/esperimenti" onClick={() => setOpen(false)}>
              Esperimenti
            </NavLink>
          </li>
          <li>
            <NavLink to="/nobel" onClick={() => setOpen(false)}>
              Nobel
            </NavLink>
          </li>
          <li>
            <NavLink to="/strumenti" onClick={() => setOpen(false)}>
              Strumenti
            </NavLink>
          </li>
          <li>
            <NavLink to="/unita-di-misura" onClick={() => setOpen(false)}>
              Unità
            </NavLink>
          </li>
          
        </ul>
        <div className="navbar-right">
          <div className="navbar-auth">
            {!loading &&
              (user ? (
                <div className="navbar-account" ref={accountRef}>
                  <button
                    type="button"
                    className="navbar-avatar-btn"
                    onClick={() => setMenuAccountAperto((o) => !o)}
                    aria-haspopup="true"
                    aria-expanded={menuAccountAperto}
                    aria-label="Account"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt=""
                        className="navbar-avatar"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="navbar-avatar navbar-avatar-fallback" aria-hidden="true">
                        {(user.email || '?')[0].toUpperCase()}
                      </span>
                    )}
                  </button>
                  {menuAccountAperto && (
                    <div className="navbar-account-menu" role="menu">
                      <p className="navbar-account-email">{user.email}</p>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setMenuAccountAperto(false);
                          signOut();
                        }}
                      >
                        Esci
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button type="button" className="btn" onClick={signIn}>
                  Accedi con Google
                </button>
              ))}
          </div>
          <button
            className="navbar-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={open}
          >
            {open ? '×' : '☰'}
          </button>
        </div>
      </div>
    </header>
  );
}
