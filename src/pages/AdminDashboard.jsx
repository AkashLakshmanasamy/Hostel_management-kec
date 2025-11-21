// src/pages/AdminDashboard.jsx
import React, { useState } from "react";
import RoomRequests from "../components/admin/RoomRequests";
import StudentProfiles from "../components/admin/StudentProfiles";
import FeedbackManagement from "../components/admin/FeedbackManagement";
import LeaveApplications from "../components/admin/LeaveApplications";
import VacantRooms from "../components/admin/VacantRooms";
import "../styles/AdminDashboard.css"; // We will replace this file's content

// Helper component for icons (or you can use a library like react-icons)
const Icon = ({ path, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`icon ${className}`}
  >
    <path d={path} />
  </svg>
);

// Icon paths
const ICONS = {
  requests: "M8.25 6.75h3.75v3.75H8.25V6.75zM12.75 6.75h3.75v3.75h-3.75V6.75zM8.25 12.75h3.75v3.75H8.25v-3.75zM12.75 12.75h3.75v3.75h-3.75v-3.75zM5.25 6.75h.75v3.75h-.75V6.75zm.75 4.5h-.75v3.75h.75v-3.75zM3.75 5.25h1.5v.75h-1.5V5.25zm1.5 1.5h-.75v.75h.75v-.75zm-1.5.75h.75v.75h-.75v-.75zm.75.75h-.75v.75h.75v-.75zm-1.5.75h.75v.75h-.75v-.75zM6 3.75h.75v1.5H6v-1.5zm1.5.75h.75v.75h-.75v-.75zM6 6h.75v.75H6V6zM6 12h.75v.75H6V12zm.75.75h.75v.75h-.75v-.75zM6 15h.75v.75H6v-.75zm1.5.75h.75v.75h-.75v-.75zM3.75 12h1.5v.75h-1.5V12zm1.5 1.5h-.75v.75h.75v-.75zm-1.5.75h.75v.75h-.75v-.75zm.75.75h-.75v.75h.75v-.75zm-1.5.75h.75v.75h-.75v-.75z",
  students: "M15 8a3 3 0 10-6 0 3 3 0 006 0zM1.923 15.066a8.25 8.25 0 0116.154 0A1.83 1.83 0 0118.25 17H1.75a1.83 1.83 0 01-1.682-1.934z",
  feedback: "M8.625 10.5c.398 0 .75-.112.992-.33l.29-.289c.338-.34.463-.73.463-1.096A1.75 1.75 0 008.625 7 1.75 1.75 0 006.875 8.75c0 .366.125.756.463 1.096l.29.289c.242.218.594.33.992.33zm5 0c.398 0 .75-.112.992-.33l.29-.289c.338-.34.463-.73.463-1.096A1.75 1.75 0 0013.625 7 1.75 1.75 0 0011.875 8.75c0 .366.125.756.463 1.096l.29.289c.242.218.594.33.992.33zM2.5 5.5A.5.5 0 002 6v6a.5.5 0 00.5.5h.5c.276 0 .5.224.5.5v2.36l1.96-1.633a.5.5 0 01.31-.102H17.5a.5.5 0 00.5-.5V6a.5.5 0 00-.5-.5H2.5z",
  leave: "M11.25 10.738V10.5a.75.75 0 00-1.5 0v.238a3.748 3.748 0 001.5 0zM10.5 3a.75.75 0 00-.75.75v2.219c0 .248 0 .49.012.73l.013.26a3.745 3.745 0 010 5.582l-.013.26c-.012.24-.012.482-.012.73v2.219a.75.75 0 001.5 0v-2.219c0-.248 0-.49-.012-.73l-.013-.26a3.745 3.745 0 010-5.582l.013-.26c.012-.24.012-.482.012-.73V3.75A.75.75 0 0010.5 3zM6 3.75A.75.75 0 016.75 3h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 016 3.75zM6 14.75a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75z",
  vacant: "M10 2a.75.75 0 01.75.75v.232a8.9 8.9 0 016.14 5.013.75.75 0 01-1.339.696A7.4 7.4 0 0010.75 3.55V5.25a.75.75 0 01-1.5 0V3.55A7.4 7.4 0 004.449 8.69a.75.75 0 01-1.339-.696A8.9 8.9 0 019.25 2.982V2.75A.75.75 0 0110 2zM4.132 9.034a.75.75 0 011.056.257A7.4 7.4 0 009.25 12.2v-2.1a.75.75 0 011.5 0v2.1a7.4 7.4 0 004.062-2.909.75.75 0 011.313.514A8.9 8.9 0 0110.75 17.018v.232a.75.75 0 01-1.5 0v-.232a8.9 8.9 0 01-6.14-5.013.75.75 0 01.022-1.313z",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("roomRequests");

  // This is your core functionality. It does not need to change.
  const renderTab = () => {
    switch (activeTab) {
      case "roomRequests":
        return <RoomRequests />;
      case "studentProfiles":
        return <StudentProfiles />;
      case "feedback":
        return <FeedbackManagement />;
      case "leaveApplications":
        return <LeaveApplications />;
      case "vacantRooms":
        return <VacantRooms />;
      default:
        return <RoomRequests />;
    }
  };

  const NavLink = ({ tab, iconPath, label }) => (
    <button
      className={`admin-sidebar-link ${activeTab === tab ? "active" : ""}`}
      onClick={() => setActiveTab(tab)}
    >
      <Icon path={iconPath} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          {/* You can put a logo here */}
          <h2>Hostel Admin</h2>
        </div>
        <nav className="admin-sidebar-nav">
          <NavLink
            tab="roomRequests"
            iconPath={ICONS.requests}
            label="Room Requests"
          />
          <NavLink
            tab="studentProfiles"
            iconPath={ICONS.students}
            label="Student Profiles"
          />
          <NavLink
            tab="feedback"
            iconPath={ICONS.feedback}
            label="Feedback"
          />
          <NavLink
            tab="leaveApplications"
            iconPath={ICONS.leave}
            label="Leave Applications"
          />
          <NavLink
            tab="vacantRooms"
            iconPath={ICONS.vacant}
            label="Vacant Rooms"
          />
        </nav>
      </aside>

      <div className="admin-content-wrapper">
        <header className="admin-content-header">
          <h1>Admin Dashboard</h1>
          {/* You could add user profile/logout button here */}
        </header>

        <main className="admin-tab-content">
          {/* This is where the magic happens! Functionality is preserved. */}
          {renderTab()}
        </main>
      </div>
    </div>
  );
}