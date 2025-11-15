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

const numberFormatter = new Intl.NumberFormat("en-US", {
  style: "decimal",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const BarGraphBudget = ({ data, xAxisKey, title, height, barKeys, xAxisLabel, customTickFormatter, showPercentage, hideLabels, yAxisWidth, valueLabelPosition = "outside", valueLabelOffset = 5, rightMargin = 50, maxBarSize, layout = "vertical" }) => {
  // Create custom tooltip content that shows legend labels
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'white',
          padding: '8px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '0.75rem'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{`${label}`}</p>
          {payload.map((entry) => {
            // Find the corresponding barKey to get the tooltip label
            const barKey = barKeys.find(bar => bar.dataKey === entry.dataKey);
            const displayLabel = barKey?.tooltipLabel || barKey?.label || entry.dataKey;
            return (
              <p key={entry.dataKey} style={{
                margin: '2px 0',
                color: entry.color
              }}>
                {`${displayLabel}: ${numberFormatter.format(entry.value)}`}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Custom label renderer for percentage
  const renderPercentageLabel = (props) => {
    const { x, y, width, height, value, index, viewBox } = props;
    if (!showPercentage || !data[index] || barKeys.length < 2) return null;

    // Use the first barKey as the base (denominator) and second as the actual (numerator)
    const baseValue = data[index][barKeys[0].dataKey];
    const actualValue = data[index][barKeys[1].dataKey];

    if (!baseValue || baseValue === 0) return null;

    const percentage = ((actualValue / baseValue) * 100).toFixed(2);
    const formattedValue = formatValue(value);

    // Calculate position based on valueLabelPosition
    // Auto-adjust if bar is too close to the edge
    const chartWidth = viewBox?.width || 0;
    const availableSpace = chartWidth - (x + width);
    const minSpaceNeeded = 80; // Minimum pixels needed for percentage label (wider)

    let labelX, textAnchor;
    // If position is "outside" but there's not enough space, move it inside
    if (valueLabelPosition === "outside" && availableSpace < minSpaceNeeded) {
      labelX = x + width - valueLabelOffset;
      textAnchor = "end";
    } else if (valueLabelPosition === "inside") {
      labelX = x + width - valueLabelOffset;
      textAnchor = "end";
    } else if (valueLabelPosition === "center") {
      labelX = x + width / 2;
      textAnchor = "middle";
    } else { // "outside" (default)
      labelX = x + width + valueLabelOffset;
      textAnchor = "start";
    }

    return (
      <text
        x={labelX}
        y={y + height / 2}
        fill="#666"
        textAnchor={textAnchor}
        dominantBaseline="middle"
        fontSize="0.7rem"
      >
        {`${formattedValue} (${percentage}%)`}
      </text>
    );
  };

  // Custom label renderer for stacked bars - shows sum on end
  const renderStackedLabel = (barKey, barIndex) => (props) => {
    const { x, y, width, height, index, viewBox } = props;
    if (!data[index]) return null;

    // Calculate position based on valueLabelPosition
    // Auto-adjust if bar is too close to the edge
    const chartWidth = viewBox?.width || 0;
    const availableSpace = chartWidth - (x + width);
    const minSpaceNeeded = 60; // Minimum pixels needed for label

    let labelX, textAnchor;
    // If position is "outside" but there's not enough space, move it inside
    if (valueLabelPosition === "outside" && availableSpace < minSpaceNeeded) {
      labelX = x + width - valueLabelOffset;
      textAnchor = "end";
    } else if (valueLabelPosition === "inside") {
      labelX = x + width - valueLabelOffset;
      textAnchor = "end";
    } else if (valueLabelPosition === "center") {
      labelX = x + width / 2;
      textAnchor = "middle";
    } else { // "outside" (default)
      labelX = x + width + valueLabelOffset;
      textAnchor = "start";
    }

    // Check if this bar is part of a stack
    if (barKey.stackId) {
      // Find all bars with the same stackId
      const stackedBars = barKeys.filter(b => b.stackId === barKey.stackId);
      // Only show label on the last bar in the stack
      const isLastInStack = barIndex === barKeys.findLastIndex(b => b.stackId === barKey.stackId);

      if (!isLastInStack) return null;

      // Calculate sum of all stacked values
      const sum = stackedBars.reduce((total, b) => {
        return total + (data[index][b.dataKey] || 0);
      }, 0);

      return (
        <text
          x={labelX}
          y={y + height / 2}
          fill="#666"
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fontSize="0.7rem"
        >
          {formatValue(sum)}
        </text>
      );
    }

    // For non-stacked bars, show individual value
    return (
      <text
        x={labelX}
        y={y + height / 2}
        fill="#666"
        textAnchor={textAnchor}
        dominantBaseline="middle"
        fontSize="0.7rem"
      >
        {formatValue(data[index][barKey.dataKey])}
      </text>
    );
  };
  return (
    <div className="bar-chart-container">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout}
          margin={{
            top: 25,
            right: rightMargin,
            left: layout === "vertical" ? (yAxisWidth ? yAxisWidth + 10 : (hideLabels ? 20 : 150)) : 25,
            bottom: layout === "horizontal" ? 25 : 15,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {layout === "vertical" ? (
            <>
              <XAxis
                type="number"
                tickFormatter={(value) => numberFormatter.format(value)}
                tick={{ fontSize: '0.75rem' }}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                tickFormatter={customTickFormatter}
                tick={hideLabels ? false : { fontSize: '0.75rem' }}
                width={yAxisWidth || (hideLabels ? 10 : 140)}
              />
            </>
          ) : (
            <>
              <XAxis
                type="category"
                dataKey={xAxisKey}
                tickFormatter={customTickFormatter}
                tick={{ fontSize: '0.75rem' }}
              />
              <YAxis
                type="number"
                tickFormatter={(value) => numberFormatter.format(value)}
                tick={{ fontSize: '0.75rem' }}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          {barKeys.map((bar, barIndex) => (
            <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.fill} stackId={bar.stackId} maxBarSize={maxBarSize}>
              <LabelList
                dataKey={bar.dataKey}
                position={valueLabelPosition || "top"}
                formatter={formatValue}
                style={{ fontSize: '0.7rem', fill: '#666' }}
              />
              {!hideLabels && (bar.bottomLabel || bar.label) && (
                <LabelList
                  valueAccessor={() => bar.bottomLabel || bar.label}
                  position="bottom"
                  offset={10}
                  style={{ fontSize: '0.65rem', fill: bar.fill }}
                />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarGraphBudget