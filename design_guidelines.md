# GlyPal Design Guidelines

## Design Approach: Healthcare-Optimized Utility System

**Selected Framework**: Material Design 3 adapted for healthcare contexts
**Rationale**: GlyPal is a utility-focused health management tool where clarity, trust, and accessibility trump visual flair. Users need to quickly log BG readings, check meal plans, and track medications without cognitive overload. Material Design 3 provides accessible, well-tested patterns for data visualization, forms, and navigation while allowing healthcare-specific customization.

---

## Core Design Principles

1. **Trust Through Clarity**: Medical data requires zero ambiguity
2. **Senior-First Accessibility**: Large touch targets, high contrast, clear hierarchy
3. **Consistent Predictability**: Health tools should never surprise users
4. **Information Density Balance**: Show critical data without overwhelming

---

## Color Palette

### Light Mode
- **Primary**: 210 75% 45% (Trustworthy clinical blue)
- **Primary Variant**: 210 65% 35% (Darker for emphasis)
- **Background**: 0 0% 98% (Soft white to reduce eye strain)
- **Surface**: 0 0% 100% (Pure white for cards/sheets)
- **Surface Variant**: 210 20% 95% (Subtle gray-blue for secondary containers)
- **On-Surface**: 210 15% 20% (Near-black with slight warmth)
- **On-Surface Variant**: 210 10% 45% (Medium gray for secondary text)

### Dark Mode
- **Primary**: 210 70% 65% (Lighter blue for dark backgrounds)
- **Primary Variant**: 210 80% 75% (Even lighter for emphasis)
- **Background**: 210 15% 12% (Deep blue-gray, not pure black)
- **Surface**: 210 12% 16% (Elevated surface tone)
- **Surface Variant**: 210 15% 20% (Subtle elevation)
- **On-Surface**: 0 0% 95% (Off-white for readability)
- **On-Surface Variant**: 210 10% 70% (Light gray for secondary text)

### Semantic Colors (Both Modes)
- **Success/In-Range**: 145 60% 45% (Calming green for BG in range)
- **Warning/High**: 35 85% 55% (Amber for high BG)
- **Error/Urgent**: 0 70% 50% (Clear red for urgent readings)
- **Info**: 200 75% 50% (Distinct from primary for tips/education)

---

## Typography

**Font Families**:
- Primary: 'Inter' (Google Fonts) - Exceptional readability at all sizes, optimized for screens
- Monospace: 'JetBrains Mono' - For numerical data (BG readings, nutrition values)

**Type Scale** (Senior-optimized, larger than standard):
- **Display**: 48px/1.1/700 - Onboarding headlines
- **H1**: 36px/1.2/700 - Page titles
- **H2**: 28px/1.3/600 - Section headers
- **H3**: 22px/1.4/600 - Card titles
- **Body Large**: 18px/1.5/400 - Primary content (standard apps use 16px)
- **Body**: 16px/1.5/400 - Secondary content
- **Caption**: 14px/1.4/400 - Metadata, labels
- **Numerical**: 24px/1.2/500 - BG readings, macro values (monospace)

**Senior Defaults (+2px to all sizes for 65+)**

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 8, 12, 16** (8px base grid)
- Tight spacing: p-2 (8px) - Within compact components
- Standard spacing: p-4 (16px) - Default container padding
- Section spacing: p-8 (32px) - Between major sections
- Page margins: px-4 md:px-8 lg:px-12 (16px/32px/48px responsive)
- Vertical rhythm: space-y-8 for stacked sections

**Container Strategy**:
- Max-width: max-w-7xl (1280px) for dashboard
- Content reading width: max-w-4xl for recipe details
- Forms: max-w-2xl centered for onboarding flows

**Grid Patterns**:
- Dashboard: 1-column mobile, 2-column tablet (md:), 3-column desktop (lg:)
- Recipe cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Meal planner: Single column with day cards

---

## Component Library

### Navigation
- **Top App Bar**: Sticky, 64px height, surface elevation-2, contains logo, language toggle (EN/ES flag icons), profile menu
- **Bottom Navigation** (Mobile): 56px height, 4-5 core actions (Dashboard, Planner, Recipes, Log BG, More), active state with primary color fill
- **Side Navigation** (Desktop): 240px width, collapsible, grouped by function (Plan, Track, Manage)

### Cards & Containers
- **Recipe Cards**: Rounded-2xl (16px radius), surface color, 8px elevation, image ratio 16:9, overlay gradient for text readability, title + quick stats (time, carbs, difficulty)
- **Meal Plan Day Cards**: Rounded-xl (12px radius), surface variant, border-l-4 with primary color accent, breakfast/lunch/dinner/snack slots
- **BG Reading Cards**: Rounded-lg (8px radius), color-coded left border (green/amber/red based on range), monospace numerical display, timestamp
- **Stat Cards** (Dashboard): Rounded-xl, gradient backgrounds (subtle, 5% opacity), large numerical values, sparkline micro-charts

### Forms & Inputs
- **Text Fields**: Outlined style, 56px height for touch, 16px padding, rounded-lg, label floats on focus, helper text below, dark mode consistent background
- **Dropdowns**: Material-style select with chevron icon, max-height with scroll for long lists
- **Steppers**: Numeric inputs with -/+ buttons, 48px touch targets
- **Voice Input Button**: Microphone icon, primary color, pulsing animation when active

### Data Visualization
- **Activity Rings**: 
  - 200px diameter on desktop, 160px mobile
  - 16px stroke width
  - Animated fill on load (0.8s ease-out)
  - Percentage label centered, numerical value below
  - Color: Primary for calories, Success for TIR, gradient for macros
- **BG Chart**: Line graph with shaded "in-range" zone (green background at 10% opacity), dotted threshold lines, time axis, interactive tooltips
- **Macro Breakdown**: Horizontal stacked bar, segment labels, percentage overlays

### Buttons & Actions
- **Primary**: Filled, primary color, white text, rounded-lg, 48px height, ripple effect
- **Secondary**: Outlined, primary color border and text, rounded-lg, 48px height
- **Text Button**: No background, primary color text, 40px height, subtle hover background
- **FAB** (Floating): 56px circle, primary color, bottom-right 16px margin, elevation-6, "Log BG" or "Add Meal" shortcuts
- **Icon Buttons**: 48px square, rounded-full, on-surface-variant color, hover surface overlay

### Lists & Tiles
- **Prescription List**: Avatar (pill icon), title (drug name), subtitle (dose + schedule), trailing checkbox for "taken", dividers between items
- **Shopping List**: Grouped by category (Produce, Proteins, etc.), checkboxes, strike-through when checked, quantity + unit labels
- **Recipe Ingredients**: Bulleted, quantity in monospace, ingredient name in body text, optional items in muted color

### Modals & Sheets
- **Bottom Sheets** (Mobile): Rounded top corners (24px), handle bar, swipe-to-dismiss, max-height 90vh
- **Dialogs** (Desktop): Centered, 560px max-width, rounded-xl, elevation-24, title + content + actions footer
- **Success/Error Snackbars**: Bottom-center, 4s auto-dismiss, action button optional, semantic color backgrounds

### Accessibility Indicators
- **Focus States**: 3px solid primary color outline, 2px offset
- **Touch Targets**: Minimum 48x48px (WCAG AAA)
- **Text-to-Speech Icon**: Persistent in recipe headers, speaker icon, toggles narration
- **High Contrast Toggle**: In settings, boosts all color contrasts by 20%

---

## Animation Philosophy

**Sparingly Applied**:
- Page transitions: 200ms fade
- Ring animations: 800ms ease-out on load only
- Button ripples: Material standard
- Loading states: Subtle skeleton screens, no spinners
- **Avoid**: Parallax, complex scroll-triggered effects, decorative motion

---

## Images

**Hero Section**: None (utility app, not marketing)
**Recipe Cards**: 16:9 images with fallback gradient + icon for user uploads
**Onboarding**: Illustration spot graphics (health icons, food illustrations) at 240x240px, positioned left of text on desktop
**Empty States**: Friendly illustrations (e.g., empty plate for no meal plan), 200x200px centered
**Profile/Avatars**: 96x96px circular for user profile, 40x40px for prescription icons

---

## Responsive Breakpoints

- **Mobile**: <640px (single column, bottom nav, full-width cards)
- **Tablet**: 640px-1024px (2-column grids, side drawer navigation)
- **Desktop**: >1024px (3-column grids, persistent side nav, multi-panel layouts)