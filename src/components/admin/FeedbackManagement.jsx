// src/components/admin/FeedbackManagement.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
// Import our new, component-specific CSS file
import "../../styles/FeedbackManagement-new.css";

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
  resolve: "M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z",
  unresolve: "M15 10a.75.75 0 01-.75.75H5.707l2.147 2.146a.75.75 0 11-1.06 1.06l-3.5-3.5a.75.75 0 010-1.06l3.5-3.5a.75.75 0 111.06 1.06L5.707 9.25H14.25A.75.75 0 0115 10z",
  delete: "M10 18a8 8 0 100-16 8 8 0 000 16zM6.5 9.25a.75.75 0 000 1.5h7a.75.75 0 000-1.5h-7z",
  refresh: "M.75 4.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H1.5a.75.75 0 01-.75-.75zM1.5 6.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H1.5zM19.25 15.25a.75.75 0 01-.75.75h-7.5a.75.75 0 010-1.5h7.5a.75.75 0 01.75.75zM18.5 13.25a.75.75 0 000-1.5h-4.5a.75.75 0 000 1.5h4.5zM6.252 8.618A.75.75 0 017.31 9.77l-4.5 4.5a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97L5.84 8.68a.75.75 0 01.412-.062zM13.748 11.382a.75.75 0 01-.412.062L11.77 12.82l-1.03-1.03a.75.75 0 011.06-1.06l1.5 1.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-.97-.97a.75.75 0 111.06-1.06l3.47 3.47 3.44-4.4a.75.75 0 01.412-.062z",
};
// --- End Icons ---

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "resolved", "pending"
  const [urgencyFilter, setUrgencyFilter] = useState("all"); // "all", "high", "medium", "low"

  // --- All functionality below is 100% UNCHANGED ---
  useEffect(() => {
    fetchFeedbacks();
  }, [filter, urgencyFilter]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    let query = supabase.from("feedbacks").select("*").order("created_at", { ascending: false });
    
    if (filter !== "all") {
      query = query.eq("resolved", filter === "resolved");
    }
    
    if (urgencyFilter !== "all") {
      query = query.eq("urgency", urgencyFilter);
    }
    
    const { data, error } = await query;
    if (!error) setFeedbacks(data);
    setLoading(false);
  };

  const markResolved = async (id) => {
    const { error } = await supabase.from("feedbacks").update({ resolved: true }).eq("id", id);
    if (!error) {
      fetchFeedbacks();
    } else {
      alert("Failed to update feedback");
    }
  };

  const markUnresolved = async (id) => {
    const { error } = await supabase.from("feedbacks").update({ resolved: false }).eq("id", id);
    if (!error) {
      fetchFeedbacks();
    } else {
      alert("Failed to update feedback");
    }
  };

  const deleteFeedback = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      const { error } = await supabase.from("feedbacks").delete().eq("id", id);
      if (!error) {
        fetchFeedbacks();
      } else {
        alert("Failed to delete feedback");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // --- End of unchanged functionality ---

  return (
    <div className="feedback-layout">
      <div className="component-header">
        <div className="component-header-left">
          <h2 className="component-header-title">Feedback Management</h2>
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select 
                id="status-filter"
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Feedback</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="urgency-filter">Urgency:</label>
              <select 
                id="urgency-filter"
                value={urgencyFilter} 
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="all">All Levels</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
        <button onClick={fetchFeedbacks} className="button-secondary">
          <Icon path={ICONS.refresh} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-number">{feedbacks.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-number">{feedbacks.filter(f => !f.resolved).length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Resolved</span>
          <span className="stat-number">{feedbacks.filter(f => f.resolved).length}</span>
        </div>
      </div>

      {loading ? (
        <div className="component-loading">
          <div className="loading-spinner"></div>
          <p>Loading feedback...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h3>No feedback found</h3>
          <p>There are no feedback entries matching your current filters.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Message</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map(feedback => (
                <tr key={feedback.id} className={feedback.resolved ? "row-resolved" : ""}>
                  <td data-label="Student">
                    <div className="student-info">
                      <span className="student-name">{feedback.name}</span>
                      {feedback.email && (
                        <span className="student-email">{feedback.email}</span>
                      )}
                    </div>
                  </td>
                  <td data-label="Message">
                    <div className="feedback-message">
                      {feedback.message}
                    </div>
                  </td>
                  <td data-label="Urgency">
                    <span className={`urgency-badge urgency-${feedback.urgency}`}>
                      {feedback.urgency}
                    </span>
                  </td>
                  <td data-label="Status">
                    <span className={`status-badge status-${feedback.resolved ? "confirmed" : "pending"}`}>
                      {feedback.resolved ? "Resolved" : "Pending"}
                    </span>
                  </td>
                  <td data-label="Date">
                    <div className="feedback-date">
                      {formatDate(feedback.created_at)}
                    </div>
                  </td>
                  <td data-label="Actions">
                    <div className="action-buttons">
                      {!feedback.resolved ? (
                        <button 
                          onClick={() => markResolved(feedback.id)}
                          className="button-icon confirmed"
                          title="Mark as resolved"
                        >
                          <Icon path={ICONS.resolve} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => markUnresolved(feedback.id)}
                          className="button-icon warning"
                          title="Mark as pending"
                        >
                          <Icon path={ICONS.unresolve} />
                        </button>
                      )}
                      <button 
                        onClick={() => deleteFeedback(feedback.id)}
                        className="button-icon rejected"
                        title="Delete feedback"
                      >
                        <Icon path={ICONS.delete} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}