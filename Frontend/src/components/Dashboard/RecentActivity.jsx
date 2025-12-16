import React from "react";
import "./activity.css";

const RecentActivity = ({ activities }) => {
  return (
    <div className="recent-activity-container">
      <h3>Recent Activity</h3>

      {activities.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        activities.slice(0, 6).map((a, idx) => (
          <div key={idx} className="activity-item">
            <p>{a.message}</p>
            <small>{new Date(a.createdAt).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
};

export default RecentActivity;
