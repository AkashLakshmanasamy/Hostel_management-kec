// src/components/admin/VacantRooms.jsx
import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../../utils/supabase";
// Import our new, component-specific CSS file
import "../../styles/VacantRooms-new.css";

// --- Functionality is 100% UNCHANGED ---
const HOSTELS = ["Dheeran", "Valluvar", "Ponnar", "Sankar", "Elango", "Kamban", "Bharathi"];
const FLOORS = ["Ground", "First", "Second", "Third"];

function genRooms(floor) {
  if (floor === "Ground") return Array.from({ length: 40 }, (_, i) => String(i + 1));
  const start = floor === "First" ? 101 : floor === "Second" ? 201 : 301;
  return Array.from({ length: 40 }, (_, i) => String(start + i));
}

function normalizeFloor(floor) {
  if (!floor) return "";
  const f = floor.toLowerCase();
  if (f === "0" || f.includes("ground")) return "Ground";
  if (f.startsWith("1")) return "First";
  if (f.startsWith("2")) return "Second";
  if (f.startsWith("3")) return "Third";
  return floor;
}
// --- End of unchanged functionality ---

export default function VacantRooms() {
  const [hostel, setHostel] = useState(HOSTELS[0]);
  const [floor, setFloor] = useState(FLOORS[0]);
  const [bookedBeds, setBookedBeds] = useState({});
  const [adminAllocation, setAdminAllocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- All functionality below is 100% UNCHANGED ---
  useEffect(() => {
    const fetchAllocations = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("allocations")
        .select("hostel,floor,room_number,bed_number,user_id")
        .eq('status', 'confirmed');

      if (error) {
        console.warn("Error fetching allocations:", error);
        setLoading(false);
        return;
      }

      const booked = {};
      data.forEach((r) => {
        const normalizedRoomNumber = String(parseInt(r.room_number, 10));
        const key = `${r.hostel}-${normalizeFloor(r.floor)}-${normalizedRoomNumber}`;
        
        if (!booked[key]) booked[key] = [false, false, false, false];
        if (r.bed_number >= 1 && r.bed_number <= 4) {
          booked[key][r.bed_number - 1] = true;
        }
      });
      setBookedBeds(booked);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const myAlloc = data.find((r) => r.user_id === user.id);
        if (myAlloc) {
          setAdminAllocation({
            hostel: myAlloc.hostel,
            floor: normalizeFloor(myAlloc.floor),
            room: String(parseInt(myAlloc.room_number, 10)),
            bed: myAlloc.bed_number,
          });
        }
      }
      setLoading(false);
    };
    fetchAllocations();
  }, []);

  const rooms = useMemo(() => genRooms(floor), [floor]);
  const getBeds = (roomNo) =>
    bookedBeds[`${hostel}-${floor}-${roomNo}`] || [false, false, false, false];
  // --- End of unchanged functionality ---

  return (
    <div className="vacant-rooms-layout">
      <div className="component-header">
        <div className="component-header-left">
          <h2 className="component-header-title">Hostel Room Vacancy</h2>
          <p className="component-header-subtitle">
            Check availability. Your own allocation is highlighted in blue.
          </p>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="hostel-filter">Hostel</label>
            <select
              id="hostel-filter"
              value={hostel}
              onChange={(e) => setHostel(e.target.value)}
            >
              {HOSTELS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="floor-filter">Floor</label>
            <select
              id="floor-filter"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            >
              {FLOORS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="component-loading">
          <div className="loading-spinner"></div>
          <p>Loading room data...</p>
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map((r) => {
            const beds = getBeds(r);
            const freeBeds = beds.filter((b) => !b).length;

            return (
              <div
                key={r}
                className="room-card"
              >
                <h4 className="room-card-title">Room {r}</h4>
                <div className="bed-status-grid">
                  {beds.map((b, i) => {
                    const isAdminBed =
                      adminAllocation &&
                      adminAllocation.hostel === hostel &&
                      adminAllocation.floor === floor &&
                      adminAllocation.room === r &&
                      adminAllocation.bed === i + 1;

                    return (
                      <span
                        key={i}
                        className={`bed-indicator ${
                          isAdminBed
                            ? "bed-admin"
                            : b
                            ? "bed-booked"
                            : "bed-free"
                        }`}
                        title={
                          isAdminBed
                            ? `Your Bed (Bed ${i + 1})`
                            : b
                            ? `Bed ${i + 1} Occupied`
                            : `Bed ${i + 1} Available`
                        }
                      >
                        Bed {i + 1}
                      </span>
                    );
                  })}
                </div>
                <div className="room-card-footer">
                  {freeBeds === 0 ? (
                    <span className="status-text status-full">Full</span>
                  ) : (
                    <span className="status-text status-free">
                      {freeBeds} {freeBeds === 1 ? 'bed' : 'beds'} free
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}