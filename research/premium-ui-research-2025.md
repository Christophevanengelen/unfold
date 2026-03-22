# Premium Mobile App UI Research Report
## For: Unfold Personal Momentum App
## Date: March 9, 2026

---

## 1. Executive Summary

This research analyzes 10 best-in-class apps recognized for premium, minimalist UI design in 2025-2026. The findings are synthesized into actionable design patterns for a personal momentum/wellness app that displays daily scores (0-100), dimension breakdowns (Love, Health, Work), sparkline trends, and AI insights.

**Key Finding:** The premium feeling comes from a precise combination of restraint (what you leave out), motion quality (how things move), typographic confidence (large, bold, purposeful text), and color discipline (limited palette, meaningful color changes). It is never about adding more visual elements.

---

## 2. App-by-App Analysis

### 2.1 Oura Ring App

**What makes it special:**
- Condensed five navigation tabs into three (Today, Vitals, My Health) -- radical simplification
- "One big thing" philosophy: the most critical score or insight is the hero element
- Small score circles at top provide at-a-glance status for Readiness, Sleep, Activity, Heart Rate, and Stress
- Color-based state system: body states are encoded as colors tied to personal baselines, providing instant visual feedback without reading numbers

**Icon approach:** Custom SVG icons matching their specific health metrics. Body-part and metric-specific iconography that no generic library provides.

**Animation style:** Smooth ring-fill animations for scores. Data transitions are gentle fades rather than hard cuts. Score circles animate on load to draw attention.

**Color/typography:** Predominantly dark UI with colored accents that carry semantic meaning (green = optimal, yellow = attention, red = concern). Clean sans-serif typography with large score numbers.

**Premium feeling created by:** Personalized baselines make every number feel meaningful to YOU specifically. The app never shows raw data -- it shows interpreted, contextual insights. Restraint in what surfaces at any given moment.

*Sources: [Oura Blog - New App Design](https://ouraring.com/blog/new-app-design/), [Oura Blog - New App Experience](https://ouraring.com/blog/new-oura-app-experience/), [TechRadar - Oura Revamped App](https://www.techradar.com/health-fitness/oura-ring-users-are-getting-a-revamped-ai-powered-app-and-samsung-galaxy-ring-users-are-going-to-be-seriously-jealous)*

---

### 2.2 Arc Browser

**What makes it special:**
- Adaptive color schemes that change to complement whatever website you are viewing
- Collapsible sidebar replaces traditional tab bar -- radical rethinking of a decades-old UI pattern
- Spaces concept for context switching (work, personal, research)
- Command bar as primary navigation (keyboard-first, search-driven)

**Icon approach:** Minimal custom icons. The browser itself is the canvas -- websites provide the visual variety. UI chrome uses very thin, subtle iconography.

**Animation style:** Smooth sidebar collapse/expand. Tab transitions feel spatial rather than flat. Color morphing between spaces. Physics-based spring animations for panel movements.

**Color/typography:** Each Space gets its own color identity. UI chrome is intentionally muted so content takes center stage. System font with confident sizing.

**Premium feeling created by:** The product feels alive because it adapts visually to what you are doing. Every interaction feels considered and intentional. The lack of traditional chrome (no visible tab bar, no toolbar clutter) creates a feeling of liberation.

*Sources: [The Shell Out - Arc Browser UI/UX Revolution](https://www.theshellout.com/p/arc-browser-ui-ux-revolution), [Technical Explore - Arc Browser Review 2025](https://www.technicalexplore.com/tech/arc-browser-review-2025-redefining-the-web-experience)*

---

### 2.3 Linear

**What makes it special:**
- Speed as a design principle: 100ms interaction target for everything
- Keyboard-first with full command palette navigation
- Extreme color restraint: monochrome black/white with very few bold accent colors
- High information density with low visual clutter -- shows a lot without feeling busy

**Icon approach:** Custom monochrome SVG icons. Minimal, geometric, consistent stroke weight. Issue type icons (bug, feature, improvement) are distinctive yet subtle.

**Animation style:** ~200ms ease-out transitions. Purposeful micro-interactions only -- nothing decorative. Panel slides, list reorders, and status changes all animate but never draw undue attention.

**Color/typography:** Inter and Inter Display fonts. 4px spacing unit grid. Dark-first design. Color is used sparingly and always carries meaning (status colors, priority indicators). Background: near-black. Text: high-contrast white/gray hierarchy.

**Premium feeling created by:** The relentless focus on speed. Every interaction completes before you expect it to. The monochrome palette with surgical color accents feels sophisticated. Undo-first confirmation patterns (act immediately, offer undo) feel confident and modern.

*Sources: [Linear - How We Redesigned the UI](https://linear.app/now/how-we-redesigned-the-linear-ui), [LogRocket - Linear Design Trend](https://blog.logrocket.com/ux-design/linear-design/), [Linear Changelog - New UI](https://linear.app/changelog/2024-03-20-new-linear-ui)*

---

### 2.4 Amie

**What makes it special:**
- Soothing color palette (soft blues, warm neutrals) that feels professional but not sterile
- Generous white space preventing visual overload
- Buttery smooth drag-and-drop with smart time-slot snapping
- Feels like a native app even in the browser

**Icon approach:** Clean, consistent line icons. Custom-designed to match their specific color palette and corner radius system.

**Animation style:** Fluid drag interactions. Calendar events have spring physics when moved. Transitions between views are cinematic but fast. The whole app feels like it is made of physical material.

**Color/typography:** Warm, inviting palette. Not the cold blue of Google Calendar or the utilitarian look of Outlook. Rounded sans-serif with generous line height. Colored tags and events create visual rhythm across the calendar grid.

**Premium feeling created by:** The emotional warmth. Most productivity apps feel clinical -- Amie feels welcoming. The drag physics make it feel tactile. Won Product Hunt Golden Kitty for design, recognized by the industry as a benchmark.

*Sources: [AI Tech Story - Amie Review](https://www.aitechstory.com/2025/05/30/amie-so-review-a-fresh-take-on-productivity-and-time-management/), [TrendingAITools - Amie](https://www.trendingaitools.com/ai-tools/amie/)*

---

### 2.5 Things 3

**What makes it special:**
- Two Apple Design Awards -- widely regarded as the gold standard for task management UI
- When opening a to-do, it smoothly transforms into a clear white paper surface ready for writing
- Additional details tucked away until needed -- progressive disclosure done perfectly
- Glass-like UI elements that let your wallpaper shine through (latest updates)

**Icon approach:** Minimal, custom-designed. The checkbox itself is the primary icon and has been refined to perfection -- satisfying completion animation.

**Animation style:** Unfolding animations that keep spatial context. Smooth transforms between list and detail views. The completion checkbox animation is legendary -- a small moment of delight repeated hundreds of times.

**Color/typography:** Clean white surfaces. Increased corner rounding for windows, dialogs, and to-dos. Glassy buttons that reflect and refract surroundings. System-native typography with strong hierarchy.

**Premium feeling created by:** German engineering precision applied to every pixel. The app does not try to impress with complexity -- it impresses with how simple and obvious everything feels. Repetitive micro-moments (checking a task) are made satisfying through careful animation.

*Sources: [Cultured Code - Things Features](https://culturedcode.com/things/features/), [Meet Daniel - Eight Years With Things 3](https://meetdaniel.me/blog/eight-years-with-things-3/)*

---

### 2.6 Raycast

**What makes it special:**
- Keyboard-first launcher that replaces multiple apps
- Buttery 120fps animations with mathematically precise corner radii
- Extension system with consistent UI components across thousands of community extensions
- The entire product is a command palette -- search-driven interaction model

**Icon approach:** Custom SVG icons for core features. Extension icons follow strict design guidelines. Monochrome with optional color accents.

**Animation style:** 120fps smooth transitions. Panel appearances/disappearances use physics-based spring curves. Everything feels instantaneous. Window management animations are fluid.

**Color/typography:** Dark-first with vibrant accent colors for differentiation. Clean, readable typography optimized for scanning command results quickly. High contrast for accessibility.

**Premium feeling created by:** Speed above everything. The app appears and responds faster than your brain expects. The consistency across all extensions (maintained by strict design system guidelines) creates trust. You never encounter a jarring visual inconsistency.

*Sources: [Raycast](https://www.raycast.com/), [Raycast Blog - iOS Launch](https://www.raycast.com/blog/raycast-for-ios)*

---

### 2.7 Apple Health / Apple Watch Activity Rings

**What makes it special:**
- The Activity Ring is one of the most recognizable data visualization patterns in consumer technology
- Three stacked circular rings (Move, Exercise, Stand) that fill as you progress
- Goal-driven design: each ring has a clear daily target, creating satisfaction upon completion
- The pattern has become a universal language for health progress

**Icon approach:** SF Symbols (Apple's proprietary icon system). Consistent, platform-native, available in multiple weights.

**Animation style:** Ring-fill animations with subtle bounce at completion. Confetti-like celebration animations when all three rings close. Smooth, physics-based interactions throughout.

**Color/typography:** Three distinct, vibrant colors per ring (red, green, blue) on a dark background. San Francisco font with a strong typographic scale. Large numbers for scores with smaller labels.

**Premium feeling created by:** The ring metaphor transforms abstract health data into a tangible, gamified experience. Closing your rings has become a cultural phenomenon. The visualization works because it reduces complex health data to a single, beautiful, goal-oriented graphic.

**Technical implementation:** SVG-based with two stacked circle elements per ring. Uses stroke-dasharray and stroke-dashoffset properties to create partial circle fills. Background circle shows the target, foreground circle shows progress.

*Sources: [Apple Developer - Activity Rings HIG](https://developer.apple.com/design/human-interface-guidelines/activity-rings), [DEV Community - Activity Rings with React and SVG](https://dev.to/wellallytech/activity-rings-build-your-own-health-dashboard-with-react-and-svg-49og)*

---

### 2.8 WHOOP

**What makes it special:**
- Three core metrics front and center: Recovery, Strain, and Sleep -- each with distinct visual dials
- Recovery score (0-100%) with color-coded zones (green/yellow/red)
- All-new Health tab unifying cardiovascular fitness with Healthspan metrics
- Shows how body systems connect and evolve over time

**Icon approach:** Custom metric-specific iconography. Minimal, functional icons focused on data communication rather than decoration.

**Animation style:** Dial and gauge animations for scores. Smooth transitions between metric views. Data loading uses subtle shimmer effects.

**Color/typography:** Dark UI with green/yellow/red semantic scoring. Bold score numbers dominate the hierarchy. Clean, athletic aesthetic. High contrast for readability during workouts.

**Premium feeling created by:** The app treats your body like a high-performance machine. The dial/gauge metaphors feel technical and precise. Daily recovery scores create a compelling ritual of checking in.

*Sources: [WHOOP - Everything Launched in 2025](https://www.whoop.com/us/en/thelocker/everything-whoop-launched-in-2025/), [Cybernews - WHOOP 5.0 Review](https://cybernews.com/health-tech/whoop-review/)*

---

### 2.9 Gentler Streak

**What makes it special:**
- Apple Design Award winner for sustainable fitness UX
- Takes a "kind" approach to fitness rather than shame-based tracking
- Soothing color palette with soft blues and greens
- For You tab combining streak data with personalized health insights
- Workout suggestions match your current energy level

**Icon approach:** Custom soft, rounded icons matching the gentle brand personality. Illustrations rather than hard-edged technical icons.

**Animation style:** Gentle, organic animations. Nothing jarring or aggressive. Streak visualizations build progressively. Transitions feel like breathing.

**Color/typography:** Soft blues and greens as primary palette. Rounded, friendly typography. Generous padding and spacing. Light backgrounds with subtle gradients.

**Premium feeling created by:** The emotional intelligence of the design. Instead of shouting at you to work harder, it meets you where you are. The design actively reduces anxiety about fitness, which paradoxically makes you want to use it more.

*Sources: [Apple Developer - Gentler Streak Design](https://developer.apple.com/news/?id=3m0ht22s), [Sketch Blog - Gentler Streak](https://www.sketch.com/blog/gentler-streak/), [Pixso - Gentler Streak UX Gems](https://pixso.net/articles/gentler/)*

---

### 2.10 Endel

**What makes it special:**
- Generative, abstract visualizations that respond to your current state
- No traditional dashboard -- the UI IS the content (soundscapes visualized)
- Minimal controls, maximum ambience
- Personalization through biometric data integration

**Icon approach:** Almost no traditional icons. The interface is primarily abstract shapes and gradients that shift based on the soundscape mode.

**Animation style:** Continuous, ambient motion. Generative art that responds to audio output. Smooth, hypnotic transitions between modes.

**Color/typography:** Full-spectrum gradients that shift based on context (focus = cool blues, relax = warm amber). Minimal text, large mode labels. The color IS the interface.

**Premium feeling created by:** The app feels like an art installation rather than a software product. There is nothing to learn or configure -- you just exist within it. The generative nature means the experience is unique every time.

---

## 3. Cross-App Pattern Analysis: What Creates "Premium"

### 3.1 The Seven Pillars of Premium UI

Based on analyzing all ten apps, premium feeling consistently comes from these seven elements:

| Pillar | Pattern | Anti-Pattern |
|--------|---------|-------------|
| **Speed** | 100-200ms transitions, instant response | Loading spinners, delayed feedback |
| **Restraint** | Show only what matters right now | Information overload, feature dumping |
| **Motion quality** | Physics-based springs, ease-out curves | Linear transitions, no animation |
| **Color discipline** | Limited palette, color carries meaning | Decorative color, rainbow UI |
| **Typography confidence** | Large scores, bold headlines, clear hierarchy | Small text, weak hierarchy, many sizes |
| **Spatial consistency** | 4-8px grid, consistent spacing, alignment | Random padding, inconsistent margins |
| **Personalization** | Data adapts to YOUR context/baselines | Generic dashboards, one-size-fits-all |

### 3.2 Universal Premium Patterns

1. **Dark-first or neutral-first**: 7 of 10 apps default to dark mode or offer it as the primary experience
2. **Score as hero**: Health/wellness apps place the primary score as the largest visual element
3. **Progressive disclosure**: Details hidden until requested, reducing cognitive load
4. **Semantic color only**: Color is never decorative -- it always communicates state or priority
5. **Keyboard/gesture shortcuts**: Power users get faster paths, not just tap targets
6. **Sound and haptics**: Premium apps include subtle audio/haptic feedback for key interactions
7. **Generous whitespace**: Elements breathe. Nothing feels cramped.

---

## 4. Score and Data Visualization Patterns

### 4.1 Score Display Approaches (0-100 scale)

| App | Visualization | When to Use |
|-----|--------------|-------------|
| **Oura** | Small colored circles at top + one hero score | When you have multiple dimension scores with one primary |
| **WHOOP** | Dial/gauge with colored zones | When the score maps to performance zones |
| **Apple Health** | Stacked rings showing goal progress | When tracking progress toward daily targets |
| **Gentler Streak** | Streak visualization with gentle gradients | When emphasizing consistency over absolute numbers |

### 4.2 Recommended Score Hierarchy for Unfold

Based on research, the following hierarchy works best for a momentum app with daily scores:

```
PRIMARY: Overall Momentum Score (0-100)
  - Large number, center stage
  - Circular ring or arc around it showing fill level
  - Color shifts based on score zone (not fixed color)

SECONDARY: Dimension Breakdown (Love, Health, Work)
  - Three smaller score indicators
  - Could be mini-rings (Apple pattern) or colored pills (Oura pattern)
  - Tap to expand for detail

TERTIARY: Sparkline Trends
  - 7-day or 30-day mini chart below each dimension
  - No axes, no labels on the sparkline itself
  - Direction and trend visible at a glance

CONTEXTUAL: AI Insight
  - Single sentence below the score
  - "Your Work momentum is building -- 3-day uptrend"
  - Changes daily, feels personalized
```

### 4.3 Sparkline Best Practices for React

Top libraries for sparkline implementation in React (2025):

| Library | Best For | Bundle Size |
|---------|----------|-------------|
| **Recharts** | Full-featured charts with sparkline mode | ~45KB gzipped |
| **MUI X Charts** | If already using MUI ecosystem | Part of MUI X |
| **Custom SVG** | Minimal dependency, maximum control | ~0KB (native) |
| **Tremor** | Dashboard-style sparklines with Tailwind | ~25KB gzipped |

**Recommendation for Unfold:** Custom SVG sparklines. For a premium app, custom SVG gives you:
- Zero dependency overhead
- Full control over animation (use CSS transitions or Framer Motion)
- Exact color matching to your design tokens
- Responsive sizing without library constraints

A sparkline is fundamentally just a polyline SVG element with calculated points. Implementation is straightforward:
```
<svg viewBox="0 0 100 30">
  <polyline points="0,25 15,20 30,22 45,15 60,18 75,10 90,8 100,5"
    fill="none" stroke="currentColor" stroke-width="1.5" />
</svg>
```

### 4.4 Ring/Arc Score Visualization (React + SVG)

The Apple Activity Ring pattern is the gold standard for score visualization. Technical approach:

- Two stacked SVG `<circle>` elements per ring
- Background circle: shows the full target (muted color)
- Foreground circle: shows progress using `stroke-dasharray` and `stroke-dashoffset`
- Animated on mount using CSS transition on `stroke-dashoffset`
- Color intensity increases as score approaches 100

This pattern directly applies to showing an overall Momentum Score (0-100) with three dimension sub-rings (Love, Health, Work).

---

## 5. Modern Interaction Patterns

### 5.1 Animation Timing Standards

| Interaction | Duration | Easing | Example |
|------------|----------|--------|---------|
| Micro-feedback (button press) | 50-100ms | ease-out | Button scale on tap |
| State change (toggle, checkbox) | 150-200ms | ease-out | Score update animation |
| Panel slide (drawer, modal) | 200-300ms | spring (damping: 25) | Detail panel opening |
| Page transition | 250-350ms | ease-in-out | View switching |
| Data loading (skeleton) | 1000-2000ms | linear pulse | Content shimmer |
| Score fill animation | 600-800ms | ease-out with slight overshoot | Ring filling on page load |

### 5.2 Gesture Patterns That Feel Premium

1. **Swipe to navigate between dimensions**: Love <-> Health <-> Work with haptic feedback at boundaries
2. **Pull-to-refresh with branded animation**: Custom animation during refresh (not default spinner)
3. **Long-press for quick actions**: Context menu with blur background
4. **Pinch to zoom time range**: On sparkline charts, pinch to switch between 7d/30d/90d views
5. **Drag to reorder priorities**: Spring physics on drop, subtle shadow during drag

### 5.3 Micro-Interactions Worth Implementing

- **Score counter animation**: Numbers count up from 0 to final score on page load
- **Dimension indicator pulse**: Subtle glow when a dimension score changes
- **AI insight typing effect**: Insight text appears character-by-character, feeling like live AI generation
- **Streak flame animation**: If maintaining a momentum streak, subtle animated indicator
- **Completion haptic**: Device vibration pattern when daily check-in is complete

---

## 6. Icon Library Comparison for React (2025-2026)

### 6.1 Detailed Comparison

| Library | Icons | Styles | Bundle (50 icons) | Grid | Weekly Downloads | Best For |
|---------|-------|--------|-------------------|------|-----------------|----------|
| **Lucide** | 1,500+ | 1 (outline) | ~5.16 KB | 24x24 | ~29.4M | General purpose, most popular |
| **Phosphor** | 1,200+ | 6 (thin/light/regular/bold/fill/duotone) | ~larger (16-18x overhead) | 24x24 | ~2M | Design flexibility, visual hierarchy |
| **Heroicons** | 450+ | 3 (outline/solid/mini) | ~3.49 KB | 24x24 / 20x20 | ~5M | Tailwind CSS projects |
| **Radix Icons** | 300+ | 1 (outline) | Minimal | 15x15 | ~1.5M | Radix UI ecosystem |
| **Flowbite Icons** | 500+ | 2 (outline/solid) | Moderate | 24x24 | Growing | Flowbite/Tailwind ecosystem |
| **Custom SVG** | Unlimited | Custom | Zero overhead | Custom | N/A | Premium, branded experiences |

### 6.2 Analysis by Use Case

**For Unfold specifically (Flowbite already in stack):**

The project already uses `flowbite-react-icons`. This is a pragmatic baseline for general UI icons (navigation, settings, common actions). However, for the premium momentum/wellness features specifically:

**Tier 1 -- General UI (keep Flowbite):**
Navigation icons, settings, menu, close, search, filters. These are commodity icons where consistency matters more than uniqueness. Flowbite handles this well.

**Tier 2 -- Feature Icons (consider Phosphor for its weight variants):**
Phosphor's six weight options (thin, light, regular, bold, fill, duotone) provide unmatched ability to create visual hierarchy. A "selected" dimension could use the bold weight while unselected dimensions use thin. This creates a sophisticated interaction without changing the icon shape.

However, Phosphor's larger bundle overhead (16-18x ratio) is a real cost.

**Tier 3 -- Score/Metric Visualization (custom SVG):**
The Love, Health, and Work dimension icons should be custom SVGs. No icon library will have icons that perfectly express Unfold's specific concept of these three life dimensions. Custom SVGs also allow:
- Animated state changes (icon morphs based on score)
- Exact color token matching
- Unique visual identity that cannot be replicated by competitors using the same library

### 6.3 Recommendation

**Primary library: Keep Flowbite (already integrated)**
- Covers 80% of UI icon needs
- Consistent with existing codebase
- Good Tailwind integration

**For premium differentiation: Custom SVG for the 3 dimension icons + score visualization**
- Love, Health, Work icons should be bespoke
- Score rings, sparklines, and data viz elements should be custom SVG
- This is where visual identity lives
- Consider commissioning 10-15 custom icons for core momentum features

**Do NOT switch to Lucide or Phosphor** -- the migration cost is not justified when Flowbite already works. The premium feeling comes from the custom elements, not from swapping one generic library for another.

---

## 7. Actionable Design Recommendations for Unfold

### 7.1 Score Display System

**Hero Score (Momentum Score 0-100):**
- Use a single arc or ring visualization (SVG-based)
- Score number in the center, large (48-64px), bold weight
- Arc color transitions through brand palette based on score zone:
  - 0-30: Muted / needs attention
  - 31-60: Building / on track
  - 61-85: Strong / great momentum
  - 86-100: Peak / exceptional
- Animate the arc fill on page load (600-800ms, ease-out with slight overshoot)

**Dimension Scores (Love, Health, Work):**
- Three smaller circular indicators or colored pills below the hero
- Custom SVG icons inside each (not library icons)
- Tap to expand into detailed view with sparkline
- Each dimension gets a subtle color accent from the brand palette

**Sparkline Trends:**
- Custom SVG polylines, no charting library dependency
- Show 7-day trend by default
- No axes or labels on the sparkline -- pure shape
- Gradient fill below the line (transparent at bottom)
- Animate draw-on from left to right on load

**AI Insight:**
- Single line of personalized text below scores
- Typing animation on first appearance (character-by-character, 30ms per char)
- Changes daily based on score patterns
- Examples: "Your Health momentum has climbed 12 points this week"

### 7.2 Animation System

Implement a consistent animation system with these presets:

```css
/* Micro (button feedback) */
--duration-micro: 100ms;
--ease-micro: cubic-bezier(0.25, 0.1, 0.25, 1);

/* Standard (state changes, toggles) */
--duration-standard: 200ms;
--ease-standard: cubic-bezier(0.25, 0.1, 0.25, 1);

/* Emphasized (panels, modals, score animations) */
--duration-emphasized: 350ms;
--ease-emphasized: cubic-bezier(0.34, 1.56, 0.64, 1); /* slight overshoot */

/* Score fill */
--duration-score: 700ms;
--ease-score: cubic-bezier(0.16, 1, 0.3, 1);
```

### 7.3 Color Strategy

Following the existing Unfold design system (muted purple / mauve neutrals), apply the Oura-inspired semantic color layer:

- **Score zones** should use subtle hue shifts within the brand palette, NOT traffic-light red/yellow/green
- Keep the muted, sophisticated purple anchor (#7C6BBF)
- Let score state be communicated through saturation and brightness changes rather than hue changes
- Dark mode: deeper, richer tones -- not inverted

### 7.4 Typography for Data

| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| Hero score number | 48-64px | Bold/Black | Center of ring visualization |
| Score label | 12-14px | Medium | "Momentum Score" below number |
| Dimension score | 28-36px | Semibold | Inside dimension indicators |
| Dimension label | 11-13px | Medium | "Love" / "Health" / "Work" |
| Sparkline label | 10-12px | Regular | Date range indicator |
| AI insight text | 14-16px | Regular | Single line, conversational |
| Section headers | 18-22px | Semibold | "Today" / "Trends" / "Insights" |

### 7.5 What to Steal from Each App

| From | Steal This | Apply To |
|------|-----------|----------|
| **Oura** | "One big thing" hierarchy + small score circles at top | Momentum Score hero + dimension pills |
| **Linear** | 200ms ease-out + keyboard shortcuts + color restraint | All UI transitions + power-user shortcuts |
| **Things 3** | Satisfying completion micro-animation | Daily check-in completion moment |
| **Amie** | Warm color palette + buttery drag physics | Overall emotional warmth of the app |
| **Raycast** | 120fps animation quality + instant response | Performance bar for all interactions |
| **Apple Health** | Ring visualization pattern for progress | Momentum Score ring + dimension sub-rings |
| **WHOOP** | Score zones with color-coded dials | Score interpretation zones |
| **Gentler Streak** | Kind, supportive UX tone | AI insights messaging tone |
| **Arc** | Adaptive color that responds to context | Score-based color shifts |
| **Endel** | Ambient, living interface | Background subtle animation on dashboard |

---

## 8. Technical Implementation Priority

### Phase 1: Score Foundation
1. Custom SVG ring component for Momentum Score (0-100)
2. Three dimension indicator components (Love, Health, Work) with custom SVG icons
3. Score fill animation system (CSS transitions on SVG stroke-dashoffset)
4. Score zone color mapping using existing design tokens

### Phase 2: Data Visualization
5. Custom SVG sparkline component (7-day trend, no library dependency)
6. Score counter animation (number counts up on load)
7. Dimension detail panel with expanded sparkline view
8. AI insight display with typing animation

### Phase 3: Premium Polish
9. Gesture navigation between dimensions (swipe)
10. Pull-to-refresh with branded animation
11. Haptic feedback for key interactions
12. Ambient background animation (subtle, Endel-inspired)

---

## Sources

### App Research
- [Oura Blog - New App Design](https://ouraring.com/blog/new-app-design/)
- [Oura Blog - New App Experience](https://ouraring.com/blog/new-oura-app-experience/)
- [Linear - How We Redesigned the UI](https://linear.app/now/how-we-redesigned-the-linear-ui)
- [LogRocket - Linear Design Trend](https://blog.logrocket.com/ux-design/linear-design/)
- [Linear Changelog - New UI](https://linear.app/changelog/2024-03-20-new-linear-ui)
- [The Shell Out - Arc Browser UI/UX Revolution](https://www.theshellout.com/p/arc-browser-ui-ux-revolution)
- [Technical Explore - Arc Browser Review](https://www.technicalexplore.com/tech/arc-browser-review-2025-redefining-the-web-experience)
- [Cultured Code - Things Features](https://culturedcode.com/things/features/)
- [Meet Daniel - Eight Years With Things 3](https://meetdaniel.me/blog/eight-years-with-things-3/)
- [Raycast](https://www.raycast.com/)
- [Apple Developer - Activity Rings HIG](https://developer.apple.com/design/human-interface-guidelines/activity-rings)
- [WHOOP - Everything Launched in 2025](https://www.whoop.com/us/en/thelocker/everything-whoop-launched-in-2025/)
- [Gentler Streak](https://gentler.app/)
- [Apple Developer - Gentler Streak Design](https://developer.apple.com/news/?id=3m0ht22s)
- [Sketch Blog - Gentler Streak](https://www.sketch.com/blog/gentler-streak/)

### Design Trends
- [Chop Dawg - UI/UX Design Trends 2025](https://www.chopdawg.com/ui-ux-design-trends-in-mobile-apps-for-2025/)
- [Design Studio UIUX - Mobile App Trends 2026](https://www.designstudiouiux.com/blog/mobile-app-ui-ux-design-trends/)
- [Fuselab Creative - App Design Trends 2025](https://fuselabcreative.com/mobile-app-design-trends-for-2025/)
- [Primotech - Micro-Interactions and Motion 2026](https://primotech.com/ui-ux-evolution-2026-why-micro-interactions-and-motion-matter-more-than-ever/)
- [BricxLabs - Micro Animation Examples 2025](https://bricxlabs.com/blogs/micro-interactions-2025-examples)

### Icon Libraries
- [Lucide - Comparison](https://lucide.dev/guide/comparison)
- [Medium - React Icons Bundle Size Benchmark](https://medium.com/codetodeploy/the-hidden-bundle-cost-of-react-icons-why-lucide-wins-in-2026-1ddb74c1a86c)
- [shadcn Design - Best Icon Libraries](https://www.shadcndesign.com/blog/5-best-icon-libraries-for-shadcn-ui)
- [Mighil - Best React Icon Libraries 2026](https://mighil.com/best-react-icon-libraries)
- [Untitled UI - Premium Icon Sets 2026](https://www.untitledui.com/blog/icon-sets)

### Data Visualization
- [DEV Community - Activity Rings with React and SVG](https://dev.to/wellallytech/activity-rings-build-your-own-health-dashboard-with-react-and-svg-49og)
- [Merge - Best Designed Health Apps](https://merge.rocks/blog/8-best-designed-health-apps-weve-seen-so-far)
- [MUI - React Sparkline Chart](https://mui.com/x/react-charts/sparkline/)
- [shadcn - Table Sparkline Charts](https://www.shadcn.io/blocks/tables-sparkline)
