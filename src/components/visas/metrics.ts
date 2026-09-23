// Shared layout numbers for the Visas screen and the blocks it composes. They
// live here rather than in visas.tsx so a card can size its own corners and
// gutters without importing the screen — the same split offers/metrics.ts makes.
export const SIDE_PADDING = 20;
export const GAP = 12;
export const CARD_RADIUS = 22;

// The rounded surface every section sits on. One number so the hero, the
// services strip, the step flow and the help row all read as the same material.
export const PANEL_RADIUS = 20;
