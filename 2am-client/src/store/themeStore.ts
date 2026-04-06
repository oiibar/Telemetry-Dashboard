import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

function applyTheme(theme: Theme): void {
	document.documentElement.classList.toggle('dark', theme === 'dark');
}

type ThemeState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggleTheme: () => void;
};

export const useThemeStore = create<ThemeState>()(
	persist(
		(set, get) => ({
			theme: 'light',
			setTheme: theme => {
				applyTheme(theme);
				set({ theme });
			},
			toggleTheme: () => {
				const next = get().theme === 'light' ? 'dark' : 'light';
				applyTheme(next);
				set({ theme: next });
			},
		}),
		{
			name: '2am-theme',
			partialize: state => ({ theme: state.theme }),
			onRehydrateStorage: () => (state, error) => {
				if (!error && state) {
					applyTheme(state.theme);
				}
			},
		},
	),
);
