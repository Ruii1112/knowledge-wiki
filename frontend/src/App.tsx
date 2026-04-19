import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { RegistrationPage } from './pages/Registration';
import './styles/globals.css';

export default function App(): React.ReactNode {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
