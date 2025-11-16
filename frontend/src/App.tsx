
import { Routes, Route } from "react-router-dom";
import About from './components/About'
import Login from './components/Login'
import Index from './pages/index'
import { GameBoard } from './components/GameBoard'


function App() {

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/game" element={<GameBoard players={[]} />} />
    </Routes>
  )
}

export default App
