import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import "./charts.css";

const WeeklyProductivity = ({ data }) => {
  const formatted = data.map(item => ({
    date: item._id,
    tasks: item.count
  }));

  return (
    <div className="charts-container">
      <h3>Weekly Productivity</h3>

      <LineChart width={500} height={260} data={formatted}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <CartesianGrid stroke="#ddd" />
        <Line type="monotone" dataKey="tasks" stroke="#4a90e2" strokeWidth={2} />
      </LineChart>
    </div>
  );
};

export default WeeklyProductivity;
