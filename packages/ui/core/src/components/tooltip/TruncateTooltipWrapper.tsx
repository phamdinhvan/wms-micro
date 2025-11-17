import {Tooltip, TooltipProps} from '@mantine/core';
import {ReactNode, useEffect, useRef, useState} from 'react';
import {cn} from '../../utils';

type Props = Readonly<{
  children: ReactNode;
  tooltipLabel?: ReactNode;
  lineClamp?: 1 | 2 | 3 | 4 | 5 | 6;
  maxWidth?: number;
  tooltipProps?: Omit<TooltipProps, 'label' | 'children'>;
  className?: string;
}>;

export function TruncateTooltipWrapper({
  children,
  tooltipLabel,
  lineClamp = 1,
  maxWidth = 240,
  tooltipProps = {},
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const el = ref.current;
      if (el) {
        // For line-clamp, we need to check if the content would naturally be taller
        // than the clamped height
        const computedStyle = window.getComputedStyle(el);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
        const maxHeight = lineHeight * lineClamp;

        // Create a temporary element to measure natural height
        const tempEl = el.cloneNode(true) as HTMLElement;
        tempEl.style.position = 'absolute';
        tempEl.style.visibility = 'hidden';
        tempEl.style.height = 'auto';
        tempEl.style.maxHeight = 'none';
        tempEl.style.webkitLineClamp = 'none';
        tempEl.style.overflow = 'visible';
        tempEl.className = tempEl.className.replace(/wms-line-clamp-\d+/g, '');

        document.body.appendChild(tempEl);
        const naturalHeight = tempEl.scrollHeight;
        document.body.removeChild(tempEl);

        // Also check horizontal overflow
        const isHorizontalOverflow = el.scrollWidth > el.clientWidth;
        const isVerticalOverflow = naturalHeight > maxHeight;

        const isOverflowing = isHorizontalOverflow || isVerticalOverflow;
        setIsTruncated(isOverflowing);
      }
    };

    // Use setTimeout to ensure DOM is fully rendered
    const timeoutId = setTimeout(checkOverflow, 0);

    return () => clearTimeout(timeoutId);
  }, [children, lineClamp]);

  return (
    <Tooltip
      disabled={!isTruncated}
      label={tooltipLabel ?? children}
      multiline
      position="top-start"
      style={{maxWidth, whiteSpace: 'normal', wordBreak: 'break-word'}}
      {...tooltipProps}>
      <div
        ref={ref}
        className={cn(
          `wms-line-clamp-${lineClamp}`,
          'wms-overflow-hidden wms-whitespace-normal wms-break-words wms-break-all [&>*]:wms-inline',
          className,
        )}>
        {children}
      </div>
    </Tooltip>
  );
}
