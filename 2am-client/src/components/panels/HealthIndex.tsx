import { useTelemetryStore } from '@/store/telemetryStore';
import clsx from 'clsx';
import { Panel } from '../ui/Panel';

export const HealthIndex = () => {
	const health = useTelemetryStore(state => state.currentFrame?.healthIndex);
	const engine = useTelemetryStore(
		state => state.currentFrame?.effective.engine,
	);
	const brake = useTelemetryStore(state => state.currentFrame?.effective.brake);

	if (!health) return <div className='animate-pulse rounded-lg' />;

	const radius = 45;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (health.score / 100) * circumference;

	const gradeColors = {
		A: 'text-emerald-400 stroke-emerald-400',
		B: 'text-blue-400 stroke-blue-400',
		C: 'text-amber-400 stroke-amber-400',
		D: 'text-orange-400 stroke-orange-400',
		E: 'text-red-400 stroke-red-400',
	};

	return (
		<Panel className='flex flex-col'>
			<h2 className='text-sm text-muted tracking-widest uppercase mb-2'>
				Индекс здоровья
			</h2>

			<div className='relative flex-1 flex justify-center items-center min-h-0 my-3'>
				<div className='w-full max-w-35 aspect-square relative'>
					<svg
						className='w-full h-full transform -rotate-90'
						viewBox='0 0 100 100'>
						<circle
							cx='50'
							cy='50'
							r={radius}
							className='stroke-white/5 fill-none'
							strokeWidth='8'
						/>
						<circle
							cx='50'
							cy='50'
							r={radius}
							className={clsx(
								'fill-none transition-all duration-1000 ease-out',
								gradeColors[health.grade].split(' ')[1],
							)}
							strokeWidth='8'
							strokeDasharray={circumference}
							strokeDashoffset={offset}
							strokeLinecap='round'
						/>
					</svg>

					<div className='absolute inset-0 flex flex-col items-center justify-center'>
						<span
							className={clsx(
								'text-3xl font-black leading-none',
								gradeColors[health.grade].split(' ')[0],
							)}>
							{health.grade}
						</span>
						<span className='text-xs text-muted font-bold'>
							{health.score}%
						</span>
					</div>
				</div>
			</div>

			<div className='space-y-3'>
				<div className='space-y-1'>
					<div className='flex justify-between text-xs uppercase tracking-tighter'>
						<span className='text-muted'>Двигатель</span>
						<span className='text-muted font-bold'>{engine}%</span>
					</div>
					<div className='h-1 w-full bg-white/10 rounded-full overflow-hidden'>
						<div
							className='h-full bg-primary transition-all duration-1000'
							style={{ width: `${engine}%` }}
						/>
					</div>
				</div>
				<div className='space-y-1'>
					<div className='flex justify-between text-xs uppercase tracking-tighter'>
						<span className='text-muted'>Тормоза</span>
						<span className='text-muted font-bold'>{brake}%</span>
					</div>
					<div className='h-1 w-full bg-white/10 rounded-full overflow-hidden'>
						<div
							className='h-full bg-primary transition-all duration-1000'
							style={{ width: `${brake}%` }}
						/>
					</div>
				</div>
			</div>
		</Panel>
	);
};
