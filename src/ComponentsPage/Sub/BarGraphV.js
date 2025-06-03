import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import "../../ComponentsStyles/BarGraph.css";

const formatValue = (value) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const BarGraphV = ({ data, xAxisKey, title, height, barKeys }) => {
  return (
    <div className="bar-chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 30,
            right: 30,
            left: 30,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            label={{
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis tickFormatter={(value) => formatValue(value)} />
          <Tooltip formatter={(value) => formatValue(value)} />
          {barKeys.map((bar) => (
            <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.fill}>
              <LabelList
                dataKey={bar.dataKey}
                position="top"
                formatter={formatValue}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraphV;
