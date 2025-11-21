// src/components/admin/LeaveManagement.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabase";
// Import our new, component-specific CSS file
import "../../styles/LeaveManagement-new.css";

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
  approve: "M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z",
  reject: "M10 18a8 8 0 100-16 8 8 0 000 16zM6.5 9.25a.75.75 0 000 1.5h7a.75.75 0 000-1.5h-7z",
  refresh: "M.75 4.75a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5H1.5a.75.75 0 01-.75-.75zM1.5 6.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5H1.5zM19.25 15.25a.75.75 0 01-.75.75h-7.5a.75.75 0 010-1.5h7.5a.75.75 0 01.75.75zM18.5 13.25a.75.75 0 000-1.5h-4.5a.75.75 0 000 1.5h4.5zM6.252 8.618A.75.75 0 017.31 9.77l-4.5 4.5a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 111.06-1.06l.97.97L5.84 8.68a.75.75 0 01.412-.062zM13.748 11.382a.75.75 0 01-.412.062L11.77 12.82l-1.03-1.03a.75.75 0 011.06-1.06l1.5 1.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-.97-.97a.75.75 0 111.06-1.06l3.47 3.47 3.44-4.4a.75.75 0 01.412-.062z",
  upload: "M9.97 4.97a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-1.72-1.72v7.94a.75.75 0 01-1.5 0v-7.94L8.97 9.03a.75.75 0 01-1.06-1.06l3-3zM3.75 12.75A.75.75 0 013 12V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75zM12 12.75a.75.75 0 01-.75-.75V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75zM16.25 12.75a.75.75 0 01-.75-.75V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75zM4 17a1 1 0 01-1-1v-2.25a.75.75 0 011.5 0v2.25a.25.25 0 00.25.25h10.5a.25.25 0 00.25-.25v-2.25a.75.75 0 011.5 0V16a1 1 0 01-1 1H4z",
  close: "M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z",
  link: "M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.5 1.5a2.5 2.5 0 01-3.536-3.536l1.5-1.5zM11.5 8a.5.5 0 00-.5.5v.5a.5.5 0 00.5.5h.5a.5.5 0 00.5-.5v-.5a.5.5 0 00-.5-.5h-.5zM8 11.5a.5.5 0 00-.5.5v.5a.5.5 0 00.5.5h.5a.5.5 0 00.5-.5v-.5a.5.5 0 00-.5-.5h-.5zM7.768 15.768a2.5 2.5 0 01-3.536-3.536l1.5-1.5a2.5 2.5 0 013.536 3.536l-1.5 1.5z",
};
// --- End Icons ---

export default function LeaveManagement() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminSignature, setAdminSignature] = useState(null);
  const [signatureUploading, setSignatureUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // --- All functionality below is 100% UNCHANGED ---
  useEffect(() => {
    const saved = localStorage.getItem("adminSignatureUrl");
    if (saved) setAdminSignature(saved);
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leave_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeaves(data || []);
      setMessage("");
    } catch (error) {
      console.error("Fetch error:", error.message);
      setMessage(`Failed to fetch leave applications: ${error.message}`);
      setLeaves([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSignatureUploading(true);
    setMessage("Uploading signature...");
    const filePath = `admin_signatures/${Date.now()}_${file.name}`;

    try {
      const { data: uploaded, error: uploadError } = await supabase.storage
        .from("leave-signatures")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/png",
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData, error: publicUrlError } =
        await supabase.storage
          .from("leave-signatures")
          .getPublicUrl(uploaded?.path || filePath);

      if (publicUrlError || !publicUrlData?.publicUrl) {
        throw new Error("Could not get public URL for signature.");
      }

      setAdminSignature(publicUrlData.publicUrl);
      localStorage.setItem("adminSignatureUrl", publicUrlData.publicUrl);
      setMessage("✅ Signature uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error.message);
      setMessage(`Failed to upload signature: ${error.message}`);
    } finally {
      setSignatureUploading(false);
    }
  };

  const updateLeave = async (id, status) => {
    if (status === "approved") {
      if (signatureUploading) {
        setMessage("Signature upload is still in progress. Please wait.");
        return;
      }
      if (!adminSignature) {
        setMessage("Please upload your signature before approving.");
        return;
      }
    }

    try {
      const { error: updateError } = await supabase
        .from("leave_applications")
        .update({
          status,
          updated_at: new Date(),
          admin_signature_url: status === "approved" ? adminSignature : null,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      if (status === "approved") {
        await generateVerifiedForm(id, adminSignature);
      }

      await fetchLeaves();
      setMessage(`Leave application ${status} successfully!`);
    } catch (error) {
      console.error("Update error:", error.message);
      setMessage(`Failed to update leave: ${error.message}`);
    }
  };

  const generateVerifiedForm = async (leaveId, signatureUrl) => {
    const leave = leaves.find((l) => l.id === leaveId);
    if (!leave) {
      console.warn("Leave not found in local state for id:", leaveId);
      return;
    }

    const formContent = `
      Leave Application Verified Form
      Name: ${leave.name}
      Roll No: ${leave.roll_number}
      Branch: ${leave.branch}
      Year: ${leave.year}
      Semester: ${leave.semester}
      Hostel: ${leave.hostel_name}, Room: ${leave.room_number}
      Date of Stay: ${leave.date_of_stay} at ${leave.time}
      Reason: ${leave.reason}
      Approved & Signed by Admin ✅
    `;

    try {
      const { error: insertError } = await supabase
        .from("verified_forms")
        .insert([
          {
            leave_id: leaveId,
            user_id: leave.user_id,
            content: formContent,
            signature_url: signatureUrl || null,
          },
        ]);

      if (insertError) throw insertError;
      setMessage("Verified form created successfully.");
    } catch (error) {
      console.error("Insert verified_forms error:", error.message);
      setMessage(`Failed to generate verified form: ${error.message}`);
    }
  };

  const viewLeaveDetails = (leave) => {
    setSelectedLeave(leave);
    setShowModal(true);
  };
  
  const filteredLeaves = filter === "all" 
    ? leaves 
    : leaves.filter(leave => leave.status === filter);

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === "pending").length,
    approved: leaves.filter(l => l.status === "approved").length,
    rejected: leaves.filter(l => l.status === "rejected").length
  };
  // --- End of unchanged functionality ---
  

  if (loading) {
    return (
      <div className="component-loading">
        <div className="loading-spinner"></div>
        <p>Loading leave applications...</p>
      </div>
    );
  }

  return (
    <div className="leave-layout">
      {/* Use standard component header */}
      <div className="component-header">
        <div className="component-header-left">
          <h2 className="component-header-title">Leave Applications</h2>
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="status-filter">Status:</label>
              <select id="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        <button onClick={fetchLeaves} className="button-secondary">
          <Icon path={ICONS.refresh} />
          <span>Refresh</span>
        </button>
      </div>

      {message && (
        <div className={`component-message ${message.includes("✅") || message.includes("success") ? "success" : "error"}`}>
          {message}
        </div>
      )}

      {/* Stats Grid (reusing styles from Feedback) */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Leaves</span>
          <span className="stat-number">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending</span>
          <span className="stat-number">{stats.pending}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Approved</span>
          <span className="stat-number">{stats.approved}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Rejected</span>
          <span className="stat-number">{stats.rejected}</span>
        </div>
      </div>

      {/* Signature upload section (new styled card) */}
      <div className="card-section">
        <div className="card-section-header">
          <h3>Admin Signature</h3>
          <p>Upload your signature file to approve leave applications.</p>
        </div>
        <div className="signature-upload-content">
          <label className="button-primary">
            <input
              type="file"
              accept="image/*"
              onChange={handleSignatureUpload}
              disabled={signatureUploading}
              className="hidden-file-input"
            />
            <Icon path={ICONS.upload} />
            <span>{signatureUploading ? "Uploading..." : "Choose Signature"}</span>
          </label>
          {adminSignature && (
            <div className="signature-preview">
              <Icon path={ICONS.link} />
              <span>Current Signature:</span>
              <a href={adminSignature} target="_blank" rel="noreferrer" className="link-document">
                View Uploaded File
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Leaves table */}
      {filteredLeaves.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📝</div>
          <h3>No leave applications found</h3>
          <p>{filter !== "all" ? `No ${filter} applications` : "No leave applications submitted yet"}</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student Details</th>
                <th>Academic Info</th>
                <th>Leave Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave) => (
                <tr key={leave.id} className={
                  leave.status === 'approved' ? 'row-approved' : 
                  leave.status === 'rejected' ? 'row-rejected' : ''
                }>
                  <td data-label="Student Details">
                    <div className="student-info">
                      <span className="student-name">{leave.name}</span>
                      <span className="student-roll">{leave.roll_number}</span>
                    </div>
                  </td>
                  <td data-label="Academic Info">
                    <div className="academic-info">
                      <span>{leave.branch}</span>
                      <span>Year {leave.year}, Sem {leave.semester}</span>
                    </div>
                  </td>
                  <td data-label="Leave Details">
                    <div className="leave-details-cell">
                      <span className="leave-date">{leave.date_of_stay}</span>
                      <span className="leave-time">{leave.time}</span>
                      <button 
                        onClick={() => viewLeaveDetails(leave)}
                        className="button-text-link"
                      >
                        View Reason
                      </button>
                    </div>
                  </td>
                  <td data-label="Status">
                    <span className={`status-badge ${
                      leave.status === 'pending' ? 'status-pending' :
                      leave.status === 'approved' ? 'status-confirmed' : // Standardize to "confirmed"
                      'status-rejected'
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="action-buttons">
                      {leave.status === "pending" ? (
                        <>
                          <button
                            onClick={() => updateLeave(leave.id, "approved")}
                            className="button-icon confirmed"
                            disabled={signatureUploading || !adminSignature}
                            title={!adminSignature ? "Upload signature first" : "Approve leave"}
                          >
                            <Icon path={ICONS.approve} />
                          </button>
                          <button
                            onClick={() => updateLeave(leave.id, "rejected")}
                            className="button-icon rejected"
                            title="Reject leave"
                          >
                            <Icon path={ICONS.reject} />
                          </button>
                        </>
                      ) : (
                        <span className="action-completed">
                          Processed
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for leave details (new styles) */}
      {showModal && selectedLeave && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Leave Application Details</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <Icon path={ICONS.close} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Student Name</label>
                  <span>{selectedLeave.name}</span>
                </div>
                <div className="detail-item">
                  <label>Roll Number</label>
                  <span>{selectedLeave.roll_number}</span>
                </div>
                <div className="detail-item">
                  <label>Branch</label>
                  <span>{selectedLeave.branch}</span>
                </div>
                <div className="detail-item">
                  <label>Year/Semester</label>
                  <span>Year {selectedLeave.year}, Sem {selectedLeave.semester}</span>
                </div>
                <div className="detail-item">
                  <label>Hostel & Room</label>
                  <span>{selectedLeave.hostel_name}, Room {selectedLeave.room_number}</span>
                </div>
                <div className="detail-item">
                  <label>Date of Stay</label>
                  <span>{selectedLeave.date_of_stay}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Reason for Leave</label>
                  <p className="leave-reason-text">{selectedLeave.reason}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}