import { create } from 'zustand';
import { MAX_HISTORY_LENGTH } from '../config/constants';
import { type TTelemetryFrame } from '../types/telemetry';

function normalizeTimestamp(frame: TTelemetryFrame): TTelemetryFrame {
	const ts = frame.timestamp;
	const timestamp =
		ts instanceof Date ? ts : new Date(ts as unknown as string | number);
	return { ...frame, timestamp };
}

interface TelemetryState {
	currentFrame: TTelemetryFrame | null;
	history: TTelemetryFrame[];
	connectionStatus:
		| 'connecting'
		| 'online'
		| 'reconnecting'
		| 'offline'
		| 'stale';
	replayMode: boolean;
	replayPaused: boolean;
	replayProgress: number;

	pushFrame: (frame: TTelemetryFrame) => void;
	setConnectionStatus: (status: TelemetryState['connectionStatus']) => void;
	setReplayMode: (bool: boolean) => void;
	setReplayPaused: (paused: boolean) => void;
	setReplayProgress: (pct: number) => void;
	/** During replay, drives gauges without mutating history. */
	setViewFrame: (frame: TTelemetryFrame | null) => void;
	exitReplayToLive: () => void;
	clearHistory: () => void;
}

function trimHistory(history: TTelemetryFrame[]): TTelemetryFrame[] {
	if (history.length <= MAX_HISTORY_LENGTH) return history;
	return history.slice(-MAX_HISTORY_LENGTH);
}

export const useTelemetryStore = create<TelemetryState>(set => ({
	currentFrame: null,
	history: [],
	connectionStatus: 'connecting',
	replayMode: false,
	replayPaused: false,
	replayProgress: 0,

	pushFrame: frame =>
		set(state => {
			const normalized = normalizeTimestamp(frame);
			const newHistory = trimHistory([...state.history, normalized]);
			return {
				history: newHistory,
				currentFrame: state.replayMode ? state.currentFrame : normalized,
			};
		}),

	setConnectionStatus: status => set({ connectionStatus: status }),
	setReplayMode: replayMode => set({ replayMode }),
	setReplayPaused: replayPaused => set({ replayPaused }),
	setReplayProgress: replayProgress => set({ replayProgress }),
	setViewFrame: currentFrame => set({ currentFrame }),
	exitReplayToLive: () =>
		set(s => ({
			replayMode: false,
			replayPaused: false,
			replayProgress: 0,
			currentFrame: s.history[s.history.length - 1] ?? null,
		})),
	clearHistory: () => set({ history: [], currentFrame: null }),
}));
