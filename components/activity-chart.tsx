"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function ActivityChart({ data }: { data: Array<{ time: string; latency: number }> }) {
  if (!data.length) return <div className="chart-empty">Run checks to build a latency chart.</div>;
  return <div className="chart-wrap" aria-label="Recent API latency chart">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
        <defs><linearGradient id="latencyFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#32b987" stopOpacity={0.38}/><stop offset="100%" stopColor="#32b987" stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid stroke="#dce2dd" strokeDasharray="4 5" vertical={false}/>
        <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#738079", fontSize: 10 }}/>
        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#738079", fontSize: 10 }} unit="ms"/>
        <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #dce2dd", boxShadow: "0 10px 30px #15231c18" }} formatter={(value) => [`${value} ms`, "Latency"]}/>
        <Area type="monotone" dataKey="latency" stroke="#16835f" strokeWidth={2.5} fill="url(#latencyFill)" animationDuration={450}/>
      </AreaChart>
    </ResponsiveContainer>
  </div>;
}
