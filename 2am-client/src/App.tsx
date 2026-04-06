import { useWebSocket } from '@/hooks/useWebSocket';
import clsx from 'clsx';
import { TrainFront } from 'lucide-react';
import { ExportButton } from './components/ExportButton';
import { AlertsPanel } from './components/panels/Alerts';
import { FuelPanel } from './components/panels/Fuel';
import { HealthIndex } from './components/panels/HealthIndex';
import { PressurePanel } from './components/panels/Pressure';
import { SpeedPanel } from './components/panels/Speed';
import { TemperaturePanel } from './components/panels/Temperature';
import { TrendsPanel } from './components/panels/Trends';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { startMockSimulator } from './services/mockSimulator';

export function App() {
	const { status } = useWebSocket();

	if (import.meta.env.VITE_USE_MOCK === 'true') {
		startMockSimulator();
	}

	return (
		<div className='flex flex-col min-h-screen'>
			<header className='px-6 py-4 border-b bg-card border-card-border flex justify-between items-center font-mono'>
				<div className='flex items-center gap-3'>
					<span className='text-primary p-2 rounded-lg border bg-primary/20 border-primary'>
						<TrainFront />
					</span>
					<h1 className='text-xl font-bold tracking-tighter'>
						KZ8A <span className='text-muted text-sm font-normal'>#0001</span>
					</h1>
				</div>

				<div className='flex items-center gap-3'>
					<ThemeToggle />
					<div
						className={clsx('h-2 w-2 rounded-full', {
							'bg-conn-live animate-pulse': status === 'online',
							'bg-conn-reconnecting': status === 'reconnecting',
							'bg-conn-offline': status === 'offline',
							'bg-conn-stale': status === 'stale',
						})}
					/>
					<span className='font-mono text-xs uppercase tracking-widest'>
						System: {status}
					</span>
					<ExportButton />
				</div>
			</header>

			<main className='flex-1 grid grid-cols-[1fr_4fr] gap-4 p-6'>
				<aside className='gap-4 grid grid-rows-[auto_1fr]'>
					<HealthIndex />
					<AlertsPanel />
				</aside>
				<section className='flex flex-col gap-4'>
					<div className='grid grid-cols-4 gap-4'>
						<SpeedPanel />
						<TemperaturePanel />
						<PressurePanel />
						<FuelPanel />
					</div>
					<div className='flex-1'>
						<TrendsPanel />
					</div>
				</section>
			</main>
		</div>
	);
}
