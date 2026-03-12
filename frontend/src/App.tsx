import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import ApiKeys from './pages/ApiKeys';
import Billing from './pages/Billing';
import Settings from './pages/Settings';
import Documentation from './pages/Documentation';
import Playground from './pages/Playground';
import LandingPage from './pages/LandingPage';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ForgotPassword from './pages/auth/ForgotPassword';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="playground" element={<Playground />} />
          <Route path="logs" element={<Logs />} />
          <Route path="api-keys" element={<ApiKeys />} />
          <Route path="billing" element={<Billing />} />
          <Route path="docs" element={<Documentation />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}
