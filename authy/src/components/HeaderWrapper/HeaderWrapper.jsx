'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import { mockUser } from '../../data/mockData';

const HeaderWrapper = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate fetching user
    setTimeout(() => {
      setUser(mockUser);
    }, 1000);
  }, []);

  return <Header user={user} />;
};

export default HeaderWrapper;
