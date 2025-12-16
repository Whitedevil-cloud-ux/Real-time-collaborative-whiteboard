import { useEffect, useState } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/profile");
        setUser(res.data.user);
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      const res = await API.put("/profile", {
        name: user.name,
        email: user.email,
      });

      toast.success("Profile updated");
      setUser(res.data.user);
      setEditing(false);
    } catch (err) {
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <h2 className="text-xl font-semibold">Loading profile...</h2>;
  if (error) return <p className="text-red-500 text-lg">{error}</p>;

  return (
    <div className="ml-64 p-6 bg-white p-8 rounded-xl shadow-md max-w-xl">
      <h1 className="text-3xl font-bold mb-4">Profile</h1>

      <div className="space-y-4 text-lg">
        <div>
          <label className="font-semibold">Name:</label>
          {editing ? (
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full p-2 mt-1 border rounded"
            />
          ) : (
            <p>{user.name}</p>
          )}
        </div>

        <div>
          <label className="font-semibold">Email:</label>
          {editing ? (
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full p-2 mt-1 border rounded"
            />
          ) : (
            <p>{user.email}</p>
          )}
        </div>

        <p>
          <span className="font-semibold">Role:</span> {user.role}
        </p>
      </div>

      {!editing ? (
        <button
          onClick={() => setEditing(true)}
          className="mt-6 bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
        >
          Edit Profile
        </button>
      ) : (
        <button
          onClick={handleSave}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          Save Changes
        </button>
      )}
    </div>
  );
};

export default Profile;
