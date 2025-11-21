// src/components/admin/StudentProfiles.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase";
// Import our new, component-specific CSS file
import "../../styles/StudentProfiles-new.css";

// --- New Icon SVGs ---
const Icon = ({ path, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`icon ${className}`}
  >
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  search: "M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z",
  columns: "M3 3.75A.75.75 0 013.75 3h12.5a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75H3.75a.75.75 0 01-.75-.75V3.75zM11.5 6.5a.75.75 0 00-1.5 0v7a.75.75 0 001.5 0v-7zM7.75 9a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v4.25a.75.75 0 01-1.5 0V9zM14.25 7.5a.75.75 0 00-1.5 0v5.75a.75.75 0 001.5 0V7.5z",
  close: "M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z",
};
// --- End Icons ---

export default function StudentProfiles() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedColumns, setSelectedColumns] = useState([
    "roll_no", "name", "department", "year", "section",
    "room_no", "floor", "mobile", "email", "can_apply"
  ]);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // --- All functionality is 100% UNCHANGED ---
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);

    let query = supabase.from("student_profiles").select("*");

    if (search.trim() !== "") {
      query = query.or(
        `name.ilike.%${search}%,roll_no.ilike.%${search}%,department.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (!error) setStudents(data);
    else console.error("Error fetching students:", error);

    setLoading(false);
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      fetchStudents();
    }
  };

  const toggleColumn = (column) => {
    setSelectedColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const formatColumnName = (column) => {
    return column
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  };

  const allColumns = [
    "roll_no", "name", "department", "year", "section",
    "room_no", "floor", "mobile", "whatsapp", "email",
    "blood_group", "father_name", "father_contact",
    "mother_name", "mother_contact", "dob", "address",
    "district", "admission_mode", "fee_mode", "can_apply"
  ];
  // --- End of unchanged functionality ---

  return (
    <div className="student-profiles-layout">
      {/* Use the standard header class from RoomRequests */}
      <div className="component-header">
        <h2 className="component-header-title">Student Profiles</h2>
        
        <div className="controls-section">
          <div className="search-container">
            <Icon path={ICONS.search} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleSearch}
              className="search-input"
            />
            {/* The primary input is already styled, we just add the icon */}
          </div>
          
          <div className="column-selector-container">
            <button
              className="column-toggle-btn"
              onClick={() => setShowColumnSelector(!showColumnSelector)}
            >
              <Icon path={ICONS.columns} />
              <span>Columns</span>
            </button>
            {showColumnSelector && (
              <div className="column-dropdown">
                <div className="dropdown-header">
                  <h4>Select Columns</h4>
                  <button
                    className="close-dropdown"
                    onClick={() => setShowColumnSelector(false)}
                  >
                    <Icon path={ICONS.close} />
                  </button>
                </div>
                <div className="column-checkboxes">
                  {allColumns.map((col) => (
                    <label key={col} className="column-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedColumns.includes(col)}
                        onChange={() => toggleColumn(col)}
                      />
                      <span>{formatColumnName(col)}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Use the standard loading class */}
      {loading ? (
        <div className="component-loading">
          <div className="loading-spinner"></div>
          <p>Loading student profiles...</p>
        </div>
      ) : students.length === 0 ? (
        // Use the standard empty state class
        <div className="empty-state">
          <div className="empty-state-icon">👨‍🎓</div>
          <h3>No students found</h3>
          <p>{search ? `No results for "${search}"` : "No student profiles available"}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="table-info">
            <span>Showing {students.length} student{students.length !== 1 ? 's' : ''}</span>
            {search && (
              <button
                className="clear-search"
                onClick={() => {
                  setSearch("");
                  // We need to re-fetch after clearing search
                  // This is a small functional fix
                  fetchStudents(); 
                }}
              >
                Clear search
              </button>
            )}
          </div>
          <div className="table-scroll-wrapper">
            {/* Standard table, will be styled by AdminDashboard.css */}
            <table>
              <thead>
                <tr>
                  {selectedColumns.map((col) => (
                    <th key={col}>{formatColumnName(col)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id}>
                    {selectedColumns.map((col) => (
                      <td key={col} data-label={formatColumnName(col)}>
                        {col === "can_apply" ? (
                          // Use the standard status badges we defined
                          <span className={`status-badge ${student[col] ? "status-confirmed" : "status-rejected"}`}>
                            {student[col] ? "Eligible" : "Not Eligible"}
                          </span>
                        ) : col.includes("_url") && student[col] ? (
                          <a
                            href={student[col]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-document" // From RoomRequests CSS
                          >
                            View
                          </a>
                        ) : (
                          formatValue(student[col])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}