import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import MusicForm from './components/MusicForm';
import MusicDetails from './components/MusicDetails';
import MusicList from './components/MusicList';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/SharedStyles';

// Componente para verificar autenticação
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          {/* Rota inicial - redireciona para a lista de músicas se estiver autenticado */}
          <Route 
            path="/" 
            element={
              localStorage.getItem('user') ? 
                <Navigate to="/musiclist" replace /> : 
                <Login />
            } 
          />
          
          <Route path="/signup" element={<Signup />} />
          
          {/* Rotas protegidas */}
          <Route 
            path="/music-form" 
            element={
              <PrivateRoute>
                <MusicForm />
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
          
          {/* Suporte para ambas as versões da rota */}
          <Route 
            path="/musiclist" 
            element={
              <PrivateRoute>
                <MusicList />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/music-list" 
            element={
              <Navigate to="/musiclist" replace />
            } 
          />

          {/* Rota para lidar com URLs não encontradas */}
          <Route 
            path="*" 
            element={
              <Navigate to="/musiclist" replace />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
