// src/components/Navbar.jsx
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useUser } from "../contexts/UserContext";
// Import new CSS
import "../styles/Navbar-new.css"; 
import logo from "../assets/logo.png";

// Logout Icon SVG
const LogoutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16 17 21 12 16 7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
);

export default function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/login");
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        {/* Branding */}
        <div className="navbar-brand" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" className="navbar-logo" />
          <div className="brand-text">
            <h1>KONGU HOSTELS</h1>
            <span>Student Portal</span>
          </div>
        </div>

        {/* Hamburger Toggle (Mobile) */}
        <div className={`navbar-toggle ${isMenuOpen ? "open" : ""}`} onClick={toggleMenu}>
          <span className="bar top"></span>
          <span className="bar middle"></span>
          <span className="bar bottom"></span>
        </div>

        {/* Navigation Links & User Actions */}
        <div className={`navbar-menu ${isMenuOpen ? "active" : ""}`}>
          <ul className="nav-links">
            <li><NavLink to="/profile" onClick={closeMenu}>Profile</NavLink></li>
            <li><NavLink to="/room-allocation" onClick={closeMenu}>Rooms</NavLink></li>
            <li><NavLink to="/feedback" onClick={closeMenu}>Feedback</NavLink></li>
            <li><NavLink to="/leave" onClick={closeMenu}>Leave</NavLink></li>
            <li><NavLink to="/schedule" onClick={closeMenu}>Menu</NavLink></li>
            <li><NavLink to="/rules" onClick={closeMenu}>Rules</NavLink></li>
          </ul>

          <div className="nav-user-actions">
            <span className="user-email">{user.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              <span>Logout</span>
              <LogoutIcon />
            </button>
          </div>
        </div>

      </div>
    </nav>
  );
}