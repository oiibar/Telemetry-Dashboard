import { useTelemetryStore } from '@/store/telemetryStore';
import type { TTelemetryFrame } from '@/types/telemetry';

let interval: number | null = null;

// initial state for the drift logic
const state = {
	speed: 84,
	temp: 82,
	pressure: 6.2,
	fuel: 750,
	engine: 97,
	brake: 89,
};

const generateFrame = (): TTelemetryFrame => {
	state.speed += (Math.random() - 0.5) * 2;
	state.temp += (Math.random() - 0.5) * 0.5;
	state.pressure += (Math.random() - 0.5) * 0.1;
	state.fuel -= 0.01; // constant fuel consumption
	state.engine += (Math.random() - 0.5) * 0.5;
	state.brake += (Math.random() - 0.5) * 0.5;

	return {
		timestamp: new Date(),
		effective: {
			speed: Math.round(state.speed),
			temp: Math.round(state.temp),
			pressure: Number(state.pressure.toFixed(1)),
			fuel: Math.round(state.fuel),
			engine: Math.round(state.engine),
			brake: Math.round(state.brake),
		},
		healthIndex: {
			score: 94,
			grade: 'A',
			factors: [
				{
					parameter: 'Engine Temp',
					status: 'normal',
					message: 'Operating within normal parameters',
				},
				{
					parameter: 'Brake Wear',
					status: 'warning',
					message: 'Brake wear at 85%, consider maintenance soon',
				},
			],
		},
	};
};

export const startMockSimulator = () => {
	if (interval) return;

	const { setConnectionStatus, pushFrame } = useTelemetryStore.getState();
	setConnectionStatus('online');

	interval = window.setInterval(() => {
		pushFrame(generateFrame());
	}, 1000);

	console.log('mock simulator started');
};

export const stopMockSimulator = () => {
	if (interval) {
		clearInterval(interval);
		interval = null;
	}
};
