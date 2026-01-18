# Flare Dating App Design System - Implementation Guide

## Overview
This design system implements the **Flare Dating App** aesthetic with a **desaturated pink palette** that creates a soft, inviting, and sophisticated atmosphere. The system combines playful gradients with refined typography for a modern dating app experience.

## Design Philosophy

### Core Principles
1. **Soft & Inviting**: Desaturated colors create a calm, approachable atmosphere
2. **Playful Yet Sophisticated**: Mix of playful gradients with refined typography
3. **Card-Based Layouts**: White cards floating on gradient backgrounds
4. **Rounded Everything**: Consistent border-radius for a friendly feel
5. **Generous White Space**: Clean, uncluttered interfaces
6. **High Contrast Text**: Dark text on light backgrounds for readability
7. **Multi-Color Gradients**: Pink-yellow-blue transitions for dreamy aesthetic

---

## Color Palette

### Primary Colors (Desaturated)
```css
Dusty Pink:     #D4A5A5  --  Primary brand color, main interactive elements
Muted Mauve:    #C4A3B3  --  Secondary accents, alternative buttons
Soft Rose:      #D1A5B8  --  Tertiary accents, highlights
Soft Blue:      #A5C4D4  --  Cool accent, balance to pink
Pale Yellow:    #F4E8C1  --  Warm accent, cream backgrounds
Soft Purple:    #B8A5C4  --  Badges, match indicators
Gold:           #FFD700  --  Stars, sparkles, premium features
```

### Background Colors
```css
Pure White:     #FFFFFF  --  Cards, main content areas
Warm Cream:     #FFF9F0  --  Subtle backgrounds, alternate sections
Dark:           #2D2D2D  --  Text, buttons, dark mode
```

### Text Colors
```css
Primary Text:   #2D2D2D  --  Main content (near-black)
Secondary:      #6B6B6B  --  Supporting text (medium gray)
Muted:          #9B9B9B  --  Timestamps, captions (light gray)
Light Text:     #FFFFFF  --  Text on dark backgrounds
```

### Gradients
```css
--gradient-main:        Pink → Yellow → Blue (180deg)
--gradient-pink-blue:   Pink → Blue (135deg)
--gradient-card:        Light Pink → Dusty Pink (135deg)
--gradient-subtle:      Transparent pink/blue overlay
--gradient-overlay:     White with transparency
```

---

## Typography System

### Font Families

#### Pacifico - Logo/Display Font
- **Use for**: App logo, brand name "Flare", playful titles
- **Character**: Cursive, playful, friendly
- **CSS**: `font-family: var(--font-display)` or class `font-logo`

#### Instrument Serif - Heading Font
- **Use for**: Card titles, section headings, elegant text
- **Character**: Editorial, sophisticated, timeless
- **CSS**: `font-family: var(--font-heading)` or class `font-display`

#### Inter Variable - Body Font
- **Use for**: Body text, UI labels, descriptions, chat messages
- **Character**: Clean, highly readable, modern
- **CSS**: `font-family: var(--font-body)` or default body text

### Font Scale
```
xs:     12px  --  Timestamps, fine print
sm:     14px  --  Secondary labels, captions
base:   16px  --  Body text, chat messages
lg:     18px  --  Subheadings
xl:     20px  --  Small headings
2xl:    24px  --  Card headings
3xl:    30px  --  Section titles
4xl:    36px  --  Page titles
5xl:    48px  --  Hero text
6xl:    60px  --  Display text
```

### Font Weights
```
light:      300
normal:     400  --  Body text
medium:     500  --  Emphasized text
semibold:   600  --  Headings, buttons
bold:       700  --  Strong emphasis
extrabold:  800  --  Display text
```

---

## Component Patterns

### Profile Cards
```tsx
<div className="bg-card shadow-card rounded-xl overflow-hidden max-w-sm">
  {/* Photo with aspect ratio */}
  <div className="relative aspect-[4/5]">
    <img src="photo.jpg" className="w-full h-full object-cover" />
    
    {/* Match badge - top right */}
    <div className="absolute top-4 right-4">
      <span className="bg-purple text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-elevated">
        <Star className="inline w-3 h-3 mr-1" />
        92% Match
      </span>
    </div>
  </div>
  
  {/* Content */}
  <div className="p-6">
    <h3 className="font-display text-2xl mb-2">Sarah, 25</h3>
    <p className="text-secondary text-sm mb-4">
      <MapPin className="inline w-4 h-4" /> San Francisco • 2 miles away
    </p>
    <p className="text-body leading-relaxed">
      Love hiking, coffee, and deep conversations...
    </p>
  </div>
</div>
```

### Buttons

#### Primary CTA (Dark Button)
```tsx
<button className="btn-dark px-6 py-3 rounded-lg shadow-card hover:shadow-elevated transition-all">
  Match Now
</button>
```

#### Gradient Button
```tsx
<button className="gradient-pink-blue text-white px-6 py-3 rounded-lg shadow-soft hover:shadow-card transition-all">
  Send Message
</button>
```

#### Outline Button
```tsx
<button className="bg-white border-2 border-primary text-primary px-6 py-3 rounded-lg hover:bg-primary hover:text-white transition-all">
  Learn More
</button>
```

#### Icon Button (Circular)
```tsx
<button className="w-12 h-12 rounded-full bg-primary text-white shadow-soft hover:shadow-card transition-all flex items-center justify-center">
  <Heart className="w-5 h-5" />
</button>
```

### Chat Bubbles

#### Sent Message
```tsx
<div className="flex justify-end mb-3">
  <div className="btn-dark rounded-2xl px-4 py-3 max-w-xs">
    <p className="text-white text-base">Hey! How's it going?</p>
    <span className="text-white/60 text-xs mt-1 block">2:34 PM</span>
  </div>
</div>
```

#### Received Message
```tsx
<div className="flex justify-start mb-3">
  <div className="bg-white shadow-sm rounded-2xl px-4 py-3 max-w-xs">
    <p className="text-primary text-base">Great! Want to meet up?</p>
    <span className="text-muted text-xs mt-1 block">2:35 PM</span>
  </div>
</div>
```

### Navigation Bar
```tsx
<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-elevated">
  <div className="flex justify-around items-center py-3 px-4">
    <button className="flex flex-col items-center gap-1 text-primary">
      <Home className="w-6 h-6" />
      <span className="text-xs font-medium">Home</span>
    </button>
    <button className="flex flex-col items-center gap-1 text-muted-foreground">
      <Users className="w-6 h-6" />
      <span className="text-xs">Matches</span>
    </button>
    <button className="flex flex-col items-center gap-1 text-muted-foreground">
      <MessageCircle className="w-6 h-6" />
      <span className="text-xs">Chat</span>
    </button>
    <button className="flex flex-col items-center gap-1 text-muted-foreground">
      <User className="w-6 h-6" />
      <span className="text-xs">Profile</span>
    </button>
  </div>
</nav>
```

### Badges & Pills
```tsx
{/* Status badge */}
<span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
  Active Now
</span>

{/* Match badge */}
<span className="bg-purple text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-soft">
  New Match
</span>

{/* Interest tag */}
<span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
  Coffee Lover
</span>
```

### Glass Morphism Cards
```tsx
<div className="glass rounded-xl p-6 backdrop-blur-xl">
  <h3 className="font-display text-xl mb-2">Profile Stats</h3>
  <div className="space-y-2">
    <div className="flex justify-between">
      <span className="text-secondary">Profile Views</span>
      <span className="font-semibold">127</span>
    </div>
    <div className="flex justify-between">
      <span className="text-secondary">Matches</span>
      <span className="font-semibold">42</span>
    </div>
  </div>
</div>
```

---

## Layout Patterns

### Full-Screen Gradient Background
```tsx
<div className="gradient-main min-h-screen">
  {/* Layer white cards on top */}
  <div className="container mx-auto p-4">
    <div className="bg-card shadow-card rounded-xl p-6">
      Content here
    </div>
  </div>
</div>
```

### Card Grid Layout
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {profiles.map(profile => (
    <ProfileCard key={profile.id} {...profile} />
  ))}
</div>
```

### Scrollable Card Stack (Tinder-style)
```tsx
<div className="relative h-[600px] w-full max-w-md mx-auto">
  {cards.map((card, index) => (
    <motion.div
      key={card.id}
      className="absolute inset-0 bg-card shadow-elevated rounded-xl"
      style={{ zIndex: cards.length - index }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
    >
      <ProfileCard {...card} />
    </motion.div>
  ))}
</div>
```

---

## Border Radius System

```css
--radius-sm:   8px   (0.5rem)   --  Small elements, inputs
--radius:      12px  (0.75rem)  --  Default, standard cards
--radius-md:   16px  (1rem)     --  Medium cards, modals
--radius-lg:   24px  (1.5rem)   --  Large cards, profile cards
--radius-xl:   32px  (2rem)     --  Extra large elements
--radius-full: 9999px           --  Circular buttons, avatars, badges
```

**Usage**: Apply `rounded-lg` or `rounded-xl` to most cards for the signature Flare look.

---

## Shadow System

```css
shadow-sm:       Subtle elevation (0 2px 8px)
shadow-soft:     Soft pink-tinted shadow (0 4px 16px)
shadow-card:     Standard card shadow (0 4px 20px)
shadow-elevated: Higher elevation (0 8px 24px)
shadow-glow-pink: Pink glow effect (0 0 40px)
shadow-glow-purple: Purple glow effect (0 0 40px)
```

**Usage**: Use `shadow-card` for most cards, `shadow-elevated` for modals and popovers.

---

## Spacing Guidelines

### Padding Scale
```
p-2:   8px   --  Tight spacing
p-4:   16px  --  Standard padding
p-6:   24px  --  Card padding (recommended)
p-8:   32px  --  Generous padding
p-12:  48px  --  Extra spacious
```

### Gap/Margin
```
gap-2:  8px   --  Tight gaps in flex/grid
gap-4:  16px  --  Standard gaps
gap-6:  24px  --  Generous gaps (recommended)
gap-8:  32px  --  Large gaps
```

**Best Practice**: Use `p-6` for card interiors and `gap-6` for card grids.

---

## Accessibility Guidelines

### Contrast Ratios
- **Body text**: 4.5:1 minimum (WCAG AA compliant)
- **Large text**: 3:1 minimum
- **UI elements**: 3:1 minimum

### Touch Targets
- **Minimum size**: 44x44px (iOS standard)
- **Recommended**: 48x48px for primary actions

### Focus States
All interactive elements have visible focus rings using `ring-primary` color.

```tsx
<button className="focus:ring-2 focus:ring-primary focus:ring-offset-2">
  Click me
</button>
```

---

## Theme Customization

### Changing Primary Color
Edit in `src/index.css`:
```css
:root {
  --primary: 0 23% 73%;  /* Change HSL values here */
}
```

### Updating Gradients
```css
:root {
  --gradient-main: linear-gradient(180deg, #YourColor1 0%, #YourColor2 50%, #YourColor3 100%);
}
```

### Swapping Fonts
```css
:root {
  --font-display: 'YourCursiveFont', cursive;
  --font-heading: 'YourSerifFont', serif;
  --font-body: 'YourSansFont', sans-serif;
}
```

Then install fonts via npm:
```bash
npm install @fontsource/your-font-name
```

And import in `index.css`:
```css
@import "@fontsource/your-font-name";
```

---

## Dark Mode

Dark mode is automatically supported. Toggle with:
```tsx
<html className="dark">
```

The system automatically adapts:
- Backgrounds become dark (#2D2D2D)
- Text becomes light
- Colors remain vibrant but slightly muted
- Shadows are enhanced for better visibility

---

## Common Patterns Summary

### Do's ✅
- Use white cards on gradient backgrounds
- Apply rounded corners (rounded-lg or rounded-xl)
- Use generous padding (p-6, p-8)
- Layer cards with shadow-card for depth
- Use Pacifico for logo/brand only
- Use Instrument Serif for headings
- Use Inter for body text
- Maintain high contrast text (dark on light)
- Use desaturated pink for primary actions

### Don'ts ❌
- Don't use vibrant/neon colors (keep it desaturated)
- Don't use square corners (always rounded)
- Don't use Pacifico for body text (readability)
- Don't overcrowd cards (generous spacing)
- Don't use thin borders (use shadows for depth)
- Don't mix too many colors in one component

---

## Quick Start Checklist

1. ✅ Fonts installed (`@fontsource-variable/inter`, `@fontsource/instrument-serif`, `@fontsource/pacifico`)
2. ✅ CSS variables defined in `src/index.css`
3. ✅ Tailwind config extended with design tokens
4. ✅ All utility classes available

**Start building with:**
```tsx
// Logo
<h1 className="font-logo text-5xl text-gradient-main">Flare</h1>

// Card
<div className="bg-card shadow-card rounded-xl p-6">
  <h2 className="font-display text-2xl mb-4">Heading</h2>
  <p className="text-body">Content here</p>
</div>

// Button
<button className="btn-dark px-6 py-3 rounded-lg shadow-card">
  Action
</button>
```

---

## Resources

- **Design Reference**: [Flare Dating App on Dribbble](https://dribbble.com/shots/25324794-Flare-Mobile-Dating-App-UI-UX-Design)
- **Color Tool**: [Figma Light Pink Colors](https://www.figma.com/colors/light-pink/)
- **Typography**: Font pairing best practices for dating apps
- **Component Library**: Built on shadcn/ui with Radix UI primitives

---

## Support & Maintenance

For design system updates or questions:
1. Check `src/index.css` for all CSS variables
2. See usage examples at bottom of `index.css`
3. Reference this guide for component patterns
4. Test changes in both light and dark mode

**Version**: 1.0.0 - Desaturated Pink Edition
**Last Updated**: January 2026
