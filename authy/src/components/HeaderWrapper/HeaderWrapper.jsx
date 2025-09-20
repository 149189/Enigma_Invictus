// components/HeaderWrapper/HeaderWrapper.jsx
'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import { getCurrentUser } from '@/services/user/userServices';
import { useRouter } from "next/navigation";

const HeaderWrapper = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const response = await getCurrentUser(router);
      if (response?.data) {
        setUser({ 
          name: response.data.data.name, 
          avatar: response.data.data.avatar 
        });
      } else {
        // Don't redirect here as it will conflict with page-level redirects
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  return <Header user={user} isLoading={isLoading} />;
};

export default HeaderWrapper;