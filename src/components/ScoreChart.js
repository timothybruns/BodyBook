// src/components/ScoreChart.js - UPDATED with prominent score
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line, Polyline, Circle, G, Text as SvgText } from 'react-native-svg';
import { colors } from '../styles/theme';

export default function ScoreChart({ data, width, height, avgScore }) {
  if (!data || data.length === 0) return null;

  const padding = { top: 80, right: 15, bottom: 30, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const minScore = -2;
  const maxScore = 2;
  const scoreRange = maxScore - minScore;

  // Calculate points
  const points = data.map((item, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - ((item.score - minScore) / scoreRange) * chartHeight;
    return { x, y, ...item };
  });

  const pathPoints = points.map(p => `${p.x},${p.y}`).join(' ');

  // Grid lines at each score level
  const gridLines = [-2, -1, 0, 1, 2];

  // Line color - white/light gray
  const lineColor = '#FFFFFF';
  const gridColor = 'rgba(255, 255, 255, 0.15)';
  const zeroLineColor = 'rgba(255, 255, 255, 0.3)';
  const labelColor = 'rgba(255, 255, 255, 0.5)';

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Score Label - Centered and More Prominent */}
      <View style={styles.scoreLabel}>
        <Text style={styles.scoreLabelText}>AVG. SCORE</Text>
        <Text style={styles.scoreValue}>
          {avgScore > 0 ? '+' : ''}{avgScore}
        </Text>
      </View>

      {/* Chart */}
      <Svg width={width} height={height}>
        <G>
          {/* Horizontal grid lines with Y-axis labels */}
          {gridLines.map((score) => {
            const y = padding.top + chartHeight - ((score - minScore) / scoreRange) * chartHeight;
            const isZeroLine = score === 0;
            return (
              <G key={`grid-${score}`}>
                {/* Grid line */}
                <Line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke={isZeroLine ? zeroLineColor : gridColor}
                  strokeWidth={isZeroLine ? 1 : 0.5}
                />
                {/* Y-axis label */}
                <SvgText
                  x={padding.left - 8}
                  y={y + 4}
                  fontSize="11"
                  fill={labelColor}
                  textAnchor="end"
                  fontWeight={isZeroLine ? "600" : "400"}
                >
                  {score > 0 ? `+${score}` : score}
                </SvgText>
              </G>
            );
          })}

          {/* Vertical grid lines (optional - for days) */}
          {points.map((point, index) => {
            // Only show every few vertical lines to avoid clutter
            if (index % Math.ceil(points.length / 5) !== 0) return null;
            return (
              <Line
                key={`vgrid-${index}`}
                x1={point.x}
                y1={padding.top}
                x2={point.x}
                y2={height - padding.bottom}
                stroke={gridColor}
                strokeWidth={0.5}
              />
            );
          })}

          {/* Main line chart */}
          <Polyline
            points={pathPoints}
            fill="none"
            stroke={lineColor}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points - only show for entries with data */}
          {points.map((point, index) => {
            if (!point.hasEntry) return null;
            return (
              <Circle
                key={`point-${index}`}
                cx={point.x}
                cy={point.y}
                r={3.5}
                fill={lineColor}
                stroke={colors.background}
                strokeWidth={1.5}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  scoreLabel: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  scoreLabelText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 0.5,
  },
  scoreValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
});