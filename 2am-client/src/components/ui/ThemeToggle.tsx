import { useThemeStore } from '@/store/themeStore';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle = () => {
	const theme = useThemeStore(s => s.theme);
	const toggleTheme = useThemeStore(s => s.toggleTheme);
	const isDark = theme === 'dark';

	return (
		<button
			type='button'
			onClick={toggleTheme}
			className='p-2 rounded-lg border border-card-border bg-card text-foreground hover:bg-background transition-colors'
			aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
			title={isDark ? 'Light theme' : 'Dark theme'}>
			{isDark ? (
				<Sun className='size-5' aria-hidden />
			) : (
				<Moon className='size-5' aria-hidden />
			)}
		</button>
	);
};
