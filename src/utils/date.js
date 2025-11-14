// src/utils/date.js
export const todayISO = () => new Date().toISOString().split('T')[0];

// Format ISO date (YYYY-MM-DD) to "Thursday, 11/13/25"
export const formatDisplayDate = (isoDate) => {
  const date = new Date(isoDate + 'T00:00:00'); // Add time to avoid timezone issues
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[date.getDay()];
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2); // Last 2 digits of year
  
  return `${dayName}, ${month}/${day}/${year}`;
};

// Format ISO date to short format "Thu, 11/13"
export const formatShortDate = (isoDate) => {
  const date = new Date(isoDate + 'T00:00:00');
  
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = days[date.getDay()];
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${dayName}, ${month}/${day}`;
};

// Format ISO date to compact format "11/13/25"
export const formatCompactDate = (isoDate) => {
  const date = new Date(isoDate + 'T00:00:00');
  
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear().toString().slice(-2);
  
  return `${month}/${day}/${year}`;
};