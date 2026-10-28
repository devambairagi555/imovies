import { useState } from 'react';
import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { Movies, MovieDetail, Auth, Bookings } from './pages.jsx';

function Logo() {
  return (
    <Link to="/" className="logo" aria-label="IMovies home">
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect x="2" y="6" width="28" height="20" rx="5" fill="#8b5cf6" />
        <path d="M13 12l8 4-8 4z" fill="#07060b" />
      </svg>
      <span>IMovies</span>
    </Link>
  );
}

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  const nav = useNavigate();

  const login = ({ token, user }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    nav('/');
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
    nav('/');
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar__inner container">
          <Logo />
          <nav className="navbar__links" aria-label="Main">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/bookings">My Bookings</NavLink>
            {user ? (
              <button className="btn btn--ghost btn--sm" onClick={logout}>Logout</button>
            ) : (
              <Link className="btn btn--primary btn--sm" to="/login">Login</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="container page">
        <Routes>
          <Route path="/" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetail user={user} />} />
          <Route path="/login" element={<Auth onAuth={login} />} />
          <Route path="/bookings" element={<Bookings />} />
        </Routes>
      </main>
    </>
  );
}
