import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import Card from './Card.jsx'
const COLORS = ['#3f8480', '#c96a3e']

export function BarChartCard({ title, data }) {
  return (
    <Card title={title}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} />
            <YAxis tick={{ fontSize: 12, fill: 'var(--chart-tick)' }} allowDecimals={false} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} labelStyle={{ color: 'var(--color-text)' }} />
            <Bar dataKey="value" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

export function PieChartCard({ title, data }) {
  return (
    <Card title={title}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
              {data.map((entry, index) => (<Cell key={entry.name} fill={COLORS[index % COLORS.length]} />))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} labelStyle={{ color: 'var(--color-text)' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
