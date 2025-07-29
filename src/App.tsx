import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoryProvider, useStoryContext } from './context/StoryContext';
import ProfileForm from './pages/ProfileForm';
import StoryDiscovery from './pages/StoryDiscovery';
import StoryResults from './pages/StoryResults';

// Protected Route Component - prevents access if requirements aren't met
const ProtectedRoute = ({ 
  children, 
  requireProfile = false, 
  requireDiscovery = false 
}: { 
  children: React.ReactNode;
  requireProfile?: boolean;
  requireDiscovery?: boolean;
}) => {
  const { isProfileComplete, isDiscoveryComplete } = useStoryContext();

  // If profile is required but not complete, redirect to profile
  if (requireProfile && !isProfileComplete) {
    return <Navigate to="/" replace />;
  }

  // If discovery is required but not complete, redirect to discovery
  if (requireDiscovery && !isDiscoveryComplete) {
    return <Navigate to="/discovery" replace />;
  }

  return <>{children}</>;
};

// Main App Component with Routing
const AppRoutes = () => {
  return (
    <Routes>
      {/* Profile Form - Always accessible */}
      <Route path="/" element={<ProfileForm />} />
      
      {/* Story Discovery - Requires completed profile */}
      <Route 
        path="/discovery" 
        element={
          <ProtectedRoute requireProfile={true}>
            <StoryDiscovery />
          </ProtectedRoute>
        } 
      />
      
      {/* Story Results - Requires completed profile AND discovery */}
      <Route 
        path="/results" 
        element={
          <ProtectedRoute requireProfile={true} requireDiscovery={true}>
            <StoryResults />
          </ProtectedRoute>
        } 
      />
      
      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Root App Component
const App = () => {
  return (
    <Router>
      <StoryProvider>
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          <AppRoutes />
        </div>
      </StoryProvider>
    </Router>
  );
};

export default App;