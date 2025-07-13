// hooks/useUserProfile.js
import { useState, useEffect } from 'react';
import { mockUserProfile } from '../lib/mockData';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState(mockUserProfile);

  useEffect(() => {
    setTimeout(() => {
      setUserProfile(mockUserProfile);
    }, 500); // 0.5 seconde pour imiter un appel
  }, []);

  return userProfile;
};
