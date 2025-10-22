# 🎨 VYAPAAR COMPONENT GUIDE - Phase 2 Implementation

## Quick Start for Remaining Pages

### Step 1: Import Components
```tsx
'use client';

import { VyapaarPage } from '@/components/VyapaarPageTemplate';
import { 
  PrimaryButton, 
  SecondaryButton, 
  FormInput, 
  FormSelect, 
  Card, 
  CardHeader, 
  StatusBadge, 
  Alert 
} from '@/components/VyapaarComponents';
```

### Step 2: Use VyapaarPage Template
```tsx
return (
  <VyapaarPage
    title="Page Title"
    subtitle="Page description"
    loading={loading}
    action={<PrimaryButton>+ Add Item</PrimaryButton>}
    filters={<FilterButtons />}
  >
    {/* Page Content */}
  </VyapaarPage>
);
```

---

## Color Variables Reference

```css
/* Primary Colors */
var(--primary)           /* #ED1A3B - Main red */
var(--primary-dark)      /* #CC0000 - Darker red */
var(--primary-light)     /* #FF4D5F - Lighter red */

/* Neutral Colors */
var(--dark-bg)           /* #2E2C2C - Sidebar */
var(--white)             /* #FFFFFF - White */
var(--light-gray)        /* #F5F5F5 - Light background */
var(--border-gray)       /* #DDDDDD - Borders */

/* Text Colors */
var(--text-dark)         /* #333333 - Primary text */
var(--text-gray)         /* #666666 - Secondary text */
var(--text-light)        /* #999999 - Tertiary text */

/* Status Colors */
var(--success)           /* #4CAF50 - Green */
var(--warning)           /* #FF9800 - Orange */
var(--error)             /* #F44336 - Red */
var(--info)              /* #2196F3 - Blue */
```

---

## Common Patterns

### Filter Tabs
```tsx
<div className="flex gap-2">
  {['ALL', 'ACTIVE', 'INACTIVE'].map((type) => (
    <button
      key={type}
      onClick={() => setFilterType(type)}
      className="px-4 py-2 rounded-lg text-sm font-medium transition"
      style={{
        backgroundColor: filterType === type ? 'var(--primary)' : 'var(--white)',
        color: filterType === type ? 'white' : 'var(--text-gray)',
        borderColor: filterType === type ? 'var(--primary)' : 'var(--border-gray)',
        border: '1px solid',
      }}
    >
      {type}
    </button>
  ))}
</div>
```

### Empty State
```tsx
<Card className="text-center py-12">
  <div className="text-4xl mb-4">📦</div>
  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-dark)' }}>
    No items yet
  </h3>
  <p className="text-sm mb-4" style={{ color: 'var(--text-gray)' }}>
    Add your first item to get started
  </p>
  <PrimaryButton onClick={() => setShowForm(true)}>Add Item</PrimaryButton>
</Card>
```

### Professional Table
```tsx
<Card>
  <CardHeader title="Items" subtitle="All your items" />
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr style={{ backgroundColor: 'var(--light-gray)', borderBottom: '1px solid var(--border-gray)' }}>
          <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
            Name
          </th>
          <th className="px-4 py-3 text-left text-sm font-semibold" style={{ color: 'var(--text-dark)' }}>
            Status
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b hover:bg-gray-50" style={{ borderColor: 'var(--border-gray)' }}>
            <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-dark)' }}>
              {item.name}
            </td>
            <td className="px-4 py-3 text-sm">
              <StatusBadge status={item.status} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</Card>
```

### Form with Validation
```tsx
<Card className="mb-6">
  <CardHeader title="Add Item" subtitle="Enter item details" />
  {success && <Alert type="success" message={`✓ ${success}`} />}
  <form onSubmit={handleSubmit} className="space-y-4">
    <FormInput
      label="Name"
      placeholder="Enter name"
      value={formData.name}
      onChange={handleInputChange}
      error={errors.name}
      required
    />
    
    <div className="flex gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-gray)' }}>
      <PrimaryButton onClick={handleSubmit}>Save</PrimaryButton>
      <SecondaryButton onClick={() => setShowForm(false)}>Cancel</SecondaryButton>
    </div>
  </form>
</Card>
```

---

## Pages to Update - Priority Order

### Priority 1 - Core Pages (1-2 hours)
1. **Payments** - Payment tracking, modes, status filters
2. **Purchases** - Purchase orders, vendor management
3. **Inventory** - Stock levels, low stock alerts
4. **Reports** - GST reports, sales reports, analytics

### Priority 2 - Settings & Management (2-3 hours)
5. **Settings** - Organization settings, preferences
6. **Users** - User management, role assignment
7. **Suppliers** - Supplier list, payment terms

### Priority 3 - Advanced Features (3-4 hours)
8. **GST Compliance** - GSTR-1, GSTR-2 reports
9. **Accounting** - Chart of accounts, journal entries
10. **Bank Reconciliation** - Bank statement matching
11. **Cheque Management** - Cheque tracking

---

## Testing Checklist

For each page:
- [ ] Page loads without errors
- [ ] All colors match Vyapaar scheme
- [ ] Forms work correctly
- [ ] Filters work correctly
- [ ] Tables display properly
- [ ] Responsive on mobile/tablet/desktop
- [ ] Status badges display correctly
- [ ] Empty states show properly
- [ ] Buttons are clickable
- [ ] No console errors

---

## Common Issues & Solutions

### Colors not applying
Use inline styles with CSS variables:
```tsx
style={{ backgroundColor: 'var(--primary)', color: 'var(--white)' }}
```

### Form not submitting
Check form validation and error handling:
```tsx
if (Object.keys(newErrors).length > 0) {
  setErrors(newErrors);
  return;
}
```

### Table not responsive
Wrap table in overflow container:
```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Table content */}
  </table>
</div>
```

---

## Resources

- **Component Library**: `frontend/components/VyapaarComponents.tsx`
- **Page Templates**: `frontend/components/VyapaarPageTemplate.tsx`
- **Global Styles**: `frontend/app/globals.css`
- **Design System**: `VYAPAAR_UI_DETAILED_ANALYSIS.md`
- **Implementation Guide**: `UPDATE_ALL_PAGES.md`
- **Completion Report**: `PHASE_1_COMPLETION_REPORT.md`

---

**Status**: Phase 1 Complete ✅  
**Next**: Phase 2 - Update remaining 11 pages  
**Estimated Time**: 6-9 hours

