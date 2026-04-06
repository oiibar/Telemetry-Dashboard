import { useTelemetryStore } from '@/store/telemetryStore';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

const METRICS = [
	{
		key: 'speed',
		rawKey: 'rawSpeed',
		label: 'SPEED',
		unit: 'km/h',
		color: 'var(--color-metric-speed)',
		gradientId: 'colorSpeed',
		max: 120,
	},
	{
		key: 'temp',
		rawKey: 'rawTemp',
		label: 'TEMP',
		unit: '°C',
		color: 'var(--color-metric-temp)',
		gradientId: 'colorTemp',
		max: 100,
	},
	{
		key: 'pressure',
		rawKey: 'rawPressure',
		label: 'PRESS',
		unit: 'bar',
		color: 'var(--color-metric-pressure)',
		gradientId: 'colorPressure',
		max: 10,
	},
	{
		key: 'fuel',
		rawKey: 'rawFuel',
		label: 'FUEL',
		unit: 'L',
		color: 'var(--color-metric-fuel)',
		gradientId: 'colorFuel',
		max: 1000,
	},
] as const;

type TMetricKey = (typeof METRICS)[number]['key'];

type TChartPayload = {
	time: Date;
	rawSpeed: number | null | undefined;
	rawTemp: number | null | undefined;
	rawPressure: number | null | undefined;
	rawFuel: number | null | undefined;
	speed: number;
	temp: number;
	pressure: number;
	fuel: number;
};

type TCustomTooltipProps = {
	active?: boolean;
	payload?: Array<{
		dataKey: string;
		value: number;
		payload: TChartPayload;
	}>;
	label?: string | number;
};

const normalize = (value: number | null | undefined, max: number): number =>
	((value ?? 0) / max) * 100;

const formatTime = (tick: Date) =>
	new Date(tick).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	});

export const TrendsPanel = () => {
	const history = useTelemetryStore(state => state.history);

	const chartData = history.map(frame => {
		const e = frame.effective;
		return {
			time: frame.timestamp,
			rawSpeed: e.speed,
			rawTemp: e.temp,
			rawPressure: e.pressure,
			rawFuel: e.fuel,
			speed: normalize(e.speed, 120),
			temp: normalize(e.temp, 100),
			pressure: normalize(e.pressure, 10),
			fuel: normalize(e.fuel, 1000),
		};
	});

	return (
		<div className='h-full w-full bg-card border border-card-border rounded-lg p-4 flex flex-col'>
			<div className='flex justify-between items-center mb-4'>
				<h2 className='text-sm font-mono font-bold uppercase tracking-widest text-muted'>
					Normalized Telemetry Trends
				</h2>

				<div className='flex gap-4 text-[10px] font-mono uppercase'>
					{METRICS.map(m => (
						<LegendItem
							key={m.key}
							color={m.color}
							label={m.label}
						/>
					))}
				</div>
			</div>

			<div className='flex-1 min-h-75'>
				<ResponsiveContainer
					width='100%'
					height='100%'>
					<AreaChart
						data={chartData}
						margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
						<defs>
							{METRICS.map(m => (
								<ChartGradient
									key={m.gradientId}
									id={m.gradientId}
									color={m.color}
								/>
							))}
						</defs>

						<CartesianGrid
							strokeDasharray='3 3'
							vertical={false}
							stroke='var(--color-card-border)'
						/>
						<XAxis
							dataKey='time'
							tickFormatter={formatTime}
							minTickGap={50}
							stroke='var(--color-muted)'
							fontSize={10}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							hide
							domain={[0, 100]}
						/>

						<Tooltip content={<CustomTooltip />} />

						{METRICS.map(m => (
							<Area
								key={m.key}
								type='monotone'
								dataKey={m.key as TMetricKey}
								stroke={m.color}
								fill={`url(#${m.gradientId})`}
								strokeWidth={2}
								isAnimationActive={false}
							/>
						))}
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
};

const CustomTooltip = ({ active, payload, label }: TCustomTooltipProps) => {
	if (!active || !payload?.length) return null;

	const raw = payload[0].payload as TChartPayload;

	return (
		<div className='bg-card border border-card-border p-3 rounded-lg shadow-xl font-mono text-[11px]'>
			<p className='mb-2 text-muted'>
				{new Date(String(label)).toLocaleString()}
			</p>
			{METRICS.map(m => (
				<TooltipRow
					key={m.key}
					label={m.label}
					value={`${raw[m.rawKey]} ${m.unit}`}
					color={m.color}
				/>
			))}
		</div>
	);
};

const LegendItem = ({ color, label }: { color: string; label: string }) => (
	<span className='flex items-center gap-1.5'>
		<span
			className='w-2 h-2 rounded-full'
			style={{ backgroundColor: color }}
		/>
		{label}
	</span>
);

const TooltipRow = ({
	label,
	value,
	color,
}: {
	label: string;
	value: string;
	color: string;
}) => (
	<div className='flex justify-between gap-4'>
		<span style={{ color }}>{label}:</span>
		<span className='font-bold'>{value}</span>
	</div>
);

const ChartGradient = ({ id, color }: { id: string; color: string }) => (
	<linearGradient
		id={id}
		x1='0'
		y1='0'
		x2='0'
		y2='1'>
		<stop
			offset='5%'
			stopColor={color}
			stopOpacity={0.2}
		/>
		<stop
			offset='95%'
			stopColor={color}
			stopOpacity={0}
		/>
	</linearGradient>
);
