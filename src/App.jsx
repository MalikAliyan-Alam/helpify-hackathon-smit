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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" />
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
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
