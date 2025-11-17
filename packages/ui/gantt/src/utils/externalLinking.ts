/**
 * External linking utility for Gantt chart integration
 * Allows external applications to link their items to Gantt tasks
 */

import {ExternalLinkRequest, TaskResponse} from '@wms/core';

export interface ExternalLinkingConfig {
  onLinkRequest?: (linkData: ExternalLinkRequest) => Promise<boolean>;
  onUnlinkRequest?: (taskId: string) => Promise<boolean>;
  onExternalItemSelect?: (externalId: string, externalType?: string) => void;
}

export class ExternalLinkingManager {
  private config: ExternalLinkingConfig;

  constructor(config: ExternalLinkingConfig) {
    this.config = config;
  }

  /**
   * Request to link an external item to a Gantt task
   */
  async linkExternalItem(
    taskId: string,
    externalId: string,
    externalType?: string,
    externalData?: Record<string, any>,
  ): Promise<boolean> {
    if (!this.config.onLinkRequest) {
      console.warn('No link request handler configured');
      return false;
    }

    const linkData: ExternalLinkRequest = {
      taskId,
      externalId,
      externalType,
      externalData,
    };

    try {
      return await this.config.onLinkRequest(linkData);
    } catch (error) {
      console.error('Failed to link external item:', error);
      return false;
    }
  }

  /**
   * Request to unlink an external item from a Gantt task
   */
  async unlinkExternalItem(taskId: string): Promise<boolean> {
    if (!this.config.onUnlinkRequest) {
      console.warn('No unlink request handler configured');
      return false;
    }

    try {
      return await this.config.onUnlinkRequest(taskId);
    } catch (error) {
      console.error('Failed to unlink external item:', error);
      return false;
    }
  }

  /**
   * Navigate to an external item (called when user clicks on linked task)
   */
  selectExternalItem(externalId: string, externalType?: string): void {
    if (this.config.onExternalItemSelect) {
      this.config.onExternalItemSelect(externalId, externalType);
    }
  }

  /**
   * Check if a task has an external link
   */
  hasExternalLink(task: TaskResponse): boolean {
    return !!(task.externalId && task.externalId.trim() !== '');
  }

  /**
   * Get external link info for a task
   */
  getExternalLinkInfo(task: TaskResponse): {id: string; type?: string} | null {
    if (!this.hasExternalLink(task)) {
      return null;
    }

    return {
      id: task.externalId!,
    };
  }
}

/**
 * Event emitter for external applications to listen to Gantt events
 */
export class GanttEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }
}
