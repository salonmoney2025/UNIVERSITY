# CSS Architecture - EBKUST University System

## Directory Structure

```
styles/
├── components/          # Component-specific styles
│   ├── buttons.css      # All button styles
│   ├── tables.css       # Data table styles
│   ├── page-header.css  # Page header with navigation
│   └── modals.css       # Modal dialog styles
│
├── layout/              # Layout component styles
│   ├── navbar.css       # Navigation bar styles
│   ├── sidebar.css      # Sidebar navigation
│   └── footer.css       # Footer styles
│
└── pages/               # Page-specific styles
    └── [page-name].css  # Individual page styles
```

## CSS Organization Principles

### 1. **Component-Based Styling**
Each component has its own CSS file for better maintainability:
- Easy to locate styles
- No conflicts with other components
- Can be imported only where needed

### 2. **Usage in Components**

```tsx
// Example: Using button styles in a component
import '@/styles/components/buttons.css';

function MyComponent() {
  return (
    <button className="btn btn-primary">
      Click Me
    </button>
  );
}
```

### 3. **Button Classes**

#### Primary Buttons
```html
<button className="btn btn-primary">Primary Action</button>
<button className="btn btn-secondary">Secondary</button>
<button className="btn btn-success">Success</button>
<button className="btn btn-warning">Warning</button>
<button className="btn btn-danger">Danger</button>
<button className="btn btn-info">Info</button>
<button className="btn btn-gray">Gray</button>
```

#### Button Sizes
```html
<button className="btn btn-primary btn-sm">Small</button>
<button className="btn btn-primary">Normal</button>
<button className="btn btn-primary btn-lg">Large</button>
```

#### Upload Button
```html
<label className="btn btn-upload">
  Upload File
  <input type="file" />
</label>
```

### 4. **Table Classes**

```html
<div className="table-container">
  <div className="table-controls">
    <!-- Controls here -->
  </div>

  <div className="table-wrapper">
    <table className="data-table">
      <!-- Table content -->
    </table>
  </div>

  <div className="table-pagination">
    <!-- Pagination here -->
  </div>
</div>
```

### 5. **Page Header Component**

The `PageHeader` component provides consistent navigation:

```tsx
import PageHeader from '@/components/common/PageHeader';
import '@/styles/components/page-header.css';

<PageHeader
  title="Page Title"
  subtitle="Page description"
  icon={<IconComponent />}
  showBackButton={true}
  showHomeButton={true}
  actions={
    <div className="action-buttons">
      <button className="btn btn-primary">Action</button>
    </div>
  }
/>
```

**Features:**
- ✅ Automatic Back button (goes to previous page)
- ✅ Home button (navigates to /dashboard)
- ✅ Custom action buttons
- ✅ Consistent styling across all pages

### 6. **Status Badges**

```html
<span className="status-badge active">Active</span>
<span className="status-badge inactive">Inactive</span>
```

### 7. **Color Scheme**

- **Primary Blue**: `#3b82f6` → `#2563eb`
- **Success Green**: `#10b981` → `#059669`
- **Warning Orange**: `#f59e0b` → `#d97706`
- **Danger Red**: `#ef4444` → `#dc2626`
- **Info Cyan**: `#06b6d4` → `#0891b2`
- **Secondary Purple**: `#8b5cf6` → `#7c3aed`
- **Gray**: `#6b7280` → `#4b5563`

All buttons use gradients for a modern look!

### 8. **Working Buttons**

All buttons are now fully functional with:
- ✅ `type="button"` to prevent form submission
- ✅ Proper `onClick` handlers
- ✅ Visual feedback on hover
- ✅ Disabled states
- ✅ Loading states support

### 9. **Navigation Features**

Every page now has:
- ✅ **Back Button**: Returns to previous page
- ✅ **Home Button**: Returns to dashboard
- ✅ **Action Buttons**: Refresh, Add, etc.
- ✅ Consistent placement (top right)

## Best Practices

1. **Import CSS at component level**
   ```tsx
   import '@/styles/components/buttons.css';
   ```

2. **Use semantic class names**
   ```html
   <button className="btn btn-primary" type="button">
   ```

3. **Always specify button type**
   ```html
   <button type="button">  <!-- Prevents form submission -->
   <button type="submit">  <!-- Submits forms -->
   ```

4. **Use PageHeader component**
   - Provides consistent navigation
   - Automatic back/home buttons
   - Professional appearance

5. **Apply gradients consistently**
   - All buttons use gradients
   - Hover states are darker
   - Active states are pressed

## Migration Guide

### Before:
```tsx
<button onClick={handleClick} className="px-4 py-2 bg-blue-600...">
  Click Me
</button>
```

### After:
```tsx
import '@/styles/components/buttons.css';

<button onClick={handleClick} className="btn btn-primary" type="button">
  Click Me
</button>
```

## File Naming Convention

- Component styles: `kebab-case.css`
- Layout styles: `kebab-case.css`
- Page styles: `[page-name].css`

## Import Path

Always use the `@/styles/` alias:
```tsx
import '@/styles/components/buttons.css';
import '@/styles/layout/navbar.css';
```

## Responsive Design

All CSS files include responsive breakpoints:
- Mobile: `@media (max-width: 768px)`
- Tablet: `@media (min-width: 769px) and (max-width: 1024px)`
- Desktop: `@media (min-width: 1025px)`

---

**Last Updated:** March 22, 2026
**Version:** 1.0.0
