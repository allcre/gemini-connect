# Flare Design System - Quick Reference

## Color Variables (Tailwind Classes)

```tsx
// Primary Colors
bg-primary              // Dusty pink #D4A5A5
bg-mauve                // Muted mauve #C4A3B3
bg-rose                 // Soft rose #D1A5B8
bg-blue                 // Soft blue #A5C4D4
bg-yellow               // Pale cream #F4E8C1
bg-purple               // Soft purple #B8A5C4
bg-gold                 // Gold sparkle #FFD700

// Text Colors
text-primary            // Dark text #2D2D2D
text-secondary          // Gray text #6B6B6B
text-muted              // Light gray #9B9B9B
text-light              // White text

// Gradients
gradient-main           // Pink → Yellow → Blue
gradient-pink-blue      // Pink → Blue
gradient-card           // Subtle pink gradient
gradient-subtle         // Transparent overlay
```

## Typography Classes

```tsx
// Font Families
font-logo               // Pacifico (cursive) - Logo only
font-display            // Instrument Serif - Headings
font-heading            // Instrument Serif - Headings  
font-body               // Inter - Body text

// Sizes
text-xs                 // 12px
text-sm                 // 14px
text-base               // 16px
text-lg                 // 18px
text-xl                 // 20px
text-2xl                // 24px
text-3xl                // 30px
text-4xl                // 36px
text-5xl                // 48px

// Custom Utilities
text-gradient           // Gradient text effect
text-heading            // Heading font + spacing
text-body               // Body font + spacing
```

## Shadows

```tsx
shadow-sm               // Subtle
shadow-soft             // Pink-tinted soft shadow
shadow-card             // Standard card shadow (most common)
shadow-elevated         // High elevation
shadow-glow-pink        // Pink glow effect
shadow-glow-purple      // Purple glow effect
```

## Border Radius

```tsx
rounded-sm              // 8px
rounded                 // 12px (default)
rounded-md              // 16px
rounded-lg              // 24px (recommended for cards)
rounded-xl              // 32px (profile cards)
rounded-full            // Circle (buttons, avatars)
```

## Common Component Snippets

### Profile Card
```tsx
<div className="bg-card shadow-card rounded-xl overflow-hidden max-w-sm">
  <div className="relative aspect-[4/5]">
    <img src="..." className="w-full h-full object-cover" />
    <div className="absolute top-4 right-4">
      <span className="bg-purple text-white px-3 py-1.5 rounded-full text-sm font-medium">
        92% Match
      </span>
    </div>
  </div>
  <div className="p-6">
    <h3 className="font-display text-2xl mb-2">Name, 25</h3>
    <p className="text-secondary text-sm mb-4">Location</p>
    <p className="text-body">Bio...</p>
  </div>
</div>
```

### Dark CTA Button
```tsx
<button className="btn-dark px-6 py-3 rounded-lg shadow-card">
  Match Now
</button>
```

### Gradient Button
```tsx
<button className="gradient-pink-blue text-white px-6 py-3 rounded-lg shadow-soft">
  Send Message
</button>
```

### Chat Bubble (Sent)
```tsx
<div className="btn-dark rounded-2xl px-4 py-3 max-w-xs ml-auto">
  <p className="text-white">Message</p>
</div>
```

### Chat Bubble (Received)
```tsx
<div className="bg-white shadow-sm rounded-2xl px-4 py-3 max-w-xs">
  <p className="text-primary">Message</p>
</div>
```

### Badge
```tsx
<span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
  Active
</span>
```

### Glass Card
```tsx
<div className="glass rounded-xl p-6">
  Content
</div>
```

### Logo Text
```tsx
<h1 className="font-logo text-5xl text-gradient-main">Flare</h1>
```

## Spacing Recommendations

```tsx
// Card padding
p-6                     // 24px (standard)
p-8                     // 32px (generous)

// Grid gaps
gap-6                   // 24px (recommended)

// Section margins
mb-4, mb-6, mb-8        // 16px, 24px, 32px
```

## Full-Screen Layout Pattern

```tsx
<div className="gradient-main min-h-screen">
  <div className="container mx-auto p-4">
    <div className="bg-card shadow-card rounded-xl p-6">
      {/* Content */}
    </div>
  </div>
</div>
```

## Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <Card key={item.id} />
  ))}
</div>
```

## Dark Mode Toggle

```tsx
// In your root HTML
<html className="dark">
  {/* App content */}
</html>
```

## Files Modified

1. ✅ `src/index.css` - Complete design system with CSS variables
2. ✅ `tailwind.config.ts` - Tailwind extended with design tokens
3. ✅ `package.json` - New fonts installed

## Installed Packages

```bash
@fontsource-variable/inter
@fontsource/instrument-serif
@fontsource/pacifico
```

## Testing Checklist

- [ ] Logo appears in Pacifico font
- [ ] Headings use Instrument Serif
- [ ] Body text uses Inter
- [ ] Cards have rounded-xl corners
- [ ] Buttons have shadow-card
- [ ] Gradients display correctly
- [ ] Dark mode works
- [ ] All colors are desaturated (not vibrant)

## Common Mistakes to Avoid

❌ `className="bg-[#FF006B]"` (Don't use vibrant colors)
✅ `className="bg-primary"` (Use design system colors)

❌ `className="font-logo text-base"` (Don't use Pacifico for body)
✅ `className="font-body"` (Use Inter for body text)

❌ `className="rounded-sm"` (Too small)
✅ `className="rounded-lg"` or `rounded-xl` (Better for cards)

❌ `className="p-2"` (Too tight)
✅ `className="p-6"` (Generous spacing)
