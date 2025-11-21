// src/pages/RoomSelection.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  getStudentProfile,
  saveAllocation,
} from "../utils/storage";
import { supabase } from "../utils/supabase";
// Import the new professional CSS
//import "../styles/RoomSelection-new.css";

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
  building: "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2h-1.528A6 6 0 004 9.528V4z",
  layer: "M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z",
  check: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
  info: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z",
  save: "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
};

const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango", "Kamban", "Bharathi"];
const FLOORS = ["Ground", "First", "Second", "Third"];

function genRooms(floor) {
  if (floor === "Ground") {
    return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
  }
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
}

export default function RoomSelection() {
  const student = getStudentProfile();
  const [hostel, setHostel] = useState(HOSTELS[0]);
  const [floor, setFloor] = useState(FLOORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const rooms = useMemo(() => genRooms(floor), [floor]);
  const [selected, setSelected] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookedBeds, setBookedBeds] = useState({}); 

  // --- Logic remains 100% UNCHANGED ---
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("reservations")
        .select("room_number, bed_number, hostel, floor");

      if (!error && data) {
        const booked = {};
        data.forEach((r) => {
          const key = `${r.hostel}-${r.floor}-${r.room_number}`;
          if (!booked[key]) booked[key] = [false, false, false, false];
          booked[key][r.bed_number - 1] = true;
        });
        setBookedBeds(booked);
      }
      setIsLoading(false);
    };

    fetchReservations();
  }, [hostel, floor]);

  const getBeds = (roomNo) => {
    const key = `${hostel}-${floor}-${roomNo}`;
    return bookedBeds[key] || [false, false, false, false];
  };

  const toggleSelect = (roomNo, bedIndex) => {
    const beds = getBeds(roomNo);
    if (beds[bedIndex]) return; // already booked
    // If clicking the same bed, deselect it, otherwise select new
    if (selected && selected.roomNo === roomNo && selected.bedIndex === bedIndex) {
        setSelected(null);
    } else {
        setSelected({ roomNo, bedIndex });
    }
  };

  const handleHostelChange = (e) => {
    const newHostel = e.target.value;
    setIsLoading(true);
    setTimeout(() => {
      setHostel(newHostel);
      setSelected(null);
      setIsLoading(false);
    }, 200);
  };

  const handleFloorChange = (e) => {
    const newFloor = e.target.value;
    setIsLoading(true);
    setTimeout(() => {
      setFloor(newFloor);
      setSelected(null);
      setIsLoading(false);
    }, 200);
  };

  const confirm = async () => {
    if (!selected) return;
    setIsLoading(true);
    try {
      const { roomNo, bedIndex } = selected;

      // Double-check in Supabase
      const { data: existing } = await supabase
        .from("reservations")
        .select("*")
        .eq("hostel", hostel)
        .eq("floor", floor)
        .eq("room_number", roomNo)
        .eq("bed_number", bedIndex + 1);

      if (existing && existing.length > 0) {
        alert("Sorry, this bed is already taken. Please select another.");
        setIsLoading(false);
        return;
      }

      // Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: studentRow } = await supabase
          .from("students")
          .select("id")
          .eq("email", user.email)
          .single();

        if (studentRow) {
          await supabase.from("reservations").insert([
            {
              student_id: studentRow.id,
              room_number: roomNo,
              bed_number: bedIndex + 1,
              hostel,
              floor,
            },
          ]);
        }
      }

      // Update UI
      const newBeds = [...getBeds(roomNo)];
      newBeds[bedIndex] = true;
      setBookedBeds((prev) => ({
        ...prev,
        [`${hostel}-${floor}-${roomNo}`]: newBeds,
      }));

      saveAllocation({
        regNo: student?.regNo || "",
        name: student?.name || "",
        department: student?.department || "",
        hostel,
        floor,
        roomNo,
        bedIndex,
        date: new Date().toISOString(),
      });

      setShowConfirmation(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeConfirmation = () => {
    setShowConfirmation(false);
    setSelected(null);
  };
  // --- End Logic ---

  return (
    <div className="room-selection-page">
      <div className="room-selection-card">
        
        {/* Header */}
        <div className="room-selection-header">
          <h2>Room Selection</h2>
          <p>Select your preferred hostel, floor, and bed.</p>
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-grid">
            <div className="form-group">
              <label htmlFor="hostel-select">
                <Icon path={ICONS.building} className="label-icon" /> Select Hostel
              </label>
              <select 
                id="hostel-select" 
                value={hostel} 
                onChange={handleHostelChange} 
                disabled={isLoading}
              >
                {HOSTELS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="floor-select">
                <Icon path={ICONS.layer} className="label-icon" /> Select Floor
              </label>
              <select 
                id="floor-select" 
                value={floor} 
                onChange={handleFloorChange} 
                disabled={isLoading}
              >
                {FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Selection Summary */}
        {selected && (
          <div className="selection-summary">
            <div className="summary-content">
              <span className="summary-label">Selected:</span>
              <span className="summary-value">Room {selected.roomNo} — Bed {selected.bedIndex + 1}</span>
            </div>
            <div className="summary-hint">Click "Confirm Selection" at the bottom to proceed.</div>
          </div>
        )}

        {/* Grid Area */}
        <div className="grid-area">
          <div className="grid-header-row">
            <h3>{hostel} Hostel - {floor} Floor</h3>
            <div className="legend">
               <span className="legend-item"><span className="dot free"></span> Available</span>
               <span className="legend-item"><span className="dot selected"></span> Selected</span>
               <span className="legend-item"><span className="dot occupied"></span> Occupied</span>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <span className="spinner"></span> Loading rooms...
            </div>
          ) : (
            <div className="room-grid">
              {rooms.map(roomNo => {
                 const beds = getBeds(roomNo);
                 return (
                  <div key={roomNo} className="room-card">
                    <div className="room-number">Room {roomNo}</div>
                    <div className="bed-grid">
                      {beds.map((isOccupied, bedIndex) => {
                        const isSelected = selected && selected.roomNo === roomNo && selected.bedIndex === bedIndex;
                        
                        return (
                          <div
                            key={bedIndex}
                            onClick={() => toggleSelect(roomNo, bedIndex)}
                            className={`bed-box ${isOccupied ? 'occupied' : isSelected ? 'selected' : 'free'}`}
                            title={isOccupied ? "Occupied" : `Select Bed ${bedIndex + 1}`}
                          >
                            {bedIndex + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm Button */}
        <div className="action-section">
          <button 
            className="submit-btn" 
            onClick={confirm} 
            disabled={!selected || isLoading}
          >
            {isLoading ? (
              <> <span className="spinner"></span> Processing... </>
            ) : (
              <> Confirm Selection <Icon path={ICONS.save} /> </>
            )}
          </button>
        </div>

        {/* Success Modal */}
        {showConfirmation && (
          <div className="modal-overlay">
            <div className="confirmation-modal">
              <div className="modal-header">
                <h3>Allocation Confirmed!</h3>
              </div>
              <div className="modal-body">
                <div className="success-icon">✓</div>
                <p>Your bed has been successfully reserved.</p>
                <div className="allocation-details">
                  <div className="detail-item">
                    <span className="detail-label">Hostel:</span>
                    <span className="detail-value">{hostel}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Floor:</span>
                    <span className="detail-value">{floor}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Room:</span>
                    <span className="detail-value">{selected?.roomNo}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Bed:</span>
                    <span className="detail-value">{selected ? selected.bedIndex + 1 : ''}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={closeConfirmation} className="modal-btn">Continue to Dashboard</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
} 