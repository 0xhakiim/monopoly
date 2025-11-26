import { Menu } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function SideBar() {
    const [open, setOpen] = useState(true);
    const navigate = useNavigate();
    return (

        <div className="relative h-screen bg-gray-100">
            <button
                onClick={() => setOpen(!open)}
                className={`p-2 m-2 rounded bg-gray-200 relative z-50 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"}`}
            >
                <Menu />
            </button>
            <div
                className={`
          fixed top-0 left-0 h-full w-64 bg-white shadow-xl
          transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
            >
                <div className="p-4 font-bold"><button onClick={() => navigate("/newgame")}>New Game</button></div>
            </div>

        </div >
    );
}