# 🎨 UI Design Guide: GST Invoice SaaS

## 📐 Design System Overview

### Technology Stack
```
Frontend Framework:  Next.js 15.5.6
Styling:            Tailwind CSS 3.x
Component Library:  Custom React Components
Icons:              Lucide React / Heroicons
Charts:             Chart.js / Recharts
Forms:              React Hook Form
State Management:   React Context / Zustand
```

---

## 🎨 Color System

### Primary Colors
```
Blue-50:    #EFF6FF
Blue-100:   #DBEAFE
Blue-200:   #BFDBFE
Blue-300:   #93C5FD
Blue-400:   #60A5FA
Blue-500:   #3B82F6  ← Primary
Blue-600:   #2563EB  ← Primary Dark
Blue-700:   #1D4ED8
Blue-800:   #1E40AF
Blue-900:   #1E3A8A
```

### Secondary Colors
```
Green-50:   #F0FDF4
Green-100:  #DCFCE7
Green-200:  #BBF7D0
Green-300:  #86EFAC
Green-400:  #4ADE80
Green-500:  #22C55E
Green-600:  #16A34A  ← Success
Green-700:  #15803D
Green-800:  #166534
Green-900:  #145231
```

### Accent Colors
```
Amber-50:   #FFFBEB
Amber-100:  #FEF3C7
Amber-200:  #FDE68A
Amber-300:  #FCD34D
Amber-400:  #FBBF24
Amber-500:  #F59E0B  ← Warning
Amber-600:  #D97706
Amber-700:  #B45309
Amber-800:  #92400E
Amber-900:  #78350F
```

### Neutral Colors
```
Gray-50:    #F9FAFB
Gray-100:   #F3F4F6
Gray-200:   #E5E7EB
Gray-300:   #D1D5DB
Gray-400:   #9CA3AF
Gray-500:   #6B7280  ← Neutral
Gray-600:   #4B5563
Gray-700:   #374151
Gray-800:   #1F2937
Gray-900:   #111827
```

### Status Colors
```
Success:    #10B981 (Green)
Error:      #EF4444 (Red)
Warning:    #F59E0B (Amber)
Info:       #3B82F6 (Blue)
Pending:    #F59E0B (Amber)
Completed:  #10B981 (Green)
Failed:     #EF4444 (Red)
```

---

## 🔤 Typography

### Font Family
```
Primary:    Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI'
Monospace:  'Fira Code', 'Courier New', monospace
```

### Font Sizes
```
Display:    48px (3rem)   - Page titles
Heading 1:  36px (2.25rem) - Section titles
Heading 2:  30px (1.875rem) - Subsection titles
Heading 3:  24px (1.5rem) - Card titles
Heading 4:  20px (1.25rem) - Subheadings
Body:       16px (1rem)   - Regular text
Small:      14px (0.875rem) - Secondary text
Tiny:       12px (0.75rem) - Labels, captions
```

### Font Weights
```
Thin:       100
ExtraLight: 200
Light:      300
Normal:     400 (Default)
Medium:     500 (Headings)
SemiBold:   600 (Emphasis)
Bold:       700 (Strong)
ExtraBold:  800
Black:      900
```

### Line Heights
```
Tight:      1.25
Snug:       1.375
Normal:     1.5 (Default)
Relaxed:    1.625
Loose:      2
```

---

## 📏 Spacing System

### Spacing Scale (Tailwind)
```
0:    0px
1:    4px
2:    8px
3:    12px
4:    16px
5:    20px
6:    24px
7:    28px
8:    32px
9:    36px
10:   40px
12:   48px
14:   56px
16:   64px
20:   80px
24:   96px
28:   112px
32:   128px
```

### Common Spacing Patterns
```
Padding:
- Buttons:      px-4 py-2 (16px x 8px)
- Cards:        p-6 (24px)
- Sections:     p-8 (32px)
- Containers:   px-4 py-6 (16px x 24px)

Margins:
- Between sections:  mb-8 (32px)
- Between items:     mb-4 (16px)
- Between groups:    mb-6 (24px)

Gaps:
- Grid items:   gap-4 (16px)
- Flex items:   gap-3 (12px)
- List items:   gap-2 (8px)
```

---

## 🎯 Component Specifications

### Buttons
```
Primary Button:
- Background:   Blue-600
- Text:         White
- Padding:      px-4 py-2
- Border Radius: rounded-lg
- Font Weight:  medium
- Hover:        Blue-700
- Active:       Blue-800
- Disabled:     Gray-300

Secondary Button:
- Background:   Gray-100
- Text:         Gray-900
- Border:       1px Gray-300
- Padding:      px-4 py-2
- Hover:        Gray-200
- Active:       Gray-300

Danger Button:
- Background:   Red-600
- Text:         White
- Padding:      px-4 py-2
- Hover:        Red-700
- Active:       Red-800
```

### Cards
```
Background:     White
Border:         1px Gray-200
Border Radius:  rounded-lg
Padding:        p-6
Shadow:         shadow-sm
Hover Shadow:   shadow-md
Transition:     transition-shadow duration-200
```

### Inputs
```
Background:     White
Border:         1px Gray-300
Border Radius:  rounded-lg
Padding:        px-3 py-2
Font Size:      text-base
Focus:          Blue-500 border, ring-2 ring-Blue-200
Placeholder:    Gray-400
Disabled:       Gray-100 background, Gray-400 text
```

### Badges
```
Success:        bg-Green-100 text-Green-800
Error:          bg-Red-100 text-Red-800
Warning:        bg-Amber-100 text-Amber-800
Info:           bg-Blue-100 text-Blue-800
Padding:        px-2.5 py-0.5
Border Radius:  rounded-full
Font Size:      text-xs
Font Weight:    medium
```

---

## 📱 Responsive Breakpoints

```
Mobile:     < 640px   (sm)
Tablet:     640px     (md)
Desktop:    1024px    (lg)
Large:      1280px    (xl)
XL:         1536px    (2xl)

Usage:
- Mobile-first approach
- md: for tablet layouts
- lg: for desktop layouts
- xl: for large screens
```

---

## 🎬 Animations & Transitions

### Transition Durations
```
Instant:    duration-0 (0ms)
Fast:       duration-75 (75ms)
Quick:      duration-100 (100ms)
Normal:     duration-200 (200ms)
Slow:       duration-300 (300ms)
Slower:     duration-500 (500ms)
Slowest:    duration-700 (700ms)
```

### Common Animations
```
Fade In:        opacity-0 → opacity-100
Slide In:       translate-x/y with opacity
Scale:          scale-95 → scale-100
Bounce:         keyframe animation
Spin:           rotate animation
Pulse:          opacity pulse
```

### Hover Effects
```
Buttons:        scale-105, shadow-lg
Cards:          shadow-md, translate-y-1
Links:          text-Blue-600, underline
Icons:          scale-110, color change
```

---

## 📊 Dashboard Layout

### Grid System
```
12-column grid
Gap: 24px (gap-6)

Common Layouts:
- Full width:       col-span-12
- Half width:       col-span-6
- Third width:      col-span-4
- Quarter width:    col-span-3
- Two-thirds:       col-span-8
- Three-quarters:   col-span-9

Mobile (md):
- Full width:       md:col-span-12
- Half width:       md:col-span-6
- Third width:      md:col-span-4
```

### Widget Sizes
```
Small:      col-span-3 (Quarter)
Medium:     col-span-6 (Half)
Large:      col-span-9 (Three-quarters)
Full:       col-span-12 (Full)
```

---

## 🎨 Dark Mode Support

### Dark Mode Colors
```
Background:     Gray-900
Surface:        Gray-800
Border:         Gray-700
Text Primary:   Gray-50
Text Secondary: Gray-400
Accent:         Blue-400
```

### Implementation
```
<div className="dark:bg-Gray-900 dark:text-Gray-50">
  Content
</div>
```

---

## 📐 Icon System

### Icon Library
```
Lucide React:   Primary icon library
- 400+ icons
- Consistent design
- Customizable size & color
- SVG-based

Usage:
<Icon className="w-5 h-5 text-Blue-600" />
```

### Icon Sizes
```
xs:  w-3 h-3 (12px)
sm:  w-4 h-4 (16px)
md:  w-5 h-5 (20px)
lg:  w-6 h-6 (24px)
xl:  w-8 h-8 (32px)
2xl: w-10 h-10 (40px)
```

---

## 🎯 Accessibility Guidelines

### Color Contrast
```
Normal Text:    4.5:1 ratio (WCAG AA)
Large Text:     3:1 ratio (WCAG AA)
UI Components:  3:1 ratio (WCAG AA)
```

### Focus States
```
Outline:        2px solid Blue-500
Offset:         2px
Visible:        Always visible
Keyboard:       Tab navigation
```

### ARIA Labels
```
<button aria-label="Close menu">
  <Icon />
</button>

<div role="alert" aria-live="polite">
  Error message
</div>
```

---

## 📱 Mobile Design Patterns

### Touch Targets
```
Minimum Size:   44x44px
Recommended:    48x48px
Spacing:        8px minimum between targets
```

### Mobile Navigation
```
Bottom Navigation:  For primary actions
Hamburger Menu:     For secondary actions
Swipe Gestures:     For navigation
```

### Mobile Forms
```
Single Column:      Always
Large Inputs:       44px minimum height
Clear Labels:       Above inputs
Error Messages:     Clear and visible
```

---

## 🚀 Performance Optimization

### Image Optimization
```
Format:         WebP with fallback
Sizes:          Responsive sizes
Lazy Loading:   Enabled by default
Compression:    Optimized
```

### CSS Optimization
```
Tailwind:       Purged unused styles
Bundle Size:    ~30KB gzipped
Critical CSS:   Inlined
```

### JavaScript Optimization
```
Code Splitting:  Per route
Lazy Loading:    Components
Tree Shaking:    Unused code removed
```

---

## 📚 Component Examples

### Invoice Card
```jsx
<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
  <div className="flex justify-between items-start mb-4">
    <h3 className="text-lg font-semibold text-gray-900">INV-001</h3>
    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
      PAID
    </span>
  </div>
  <p className="text-gray-600 text-sm mb-4">Acme Corporation</p>
  <p className="text-2xl font-bold text-gray-900">₹212,400</p>
</div>
```

### Data Table
```jsx
<table className="w-full">
  <thead className="bg-gray-50 border-b border-gray-200">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
        Invoice
      </th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200">
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-sm text-gray-900">INV-001</td>
    </tr>
  </tbody>
</table>
```

---

**This design system ensures consistency and quality across the entire application!** 🎨

