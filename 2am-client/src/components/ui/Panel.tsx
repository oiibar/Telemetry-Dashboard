import clsx from 'clsx';

export type TPanelProps = React.HTMLAttributes<HTMLDivElement>;

export const Panel = ({ children, className, ...rest }: TPanelProps) => {
	return (
		<div
			className={clsx(
				'bg-card border border-card-border rounded-lg p-4',
				className,
			)}
			{...rest}>
			{children}
		</div>
	);
};
