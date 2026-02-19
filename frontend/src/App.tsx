
import { Routes, Route } from "react-router-dom";
import About from './components/About'
import Login from './components/Login'
import Index from './pages/index'
import Signup from "./components/Signup";
import Logout from "./components/Logout";
import SideBar from './components/SideBar'
import { NewGame } from './pages/NewGame'


function App() {
  function logtoken() {
    console.log(localStorage.getItem("access_token"));
  }
  return (
    <>
      <Routes>

        <Route path="/game" element={<Index players={[{ id: 1, name: "ac", money: 1500, position: 0, color: "", properties: [] }, { id: 2, name: "ab", money: 2500, position: 0, color: "", properties: [] }]} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sidebar" element={<SideBar />} />
        <Route path="/newgame/:id" element={<NewGame />} />
        <Route path="/logout" element={<Logout />} />
      </Routes></>
  )
}

export default App
