# Travel Reverie 6.4 · Design System Addendum

## Editorial font layer

The Theme Studio font is now a global editorial choice shared by the five
memory universes. Each universe retains only the interface type that is
semantically necessary:

- Y2K: file names, HUD and window chrome
- Film: timecode, stock and scene metadata
- Sketchbook: paper marks may retain handwritten microcopy
- Watercolor: pigment annotations may retain brush microcopy

## Color translation, not literal recoloring

The same four controls are translated into each universe:

- `titleColor`: heading pigment or screen title
- `inkColor`: readable editorial ink
- `accentColor`: stickers, timecode, annotations and washes
- `paperColor`: card or paper substrate

Film fixes its paper substrate to preserve the dark cinema environment, so
that control is visibly disabled.

## Compact card principle

A collapsed card must not reserve a writing surface. Its complete height is
the cover plus an overlaid summary. The writing surface is introduced only
after an explicit expand action.

## Y2K decoration hierarchy

Emoji occupy high-z-index, pointer-transparent layers in outer gutters and
section corners. They may cross frames but must not cover reading columns or
controls.
