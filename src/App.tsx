import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GameList from './pages/GamesList/GamesList';
import 'bootstrap/dist/css/bootstrap.min.css';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/games" element={<GameList />} />
      </Routes>
    </Router>
  );
}

export default App;
