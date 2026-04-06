import { MAX_LOCOMOTIVE_SPEED } from '@/config/constants';
import { useTelemetryStore } from '@/store/telemetryStore';
import { Gauge } from 'lucide-react';
import { Panel } from '../ui/Panel';
// import { QualityPill } from '../ui/QualityPill';

export const SpeedPanel = () => {
	const speed = useTelemetryStore(
		state => state.currentFrame?.effective?.speed ?? 0,
	);
	// const quality = useTelemetryStore(
	// 	state => state.currentFrame?.quality?.speed ?? 'stale',
	// );

	const radius = 80;
	const stroke = 6;
	const normalizedRadius = radius - stroke * 2;
	const circumference = normalizedRadius * 2 * Math.PI;
	const gaugeLength = circumference * 0.75;
	const arcOffset = (speed / MAX_LOCOMOTIVE_SPEED) * gaugeLength;

	return (
		<Panel className='relative flex flex-col items-center justify-between'>
			<header className='w-full flex justify-between items-center z-10'>
				<div className='flex items-center gap-2 text-metric-speed'>
					<Gauge size={14} />
					<span className='text-sm font-bold tracking-widest uppercase'>
						Скорость
					</span>
				</div>

				{/* <QualityPill quality={quality} /> */}
			</header>

			<div className='relative flex items-center justify-center mt-2 z-10'>
				<svg
					height={radius * 2}
					width={radius * 2}
					className='transform -rotate-225'>
					<circle
						// stroke='currentColor'
						fill='transparent'
						strokeWidth={stroke}
						strokeDasharray={`${gaugeLength} ${circumference}`}
						r={normalizedRadius}
						cx={radius}
						cy={radius}
						style={{ stroke: 'var(--color-card-border)' }}
						strokeLinecap='round'
					/>
					<circle
						stroke='currentColor'
						fill='transparent'
						strokeWidth={stroke}
						strokeDasharray={`${arcOffset} ${circumference}`}
						r={normalizedRadius}
						cx={radius}
						cy={radius}
						strokeLinecap='round'
						className='text-metric-speed transition-all'
					/>
				</svg>

				<div className='absolute inset-0 flex flex-col items-center justify-center'>
					<span className='text-5xl font-black tabular-nums tracking-tighter'>
						{Math.round(speed)}
					</span>
					<span className='text-xs text-muted font-bold tracking-widest'>
						KM/H
					</span>
				</div>
			</div>

			<p className='text-2xs text-metric-speed/30 font-bold z-20 uppercase'>
				Max {MAX_LOCOMOTIVE_SPEED}
			</p>
		</Panel>
	);
};
