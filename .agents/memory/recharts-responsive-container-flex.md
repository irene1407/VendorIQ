---
name: Recharts ResponsiveContainer in flex layouts
description: A Pie/donut chart rendered as a tiny clipped sliver instead of filling its card, caused by nesting ResponsiveContainer inside flex-1/percentage-height wrappers.
---

Nesting a `recharts` `ResponsiveContainer` inside a chain of `flex-1` / `min-h-0` / percentage-height wrapper divs (e.g. `CardContent` with `flex flex-col`, then an inner `flex-1 min-h-0 w-full` div, then `ResponsiveContainer width="100%" height="100%"`) can cause the container to measure an incorrect (very narrow or mismatched) size. The visible symptom is a pie/donut chart rendering as a thin, diagonal, clipped sliver of color in one corner of its card rather than a full ring — restarting the workflow does not fix it because it's a layout measurement issue, not stale state.

**Why:** ResponsiveContainer relies on its immediate parent having a concrete, resolvable size. Multiple layers of flex-grow + percentage heights don't always resolve reliably before/after mount, especially combined with enter animations (fade/slide) on ancestor elements.

**How to apply:** When a recharts chart inside a card looks broken/clipped, skip trying to fix the flex percentage chain. Instead give the chart's wrapper an explicit fixed pixel height (e.g. `<div style={{ width: '100%', height: 260 }}><ResponsiveContainer width="100%" height={260}>...`) and use fixed pixel `innerRadius`/`outerRadius` on `Pie` rather than percentages. Render the legend as a separate plain grid below the chart rather than recharts' built-in `<Legend>` component if further layout control is needed.
