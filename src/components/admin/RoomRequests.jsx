// src/components/admin/RoomRequests.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
// We no longer need a separate CSS import, 
// it's all handled by AdminDashboard.css
// import "../../styles/RoomRequests.css"; 

// We'll create a new, minimal CSS file for component-specific styles
import "../../styles/RoomRequests-new.css"; 

export default function RoomRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all", "pending", "confirmed", "rejected"

  // Fetch all room allocation requests (FUNCTIONALITY UNCHANGED)
  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("allocations")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error("Error fetching allocations:", err);
      alert("Failed to fetch room requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  // Update allocation status and student can_apply (FUNCTIONALITY UNCHANGED)
  const updateStatus = async (uuid, status) => {
    if (!uuid) return alert("Invalid allocation ID");

    try {
      // ✅ Update allocation status
      const { data: updatedAllocations, error: updateError } = await supabase
        .from("allocations")
        .update({ status })
        .eq("id", uuid)
        .select();

      if (updateError) throw updateError;
      if (!updatedAllocations || updatedAllocations.length === 0) {
        return alert("Allocation not found");
      }

      const allocation = updatedAllocations[0];

      // ✅ Update student's can_apply
      const canApplyValue = status === "confirmed" ? false : true;
      const { error: studentError } = await supabase
        .from("student_profiles")
        .update({ can_apply: canApplyValue })
        .eq("roll_no", allocation.reg_no);

      if (studentError) throw studentError;

      alert(`Status updated to "${status}"`);
      fetchRequests();
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update status");
    }
  };

  // We removed the getStatusBadgeClass() function

  if (loading) {
    return (
      <div className="component-loading">
        <div className="loading-spinner"></div>
        <p>Loading room requests...</p>
      </div>
    );
  }

  return (
    <div className="room-requests-layout">
      <div className="component-header">
        <h2 className="component-header-title">Room Allocation Requests</h2>
        <div className="filter-controls">
          <label htmlFor="status-filter">Filter by status:</label>
          <select 
            id="status-filter"
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Requests</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No room requests found</h3>
          <p>
            There are currently no room allocation requests
            {filter !== "all" ? ` with status "${filter}"` : ""}.
          </p>
        </div>
      ) : (
        <div className="table-wrapper">
          {/* No specific table class is needed.
            The styles from AdminDashboard.css will apply automatically.
          */}
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Registration No</th>
                <th>Hostel</th>
                <th>Room</th>
                <th>Bed</th>
                <th>Status</th>
                <th>Document</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id}>
                  <td data-label="Student">{r.name || "N/A"}</td>
                  <td data-label="Reg. No">{r.reg_no}</td>
                  <td data-label="Hostel">{r.hostel}</td>
                  <td data-label="Room">
                    <span className="room-badge">{r.room_number}</span>
                  </td>
                  <td data-label="Bed">
                    <span className="bed-badge">{r.bed_number}</span>
                  </td>
                  <td data-label="Status">
                    {/* Simplified status badge logic */}
                    <span className={`status-badge status-${r.status}`}>
                      {r.status}
                    </span>
                  </td>
                  <td data-label="Document">
                    {r.receipt_url && (
                      <a 
                        href={r.receipt_url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="link-document"
                      >
                        View Document
                      </a>
                    )}
                  </td>
                  <td data-label="Actions">
                    <div className="action-buttons">
                      <button 
                        onClick={() => updateStatus(r.id, "confirmed")}
                        // Use the class from AdminDashboard.css
                        className="confirmed" 
                        disabled={r.status === "confirmed"}
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => updateStatus(r.id, "rejected")}
                        // Use the class from AdminDashboard.css
                        className="rejected"
                        disabled={r.status === "rejected"}
                      >
                        Reject
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