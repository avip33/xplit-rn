# Toast System Usage Guide

This app uses `react-native-toast-message` with a custom design system that matches the app's theme and styling.

## Features

- ✅ **Theme-aware**: Automatically adapts to light/dark mode
- ✅ **Design system compliant**: Uses app's colors, fonts, and spacing
- ✅ **Multiple types**: Success, Error, Info, and Warning toasts
- ✅ **Easy to use**: Simple hook-based API
- ✅ **Customizable**: Configurable duration, position, and styling

## Quick Start

### 1. Using the Hook (Recommended)

```typescript
import { useToast } from '@/hooks/useToast';

const MyComponent = () => {
  const toast = useToast();

  const handleSuccess = () => {
    toast.success('Success!', 'Your action was completed successfully.');
  };

  const handleError = () => {
    toast.error('Error!', 'Something went wrong. Please try again.');
  };

  const handleInfo = () => {
    toast.info('Info', 'Here is some important information.');
  };

  const handleWarning = () => {
    toast.warning('Warning!', 'Please be careful with this action.');
  };

  return (
    // Your component JSX
  );
};
```

### 2. Direct Import (Alternative)

```typescript
import { showToast } from '@/components/ui/Toast';

// Usage
showToast.success('Success!', 'Your action was completed successfully.');
showToast.error('Error!', 'Something went wrong. Please try again.');
showToast.info('Info', 'Here is some important information.');
showToast.warning('Warning!', 'Please be careful with this action.');
```

## Toast Types

### Success Toast
- **Color**: Green (#10B981)
- **Use case**: Successful operations, confirmations
- **Duration**: 4 seconds

```typescript
toast.success('Success!', 'Your profile has been updated.');
```

### Error Toast
- **Color**: Red (#EF4444)
- **Use case**: Errors, failed operations
- **Duration**: 5 seconds

```typescript
toast.error('Error!', 'Failed to save your changes. Please try again.');
```

### Info Toast
- **Color**: Blue (#3B82F6)
- **Use case**: General information, tips
- **Duration**: 4 seconds

```typescript
toast.info('Info', 'Your data will be synced in the background.');
```

### Warning Toast
- **Color**: Amber (#F59E0B)
- **Use case**: Warnings, important notices
- **Duration**: 4 seconds

```typescript
toast.warning('Warning!', 'This action cannot be undone.');
```

## Design System Integration

The toast system automatically uses:

- **Fonts**: Avenir (iOS) / Lato (Android) with proper weights
- **Colors**: Theme-aware colors from the app's design system
- **Spacing**: Consistent padding and margins
- **Shadows**: Subtle shadows for depth
- **Border Radius**: 12px for modern rounded corners

## Customization

### Toast Configuration

The toast configuration is defined in `components/ui/Toast.tsx`. You can customize:

- Position (top/bottom)
- Duration
- Auto-hide behavior
- Top offset
- Styling for each toast type

### Example Customization

```typescript
// In components/ui/Toast.tsx
export const showToast = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'top', // or 'bottom'
      visibilityTime: 4000, // 4 seconds
      autoHide: true,
      topOffset: 60, // Adjust for status bar
    });
  },
  // ... other types
};
```

## Best Practices

1. **Keep titles short**: Use concise, action-oriented titles
2. **Provide context**: Use the message field for additional details
3. **Be consistent**: Use the same toast type for similar actions
4. **Don't overuse**: Reserve toasts for important feedback
5. **Test both themes**: Ensure toasts look good in light and dark mode

## Examples in the Codebase

See `components/ToastExample.tsx` for a complete example of all toast types.

## Troubleshooting

### Toast not showing?
- Ensure `CustomToast` is added to your root layout (`app/_layout.tsx`)
- Check that you're calling the toast function correctly
- Verify the component is mounted and rendered

### Styling issues?
- Check that the design system constants are properly imported
- Ensure the color scheme hook is working correctly
- Verify font loading is complete

### Performance issues?
- Avoid showing multiple toasts simultaneously
- Use appropriate duration times
- Consider debouncing rapid toast calls
