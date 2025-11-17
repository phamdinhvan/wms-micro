# Theme Integration Guide

## Overview

The WMS UI library now supports flexible theme integration with three different modes:

1. **Default Theme**: Uses the built-in `customAppTheme` automatically
2. **Custom Theme**: Pass your own Mantine theme via props
3. **No Theme**: Use Mantine's default theme by passing `theme={null}`

This ensures no conflicts when integrating with external projects that already use Mantine.

## Usage Examples

### 1. Default Theme (Automatic)

```tsx
// Uses customAppTheme automatically
import { WmsProvider } from '@wms/core';

<WmsProvider lang="en">
  {/* Your components */}
</WmsProvider>
```

### 2. Custom Theme

```tsx
import { createTheme } from '@mantine/core';
import { WmsProvider } from '@wms/core';

const myCustomTheme = createTheme({
  primaryColor: 'blue',
  colors: {
    // Your custom colors
  }
});

<WmsProvider lang="en" theme={myCustomTheme}>
  {/* Your components */}
</WmsProvider>
```

### 3. No Theme (Mantine Default)

```tsx
import { WmsProvider } from '@wms/core';

// Explicitly use Mantine's default theme
<WmsProvider lang="en" theme={null}>
  {/* Your components */}
</WmsProvider>
```

### 4. External Project Integration

For projects that already have MantineProvider:

```tsx
import { MantineProvider } from '@mantine/core';
import { WmsProvider } from '@wms/core';
import { mountListProjects } from './wms-ui.js';

// Host component with existing Mantine setup
function MyApp() {
  return (
    <MantineProvider theme={myExistingTheme}>
      {/* Your existing app */}
      <WmsIntegration />
    </MantineProvider>
  );
}

function WmsIntegration() {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const unmount = mountListProjects(ref.current, {
      lang: 'en',
      hasMantineProvider: true,  // Important: tells WMS not to create another MantineProvider
      theme: null,               // Use parent's theme
      appId: "your-app-id",
      code: "your-app-code",
    });
    
    return () => unmount();
  }, []);

  return <div ref={ref} />;
}
```

## Bundle API Integration

All mount functions now support the theme prop:

```javascript
// Default theme
mountListProjects(container, {
  lang: 'en',
  appId: 'your-app-id',
  code: 'your-app-code'
});

// Custom theme
mountListProjects(container, {
  lang: 'en',
  theme: myCustomTheme,
  appId: 'your-app-id',
  code: 'your-app-code'
});

// No theme (use parent's Mantine theme)
mountListProjects(container, {
  lang: 'en',
  theme: null,
  hasMantineProvider: true,
  appId: 'your-app-id',
  code: 'your-app-code'
});
```

## Theme Features

The built-in `customAppTheme` includes:

### Extended Color Palette
- `primary` - Main brand colors
- `lightBlue` - Light blue variants
- `success` - Success states
- `warning` - Warning states  
- `danger` - Error states
- `info` - Information states
- `priority` - Priority indicators
- `pending` - Pending states

### Typography
- Custom font families with CSS variables
- Responsive heading sizes
- Optimized line heights

### Component Overrides
- Button styles with rounded corners
- Card hover effects
- Modal header styling
- Date picker customizations
- Select component defaults

### Design Tokens
- Consistent spacing scale
- Shadow system
- Border radius values
- Breakpoint definitions

## Conflict Prevention

### When to use `hasMantineProvider: true`
- Your host application already has `<MantineProvider>`
- You want WMS components to inherit the parent theme
- You're embedding WMS components in an existing Mantine app

### When to use `theme: null`
- You want to use Mantine's default theme
- You're testing without custom styling
- You want minimal theme overhead

### When to use custom theme
- You need specific brand colors
- You want to override WMS default styling
- You're creating a white-label solution

## Migration Guide

### From Previous Versions

If you were using WMS components without theme props:

```tsx
// Before (still works - uses default theme)
<WmsProvider lang="en">
  {children}
</WmsProvider>

// After (explicit - same result)
<WmsProvider lang="en" theme={customAppTheme}>
  {children}
</WmsProvider>
```

### Bundle Integration

```javascript
// Before
mountListProjects(container, {
  lang: 'en',
  hasMantineProvider: true
});

// After (explicit theme control)
mountListProjects(container, {
  lang: 'en',
  theme: null,  // Use parent theme
  hasMantineProvider: true
});
```

## Best Practices

1. **Use `hasMantineProvider: true`** when embedding in existing Mantine apps
2. **Use `theme: null`** to inherit parent themes without conflicts
3. **Use default theme** for standalone WMS applications
4. **Use custom theme** for brand-specific implementations
5. **Test theme inheritance** in your specific integration scenario

## Troubleshooting

### Theme Not Applied
- Ensure you're not overriding with `hasMantineProvider: true` and custom theme
- Check if parent MantineProvider is conflicting
- Verify theme object is valid Mantine theme

### Style Conflicts
- Use `theme: null` with `hasMantineProvider: true` for clean inheritance
- Check CSS specificity issues
- Ensure proper CSS import order

### TypeScript Errors
- Import `MantineTheme` type for custom themes
- Use `theme?: MantineTheme | null` for optional theme props
- Rebuild packages after theme changes

## Example Implementation

See the complete example in your host component:

```tsx
"use client";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { mountListProjects } from "./wms-ui.js";

export default function ListProjects() {
  const t = useTranslations("gantt");
  const ref = useRef<HTMLDivElement>(null);
  const locale = useLocale();

  useEffect(() => {
    if (!ref.current) return;
    
    const unmount = mountListProjects(ref.current, {
      lang: locale,
      hasMantineProvider: true,  // Your app has Mantine
      theme: null,               // Use your app's theme
      appId: "enter_app_id",
      code: "enter_code",
    });

    return () => unmount();
  }, [locale]);

  return <div ref={ref} />;
}
```

This setup ensures WMS components inherit your existing Mantine theme without conflicts.
