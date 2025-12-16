import React, { useEffect, useState } from "react";
import api from "../api/axios";
import StatsCards from "../components/Dashboard/StatsCards";
import RecentActivity from "../components/Dashboard/RecentActivity";
import ChartsSection from "../components/Dashboard/ChartsSection";
import UpcomingTasks from "../components/Dashboard/UpcomingTasks";
import WeeklyProductivity from "../components/Dashboard/WeeklyProductivity";
import ProfileSummary from "../components/Dashboard/ProfileSummary";
import "../styles/dashboard.css";

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id;

  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [upcoming, setUpcoming] = useState({ todayTasks: [], upcoming: [] });
  const [profile, setProfile] = useState({});

  const loadDashboard = async () => {
    const statsRes = await api.get("/api/dashboard/stats");
    const activityRes = await api.get("/api/dashboard/recent-activity");
    const chartRes = await api.get("/api/dashboard/stage-distribution");
    const weeklyRes = await api.get("/api/dashboard/weekly-productivity");
    const upcomingRes = await api.get("/api/dashboard/upcoming-tasks");
    const profileRes = await api.get(`/api/dashboard/profile-summary/${userId}`);

    setStats(statsRes.data);
    setActivities(activityRes.data);
    setChartData(chartRes.data);
    setWeeklyData(weeklyRes.data);
    setUpcoming(upcomingRes.data);
    setProfile(profileRes.data);
  };

  useEffect(() => {
    if (userId) loadDashboard();
  }, [userId]);

  return (
    <div className="dashboard-page ml-64 h-screen overflow-y-auto p-6">

      <h2 className="dashboard-title">Dashboard</h2>

      {/* ROW 1 – Stats */}
      <StatsCards stats={stats} />

      {/* ROW 2 – Charts + Activity */}
      <div className="row row-2">
        <div className="left-panel">
          <ChartsSection chartData={chartData} />
        </div>

        <div className="right-panel">
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* ROW 3 – Productivity + Profile + Upcoming */}
      <div className="row row-3">
        <div className="left-panel">
          <WeeklyProductivity data={weeklyData} />
        </div>

        <div className="right-panel">
          <UpcomingTasks 
            today={upcoming.todayTasks} 
            upcoming={upcoming.upcoming} 
          />

          <ProfileSummary data={profile} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
