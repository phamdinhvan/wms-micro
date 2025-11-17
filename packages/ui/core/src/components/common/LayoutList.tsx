'use client';
import {Box, Paper} from '@mantine/core';
import {IconArrowLeft} from '@tabler/icons-react';
import React from 'react';

interface LayoutListProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  showHeader?: boolean;
  backText?: string;
  backHref?: string;
  onBack?: () => void;
  // Smart back configuration
  smartBackOptions?: {
    defaultPath?: string;
    fallbackPaths?: {
      [currentPathPattern: string]: string;
    };
  };
}

// Use forwardRef to properly handle the ref
const LayoutList = React.forwardRef<
  HTMLDivElement,
  Omit<LayoutListProps, 'ref'>
>(
  (
    {
      children,
      filters,
      actions,
      title,
      description,
      backHref,
      backText,
      onBack,
      smartBackOptions,
      showHeader = true,
    },
    ref,
  ) => {
    const handleBackClick = () => {
      if (onBack) {
        onBack();
        return;
      }
      // If no callback provided and backHref exists, you could implement navigation here
      // For now, just call the callback if provided
    };

    return (
      <div className="wms-relative wms-size-full wms-min-h-0 wms-h-full wms-flex wms-flex-col">
        <div className="wms-h-full wms-flex wms-flex-col">
          {showHeader && (
            <Paper
              className="wms-z-10 wms-flex wms-flex-none wms-flex-wrap wms-items-center wms-justify-between wms-gap-1 wms-px-2 wms-py-2 wms-border-b"
              shadow="xs"
              ref={ref}
              radius={0}>
              <div>
                <h1 className="wms-font-semibold wms-text-primary-500 md:wms-text-2xl wms-text-xl">
                  {title}
                  {description && (
                    <div className="wms-text-primary-500 wms-text-sm wms-font-medium">
                      {description}
                    </div>
                  )}
                </h1>
                {backText && (
                  <button
                    type="button"
                    aria-label={`Go back to ${backText}`}
                    onClick={handleBackClick}
                    className="wms-text-sm wms-text-primary-400 hover:wms-underline wms-inline-flex wms-items-center">
                    <IconArrowLeft size={14} />
                    {backText}
                  </button>
                )}
              </div>
              <div className="wms-flex-none">{actions}</div>
            </Paper>
          )}

          <Box className="wms-gap-2 wms-px-2 wms-py-2 wms-bg-slate-50 wms-flex-1 wms-flex wms-flex-col wms-min-h-0">
            {filters && (
              <div className="wms-flex wms-gap-2 wms-py-2">{filters}</div>
            )}
            {children}
          </Box>
        </div>
      </div>
    );
  },
);

LayoutList.displayName = 'LayoutList';

export default LayoutList;
