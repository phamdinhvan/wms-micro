'use client';

import {
  Affix,
  Box,
  Button,
  Paper,
  ScrollArea,
  Text,
  Transition,
} from '@mantine/core';
import {IconArrowLeft, IconArrowUp} from '@tabler/icons-react';
import React, {useRef, useState} from 'react';
import {useTranslation} from '../../i18n';

interface LayoutDetailProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  description?: string;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  backText?: string;
  backHref?: string;
  onBack?: () => void;
  showHeader?: boolean;
  // Smart back configuration
  smartBackOptions?: {
    defaultPath?: string;
    fallbackPaths?: {
      [currentPathPattern: string]: string;
    };
  };
}

const LayoutDetail: React.FC<LayoutDetailProps> = ({
  children,
  title,
  description,
  actions,
  aside,
  backText,
  backHref,
  onBack,
  showHeader = true,
  smartBackOptions,
}) => {
  const [t] = useTranslation('gantt');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({x: 0, y: 0});

  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }
    // If no callback provided and backHref exists, you could implement navigation here
    // For now, just call the callback if provided
  };

  return (
    <div className="wms-relative wms-flex wms-size-full wms-flex-1">
      <div className="wms-flex wms-h-full wms-flex-1 wms-flex-col wms-overflow-hidden">
        {/* Header Section - Sticky */}
        {showHeader && (
          <Paper
            className="wms-z-10 wms-flex wms-flex-none wms-flex-col wms-gap-2 wms-border-b wms-px-4 wms-py-3"
            shadow="xs"
            radius={0}>
            {/* Back Button, Title and Actions Row */}
            <div className="wms-flex wms-items-center wms-justify-between wms-gap-4">
              <div className="wms-flex wms-items-center wms-gap-3">
                {/* Back Button */}
                {backText && (
                  <Button
                    variant="subtle"
                    leftSection={<IconArrowLeft size={16} />}
                    onClick={handleBackClick}
                    size="sm"
                    c="gray.6">
                    {t('button.back')}
                  </Button>
                )}

                {/* Title */}
                <div className="wms-flex-1">
                  <Text size="xl" c="black" fw={700}>
                    {title}
                  </Text>
                  {description && (
                    <Text size="md" c="gray.6">
                      {description}
                    </Text>
                  )}
                </div>
              </div>

              {/* Actions */}
              {actions && (
                <div className="wms-flex wms-flex-none wms-items-center wms-gap-2">
                  {actions}
                </div>
              )}
            </div>
          </Paper>
        )}

        {/* Content Area with Sidebar */}
        <div className="wms-flex wms-flex-1 wms-overflow-hidden">
          {/* Main Content */}
          <ScrollArea
            className="wms-flex-1 wms-bg-gray-50"
            type="always"
            offsetScrollbars
            onScrollPositionChange={setScroll}
            viewportRef={scrollRef}>
            <Box className="wms-p-4 md:wms-p-6">{children}</Box>

            {/* Scroll to Top Button */}
            <Affix position={{bottom: 20, right: 20}}>
              <Transition transition="slide-up" mounted={scroll.y > 200}>
                {transitionStyles => (
                  <Button
                    leftSection={<IconArrowUp size={16} />}
                    style={transitionStyles}
                    onClick={() => {
                      scrollRef.current?.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                      });
                    }}
                    variant="light"
                    size="sm"
                    opacity={0.8}>
                    Top
                  </Button>
                )}
              </Transition>
            </Affix>
          </ScrollArea>

          {/* Sidebar/Aside */}
          {aside && (
            <div className="wms-w-80 wms-flex-none wms-border-l wms-bg-white">
              <ScrollArea className="wms-h-full" type="auto">
                <Box className="wms-p-4">{aside}</Box>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

LayoutDetail.displayName = 'LayoutDetail';

export default LayoutDetail;
