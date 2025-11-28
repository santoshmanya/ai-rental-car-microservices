import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar({ user, onLogout }) {
    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">🚗</span>
                        <span className="brand-text text-gradient">RentaCar</span>
                    </Link>

                    <div className="navbar-links">
                        <Link to="/search" className="nav-link">Search Vehicles</Link>

                        {user ? (
                            <>
                                <Link to="/dashboard" className="nav-link">My Reservations</Link>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="nav-link">Admin</Link>
                                )}
                                <div className="user-menu">
                                    <span className="user-name">{user.firstName} {user.lastName}</span>
                                    <button onClick={onLogout} className="btn btn-ghost btn-sm">Logout</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
