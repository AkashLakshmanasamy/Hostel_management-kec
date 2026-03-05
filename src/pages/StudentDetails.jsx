// src/pages/StudentDetails.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabase";
import { useUser } from "../contexts/UserContext";
// Import our new, self-contained CSS file
import "../styles/StudentDetails-new.css";

// --- New Icon SVG ---
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
  upload: "M9.97 4.97a.75.75 0 011.06 0l3 3a.75.75 0 01-1.06 1.06l-1.72-1.72v7.94a.75.75 0 01-1.5 0v-7.94L8.97 9.03a.75.75 0 01-1.06-1.06l3-3zM3.75 12.75A.75.75 0 013 12V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75zM12 12.75a.75.75 0 01-.75-.75V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75zM16.25 12.75a.75.75 0 01-.75-.75V8.75a.75.75 0 011.5 0V12a.75.75 0 01-.75.75zM4 17a1 1 0 01-1-1v-2.25a.75.75 0 011.5 0v2.25a.25.25 0 00.25.25h10.5a.25.25 0 00.25-.25v-2.25a.75.75 0 011.5 0V16a1 1 0 01-1 1H4z",
  arrow: "M4.75 8.75a.75.75 0 000 1.5h8.514l-2.61 2.61a.75.75 0 101.06 1.06l4.004-4.003a.75.75 0 000-1.06l-4.004-4.004a.75.75 0 00-1.06 1.06l2.61 2.61H4.75z",
};
// --- End Icon ---

export default function StudentDetails() {
  const navigate = useNavigate();
  const { user } = useUser();

  const [form, setForm] = useState({
    name: user?.user_metadata?.full_name || "",
    regNo: "",
    department: "",
    feesStatus: "Paid",
  });

  const [receipt, setReceipt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // --- All functionality below is 100% UNCHANGED ---
  useEffect(() => {
    if (!user) {
      console.warn("⚠ No logged-in user found.");
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      console.log("Selected file:", file);
      setReceipt(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.regNo.trim()) newErrors.regNo = "Registration number is required";
    if (!form.department.trim()) newErrors.department = "Department is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      let receiptUrl = null;
      if (receipt) {
        console.log("Uploading receipt...");
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets.find((b) => b.name === "receipts")) {
          await supabase.storage.createBucket("receipts", { public: true });
        }
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("receipts")
          .upload(`receipts/${Date.now()}_${receipt.name}`, receipt);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage
          .from("receipts")
          .getPublicUrl(uploadData.path);
        receiptUrl = publicUrl;
      }
      
      const { data: studentData, error: insertError } = await supabase
        .from("students")
        .insert([
          {
            name: form.name,
            regNo: form.regNo,
            department: form.department,
            feesStatus: form.feesStatus,
            receiptUrl: receiptUrl,
            user_id: user.id,
          },
        ])
        .select();
      if (insertError) throw insertError;

      alert("Student details saved successfully!");
      navigate("/rooms");
    } catch (err) {
      console.error(err);
      alert("Error saving student details: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  // --- End of unchanged functionality ---

  return (
    // New class names for our new design
    <div className="student-details-page">
      <div className="student-details-card">
        <div className="student-details-header">
          <h2>Kongu Engineering College</h2>
          <p>Hostel Management System</p>
        </div>

        <form onSubmit={onSubmit} className="student-details-form">
          <div className="form-intro">
            <h3>Student Information</h3>
            <p>Please provide your details to proceed.</p>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={onChange}
                required
                className={errors.name ? "input-error" : ""}
                placeholder="Enter your full name"
              />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="regNo">Registration Number</label>
              <input
                id="regNo"
                name="regNo"
                value={form.regNo}
                onChange={onChange}
                required
                className={errors.regNo ? "input-error" : ""}
                placeholder="e.g., 23CDR005"
              />
              {errors.regNo && <span className="error-text">{errors.regNo}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={onChange}
                className={errors.department ? "input-error" : ""}
                required
              >
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
              {errors.department && (
                <span className="error-text">{errors.department}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="feesStatus">Fees Status</label>
              <select
                id="feesStatus"
                name="feesStatus"
                value={form.feesStatus}
                onChange={onChange}
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>
          </div>

          <div className="form-group form-group-full">
            <label htmlFor="receipt">Upload Fees Receipt (PDF/Image)</label>
            <label htmlFor="receipt" className="file-upload-label">
              <input
                id="receipt"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden-file-input"
              />
              <span className="file-upload-button">
                <Icon path={ICONS.upload} />
                Choose File
              </span>
              <span className="file-name-display">
                {receipt ? receipt.name : "No file chosen"}
              </span>
            </label>
            <p className="file-hint">Maximum file size: 5MB</p>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span> Processing...
              </>
            ) : (
              <>
                Save & Continue
                <Icon path={ICONS.arrow} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}