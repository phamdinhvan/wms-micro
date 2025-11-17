'use client';

import {ActionIcon, Tooltip} from '@mantine/core';
import {IconMaximize, IconMaximizeOff} from '@tabler/icons-react';
import React from 'react';

interface GanttToggleButtonProps {
  hideControls: boolean;
  onToggle: () => void;
  t: (key: string) => string;
}

export const GanttToggleButton = React.memo(function GanttToggleButton({
  hideControls,
  onToggle,
  t,
}: GanttToggleButtonProps) {
  return (
    <div
      style={{zIndex: 100, bottom: '20px', right: '4px'}}
      className="wms-absolute">
      <Tooltip
        label={
          hideControls
            ? t('controls.showControls') || 'Show controls'
            : t('controls.hideControls') || 'Hide controls'
        }>
        <ActionIcon
          variant={hideControls ? 'filled' : 'light'}
          color="blue"
          size="lg"
          onClick={onToggle}>
          {hideControls ? (
            <IconMaximizeOff size={20} />
          ) : (
            <IconMaximize size={20} />
          )}
        </ActionIcon>
      </Tooltip>
    </div>
  );
});
