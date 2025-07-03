
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import TodayRecord from '@/components/TodayRecord';
import Statistics from '@/components/Statistics';
import Dashboard from '@/components/Dashboard';
import ProfileSetup from '@/components/ProfileSetup';
import Navigation from '@/components/Navigation';
import { getUserProfile } from '@/utils/storage';
import './App.css';

const queryClient = new QueryClient();

function App() {
  const profile = getUserProfile();

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          {profile && <Navigation />}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/setup" element={<ProfileSetup onComplete={() => window.location.reload()} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/record" element={<TodayRecord />} />
            <Route path="/record/:date" element={<TodayRecord />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
