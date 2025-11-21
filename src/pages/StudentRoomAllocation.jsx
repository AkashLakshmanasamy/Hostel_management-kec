// src/pages/StudentRoomAllocation.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useUser } from "../contexts/UserContext";
import HostelSelector from "../components/HostelSelector";
import FloorSelector from "../components/FloorSelector";
import RoomGrid from "../components/RoomGrid";
import { saveAllocation } from "../utils/storage";
// Import the new professional CSS
import "../styles/StudentRoomAllocation-new.css";

// --- Icons ---
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
  user: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",
  building: "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-1.528A6 6 0 004 9.528V4z",
  upload: "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z",
  check: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
  warn: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
};

const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango", "Kamban", "Bharathi"];
const FLOORS = ["Ground", "First", "Second", "Third"];

function genRooms(floor) {
  if (floor === "Ground") return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
}

export default function StudentRoomAllocation() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [form, setForm] = useState({
    email: user?.email || "",
    name: user?.user_metadata?.full_name || "",
    regNo: "",
    department: "",
    feesStatus: "Paid",
    hostel: HOSTELS[0],
    floor: FLOORS[0],
  });

  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Room selection states
  const [isLoading, setIsLoading] = useState(false);
  const rooms = useMemo(() => genRooms(form.floor), [form.floor]);
  const [selected, setSelected] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedBeds, setBookedBeds] = useState({});

  // Allocation gating states
  const [existingAllocation, setExistingAllocation] = useState(null);
  const [loadingAllocation, setLoadingAllocation] = useState(true);

  // --- Logic remains 100% UNCHANGED ---
  useEffect(() => {
    const loadAuthAndAllocation = async () => {
      try {
        setLoadingAllocation(true);
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) {
          console.warn("auth.getUser error:", authErr);
          setLoadingAllocation(false);
          return;
        }
        const authUser = authData?.user || null;
        if (authUser) {
          setForm((prev) => ({
            ...prev,
            email: authUser.email || prev.email,
            name: authUser.user_metadata?.full_name || prev.name,
          }));
          const { data, error } = await supabase
            .from("allocations")
            .select("*")
            .eq("user_id", authUser.id)
            .maybeSingle();
          if (error) console.warn("allocations check error:", error);
          setExistingAllocation(data || null);
        } else {
          setExistingAllocation(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAllocation(false);
      }
    };
    loadAuthAndAllocation();
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("allocations")
        .select("room_number, bed_number, hostel, floor");

      if (!error && data) {
        const booked = {};
        data.forEach((r) => {
          const key = `${r.hostel}-${r.floor}-${r.room_number}`;
          if (!booked[key]) booked[key] = [false, false, false, false];
          booked[key][r.bed_number - 1] = true;
        });
        setBookedBeds(booked);
      } else if (error) {
        console.warn("fetchReservations error:", error);
      }
      setIsLoading(false);
    };
    fetchReservations();
  }, [form.hostel, form.floor]);

  const getBeds = (roomNo) =>
    bookedBeds[`${form.hostel}-${form.floor}-${roomNo}`] || [false, false, false, false];

  const toggleSelect = (roomNo, bedIndex) => {
    const beds = getBeds(roomNo);
    if (beds[bedIndex]) return;
    setSelected({ roomNo, bedIndex });
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, receipt: "File size must be under 5MB" });
        return;
      }
      setReceipt(file);
      setErrors({ ...errors, receipt: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.regNo.trim()) newErrors.regNo = "Registration number is required";
    if (!form.department.trim()) newErrors.department = "Department is required";
    if (!receipt) newErrors.receipt = "Receipt upload is required";
    if (!selected) newErrors.bed = "Please select a bed";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(`receipts/${Date.now()}_${receipt.name}`, receipt);

      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("receipts").getPublicUrl(uploadData.path);
      const receiptUrl = publicUrl;

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) throw new Error("User authentication failed");
      const authUser = authData.user;

      const { roomNo, bedIndex } = selected;
      const { error: upsertError } = await supabase.from("allocations").upsert(
        {
          user_id: authUser.id,
          email: authUser.email,
          name: form.name,
          reg_no: form.regNo,
          department: form.department,
          fees_status: form.feesStatus,
          receipt_url: receiptUrl,
          hostel: form.hostel,
          floor: form.floor,
          room_number: roomNo,
          bed_number: bedIndex + 1,
          status: 'pending',
        },
        { onConflict: 'user_id' }
      );

      if (upsertError) {
        if (upsertError.code === "23505") alert("A record for this user already exists.");
        else throw upsertError;
      }

      saveAllocation({
        regNo: form.regNo, name: form.name, department: form.department,
        hostel: form.hostel, floor: form.floor, roomNo, bedIndex,
        date: new Date().toISOString(),
      });

      setShowConfirmation(true);
      setExistingAllocation({
        user_id: authUser.id, email: authUser.email, name: form.name,
        reg_no: form.regNo, department: form.department, fees_status: form.feesStatus,
        receipt_url: receiptUrl, hostel: form.hostel, floor: form.floor,
        room_number: roomNo, bed_number: bedIndex + 1, status: 'pending',
      });

    } catch (err) {
      console.error("Error during submission:", err);
      alert("Error saving details: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setSelected(null);
    navigate("/dashboard");
  };

  const handleReEdit = () => {
    setExistingAllocation(null);
    setForm({
      email: user?.email || "",
      name: user?.user_metadata?.full_name || "",
      regNo: existingAllocation?.reg_no || "",
      department: existingAllocation?.department || "",
      feesStatus: existingAllocation?.fees_status || "Paid",
      hostel: existingAllocation?.hostel || HOSTELS[0],
      floor: existingAllocation?.floor || FLOORS[0],
    });
    setReceipt(null);
    setSelected({
      roomNo: existingAllocation?.room_number,
      bedIndex: (existingAllocation?.bed_number || 1) - 1,
    });
    setErrors({});
  };
  // --- End Logic ---

  if (loadingAllocation) {
    return (
      <div className="allocation-page">
        <div className="allocation-card loading-view">
          <div className="spinner"></div>
          <p>Checking allocation status...</p>
        </div>
      </div>
    );
  }

  // Existing Allocation View
  if (existingAllocation) {
    if (existingAllocation.status === 'rejected') {
      return (
        <div className="allocation-page">
          <div className="allocation-card">
            <div className="allocation-header header-rejected">
              <h2>Allocation Rejected</h2>
              <p>Your previous application was not approved. Please review the reason and resubmit.</p>
            </div>
            <div className="status-body">
              <div className="rejection-box">
                <div className="rejection-title">
                  <Icon path={ICONS.warn} className="warn-icon" /> Reason for Rejection
                </div>
                <p>{existingAllocation.rejection_reason || 'No specific reason provided. Please check your details.'}</p>
              </div>
              
              <div className="allocation-details">
                <div className="detail-row"><span className="label">Name:</span> <span>{existingAllocation.name}</span></div>
                <div className="detail-row"><span className="label">Reg No:</span> <span>{existingAllocation.reg_no}</span></div>
                <div className="detail-row"><span className="label">Department:</span> <span>{existingAllocation.department}</span></div>
              </div>

              <div className="action-row">
                <button onClick={handleReEdit} className="submit-btn primary-btn">Re-edit Application</button>
                <button onClick={() => navigate("/dashboard")} className="submit-btn secondary-btn">Go to Dashboard</button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Pending/Approved View
    return (
      <div className="allocation-page">
        <div className="allocation-card">
          <div className="allocation-header">
            <h2>Allocation Status</h2>
            <p>Your room allocation request has been submitted.</p>
          </div>
          <div className="status-body">
            <div className={`status-badge status-${existingAllocation.status}`}>
              {existingAllocation.status.toUpperCase()}
            </div>

            <div className="allocation-details">
              <div className="detail-row"><span className="label">Name:</span> <span>{existingAllocation.name}</span></div>
              <div className="detail-row"><span className="label">Reg No:</span> <span>{existingAllocation.reg_no}</span></div>
              <div className="detail-row"><span className="label">Department:</span> <span>{existingAllocation.department}</span></div>
              <div className="detail-row"><span className="label">Hostel:</span> <span>{existingAllocation.hostel}</span></div>
              <div className="detail-row"><span className="label">Floor:</span> <span>{existingAllocation.floor}</span></div>
              <div className="detail-row"><span className="label">Room:</span> <span>{existingAllocation.room_number}</span></div>
              <div className="detail-row"><span className="label">Bed:</span> <span>{existingAllocation.bed_number}</span></div>
              <div className="detail-row">
                <span className="label">Receipt:</span> 
                <a href={existingAllocation.receipt_url} target="_blank" rel="noreferrer" className="link">View Receipt</a>
              </div>
            </div>

            <div className="action-row">
              <button onClick={() => navigate("/dashboard")} className="submit-btn primary-btn">Go to Dashboard</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // New Application Form
  return (
    <div className="allocation-page">
      <div className="allocation-card">
        <div className="allocation-header">
          <h2>Room Allocation Form</h2>
          <p>Complete your details and select a room.</p>
        </div>

        <form onSubmit={handleSubmit} className="allocation-form">
          
          {/* Section 1: Student Info */}
          <div className="form-section-title">
            <Icon path={ICONS.user} className="section-icon" /> Student Details
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" value={form.email} readOnly disabled className="input-readonly" />
            </div>
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input id="name" name="name" value={form.name} onChange={onChange} className={errors.name ? "input-error" : ""} placeholder="Enter full name" />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="regNo">Registration Number *</label>
              <input id="regNo" name="regNo" value={form.regNo} onChange={onChange} className={errors.regNo ? "input-error" : ""} placeholder="e.g., 21CSR001" />
              {errors.regNo && <span className="error-text">{errors.regNo}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select id="department" name="department" value={form.department} onChange={onChange} className={errors.department ? "input-error" : ""}>
                <option value="">Select Department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
                <option value="Electronics and Communication">Electronics and Communication</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Automobile Engineering">Automobile Engineering</option>
                <option value="Food Technology">Food Technology</option>
              </select>
              {errors.department && <span className="error-text">{errors.department}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="feesStatus">Fees Status</label>
              <select id="feesStatus" name="feesStatus" value={form.feesStatus} onChange={onChange}>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          {/* Section 2: Room Preference */}
          <div className="form-divider"></div>
          <div className="form-section-title">
            <Icon path={ICONS.building} className="section-icon" /> Room Preference
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="hostel">Select Hostel</label>
              <HostelSelector value={form.hostel} onChange={(value) => setForm({ ...form, hostel: value })} id="hostel" disabled={isLoading} />
            </div>
            <div className="form-group">
              <label htmlFor="floor">Select Floor</label>
              <FloorSelector value={form.floor} onChange={(value) => setForm({ ...form, floor: value })} id="floor" disabled={isLoading} />
            </div>
          </div>

          {/* Section 3: Upload */}
          <div className="form-divider"></div>
          <div className="form-group full-width">
            <label className="file-upload-label">
              Upload Fees Receipt * <span className="file-req">(PDF/Image, Max 5MB)</span>
            </label>
            <div className="file-input-wrapper">
              <label htmlFor="receipt" className="file-custom-btn">
                <Icon path={ICONS.upload} className="btn-icon" /> Choose File
              </label>
              <input id="receipt" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="hidden-input" />
              <span className="file-name">{receipt ? receipt.name : "No file selected"}</span>
            </div>
            {errors.receipt && <span className="error-text">{errors.receipt}</span>}
          </div>

          {/* Section 4: Grid */}
          <div className="form-divider"></div>
          <div className="form-group full-width">
            <label className="grid-label">Select Bed ({form.hostel} - {form.floor})</label>
            {isLoading ? (
              <div className="loading-grid">
                <span className="spinner"></span> Loading availability...
              </div>
            ) : (
              <RoomGrid
                hostel={form.hostel}
                floor={form.floor}
                rooms={rooms}
                getBeds={getBeds}
                onSelectFreeBed={toggleSelect}
                selected={selected}
              />
            )}
            {errors.bed && <span className="error-text center-text">{errors.bed}</span>}
          </div>

          <button type="submit" className="submit-btn primary-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <> <span className="spinner-small"></span> Processing... </>
            ) : (
              "Complete Allocation"
            )}
          </button>
        </form>

        {/* Success Modal */}
        {showConfirmation && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="modal-header">
                <h3>Application Submitted</h3>
              </div>
              <div className="modal-body">
                <div className="success-icon">
                  <Icon path={ICONS.check} />
                </div>
                <p>Your room allocation request is under review.</p>
                <p className="note-text">You will be notified once approved.</p>
              </div>
              <div className="modal-footer">
                <button onClick={closeConfirmation} className="modal-btn">Return to Dashboard</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}