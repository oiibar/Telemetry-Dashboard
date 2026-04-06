import { MAX_LOCOMOTIVE_FUEL } from '@/config/constants';
import { useTelemetryStore } from '@/store/telemetryStore';
import { Fuel } from 'lucide-react';
import { Panel } from '../ui/Panel';
// import { QualityPill } from '../ui/QualityPill';

export const FuelPanel = () => {
	const fuel = useTelemetryStore(
		state => state.currentFrame?.effective?.fuel ?? 0,
	);
	// const quality = useTelemetryStore(
	// 	state => state.currentFrame?.quality?.fuel ?? 'stale',
	// );

	const percentage = Math.min(
		100,
		Math.max(0, (fuel / MAX_LOCOMOTIVE_FUEL) * 100),
	);

	return (
		<Panel className='h-full p-4 flex flex-col'>
			<header className='flex justify-between items-center mb-4'>
				<div className='flex items-center gap-2 text-metric-fuel'>
					<Fuel size={16} />
					<span className='text-xs font-bold tracking-widest uppercase'>
						Топливо
					</span>
				</div>
				{/* <QualityPill quality={quality} /> */}
			</header>

			<div className='flex-1 flex flex-col justify-end gap-3'>
				<div className='flex items-baseline gap-1'>
					<span className='text-5xl font-black tabular-nums tracking-tighter'>
						{Math.round(fuel)}
					</span>
					<span className='text-lg text-muted font-bold tracking-widest uppercase'>
						Л
					</span>
				</div>

				<div className='w-full h-4 bg-white/5 rounded-sm relative overflow-hidden border border-card-border'>
					<div className='absolute left-0 top-0 bottom-0 w-[15%] bg-critical/10 z-0 border-r border-critical' />

					<div
						className='absolute left-0 h-full bg-metric-fuel transition-all duration-1000'
						style={{ width: `${percentage}%` }}
					/>
				</div>

				<div className='flex justify-between items-center'>
					<span className='text-2xs text-metric-fuel/30 font-bold uppercase'>
						Reserve 15%
					</span>
					<span className='text-2xs text-muted font-mono'>
						{percentage.toFixed(1)}%
					</span>
				</div>
			</div>
		</Panel>
	);
};
