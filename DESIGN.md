# iPod Design System (Karan's iPod)

This document outlines the visual and structural standards for the "Karan's iPod" application. Adherence to these standards ensures a pixel-perfect, consistent hardware-native experience.

## Design Direction Snapshot

- **Aesthetic Name**: iPod Classic Hardware Native (Industrial Utilitarian)
- **DFII Score**: 17 (Excellent)
- **Differentiation Anchor**: The high-fidelity ClickWheel interaction and whole-number pixel alignment.

## 1. Color Palette

Primary brand and interface colors are standardized using CSS variables in `index.css`.

| Variable                | Hex Code  | Usage                                         |
| :---------------------- | :-------- | :-------------------------------------------- |
| `--ipod-blue`           | `#007AFF` | Primary Action, Selected State, Progress Bars |
| `--ipod-bg-white`       | `#FFFFFF` | Main Screen Background                        |
| `--ipod-bg-gray`        | `#F2F2F7` | Search Inputs, Secondary Backgrounds          |
| `--ipod-border`         | `#E5E5E5` | Dividers, List Item Borders                   |
| `--ipod-text-primary`   | `#000000` | Main Headers, Titles                          |
| `--ipod-text-secondary` | `#8E8E93` | Subtitles, Secondary Metadata                 |
| `--ipod-text-tertiary`  | `#AEAEB2` | Placeholders, Disabled States                 |

## 2. Iconography

All iconography must follow these strict stroke and sizing rules:

- **Stroke Weight**: Global standard is **2.0px**.
- **Active State**: Active icons (e.g., Shuffle/Repeat in Now Playing) should be tinted with `--ipod-blue`.
- **Library**: Primarily use `lucide-react`.

## 3. Typography

- **Font Family**: `Inter`, `-apple-system`, `sans-serif`.
- **Letter Spacing**: `-0.01em` (Global), `-0.015em` (List Items).
- **List Titles**: `17px`, `font-semibold`.
- **List Subtitles**: `13px`, `font-normal`.
- **Status Bar Title**: `18px`, `font-bold`.

## 4. Layout & Spacing

### List Views (MenuScreen, SearchScreen)

- **Item Min-Height**: `50px`.
- **Horizontal Padding**: `16px` (px-4).
- **Vertical Padding**: `8px` (py-2) to `10px` (py-2.5).
- **Dividers**: Bottom border or `divide-y` using `--ipod-border`.

### Now Playing Screen

- **Album Art**: `154px x 154px` (rounded-10).
- **Control Bar**: Lifted from bottom with `26px` padding.
- **Scrubber**: `3px` track height, `13px` knob.

## 5. Persistence Standards

All localized data must be prefixed with `ipod_` to prevent collisions:

- `ipod_chassis_color`
- `ipod_favorites_v2`
- `ipod_library_songs`

## 6. Feedback & Interaction

- **ClickWheel Sensitivity**: `20` degrees per scroll event.
- **Active States**: Immediate feedback using `active:brightness-95` for buttons.
- **Transitions**: Use `duration-75` or `duration-150` for navigation to maintain a "snappy" hardware feel.
