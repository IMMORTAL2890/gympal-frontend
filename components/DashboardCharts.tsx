'use client';

import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

interface TimelinePoint {
  label: string;
  count: number;
}

interface PlanPoint {
  name: string;
  value: number;
}

interface ChartsProps {
  timeline: TimelinePoint[];
  membersByPlan: PlanPoint[];
}

const COLORS = [
  'oklch(0.26 0.06 260)', // Indigo
  'oklch(0.72 0.18 145)', // Green
  'oklch(0.78 0.16 75)',  // Amber
  'oklch(0.65 0.22 25)',  // Red
  '#6366f1', '#a855f7', '#ec4899'
];

export default function DashboardCharts({ timeline, membersByPlan }: ChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. New Members Timeline Bar Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm">
        <h3 className="text-md font-bold text-foreground mb-4">New Members Timeline</h3>
        <div className="h-72">
          {timeline.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground font-semibold">
              No registration logs in selected range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.01 250)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'oklch(0.5 0.03 250)' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: 'oklch(0.5 0.03 250)' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid oklch(0.92 0.01 250)', borderRadius: '12px', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                />
                <Bar dataKey="count" fill="oklch(0.26 0.06 260)" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 2. Members by Plan Pie Chart */}
      <div className="bg-white rounded-2xl border p-6 shadow-sm">
        <h3 className="text-md font-bold text-foreground mb-4">Plan Distribution</h3>
        <div className="h-72 flex flex-col items-center justify-center">
          {membersByPlan.length === 0 ? (
            <div className="text-xs text-muted-foreground font-semibold">
              No active plans recorded
            </div>
          ) : (
            <div className="relative w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={membersByPlan}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {membersByPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid oklch(0.92 0.01 250)', borderRadius: '12px', fontSize: '11px' }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
