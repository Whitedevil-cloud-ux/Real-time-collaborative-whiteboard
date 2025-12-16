import "./profilesummary.css";

const ProfileSummary = ({ data }) => {
  return (
    <div className="profile-summary-card">
      <h3>Your Profile</h3>

      <p><strong>Name:</strong> {data.name}</p>
      <p><strong>Joined:</strong> {new Date(data.joined).toLocaleDateString()}</p>

      <div className="profile-stats">
        <div>
          <h4>{data.totalTasks}</h4>
          <p>Total Tasks</p>
        </div>
        <div>
          <h4>{data.completed}</h4>
          <p>Completed</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummary;
