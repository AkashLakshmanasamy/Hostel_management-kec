// src/pages/Rules.jsx
import React from "react";
// Import the new professional CSS
import "../styles/Rules-new.css";

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
  book: "M10 1a9 9 0 100 18 9 9 0 000-18zm.75 14.25a.75.75 0 01-1.5 0v-6.5a.75.75 0 011.5 0v6.5zm0-8.5a.75.75 0 01-1.5 0v-.5a.75.75 0 011.5 0v.5z", // Info circle style
  clock: "M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z",
  ban: "M10 2a8 8 0 100 16 8 8 0 000-16zM5.94 5.94a.75.75 0 011.06-1.06l7.06 7.06a.75.75 0 01-1.06 1.06L5.94 5.94zm-1.06 7.06a.75.75 0 011.06-1.06l7.06 7.06a.75.75 0 01-1.06 1.06l-7.06-7.06z", // Rough ban icon
  warning: "M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z",
  list: "M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
};

export default function Rules() {
  return (
    <div className="rules-page">
      <div className="rules-card">
        <div className="rules-header">
          <h2>Hostel Rules & Regulations</h2>
          <p>Guidelines to ensure a safe, disciplined, and harmonious living environment.</p>
        </div>

        <div className="rules-body">
          
          {/* Section 1: General Rules */}
          <div className="rules-section">
            <div className="section-title">
              <Icon path={ICONS.list} className="section-icon" />
              General Guidelines
            </div>
            <div className="rules-list">
              {[
                "All students must carry their hostel identity card at all times within the premises.",
                "Students must maintain strict discipline and decorum in the hostel premises.",
                "Rooms and common areas must be kept clean and tidy at all times.",
                "Damage to hostel property will result in heavy fines and disciplinary action.",
                "Smoking, consumption of alcohol, and use of drugs is strictly prohibited.",
                "Visitors must register at the security desk and are allowed only during specified hours.",
                "Students must return to the hostel by the specified curfew time."
              ].map((rule, index) => (
                <div key={index} className="rule-item">
                  <div className="rule-number">{index + 1}</div>
                  <div className="rule-text">{rule}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Timings (Grid Layout) */}
          <div className="grid-2-col">
            <div className="rules-section">
              <div className="section-title">
                <Icon path={ICONS.clock} className="section-icon" />
                Mess Timings
              </div>
              <div className="timing-table">
                <div className="timing-row">
                  <span>Breakfast</span>
                  <span className="time-badge">7:30 AM - 9:00 AM</span>
                </div>
                <div className="timing-row">
                  <span>Lunch</span>
                  <span className="time-badge">12:30 PM - 2:00 PM</span>
                </div>
                <div className="timing-row">
                  <span>Snacks</span>
                  <span className="time-badge">4:30 PM - 5:30 PM</span>
                </div>
                <div className="timing-row">
                  <span>Dinner</span>
                  <span className="time-badge">7:30 PM - 9:00 PM</span>
                </div>
              </div>
              <div className="note-box">
                <strong>Note:</strong> Mess will remain closed on the second Sunday of every month.
              </div>
            </div>

            <div className="rules-section">
              <div className="section-title">
                <Icon path={ICONS.clock} className="section-icon" />
                Gate Timings
              </div>
              <div className="timing-table">
                <div className="timing-row">
                  <span>Gate Opens</span>
                  <span className="time-badge">5:30 AM</span>
                </div>
                <div className="timing-row">
                  <span>Day Scholars</span>
                  <span className="time-badge">9:00 AM - 4:00 PM</span>
                </div>
                <div className="timing-row">
                  <span>Regular Curfew</span>
                  <span className="time-badge">9:30 PM</span>
                </div>
                <div className="timing-row">
                  <span>Weekend Curfew</span>
                  <span className="time-badge">10:30 PM</span>
                </div>
              </div>
              <div className="note-box">
                <strong>Note:</strong> Late entry after curfew requires prior permission from the warden.
              </div>
            </div>
          </div>

          {/* Section 3: Prohibited Items */}
          <div className="rules-section">
            <div className="section-title">
              <Icon path={ICONS.ban} className="section-icon" />
              Prohibited Items
            </div>
            <div className="prohibited-grid">
              <div className="prohibited-card">
                <h4>Electrical Appliances</h4>
                <ul>
                  <li>Electric iron</li>
                  <li>Immersion rod</li>
                  <li>Electric kettle</li>
                  <li>Induction cooktop</li>
                </ul>
              </div>
              <div className="prohibited-card">
                <h4>Entertainment</h4>
                <ul>
                  <li>Large Speakers</li>
                  <li>Sound systems</li>
                  <li>Amplifiers</li>
                  <li>Gaming Consoles</li>
                </ul>
              </div>
              <div className="prohibited-card">
                <h4>Restricted Items</h4>
                <ul>
                  <li>Candles / Incense</li>
                  <li>Combustibles</li>
                  <li>Weapons</li>
                  <li>Pets</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 4: Consequences */}
          <div className="rules-section no-border">
            <div className="section-title">
              <Icon path={ICONS.warning} className="section-icon" />
              Consequences of Violations
            </div>
            <div className="consequences-grid">
              <div className="consequence-item level-1">
                <h4>1st Violation</h4>
                <p>Written warning and fine of ₹500</p>
              </div>
              <div className="consequence-item level-2">
                <h4>2nd Violation</h4>
                <p>Fine of ₹1000 and parents notification</p>
              </div>
              <div className="consequence-item level-3">
                <h4>3rd Violation</h4>
                <p>Suspension from hostel for 15 days</p>
              </div>
              <div className="consequence-item level-4">
                <h4>Serious Acts</h4>
                <p>Immediate expulsion from hostel</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}