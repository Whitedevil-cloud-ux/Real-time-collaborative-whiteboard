import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";

const Sidebar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const res = await API.get("/logout");

            if(res.data.status === true) {
                toast.success("Logged out successfully");
                navigate("/login", { replace: true });
            }
        } catch (error) {
            console.error("Logout error: ", error);
            toast.error("Logout failed");
        }
    };

  return (
    <div className="w-64 h-screen bg-white shadow-xl p-6 flex flex-col fixed left-0 top-0">
      <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

      <nav className="space-y-4">
        <Link to="/" className="block text-gray-700 hover:text-black font-medium">
          Home
        </Link>

        <Link to="/tasks" className="block text-gray-700 hover:text-black font-medium">
          Tasks
        </Link>

        <Link to="/whiteboard" className="block text-gray-700 hover:text-black font-medium">
          Whiteboard
        </Link>

        <Link to="/profile" className="block text-gray-700 hover:text-black font-medium">
          Profile
        </Link>
      </nav>

      <div className="mt-auto">
        <button onClick={handleLogout} className="w-full mt-6 bg-black text-white py-2 rounded-lg hover:bg-gray-800">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
