import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "../../ComponentsStyles/LineGraph.css";
import { formatUnit } from "../Sub_config/Format.js";

const LineGraphROC = ({
  data,
  xAxisKey = "fpr",
  lineKeys = ["tpr"],
  title,
  height,
  xLabel,
  yLabel,
}) => {
  const screenWidth = window.innerWidth;
  const labelFontSize =
    screenWidth < 600 ? "10px" : screenWidth < 768 ? "12px" : "14px";

  if (!Array.isArray(data)) {
    return <p>ไม่มีข้อมูล ROC Curve สำหรับแสดงผล</p>;
  }

  return (
    <div className="line-chart-container">
      <div className="title-legend-container">
        <h2 className="line-chart-title">{title}</h2>
      </div>

      <ResponsiveContainer width="100%" height={height || 400}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 50, left: 30, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={xAxisKey}
            domain={[0, 1]}
            tick={{ fontSize: "0.8rem", fill: "#3e3e3e" }}
            tickFormatter={formatUnit}
            label={{
              value: xLabel,
              position: "insideBottom",
              offset: -5,
              style: { fontSize: "12px", fill: "#3e3e3e" },
            }}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fontSize: "0.8rem", fill: "#3e3e3e" }}
            tickFormatter={formatUnit}
            label={{
              value: yLabel,
              angle: -90,
              position: "insideLeft",
              offset: -25,
              style: { fontSize: "12px", fill: "#3e3e3e" },
            }}
          />
          {/* <Tooltip formatter={(value) => formatUnit(value)} /> */}

          {lineKeys.map((key, index) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={["#C69530", "#410445", "#BC6FF1"][index % 3]}
              strokeWidth={1}
              dot={false}
              //   activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineGraphROC;
