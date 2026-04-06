import { useTelemetryStore } from '@/store/telemetryStore';
import type { THealthFactor } from '@/types/telemetry';
import clsx from 'clsx';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const STATUS_CONFIG: Record<
	THealthFactor['status'],
	{
		color: string;
		border: string;
		bg: string;
		icon: React.ElementType;
		pulse: boolean;
	}
> = {
	critical: {
		color: 'text-critical',
		border: 'border-l-critical',
		bg: 'bg-critical/5',
		icon: AlertCircle,
		pulse: true,
	},
	warning: {
		color: 'text-warning',
		border: 'border-l-warning',
		bg: 'bg-warning/5',
		icon: AlertTriangle,
		pulse: false,
	},
	normal: {
		color: 'text-health-good',
		border: 'border-l-health-good',
		bg: 'bg-health-good/5',
		icon: Info,
		pulse: false,
	},
};

const FactorCard = ({ factor }: { factor: THealthFactor }) => {
	const config = STATUS_CONFIG[factor.status];
	const Icon = config.icon;

	return (
		<div
			className={clsx(
				'relative flex flex-col gap-1 p-3 rounded-md border-l-4',
				'border border-card-border',
				config.border,
				config.bg,
				config.pulse && 'animate-pulse-border',
			)}>
			<div className={clsx('flex items-center gap-1.5', config.color)}>
				<Icon size={12} />
				<span className='text-xs font-bold tracking-tight uppercase'>
					{factor.parameter}
				</span>
			</div>
			<p className='text-xs text-muted leading-relaxed'>{factor.message}</p>
		</div>
	);
};

const EmptyState = () => (
	<div className='flex flex-col items-center justify-center h-full gap-2 text-center px-4'>
		<CheckCircle
			size={24}
			className='text-health-good'
		/>
		<p className='text-xs text-muted tracking-wide'>Все системы в норме</p>
	</div>
);

export const AlertsPanel = () => {
	const factors =
		useTelemetryStore(state => state.currentFrame?.healthIndex.factors) ?? [];

	const activeFactors = factors.filter(f => f.status !== 'normal');
	const criticalCount = factors.filter(f => f.status === 'critical').length;

	return (
		<div className='flex flex-col h-full bg-card border border-card-border rounded-lg overflow-hidden font-mono'>
			<div className='px-4 py-3 border-b border-card-border flex items-center gap-2'>
				<AlertTriangle className='w-4 h-4 text-warning' />
				<h2 className='text-sm font-bold tracking-widest uppercase opacity-80'>
					Алерты
				</h2>
				{criticalCount > 0 && (
					<span className='ml-auto text-2xs bg-critical/10 text-critical border border-critical/20 rounded px-1.5 py-0.5'>
						{criticalCount} critical
					</span>
				)}
			</div>

			<div className='flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar'>
				{activeFactors.length === 0 ? (
					<EmptyState />
				) : (
					activeFactors.map(factor => (
						<FactorCard
							key={factor.parameter}
							factor={factor}
						/>
					))
				)}
			</div>
		</div>
	);
};
