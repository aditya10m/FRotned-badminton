import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import theme from '../../constants/theme';

interface LineChartProps {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
  width?: number;
  showDots?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  color = theme.colors.primary,
  height = 180,
  width = 300,
  showDots = true,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!data || data.length === 0) return <View style={{ height, width }} />;

  const min = Math.min(...data.map((d) => d.value));
  const max = Math.max(...data.map((d) => d.value));
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - min) / range) * chartHeight;
    return { x, y, value: d.value, date: d.date };
  });

  const pathData = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
  const areaData = `${pathData} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

  return (
    <View style={{ height, width }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.25" />
            <Stop offset="1" stopColor={color} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Gradient fill under the curve */}
        <Path d={areaData} fill="url(#chartGradient)" />

        {/* Main metric stroke line */}
        <Path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data point dots */}
        {showDots &&
          points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={5}
              fill={theme.colors.background}
              stroke={color}
              strokeWidth={2.5}
            />
          ))}
      </Svg>
    </View>
  );
};
