import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { CreateRequestPage } from './pages/CreateRequestPage';
import { MessagesPage } from './pages/MessagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { AICenterPage } from './pages/AICenterPage';
import { DashboardPage } from './pages/DashboardPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { RequestDetailPage } from './pages/RequestDetailPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { SessionsPage } from './pages/SessionsPage';
import { LiveSessionPage } from './pages/LiveSessionPage';
import { AdminPanel } from './pages/AdminPanel';
import { RestrictedPage } from './pages/RestrictedPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }) {
  const { currentUser, isAccountRestricted } = useAuth();
  const restriction = isAccountRestricted();
  
  if (!currentUser) return <Navigate to="/login" />;
  if (restriction && window.location.pathname !== '/restricted') {
    return <Navigate to="/restricted" />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            background: '#fff',
            color: '#2b3231',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            border: '1px solid #f3f4f6',
            fontWeight: '500',
            fontSize: '14px',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#129780',
              secondary: '#fff',
            },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="explore" element={<ExplorePage />} />
            
            {/* Private Routes */}
            <Route path="create" element={
              <PrivateRoute><CreateRequestPage /></PrivateRoute>
            } />
            <Route path="messages" element={
              <PrivateRoute><MessagesPage /></PrivateRoute>
            } />
            <Route path="profile" element={
              <PrivateRoute><ProfilePage /></PrivateRoute>
            } />
            <Route path="ai-center" element={
              <PrivateRoute><AICenterPage /></PrivateRoute>
            } />
            <Route path="dashboard" element={
              <PrivateRoute><DashboardPage /></PrivateRoute>
            } />
            <Route path="request/:id" element={
              <PrivateRoute><RequestDetailPage /></PrivateRoute>
            } />
            <Route path="notifications" element={
              <PrivateRoute><NotificationsPage /></PrivateRoute>
            } />
            <Route path="leaderboard" element={
              <PrivateRoute><LeaderboardPage /></PrivateRoute>
            } />
            <Route path="sessions" element={
              <PrivateRoute><SessionsPage /></PrivateRoute>
            } />
            <Route path="session/:sessionId" element={
              <PrivateRoute><LiveSessionPage /></PrivateRoute>
            } />
            <Route path="admin" element={
              <PrivateRoute><AdminPanel /></PrivateRoute>
            } />
            <Route path="onboarding" element={
              <PrivateRoute><OnboardingPage /></PrivateRoute>
            } />
            <Route path="restricted" element={<RestrictedPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
