import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import '@aws-amplify/ui-react/styles.css';

// Import pages
import Home from './pages/Home';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// Import contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SkillProvider } from './contexts/SkillContext';

// AWS Amplify configuration
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Home />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SkillProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/matches" 
                  element={
                    <ProtectedRoute>
                      <Matches />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat/:matchId" 
                  element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </SkillProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
