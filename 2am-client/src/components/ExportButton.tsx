import clsx from 'clsx';
import { HardDriveDownload, Loader2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ExportState = 'idle' | 'picking' | 'loading' | 'error';

const API_BASE =
	import.meta.env.VITE_API_URL || 'http://localhost:3000/api/telemetry';

const QUICK_RANGES = [
	{ label: 'Last 15 min', minutes: 15 },
	{ label: 'Last 1 hour', minutes: 60 },
	{ label: 'Last 4 hours', minutes: 240 },
	{ label: 'Last 24 hours', minutes: 1440 },
];

export const ExportButton = () => {
	const [state, setState] = useState<ExportState>('idle');
	const [error, setError] = useState<string | null>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (state !== 'picking') return;
		const handler = (e: MouseEvent) => {
			if (!dropdownRef.current?.contains(e.target as Node)) {
				setState('idle');
			}
		};
		document.addEventListener('mousedown', handler);
		return () => document.removeEventListener('mousedown', handler);
	}, [state]);

	const exportRange = async (minutes: number) => {
		setState('loading');
		setError(null);

		const to = new Date();
		const from = new Date(to.getTime() - minutes * 60 * 1000);

		try {
			const params = new URLSearchParams({
				from: from.toISOString(),
				to: to.toISOString(),
			});

			console.log(`${API_BASE}/export/csv?${params}`);
			const response = await fetch(`${API_BASE}/export/csv?${params}`);

			if (!response.ok) throw new Error(`Server error: ${response.status}`);

			const disposition = response.headers.get('Content-Disposition');
			const filename =
				disposition?.match(/filename=(.+)/)?.[1] ??
				`telemetry_${Date.now()}.csv`;

			const blob = await response.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = filename;
			a.click();
			URL.revokeObjectURL(url);

			setState('idle');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Export failed');
			setState('error');
		}
	};

	return (
		<div
			className='relative'
			ref={dropdownRef}>
			<button
				onClick={() => setState(state === 'picking' ? 'idle' : 'picking')}
				disabled={state === 'loading'}
				className={clsx(
					'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono',
					'transition-colors duration-200 uppercase tracking-widest',
					'border-card-border bg-card hover:bg-primary/10 hover:border-primary/50 hover:text-primary',
					state === 'loading' && 'opacity-50 cursor-not-allowed',
					state === 'error' && 'border-critical/50 text-critical',
				)}>
				{state === 'loading' ? (
					<Loader2
						size={14}
						className='animate-spin'
					/>
				) : state === 'error' ? (
					<X size={14} />
				) : (
					<HardDriveDownload
						size={14}
						strokeWidth={1.5}
					/>
				)}
				{state === 'loading' ? 'Exporting...' : 'Export CSV'}
			</button>

			{(state === 'picking' || state === 'error') && (
				<div
					className={clsx(
						'absolute right-0 top-full mt-2 z-50',
						'w-48 rounded-lg border border-card-border bg-card',
						'shadow-lg overflow-hidden font-mono',
					)}>
					<div className='px-3 py-2 border-b border-card-border'>
						<span className='text-2xs text-muted uppercase tracking-widest'>
							Select time range
						</span>
					</div>

					{state === 'error' && (
						<div className='px-3 py-2 border-b border-card-border bg-critical/5'>
							<p className='text-2xs text-critical'>{error}</p>
						</div>
					)}

					<div className='p-1'>
						{QUICK_RANGES.map(range => (
							<button
								key={range.minutes}
								onClick={() => exportRange(range.minutes)}
								className={clsx(
									'w-full text-left px-3 py-2 rounded-md text-xs',
									'hover:bg-primary/10 hover:text-primary transition-colors',
									'tracking-wide',
								)}>
								{range.label}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
};
