import { wsClient } from '@/services/wsClient';
import { useTelemetryStore } from '@/store/telemetryStore';
import { useEffect } from 'react';

export const useWebSocket = () => {
	const connectionStatus = useTelemetryStore(state => state.connectionStatus);

	useEffect(() => {
		wsClient.connect();

		return () => {
			wsClient.disconnect();
		};
	}, []);

	return {
		status: connectionStatus,
		reconnect: () => wsClient.connect(),
	};
};
