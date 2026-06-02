import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

const AppContext = createContext(null);

const CATEGORY_COLORS = {
  academic: 'var(--cat-academic)',
  personal: 'var(--cat-personal)',
  exercise: 'var(--cat-exercise)',
  social: 'var(--cat-social)',
  work: 'var(--cat-work)',
  transit: 'var(--cat-transit)',
  other: 'var(--cat-other)',
  sleep: '#6366f1',
};

export function AppProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem('chronos_mode') || 'individual');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [activities, setActivities] = useState([]);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('chronos_apikey') || '');
  const [loading, setLoading] = useState(false);

  const API = 'http://localhost:3001/api';

  const fetchActivities = useCallback(async (date) => {
    try {
      const res = await fetch(`${API}/activities?date=${date}`);
      const data = await res.json();
      setActivities(data.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    } catch (e) { console.error('fetchActivities', e); }
  }, []);

  const fetchCalendar = useCallback(async (date) => {
    try {
      const res = await fetch(`${API}/calendar?date=${date}`);
      const data = await res.json();
      setCalendarEvents(data);
    } catch (e) { console.error('fetchCalendar', e); }
  }, []);

  const fetchLocations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/locations`);
      const data = await res.json();
      setLocations(data);
    } catch (e) { console.error('fetchLocations', e); }
  }, []);

  useEffect(() => {
    fetchActivities(selectedDate);
    fetchCalendar(selectedDate);
    fetchLocations();
  }, [selectedDate, fetchActivities, fetchCalendar, fetchLocations]);

  const saveActivity = async (activity) => {
    if (activity.id && !activity.id.startsWith('new')) {
      const res = await fetch(`${API}/activities/${activity.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity),
      });
      const updated = await res.json();
      setActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      return updated;
    } else {
      const { id, ...body } = activity;
      const res = await fetch(`${API}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, date: selectedDate }),
      });
      const created = await res.json();
      setActivities((prev) => [...prev, created].sort((a, b) => a.startTime.localeCompare(b.startTime)));
      return created;
    }
  };

  const deleteActivity = async (id) => {
    await fetch(`${API}/activities/${id}`, { method: 'DELETE' });
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const saveCalendarEvent = async (event) => {
    const res = await fetch(`${API}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    const created = await res.json();
    setCalendarEvents((prev) => [...prev, created]);
    return created;
  };

  const startTracking = () => {
    if (!navigator.geolocation) return alert('Geolocation not supported.');
    setIsTracking(true);
    const wid = navigator.geolocation.watchPosition(
      (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, speed: pos.coords.speed }),
      (err) => console.warn(err),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return wid;
  };

  const stopTracking = (wid) => {
    navigator.geolocation.clearWatch(wid);
    setIsTracking(false);
  };

  const getCategoryColor = (category) => CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

  const getActivityDuration = (act) => {
    if (act.durationMinutes) return act.durationMinutes;
    const [sh, sm] = act.startTime.split(':').map(Number);
    const [eh, em] = act.endTime.split(':').map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('chronos_apikey', key);
  };

  const changeMode = (m) => {
    setMode(m);
    localStorage.setItem('chronos_mode', m);
  };

  return (
    <AppContext.Provider value={{
      mode, changeMode, selectedDate, setSelectedDate,
      activities, calendarEvents, locations,
      isTracking, currentLocation, loading, setLoading,
      saveActivity, deleteActivity, saveCalendarEvent,
      fetchActivities, fetchCalendar, fetchLocations,
      startTracking, stopTracking,
      getCategoryColor, getActivityDuration,
      apiKey, saveApiKey, API,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
