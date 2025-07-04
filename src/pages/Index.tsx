
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import ProfileSetup from '@/components/ProfileSetup';
import { getUserProfile } from '@/utils/storage';

const Index = () => {
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      const profile = getUserProfile();
      console.log('Profile check:', profile);
      setHasProfile(!!profile && profile.goals && profile.goals.length > 0);
      setIsLoading(false);
    };
    checkProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!hasProfile) {
    return <ProfileSetup onComplete={() => setHasProfile(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="flex flex-col h-screen">
        <main className="flex-1 overflow-y-auto">
          <Dashboard />
        </main>
        <Navigation />
      </div>
    </div>
  );
};

export default Index;
