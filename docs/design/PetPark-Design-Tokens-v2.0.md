# PetPark Official Design Book v2.0

**Direction:** Smart Assistant + Service Circle  
**Product model:** service-first + community-first  
**Primary question:** “Što treba tvom ljubimcu danas?”  
**Status:** Official working specification for PetPark.hr redesign  
**Generated for:** PetPark.hr Next.js App Router codebase

---

## 1. Token philosophy

PetPark v2 uses warm cream surfaces, deep green structure, orange action accents, and soft mint support states. Tokens should be implemented in `app/globals.css` because the audit shows Tailwind v4/CSS-variable setup and no top-level Tailwind config.

## 2. Color tokens

| Token               |     Value | Use                              |
| ------------------- | --------: | -------------------------------- |
| `--pp-bg`           | `#FBF4E8` | main page background             |
| `--pp-bg-soft`      | `#FFF7ED` | soft section background          |
| `--pp-surface`      | `#FFFFFF` | cards, panels                    |
| `--pp-surface-warm` | `#FFFAF1` | warm cards                       |
| `--pp-green-950`    | `#0B2F22` | strongest headline text          |
| `--pp-green-900`    | `#123829` | primary text/brand green         |
| `--pp-green-700`    | `#0F6B57` | interactive green, secondary CTA |
| `--pp-green-100`    | `#E7F3EA` | soft mint surfaces               |
| `--pp-orange-600`   | `#F97316` | primary CTA                      |
| `--pp-orange-500`   | `#FB8A22` | hover/highlight                  |
| `--pp-orange-100`   | `#FFE6D1` | orange badges/surfaces           |
| `--pp-border`       | `#EADFCC` | card/input borders               |
| `--pp-text`         | `#163528` | default text                     |
| `--pp-muted`        | `#5F6B63` | secondary text                   |
| `--pp-danger`       | `#DC5A3D` | lost/urgent                      |
| `--pp-success`      | `#3B8A5A` | found/success                    |
| `--pp-info`         | `#0F766E` | community/info                   |

## 3. Typography tokens

Recommended CSS variable strategy:

```css
--pp-font-display: var(--font-fraunces), var(--font-lora), Georgia, serif;
--pp-font-sans: var(--font-inter), var(--font-manrope), system-ui, sans-serif;
```

### Marketing display scale

| Token               |                    Desktop |          Mobile | Use                  |
| ------------------- | -------------------------: | --------------: | -------------------- |
| `--pp-text-hero`    | `clamp(48px, 5.2vw, 82px)` | automatic clamp | homepage hero        |
| `--pp-text-page`    |   `clamp(36px, 4vw, 64px)` | automatic clamp | public page headings |
| `--pp-text-section` | `clamp(24px, 2.2vw, 36px)` | automatic clamp | section titles       |
| `--pp-text-card`    |                     `20px` |          `18px` | card titles          |
| `--pp-text-body`    |                     `16px` |          `16px` | body                 |
| `--pp-text-meta`    |                     `13px` |          `12px` | meta labels          |

### Rule

Hero typography can be expressive. App/dashboard typography should be practical, not decorative.

## 4. Radius tokens

```css
--pp-radius-xs: 8px;
--pp-radius-sm: 12px;
--pp-radius-md: 16px;
--pp-radius-lg: 22px;
--pp-radius-xl: 28px;
--pp-radius-pill: 999px;
```

Use:

- buttons: `sm` or `pill`
- cards: `lg`
- homepage bento cards: `xl`
- avatar/pet images: `md` or full circle

## 5. Shadow tokens

```css
--pp-shadow-sm: 0 4px 14px rgba(18, 56, 41, 0.06);
--pp-shadow-md: 0 10px 28px rgba(18, 56, 41, 0.1);
--pp-shadow-lg: 0 22px 60px rgba(18, 56, 41, 0.14);
--pp-shadow-orange: 0 14px 32px rgba(249, 115, 22, 0.26);
```

## 6. Spacing tokens

```css
--pp-space-1: 4px;
--pp-space-2: 8px;
--pp-space-3: 12px;
--pp-space-4: 16px;
--pp-space-5: 20px;
--pp-space-6: 24px;
--pp-space-8: 32px;
--pp-space-10: 40px;
--pp-space-12: 48px;
--pp-space-16: 64px;
--pp-space-20: 80px;
--pp-space-24: 96px;
```

## 7. Layout tokens

```css
--pp-container: 1360px;
--pp-container-narrow: 1120px;
--pp-header-height: 76px;
--pp-mobile-header-height: 64px;
--pp-hero-orbit-size: clamp(360px, 40vw, 600px);
--pp-card-border: 1px solid var(--pp-border);
```

## 8. State tokens

| State            | Background        | Text             | Border            |
| ---------------- | ----------------- | ---------------- | ----------------- |
| default          | `--pp-surface`    | `--pp-text`      | `--pp-border`     |
| active           | `--pp-green-100`  | `--pp-green-900` | `--pp-green-700`  |
| selected service | `--pp-orange-100` | `--pp-green-900` | `--pp-orange-600` |
| lost             | `#FFF1EC`         | `--pp-danger`    | `#F4B7A8`         |
| found            | `#EEF7EF`         | `--pp-success`   | `#B7D9C0`         |
| disabled         | `#F3F0EA`         | `#9A9A92`        | `#E5DFD5`         |

## 9. CSS snippet

See `tokens/petpark-v2.tokens.css` in this package.
