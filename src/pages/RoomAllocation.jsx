// src/pages/RoomAllocation.jsx
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../utils/supabase";
// Import the new professional CSS
import "../styles/RoomAllocation-new.css";

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
  search: "M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
};

const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango", "Kamban", "Bharathi"];
const FLOORS = ["Ground", "First", "Second", "Third"];

function genRooms(floor) {
  if (floor === "Ground") return Array.from({ length: 40 }, (_, i) => String(i + 1).padStart(3, "0"));
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
}

export default function RoomAllocation() {
  const [hostel, setHostel] = useState(HOSTELS[0]);
  const [floor, setFloor] = useState(FLOORS[0]);
  const [roomsData, setRoomsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const rooms = useMemo(() => genRooms(floor), [floor]);

  // --- Logic remains 100% UNCHANGED ---
  const fetchRooms = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("rooms")
      .select("*")
      .eq("hostel", hostel)
      .eq("floor", floor);

    if (error) console.error(error);
    else setRoomsData(data || []);

    setIsLoading(false);
  };

  useEffect(() => {
    fetchRooms();
    const subscription = supabase
      .from(`rooms:hostel=eq.${hostel}&floor=eq.${floor}`)
      .on("UPDATE", payload => {
        setRoomsData(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
      })
      .subscribe();

    return () => supabase.removeSubscription(subscription);
  }, [hostel, floor]);

  const handleHostelChange = (e) => setHostel(e.target.value);
  const handleFloorChange = (e) => setFloor(e.target.value);
  // --- End Logic ---

  return (
    <div className="allocation-page">
      <div className="allocation-card">
        
        {/* Header */}
        <div className="allocation-header">
          <h2>Hostel Room Overview</h2>
          <p>View real-time availability of rooms and beds.</p>
        </div>

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-title">
            <Icon path={ICONS.search} className="filter-icon" /> 
            Selection Criteria
          </div>
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

        {/* Content Area */}
        <div className="content-area">
          <div className="section-header-row">
             <h3>{hostel} Hostel - {floor} Floor</h3>
             <div className="legend">
               <span className="legend-item"><span className="dot free"></span> Available</span>
               <span className="legend-item"><span className="dot occupied"></span> Reserved</span>
             </div>
          </div>

          {isLoading ? (
             <div className="loading-state">
               <span className="spinner"></span> Loading room data...
             </div>
          ) : (
            <div className="room-grid">
              {rooms.map(roomNo => (
                <div key={roomNo} className="room-card">
                  <div className="room-number">Room {roomNo}</div>
                  <div className="bed-grid">
                    {Array.from({ length: 4 }).map((_, bedIndex) => {
                      // Logic from your original code
                      const room = roomsData.find(r => r.room_no === roomNo && r.bed_index === bedIndex);
                      const occupied = room?.occupied_by;

                      return (
                        <div
                          key={bedIndex}
                          className={`bed-box ${occupied ? 'occupied' : 'free'}`}
                          title={occupied ? "Reserved" : "Available"}
                        >
                          {bedIndex + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}