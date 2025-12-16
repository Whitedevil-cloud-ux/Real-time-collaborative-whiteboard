import "./upcoming.css";

const UpcomingTasks = ({ today, upcoming }) => {
  return (
    <div className="upcoming-container">
      <h3>Upcoming Tasks</h3>

      <h4>Due Today</h4>
      {today.length === 0 ? <p>No tasks due today.</p> :
        today.map((t, idx) => (
          <div key={idx} className="upcoming-task">
            <p>{t.title}</p>
            <small>Due: {new Date(t.dueDate).toLocaleDateString()}</small>
          </div>
        ))
      }

      <h4>Next 7 Days</h4>
      {upcoming.length === 0 ? <p>No upcoming tasks.</p> :
        upcoming.map((t, idx) => (
          <div key={idx} className="upcoming-task">
            <p>{t.title}</p>
            <small>Due: {new Date(t.dueDate).toLocaleDateString()}</small>
          </div>
        ))
      }
    </div>
  );
};

export default UpcomingTasks;
