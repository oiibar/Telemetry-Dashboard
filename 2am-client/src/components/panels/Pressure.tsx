import { MAX_LOCOMOTIVE_PRESSURE } from '@/config/constants';
import { useTelemetryStore } from '@/store/telemetryStore';
import { CircleGauge } from 'lucide-react';
import { Panel } from '../ui/Panel';
// import { QualityPill } from '../ui/QualityPill';

export const PressurePanel = () => {
	const pressure = useTelemetryStore(
		state => state.currentFrame?.effective?.pressure ?? 0,
	);
	// const quality = useTelemetryStore(
	// 	state => state.currentFrame?.quality?.pressure ?? 'stale',
	// );

	const percentage = Math.min(
		100,
		Math.max(0, (pressure / MAX_LOCOMOTIVE_PRESSURE) * 100),
	);

	return (
		<Panel className='flex flex-col'>
			<header className='flex justify-between items-center mb-4'>
				<div className='flex items-center gap-2 text-metric-pressure'>
					<CircleGauge size={16} />
					<span className='text-xs font-bold tracking-widest uppercase'>
						Давление
					</span>
				</div>
				{/* <QualityPill quality={quality} /> */}
			</header>

			<div className='flex-1 flex flex-col justify-end gap-3'>
				<div className='flex items-baseline gap-2'>
					<span className='text-5xl font-black tabular-nums tracking-tighter'>
						{pressure.toFixed(1)}
					</span>
					<span className='text-lg text-muted font-bold tracking-widest uppercase'>
						Bar
					</span>
				</div>

				<div className='w-full h-4 bg-white/5 rounded-sm relative overflow-hidden border border-card-border'>
					<div
						className='absolute left-0 h-full bg-metric-pressure transition-all'
						style={{ width: `${percentage}%` }}
					/>
				</div>

				<div className='flex justify-between items-center'>
					<span className='text-2xs text-metric-pressure/30 font-bold uppercase'>
						Limit {MAX_LOCOMOTIVE_PRESSURE}
					</span>
					<span className='text-2xs text-muted uppercase font-mono'>
						{Math.round(percentage)}%
					</span>
				</div>
			</div>
		</Panel>
	);
};
