import { MAX_LOCOMOTIVE_TEMP } from '@/config/constants';
import { useTelemetryStore } from '@/store/telemetryStore';
import { Thermometer } from 'lucide-react';
import { Panel } from '../ui/Panel';
// import { QualityPill } from '../ui/QualityPill';

export const TemperaturePanel = () => {
	const temp = useTelemetryStore(
		state => state.currentFrame?.effective?.temp ?? 0,
	);
	// const quality = useTelemetryStore(
	// 	state => state.currentFrame?.quality?.temp ?? 'stale',
	// );

	const percentage = Math.min(
		100,
		Math.max(0, (temp / MAX_LOCOMOTIVE_TEMP) * 100),
	);

	return (
		<Panel className='flex flex-col'>
			<header className='flex justify-between items-center mb-4'>
				<div className='flex items-center gap-2 text-metric-temp'>
					<Thermometer size={16} />
					<span className='text-xs font-bold tracking-widest uppercase'>
						Температура
					</span>
				</div>
				{/* <QualityPill quality={quality} /> */}
			</header>

			<div className='flex-1 flex gap-4 items-end'>
				<div className='w-4 h-full bg-white/5 rounded-sm relative overflow-hidden border border-card-border'>
					<div
						className='absolute bottom-0 w-full bg-metric-temp transition-all'
						style={{ height: `${percentage}%` }}
					/>
				</div>

				<div className='flex flex-col'>
					<div className='flex items-baseline gap-1'>
						<span className='text-5xl font-black tabular-nums tracking-tighter'>
							{Math.round(temp)}
						</span>
						<span className='text-lg text-muted font-bold'>&#8451;</span>
					</div>
					<span className='text-2xs text-metric-temp/30 font-bold uppercase'>
						Limit {MAX_LOCOMOTIVE_TEMP}
					</span>
				</div>
			</div>
		</Panel>
	);
};
