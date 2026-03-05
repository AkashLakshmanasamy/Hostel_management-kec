// src/pages/Schedule.jsx
import React, { useState } from "react";
// Import the new professional CSS
import "../styles/Schedule-new.css";

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
  coffee: "M2 8a6 6 0 016-6v1.5A4.5 4.5 0 003.5 8H2zm10.5-6V.5a7.5 7.5 0 00-7.5 7.5H6.5A6 6 0 0112.5 2zM14 7.5A2.5 2.5 0 0111.5 10V5a2.5 2.5 0 012.5 2.5z", // Custom SVG paths might need tweaking or use simple shapes
  sun: "M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h1a1 1 0 100 2h-1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z",
  moon: "M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z",
  clock: "M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
};

// Use simple unicode chars for food icons to keep code clean, or SVGs if preferred
const MealIcon = ({ type }) => {
  switch(type) {
    case 'Morning': return <span className="meal-icon">☕</span>;
    case 'Breakfast': return <span className="meal-icon">🍳</span>;
    case 'Lunch': return <span className="meal-icon">🍱</span>;
    case 'Evening': return <span className="meal-icon">🍵</span>;
    case 'Dinner': return <span className="meal-icon">🍽️</span>;
    default: return null;
  }
};

export default function Schedule() {
  const [selectedDay, setSelectedDay] = useState("Monday");

  const weeklyMenu = {
    Monday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Idli, Sambar, Coconut Chutney",
      lunch: "Sambar Rice, Rasam, Poriyal, Kootu, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Puliyodarai, Vadai, Rice, Poriyal, Mor Kuzhambu"
    },
    Tuesday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Puri, Masala Kuzhambu",
      lunch: "Jeera Rice, Dal, Poriyal, Rasam, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Aviyal, Onion Sambar, Rice, Poriyal"
    },
    Wednesday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Rava Upma, Coconut Chutney",
      lunch: "Curd Rice, Okra Poriyal, Dal, Papad, Pickle",
      evening: ["Tea", "Milk"],
      dinner: "Kootu, Mor Kuzhambu, Rice, Poriyal, Papad"
    },
    Thursday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Paniyaram, Coconut Chutney",
      lunch: "Lemon Rice, Dal, Poriyal, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Vathal Kuzhambu, Rice, Poriyal, Mor Kuzhambu"
    },
    Friday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Puttu, Kara Chutney",
      lunch: "Tomato Rice, Dal, Poriyal, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Paruppu Kuzhambu, Rice, Poriyal, Rasam"
    },
    Saturday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Masala Dosa, Sambar, Chutney",
      lunch: "Tamarind Rice, Dal, Poriyal, Papad, Curd",
      evening: ["Tea", "Milk"],
      dinner: "Butter Paneer, Rice, Poriyal, Mor Kuzhambu"
    },
    Sunday: {
      morning: ["Coffee", "Milk"],
      breakfast: "Pongal, Ven Pongal, Sweet Pongal",
      lunch: "Special Meal: Dal, Sambar, Rasam, Three Poriyal, Papad, Vadai, Payasam",
      evening: ["Tea", "Milk"],
      dinner: "Green Gram Kuzhambu, Rice, Poriyal, Mor Kuzhambu"
    }
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="schedule-page">
      <div className="schedule-card">
        <div className="schedule-header">
          <h2>Weekly Food Menu</h2>
          <p>Delicious Tamil Nadu vegetarian meals prepared daily with authentic flavors.</p>
        </div>

        <div className="days-selector">
          {daysOfWeek.map(day => (
            <button
              key={day}
              className={`day-btn ${selectedDay === day ? 'active' : ''}`}
              onClick={() => setSelectedDay(day)}
            >
              {day.substring(0, 3)} {/* Show Mon, Tue etc on mobile */}
              <span className="full-day-name">{day.substring(3)}</span>
            </button>
          ))}
        </div>

        <div className="menu-content">
          <h3 className="day-heading">{selectedDay}'s Menu</h3>
          
          <div className="timeline-container">
            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-title">
                  <MealIcon type="Morning" />
                  <span>Morning Beverages</span>
                </div>
                <span className="meal-time">6:30 AM - 7:30 AM</span>
              </div>
              <div className="meal-items-tags">
                {weeklyMenu[selectedDay].morning.map((item, i) => (
                  <span key={i} className="food-tag">{item}</span>
                ))}
              </div>
            </div>

            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-title">
                  <MealIcon type="Breakfast" />
                  <span>Breakfast</span>
                </div>
                <span className="meal-time">8:00 AM - 9:30 AM</span>
              </div>
              <p className="meal-description">{weeklyMenu[selectedDay].breakfast}</p>
            </div>

            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-title">
                  <MealIcon type="Lunch" />
                  <span>Lunch</span>
                </div>
                <span className="meal-time">12:30 PM - 2:00 PM</span>
              </div>
              <p className="meal-description">{weeklyMenu[selectedDay].lunch}</p>
            </div>

            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-title">
                  <MealIcon type="Evening" />
                  <span>Evening Beverages</span>
                </div>
                <span className="meal-time">4:30 PM - 5:30 PM</span>
              </div>
              <div className="meal-items-tags">
                {weeklyMenu[selectedDay].evening.map((item, i) => (
                  <span key={i} className="food-tag">{item}</span>
                ))}
              </div>
            </div>

            <div className="meal-card">
              <div className="meal-header">
                <div className="meal-title">
                  <MealIcon type="Dinner" />
                  <span>Dinner</span>
                </div>
                <span className="meal-time">7:30 PM - 9:00 PM</span>
              </div>
              <p className="meal-description">{weeklyMenu[selectedDay].dinner}</p>
            </div>
          </div>
        </div>

        <div className="weekly-overview">
          <h3 className="overview-title">Quick Weekly Overview</h3>
          <div className="week-grid">
            {daysOfWeek.map(day => (
              <div 
                key={day} 
                className={`day-card-mini ${selectedDay === day ? 'highlight' : ''}`}
                onClick={() => setSelectedDay(day)}
              >
                <h4>{day}</h4>
                <div className="mini-menu-item">
                  <span>🍳</span> {weeklyMenu[day].breakfast.split(',')[0]}...
                </div>
                <div className="mini-menu-item">
                  <span>🍱</span> {weeklyMenu[day].lunch.split(',')[0]}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}