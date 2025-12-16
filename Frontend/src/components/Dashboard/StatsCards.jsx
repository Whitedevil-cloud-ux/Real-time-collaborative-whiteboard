import React from "react";
import "./statscards.css";

const StatsCards = ({ stats }) => {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <h4>Total Tasks</h4>
        <p>{stats.totalTasks || 0}</p>
      </div>

      <div className="stat-card">
        <h4>Completed</h4>
        <p>{stats.completedTasks || 0}</p>
      </div>

      <div className="stat-card">
        <h4>Pending</h4>
        <p>{stats.pendingTasks || 0}</p>
      </div>

      <div className="stat-card overdue">
        <h4>Overdue</h4>
        <p>{stats.overdueTasks || 0}</p>
      </div>
    </div>
  );
};

export default StatsCards;
