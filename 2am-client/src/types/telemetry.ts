// export type TMetricQuality = 'ok' | 'stale' | 'invalid' | 'outlier';
export type THealthFactor = {
	parameter: string;
	status: 'normal' | 'warning' | 'critical';
	message: string;
};

export type TTelemetryFrame = {
	timestamp: Date;
	effective: {
		temp?: number;
		pressure?: number;
		fuel?: number;
		speed?: number;
		engine?: number;
		brake?: number;
	};
	// quality: {
	// 	temp?: TMetricQuality;
	// 	pressure?: TMetricQuality;
	// 	fuel?: TMetricQuality;
	// 	speed?: TMetricQuality;
	// };
	healthIndex: {
		score: number;
		grade: 'A' | 'B' | 'C' | 'D' | 'E';
		factors: THealthFactor[];
	};
};
