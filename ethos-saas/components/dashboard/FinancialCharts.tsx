'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'

interface ChartData {
    month: string
    ingresos: number
    gastos: number
}

interface CategoryData {
    name: string
    value: number
}

interface FinancialChartsProps {
    trendData: ChartData[]
    categoryData: CategoryData[]
}

const COLORS = ['#136dec', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function FinancialCharts({ trendData, categoryData }: FinancialChartsProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Tendencia */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Flujo de Caja Mensual</h3>
                    <p className="text-sm text-gray-500">Comparativa de ingresos y gastos en USD</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#136dec" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#136dec" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="month"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#6B7280', fontSize: 12 }}
                                tickFormatter={(value) => `$${value}`}
                            />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                            />
                            <Area
                                type="monotone"
                                dataKey="ingresos"
                                stroke="#136dec"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorIngresos)"
                                name="Ingresos"
                            />
                            <Area
                                type="monotone"
                                dataKey="gastos"
                                stroke="#EF4444"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorGastos)"
                                name="Gastos"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Gráfico de Categorías */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Distribución de Gastos</h3>
                    <p className="text-sm text-gray-500">Porcentaje por categoría de gasto</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                nameKey="name"
                            >
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '12px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Monto']}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
