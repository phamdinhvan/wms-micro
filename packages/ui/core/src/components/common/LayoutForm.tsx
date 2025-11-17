"use client";

import {Affix, Button, ScrollArea, Transition} from '@mantine/core';
import {IconArrowLeft, IconArrowUp} from '@tabler/icons-react';
import React, {useRef, useState} from 'react';
import useRouterBack from '../../hooks/useRouterBack';

interface LayoutProps {
  children: React.ReactNode;
  actions: React.ReactNode;
  aside?: React.ReactNode;
  title: string | React.ReactNode;
  backHref?: string; // ← optional back button URL
  backText?: string; // ← optional back button label
  onBackClick?: () => void; // ← optional callback for back button click
}

const LayoutForm: React.FC<LayoutProps> = ({
  children,
  actions,
  title,
  aside,
  backHref = '/', // default back link
  backText,
  onBackClick, // default back click handler
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useState({x: 0, y: 0});
  const {back} = useRouterBack();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
      return;
    }
    back(backHref);
  };

  return (
    <div className="wms-flex wms-flex-col wms-size-full wms-overflow-hidden">
      {/* Header with Back Button and Title - Sticky */}
      <div className="wms-sticky wms-top-0 wms-z-10 wms-flex wms-flex-col wms-gap-1 wms-border-b wms-border-gray-200 wms-bg-gradient-to-r wms-bg-white wms-px-2 wms-py-1 wms-shadow-sm">
        <h1 className="md:wms-text-2xl wms-text-xl wms-font-bold wms-text-primary-500">
          {title}
        </h1>
        {backText && (
          <button
            type="button"
            aria-label={`Go back to ${backText}`}
            onClick={handleBackClick}
            className="wms-text-sm wms-text-primary-400 hover:wms-underline wms-inline-flex wms-items-center wms-gap-1">
            <IconArrowLeft size={14} />
            {backText}
          </button>
        )}
      </div>
      <div className="wms-flex wms-flex-1 wms-overflow-hidden">
        <ScrollArea
          className="wms-flex-1 wms-bg-white"
          type="always"
          offsetScrollbars
          onScrollPositionChange={e => {
            setScroll(e);
          }}
          viewportRef={scrollRef}>
          <div className="md:wms-px-6 md:wms-py-3 wms-p-2 wms-max-w-screen-2xl">
            {children}

            <Affix position={{bottom: 60, right: 10}}>
              <Transition transition="slide-up" mounted={scroll.y > 0}>
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
                    opacity={0.7}>
                    TOP
                  </Button>
                )}
              </Transition>
            </Affix>
          </div>
        </ScrollArea>
        <div className="wms-flex-none">{aside}</div>
      </div>

      {!!actions && (
        <div className="wms-sticky wms-bottom-0 wms-z-10 wms-flex wms-flex-none wms-items-center wms-justify-between wms-border-t wms-gap-2 wms-border-gray-200 wms-bg-white md:wms-px-6 md:wms-py-2 wms-px-2 wms-py-1 wms-shadow-lg">
          <div className="wms-ml-auto wms-flex-none">{actions}</div>
        </div>
      )}
    </div>
  );
};

export default LayoutForm;
