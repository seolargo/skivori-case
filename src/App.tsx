import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import GameList from './pages/GamesList/GamesList';
import SlotMachine from './pages/SlotMachine/SlotMachine';

import 'bootstrap/dist/css/bootstrap.min.css';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1>Home Page</h1>} />
        <Route path="/games" element={<GameList />} />
        <Route path="/slot-machine" element={<SlotMachine />} />
      </Routes>
    </Router>
  );
}

export default App;
