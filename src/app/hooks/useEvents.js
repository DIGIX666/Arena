// hooks/useEvents.js
import { useState, useEffect } from 'react';
import { mockEvents } from '../lib/mockData';

export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000); // 1 seconde pour imiter un chargement
  }, []);

  return { events, loading };
};
