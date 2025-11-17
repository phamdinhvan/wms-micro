import createCache from '@emotion/cache';
import {CacheProvider} from '@emotion/react';
import {MantineTheme} from '@mantine/core';
import mantineCoreCss from '@mantine/core/styles.css?inline';
import mantineDatesCss from '@mantine/dates/styles.css?inline';
import mantineNotificationsCss from '@mantine/notifications/styles.css?inline';
import {WmsProvider} from '@wms/core';
import ganttCss from '@wms/gantt/styles.css?inline';
import wmsCss from '@wms/styles/styles.css?inline';
import {createRoot, Root} from 'react-dom/client';

export type MountOptions = {
  lang?: string;
  theme?: MantineTheme | null;
  render: (ctx: any) => React.ReactNode;
  hasMantineProvider?: boolean;
  appId?: string;
  code?: string;
};

// Wrap CSS with high specificity selector to prevent parent override
function wrapCssWithScope(css: string, scopeId: string): string {
  // Split CSS into rules
  const lines = css.split('\n');
  let result = '';
  let inMediaQuery = false;
  let inKeyframes = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle @media, @supports, @keyframes
    if (line.startsWith('@media') || line.startsWith('@supports')) {
      inMediaQuery = true;
      result += line + '\n';
      continue;
    }

    if (line.startsWith('@keyframes')) {
      inKeyframes = true;
      result += line + '\n';
      continue;
    }

    if (line === '}' && (inMediaQuery || inKeyframes)) {
      result += line + '\n';
      if (inMediaQuery) inMediaQuery = false;
      if (inKeyframes) inKeyframes = false;
      continue;
    }

    // Don't scope @font-face, @import, etc.
    if (line.startsWith('@') && !inMediaQuery) {
      result += line + '\n';
      continue;
    }

    result += line + '\n';
  }

  // Wrap entire CSS with scope
  return `#${scopeId} { ${result} }`;
}

export function createApp({
  hasMantineProvider = false,
  lang = 'ja',
  theme,
  ...opts
}: MountOptions) {
  return {
    mount(container: HTMLElement) {
      // Prevent double mounting
      if ((container as any)._wmsMounted) {
        console.warn('⚠️ WMS already mounted on this container');
        return () => {};
      }
      (container as any)._wmsMounted = true;

      // Create unique scope ID for this instance
      const scopeId = 'wms-scope-' + Math.random().toString(36).substring(2, 9);

      // Create wrapper with scope ID
      let wrapper = container.querySelector<HTMLDivElement>(`#${scopeId}`);
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.id = scopeId;
        wrapper.className = 'wms-root';
        container.appendChild(wrapper);
      }

      // Create host for React content
      const host = document.createElement('div');
      host.className = 'wms-content';
      wrapper.appendChild(host);

      // Create portal target for notifications and modals
      const portalTarget = document.createElement('div');
      portalTarget.className = 'wms-portal';
      portalTarget.id = `${scopeId}-portal`;
      // Append to document.body instead of wrapper for better z-index behavior
      document.body.appendChild(portalTarget);

      // Clear any existing styles
      const existingStyles = container.querySelectorAll('style[data-wms]');
      existingStyles.forEach(style => style.remove());

      // Create style container - insert at the END to have higher priority
      const styleContainer = document.createElement('div');
      styleContainer.setAttribute('data-wms-styles', 'true');
      // Insert AFTER wrapper so our styles have higher priority
      container.appendChild(styleContainer);

      // === ISOLATION LAYER ===
      const isolationStyle = document.createElement('style');
      isolationStyle.setAttribute('data-wms', 'isolation');
      isolationStyle.textContent = `
        /* Reset and isolate WMS root */
        .wms-root {
          all: initial;
          display: block !important;
          position: relative !important;
          contain: layout style;
          isolation: isolate;
        }
        
        /* Base styles for content */
        .wms-root .wms-content {
          /* Typography - use initial to allow Mantine to override */
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
          font-size: 16px;
          line-height: 1.55;
          font-weight: 400;
          color: #000000;
          
          /* Background */
          background-color: #ffffff;
          
          /* Rendering */
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
          
          /* Box model */
          box-sizing: border-box;
          
          /* Color scheme */
          color-scheme: light;
          
          /* Allow Mantine styles to work */
          display: block;
          position: relative;
        }
        
        /* Reset all children but allow CSS inheritance */
        .wms-root .wms-content *,
        .wms-root .wms-content *:before,
        .wms-root .wms-content *:after {
          box-sizing: border-box;
        }
        
        /* Portal styles - notifications and modals */
        .wms-portal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 10000;
          pointer-events: none;
        }
        
        .wms-portal > * {
          pointer-events: auto;
        }
        
        /* Ensure notifications are visible and properly styled */
        .wms-portal [class*="mantine-Notification"],
        .wms-portal [class*="m-Notification"] {
          z-index: 10001 !important;
          position: relative !important;
        }
        
        /* Notification container positioning */
        .wms-portal [data-mantine-notifications-container] {
          position: fixed !important;
          top: 20px !important;
          right: 20px !important;
          z-index: 10001 !important;
          pointer-events: auto !important;
        }
        

        /* Override parent's background if needed */
        .wms-root {
          background-color: transparent;
        }
        
        /* Don't reset Mantine components - let them use their classes */
        .wms-root [class*="mantine-"],
        .wms-root [class*="m-"] {
          /* Mantine classes should work as-is */
        }
        
        /* Reset only bare HTML elements that might inherit bad styles */
        .wms-root .wms-content > h1:not([class*="mantine-"]):not([class*="m-"]),
        .wms-root .wms-content > h2:not([class*="mantine-"]):not([class*="m-"]),
        .wms-root .wms-content > h3:not([class*="mantine-"]):not([class*="m-"]),
        .wms-root .wms-content > h4:not([class*="mantine-"]):not([class*="m-"]),
        .wms-root .wms-content > h5:not([class*="mantine-"]):not([class*="m-"]),
        .wms-root .wms-content > h6:not([class*="mantine-"]):not([class*="m-"]) {
          margin: 0;
          font-weight: 600;
        }
        
        .wms-root .wms-content > p:not([class*="mantine-"]):not([class*="m-"]) {
          margin: 0;
        }
        
        /* Reset bare buttons only - not Mantine buttons */
        .wms-root .wms-content > button:not([class*="mantine-"]):not([class*="m-"]) {
          font-family: inherit;
          cursor: pointer;
          border: none;
          background: none;
          padding: 0;
          margin: 0;
        }
        
        /* Reset bare links only */
        .wms-root .wms-content > a:not([class*="mantine-"]):not([class*="m-"]) {
          text-decoration: none;
        }
      `;
      styleContainer.appendChild(isolationStyle);

      // === MANTINE CSS VARIABLES FIX ===
      // Ensure Mantine CSS variables are available
      const mantineVarsStyle = document.createElement('style');
      mantineVarsStyle.setAttribute('data-wms', 'mantine-vars');
      mantineVarsStyle.textContent = `
        /* Ensure CSS variables work inside .wms-root */
        .wms-root,
        .wms-root .wms-content {
          /* Mantine uses CSS variables from #wms-scope or :root */
          /* Make sure they cascade properly */
        }
        
        /* If parent has aggressive * selectors, protect Mantine */
        .wms-root [class*="mantine-Button"],
        .wms-root [class*="m-Button"] {
          /* Let Mantine handle button colors */
          color: var(--mantine-color-text) !important;
          background-color: var(--mantine-color-blue-filled) !important;
        }
        
        .wms-root [class*="mantine-Text"],
        .wms-root [class*="m-Text"] {
          color: inherit !important;
        }
        
        /* Protect input colors */
        .wms-root [class*="mantine-Input"],
        .wms-root [class*="m-Input"] {
          color: var(--mantine-color-text) !important;
          background-color: var(--mantine-color-white) !important;
        }
      `;
      styleContainer.appendChild(mantineVarsStyle);

      // === COMPONENT CSS ===
      const baseCss = [wmsCss, ganttCss];
      if (!hasMantineProvider) {
        baseCss.push(mantineCoreCss, mantineDatesCss, mantineNotificationsCss);
      }

      baseCss.forEach((css, index) => {
        const style = document.createElement('style');
        style.setAttribute('data-wms', 'component');
        style.setAttribute('data-wms-priority', index.toString());

        // IMPORTANT: Don't scope the CSS - inject it as-is
        // The wrapper .wms-root provides sufficient isolation
        // Scoping breaks Mantine's class-based selectors
        style.textContent = css;
        styleContainer.appendChild(style);
      });

      // Create emotion cache
      const cache = createCache({
        key: 'wms',
        container: styleContainer,
        prepend: false,
      });

      // Check if root already exists to prevent double mounting
      let root: Root;
      let isNewRoot = false;
      const existingRoot = (host as any)._reactRoot;

      if (existingRoot) {
        console.log('♻️ Reusing existing React root');
        root = existingRoot;
      } else {
        console.log('🆕 Creating new React root');
        root = createRoot(host);
        (host as any)._reactRoot = root;
        isNewRoot = true;
      }

      let renderTimeoutId: number | undefined;
      let isMounted = true;

      const render = () => {
        // Safety check: don't render if already unmounted
        if (!isMounted) {
          console.warn('⚠️ Skipping render - component already unmounted');
          return;
        }

        // Safety check: ensure root is still valid
        if (!(host as any)._reactRoot) {
          console.warn('⚠️ Skipping render - root was removed');
          return;
        }

        try {
          root.render(
            <CacheProvider value={cache}>
              <WmsProvider
                lang={lang}
                theme={theme}
                rootElement={() => portalTarget}
                hasMantineProvider={hasMantineProvider}
                appId={opts.appId}
                code={opts.code}
                cssVariablesSelector={`#${scopeId}`}>
                {opts.render({})}
              </WmsProvider>
            </CacheProvider>,
          );
          console.log('✅ Render completed');
        } catch (error) {
          // Check if it's the "unmounted root" error
          if (
            error instanceof Error &&
            error.message.includes('unmounted root')
          ) {
            console.warn(
              '⚠️ Attempted to render into unmounted root - this is expected in StrictMode',
            );
            return;
          }

          console.error('❌ WMS Component render error:', error);

          // Only show error UI if component is still mounted
          if (isMounted && host) {
            host.innerHTML = `
              <div style="padding: 20px; border: 2px solid #ff6b6b; border-radius: 8px; background: #fff; color: #333; font-family: monospace;">
                <h3 style="margin: 0 0 10px 0; color: #c92a2a;">⚠️ WMS Component Error</h3>
                <p style="margin: 0 0 10px 0; color: #495057;">Failed to render component. Check console for details.</p>
                <pre style="font-size: 11px; color: #868e96; overflow: auto; background: #f8f9fa; padding: 10px; border-radius: 4px;">${error}</pre>
              </div>
            `;
          }
        }
      };

      // Render after brief delay to ensure CSS is applied
      renderTimeoutId = setTimeout(() => {
        render();
      }, 10) as any;

      return () => {
        console.log('🧹 Unmounting WMS component...');

        // Mark as unmounted immediately to prevent race conditions
        isMounted = false;

        // Clear pending render timeout
        if (renderTimeoutId !== undefined) {
          clearTimeout(renderTimeoutId);
          console.log('🚫 Cancelled pending render');
        }

        // Mark container as unmounted
        delete (container as any)._wmsMounted;

        // Remove styles
        const wmsStyles = container.querySelector('[data-wms-styles="true"]');
        if (wmsStyles) {
          wmsStyles.remove();
        }

        // Remove portal target from body
        if (portalTarget && portalTarget.parentNode) {
          portalTarget.parentNode.removeChild(portalTarget);
        }

        // Unmount React - only if we created the root
        if (isNewRoot) {
          queueMicrotask(() => {
            try {
              if (root && (host as any)._reactRoot) {
                root.unmount();
                delete (host as any)._reactRoot;
                console.log('✅ React root unmounted successfully');
              }
            } catch (error) {
              console.warn('⚠️ Warning during unmount:', error);
            }
          });
        } else {
          console.log('♻️ Keeping existing root (reused)');
        }
      };
    },
    render: opts.render,
  };
}
