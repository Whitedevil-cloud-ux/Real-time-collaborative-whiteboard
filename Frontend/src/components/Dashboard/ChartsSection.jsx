import { PieChart, Pie, Cell, Tooltip } from "recharts";
import "./charts.css";

const colors = ["#4a90e2", "#f5a623", "#50e3c2", "#d0021b"];

const ChartsSection = ({ chartData }) => {
  return (
    <div className="charts-container">
      <h3>Task Distribution</h3>

      <PieChart width={320} height={260}>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="stage"
          outerRadius={90}
          label
        >
          {chartData.map((entry, idx) => (
            <Cell key={idx} fill={colors[idx]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default ChartsSection;
