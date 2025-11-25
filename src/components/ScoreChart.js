// src/components/ScoreChart.js
import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Polyline, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../styles/theme';

export default function ScoreChart({ data, width, height }) {
  if (!data || data.length === 0) return null;

  const padding = { top: 20, right: 10, bottom: 20, left: 10 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minScore = -2;
  const maxScore = 2;
  const scoreRange = maxScore - minScore;

  const points = data.map((item, index) => {
    const x = padding.left + (index / (data.length - 1)) * chartWidth;
    const y = padding.top + chartHeight - ((item.score - minScore) / scoreRange) * chartHeight;
    return { x, y, ...item };
  });

  const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  const avgScore = data.reduce((sum, d) => sum + d.score, 0) / data.length;
  const lineColor = avgScore >= 0.75 ? colors.scoreExcellent :
                    avgScore >= 0.25 ? colors.scoreGood :
                    avgScore >= -0.25 ? colors.scoreNeutral :
                    avgScore >= -0.75 ? colors.scorePoor :
                    colors.scoreBad;

  const gridLines = [-2, -1, 0, 1, 2];

  return (
    <View style={{ width, height }}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={lineColor} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={lineColor} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>

        {gridLines.map((score) => {
          const y = padding.top + chartHeight - ((score - minScore) / scoreRange) * chartHeight;
          return (
            <Line
              key={score}
              x1={padding.left}
              y1={y}
              x2={width - padding.right}
              y2={y}
              stroke={score === 0 ? colors.backgroundLight : colors.background}
              strokeWidth={score === 0 ? 1.5 : 1}
              strokeOpacity={score === 0 ? 0.5 : 0.3}
            />
          );
        })}

        <Polyline
          points={pathPoints}
          fill="none"
          stroke={lineColor}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((point, index) => {
          if (!point.hasEntry) return null;
          return (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r={4}
              fill={lineColor}
              stroke={colors.backgroundCard}
              strokeWidth={2}
            />
          );
        })}
      </Svg>
    </View>
  );
}