
import { Routes, Route } from "react-router-dom";
import About from './components/About'
import Login from './components/Login'
import Index from './pages/index'

import SideBar from './components/SideBar'
import { NewGame } from './pages/NewGame'


function App() {

  return (
    <Routes>
      <Route path="/game" element={<Index players={[{ id: 1, name: "ac", money: 1500, position: 0, color: "", properties: [] }, { id: 2, name: "ab", money: 2500, position: 0, color: "", properties: [] }]} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />

      <Route path="/sidebar" element={<SideBar />} />
      <Route path="/newgame/:id" element={<NewGame />} />
    </Routes>
  )
}

export default App
