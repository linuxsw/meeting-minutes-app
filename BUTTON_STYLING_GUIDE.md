# Button Styling Guide for Meeting Minutes App

This document provides guidance on how to customize and maintain consistent button styling throughout the Meeting Minutes application.

## Button Component Overview

The application uses a centralized button component located at `src/components/ui/button.tsx` which leverages Tailwind CSS and CSS variables for styling. This ensures consistency across the entire application.

## Default Button Variants

The following button variants are available:

1. **Default** - Primary action buttons (blue background with white text)
2. **Destructive** - For delete or warning actions (red background with white text)
3. **Outline** - Secondary actions with border (transparent with black text)
4. **Secondary** - Alternative actions (light gray with black text)
5. **Ghost** - Minimal styling (transparent with black text on hover)
6. **Link** - Text-only buttons (black text with underline on hover)

## How to Use Button Variants

When implementing buttons in your components, specify the variant:

```tsx
import { Button } from "@/components/ui/button"

// Default button (primary action)
<Button>Submit</Button>

// Destructive button (for delete actions)
<Button variant="destructive">Delete</Button>

// Outline button (secondary action)
<Button variant="outline">Cancel</Button>

// Secondary button (alternative action)
<Button variant="secondary">Save Draft</Button>

// Ghost button (minimal styling)
<Button variant="ghost">More Options</Button>

// Link button (text only)
<Button variant="link">View Details</Button>
```

## Button Sizes

The component supports different sizes:

```tsx
// Default size
<Button>Normal</Button>

// Small button
<Button size="sm">Small</Button>

// Large button
<Button size="lg">Large</Button>

// Icon button (square)
<Button size="icon"><Icon /></Button>
```

## Customizing Button Colors

To modify button colors application-wide, edit the CSS variables in `src/app/globals.css`:

```css
:root {
  /* Primary button colors */
  --primary: 222.2 47.4% 11.2%;        /* Background color */
  --primary-foreground: 210 40% 98%;   /* Text color */
  
  /* Secondary button colors */
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  
  /* Destructive button colors */
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  
  /* Other button-related variables */
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
}
```

## Ensuring Text Visibility

All button variants now explicitly set text color to ensure proper contrast:
- Default and destructive variants use white text
- All other variants use black text

This ensures text is always visible regardless of background color.

## Troubleshooting Common Issues

1. **White text on light background**: If buttons have white text that's hard to see on light backgrounds, check that the button is using the correct variant.

2. **Inconsistent styling**: Ensure all buttons use the `Button` component rather than native HTML buttons.

3. **Custom styling needs**: For one-off custom styling, use the `className` prop:
   ```tsx
   <Button className="bg-purple-500 text-white">Custom</Button>
   ```

## Best Practices

1. Use the appropriate variant for the action type (primary actions should use default variant)
2. Maintain consistent button sizing within similar contexts
3. Ensure adequate contrast between button text and background
4. Use the centralized Button component for all buttons to maintain consistency

By following these guidelines, the application will maintain a consistent, accessible, and visually appealing button styling throughout the user interface.
