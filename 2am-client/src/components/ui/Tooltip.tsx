import clsx from 'clsx';
import {
	Children,
	cloneElement,
	isValidElement,
	useCallback,
	useEffect,
	useId,
	useLayoutEffect,
	useRef,
	useState,
	type FocusEvent,
	type MutableRefObject,
	type PointerEvent as ReactPointerEvent,
	type ReactElement,
	type Ref,
} from 'react';
import { createPortal } from 'react-dom';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

const FOCUSABLE_TAGS = new Set([
	'button',
	'a',
	'input',
	'select',
	'textarea',
]);

type TooltipProps = {
	content: React.ReactNode;
	children: ReactElement;
	side?: TooltipSide;
	/** Delay before showing on hover (mouse / pen). */
	delayMs?: number;
	/** Long-press duration to show on touch without blocking taps. */
	touchLongPressMs?: number;
	/** Classes on the trigger wrapper (when a wrapper is used). */
	wrapperClassName?: string;
};

function mergeHandler<E>(
	theirs: ((e: E) => void) | undefined,
	ours: (e: E) => void,
) {
	return (e: E) => {
		theirs?.(e);
		ours(e);
	};
}

function composeRefs<T>(...refs: Array<Ref<T> | undefined>) {
	return (node: T | null) => {
		refs.forEach(ref => {
			if (typeof ref === 'function') ref(node);
			else if (ref && 'current' in ref)
				(ref as MutableRefObject<T | null>).current = node;
		});
	};
}

function childIsLikelyFocusable(el: ReactElement): boolean {
	if (typeof el.type !== 'string') return true;
	const tag = el.type.toLowerCase();
	if (FOCUSABLE_TAGS.has(tag)) return true;
	const tab = el.props.tabIndex;
	return typeof tab === 'number' && tab >= 0;
}

export const Tooltip = ({
	content,
	children,
	side = 'bottom',
	delayMs = 280,
	touchLongPressMs = 480,
	wrapperClassName,
}: TooltipProps) => {
	const tipId = useId();
	const triggerRef = useRef<HTMLElement | null>(null);
	const tooltipRef = useRef<HTMLDivElement | null>(null);
	const [open, setOpen] = useState(false);
	const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const openedByLongPressRef = useRef(false);

	const clearHoverTimer = useCallback(() => {
		if (hoverTimerRef.current) {
			clearTimeout(hoverTimerRef.current);
			hoverTimerRef.current = null;
		}
	}, []);

	const clearLongPressTimer = useCallback(() => {
		if (longPressTimerRef.current) {
			clearTimeout(longPressTimerRef.current);
			longPressTimerRef.current = null;
		}
	}, []);

	const show = useCallback(() => setOpen(true), []);

	const hide = useCallback(() => {
		clearHoverTimer();
		clearLongPressTimer();
		setOpen(false);
		openedByLongPressRef.current = false;
	}, [clearHoverTimer, clearLongPressTimer]);

	useLayoutEffect(() => {
		if (!open || !triggerRef.current || !tooltipRef.current) return;

		const rect = triggerRef.current.getBoundingClientRect();
		const tt = tooltipRef.current;
		const gap = 8;
		const tw = tt.offsetWidth;
		const th = tt.offsetHeight;

		let top = 0;
		let left = 0;

		switch (side) {
			case 'bottom':
				top = rect.bottom + gap;
				left = rect.left + rect.width / 2 - tw / 2;
				break;
			case 'top':
				top = rect.top - gap - th;
				left = rect.left + rect.width / 2 - tw / 2;
				break;
			case 'right':
				top = rect.top + rect.height / 2 - th / 2;
				left = rect.right + gap;
				break;
			case 'left':
				top = rect.top + rect.height / 2 - th / 2;
				left = rect.left - gap - tw;
				break;
		}

		left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
		top = Math.max(8, Math.min(top, window.innerHeight - th - 8));

		tt.style.top = `${top}px`;
		tt.style.left = `${left}px`;
	}, [open, side, content]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') hide();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, hide]);

	useEffect(() => {
		if (!open || !openedByLongPressRef.current) return;
		const onDocPointer = (e: globalThis.PointerEvent) => {
			const t = e.target as Node;
			if (triggerRef.current?.contains(t) || tooltipRef.current?.contains(t)) {
				return;
			}
			hide();
		};
		document.addEventListener('pointerdown', onDocPointer, true);
		return () => document.removeEventListener('pointerdown', onDocPointer, true);
	}, [open, hide]);

	const onPointerEnter = (e: ReactPointerEvent) => {
		if (e.pointerType === 'mouse' || e.pointerType === 'pen') {
			clearHoverTimer();
			hoverTimerRef.current = setTimeout(show, delayMs);
		}
	};

	const onPointerLeave = () => {
		clearHoverTimer();
		if (!openedByLongPressRef.current) {
			setOpen(false);
		}
	};

	const onPointerDown = (e: ReactPointerEvent) => {
		if (e.pointerType !== 'touch') return;
		clearLongPressTimer();
		longPressTimerRef.current = setTimeout(() => {
			openedByLongPressRef.current = true;
			setOpen(true);
		}, touchLongPressMs);
	};

	const onPointerUp = () => {
		clearLongPressTimer();
	};

	const onPointerCancel = () => {
		clearLongPressTimer();
	};

	const onFocus = () => {
		clearHoverTimer();
		show();
	};

	const onBlur = (e: FocusEvent<HTMLElement>) => {
		const next = e.relatedTarget as Node | null;
		if (next && e.currentTarget.contains(next)) return;
		if (!openedByLongPressRef.current) {
			setOpen(false);
		}
	};

	const child = Children.only(children);
	if (!isValidElement(child)) {
		throw new Error('Tooltip expects a single React element child.');
	}

	const childRef = (child as ReactElement & { ref?: Ref<HTMLElement> }).ref;

	const existingDescribedBy = (child.props as { 'aria-describedby'?: string })[
		'aria-describedby'
	];
	const ariaDescribedBy =
		open && content
			? [existingDescribedBy, tipId].filter(Boolean).join(' ')
			: existingDescribedBy;

	const overlay =
		open &&
		content &&
		createPortal(
			<div
				ref={tooltipRef}
				id={tipId}
				role='tooltip'
				className={clsx(
					'fixed z-[400] px-2.5 py-1.5 text-xs leading-snug rounded-md',
					'bg-card text-foreground border border-card-border shadow-lg',
					'max-w-[min(18rem,calc(100vw-1rem))] pointer-events-none',
				)}>
				{content}
			</div>,
			document.body,
		);

	if (childIsLikelyFocusable(child)) {
		const setMergedRef = composeRefs<HTMLElement>(
			childRef,
			node => {
				triggerRef.current = node;
			},
		);

		const mergedChild = cloneElement(child, {
			ref: setMergedRef,
			onPointerEnter: mergeHandler(child.props.onPointerEnter, onPointerEnter),
			onPointerLeave: mergeHandler(child.props.onPointerLeave, onPointerLeave),
			onPointerDown: mergeHandler(child.props.onPointerDown, onPointerDown),
			onPointerUp: mergeHandler(child.props.onPointerUp, onPointerUp),
			onPointerCancel: mergeHandler(child.props.onPointerCancel, onPointerCancel),
			onFocus: mergeHandler(child.props.onFocus, onFocus),
			onBlur: mergeHandler(child.props.onBlur, onBlur),
			'aria-describedby': ariaDescribedBy,
		} as Record<string, unknown>);

		return (
			<>
				{mergedChild}
				{overlay}
			</>
		);
	}

	const innerRef = composeRefs<HTMLElement>(childRef);

	return (
		<>
			<span
				ref={node => {
					triggerRef.current = node;
				}}
				className={clsx(
					'inline-flex max-w-full cursor-default',
					'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm',
					wrapperClassName,
				)}
				tabIndex={0}
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
				onPointerDown={onPointerDown}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerCancel}
				onFocus={onFocus}
				onBlur={onBlur}
				aria-describedby={open && content ? tipId : undefined}>
				{cloneElement(child, { ref: innerRef } as Record<string, unknown>)}
			</span>
			{overlay}
		</>
	);
};
