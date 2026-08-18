import { Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import About from './components/About';
import Login from './components/Login';
import Index from './pages/index';
import Signup from './components/Signup';
import Logout from './components/Logout';
import SideBar from './components/SideBar';
import { NewGame } from './pages/NewGame';

type JwtPayload = {
  user_id: number;
  exp: number;
};

const getStoredUserId = (): number | null => {
  const token = localStorage.getItem('access_token');
  if (!token) return null;

  try {
    const payload = jwtDecode<JwtPayload>(token);
    return typeof payload.user_id === 'number' ? payload.user_id : null;
  } catch {
    return null;
  }
};

const getEntryPath = () => {
  const userId = getStoredUserId();
  return userId ? `/newgame/${userId}` : '/login';
};

function App() {
  const userId = getStoredUserId();

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to={getEntryPath()} replace />} />
        <Route
          path="/game"
          element={
            userId ? (
              <Index />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={userId ? <Navigate to={`/newgame/${userId}`} replace /> : <Login />}
        />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sidebar" element={<SideBar />} />
        <Route
          path="/newgame/:id?"
          element={userId ? <NewGame /> : <Navigate to="/login" replace />}
        />
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<Navigate to={getEntryPath()} replace />} />
      </Routes>
    </>
  );
}

export default App;
