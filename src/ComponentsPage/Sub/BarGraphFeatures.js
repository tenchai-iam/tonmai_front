// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   LabelList,
// } from "recharts";
// import "../../ComponentsStyles/BarGraph.css";

// const formatValue = (value) =>
//   new Intl.NumberFormat("en-US", {
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(value);

// const BarGraphFeatures = ({ data, xAxisKey, title, height, barKeys }) => {
//   return (
//     <div className="bar-chart-container">
//       {title && <h3 className="bar-chart-title">{title}</h3>}
//       <ResponsiveContainer width="100%" height={height}>
//         <BarChart
//           data={data}
//           margin={{
//             top: 30,
//             right: 30,
//             left: 30,
//             bottom: 5,
//           }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis
//             dataKey={xAxisKey}
//             label={{
//               position: "insideBottom",
//               offset: -5,
//             }}
//           />
//           <YAxis tickFormatter={(value) => formatValue(value)} />
//           <Tooltip formatter={(value) => formatValue(value)} />
//           {barKeys.map((barKey) => (
//             <Bar key={barKey} dataKey={barKey} fill="#8884d8">
//               <LabelList
//                 dataKey={barKey}
//                 position="top"
//                 formatter={formatValue}
//               />
//             </Bar>
//           ))}
//         </BarChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default BarGraphFeatures;

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

const BarGraphFeatures = ({ data, xAxisKey, title, height, barKeys }) => {
  return (
    <div className="bar-chart-container">
      {title && <h3 className="bar-chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          layout="vertical" // 👈 Switch to horizontal layout
          data={data}
          margin={{
            top: 30,
            right: 30,
            left: 150, // More space for category labels
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tickFormatter={(value) => formatValue(value)} />
          <YAxis type="category" dataKey={xAxisKey} width={100} />
          <Tooltip formatter={(value) => formatValue(value)} />
          {barKeys.map((barKey) => (
            <Bar key={barKey} dataKey={barKey} fill="#8884d8">
              <LabelList
                dataKey={barKey}
                position="right"
                formatter={formatValue}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraphFeatures;
