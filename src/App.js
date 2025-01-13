import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MusicList from './components/MusicList';
import MusicForm from './components/MusicForm';
import MusicDetails from './components/MusicDetails';
import Dashboard from './components/Dashboard';
import EditProfile from './components/EditProfile';
import Login from './components/Login';
import Signup from './components/Signup';
import PrintableMusic from './components/PrintableMusic';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { auth } from './firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import ReactLoading from 'react-loading';
import { NotificationProvider } from './contexts/NotificationContext';

const LoadingContainer = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const PrivateRoute = ({ children }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <LoadingContainer>
        <ReactLoading type="bubbles" color="#fff" height={64} width={64} />
      </LoadingContainer>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <LoadingContainer>
        <ReactLoading type="bubbles" color="#fff" height={64} width={64} />
      </LoadingContainer>
    );
  }

  return (
    <NotificationProvider>
      <Router>
        <ToastContainer position="top-right" />
        <Routes>
          {/* Rotas públicas */}
          <Route 
            path="/login" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Login />
            } 
          />
          <Route 
            path="/signup" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Signup />
            } 
          />

          {/* Rota inicial - redireciona para dashboard se autenticado */}
          <Route 
            path="/" 
            element={
              user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } 
          />

          {/* Rotas protegidas */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/musiclist" 
            element={
              <PrivateRoute>
                <MusicList />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/music/:id" 
            element={
              <PrivateRoute>
                <MusicDetails />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/print/:id" 
            element={
              <PrivateRoute>
                <PrintableMusic />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/edit-profile/:id" 
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/edit-profile" 
            element={
              <PrivateRoute>
                <EditProfile />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/music/new" 
            element={
              <PrivateRoute>
                <MusicForm />
              </PrivateRoute>
            } 
          />

          <Route 
            path="/music/create" 
            element={
              <PrivateRoute>
                <MusicForm />
              </PrivateRoute>
            } 
          />

          {/* Rota para URLs não encontradas */}
          <Route 
            path="*" 
            element={<Navigate to="/login" replace />} 
          />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;
