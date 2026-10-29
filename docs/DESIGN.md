# Scientific interface

The masthead spans the canvas. A narrow curriculum sidebar identifies the active lesson and saved completion. Tabs sit above the explanation and experiment, making each lesson's four sections easy to find.

## Palette and typography

[Shared tokens](../src/styles/tokens.css) define the palette, font stacks, and surface treatment. [Global styles](../src/styles.css) handle layout and shared components; [experiment styles](../src/styles/experiments.css) cover the gradient guide, controls, vector handles, and challenge.

| Role                                 | Color   |
| ------------------------------------ | ------- |
| Canvas                               | #0B111B |
| Sidebar                              | #0D1521 |
| Panels                               | #121C2A |
| Raised surfaces                      | #192638 |
| Fine borders                         | #293B50 |
| Primary text                         | #EDF1F5 |
| Secondary text                       | #A7B6C8 |
| Muted text                           | #7F94AC |
| Interactive controls and predictions | #65D6C3 |
| Teal hover                           | #83E5D5 |
| Contours and learning-rate details   | #65BCE8 |
| Residuals and optimization paths     | #E7B777 |
| Error accent                         | #F08C8C |

Local sans-serif fonts serve navigation, controls, and explanations. Georgia supplies the major headings. Code, parameters, and numerical output use monospace and tabular numerals. KaTeX supplies bundled mathematical fonts.

Targets, predictions, errors, and cluster membership have distinct plot tokens. Use shapes, line styles, text, or tables alongside color. Chart strokes do not grow thicker when a figure expands.

## Lesson composition

At wide desktop widths, the explanation takes about two fifths of the learning grid and the experiment takes three fifths. Both panels align beneath the lesson tabs. The masthead is 64 px high and the sidebar starts at 240 px wide.

Gradient descent opens with a compact update-rule guide beside the computed loss landscape. Its complete intuition, prerequisites, notation, assumptions, and worked example remain available in an expandable explanation. Derivation, Python, and practice remain separate tabs.

At smaller widths, the panels stack in reading order. Section links provide direct access to the experiment. Below 700 px, the curriculum uses an inert, off-canvas drawer with keyboard focus handling. Long equations, code, and tables scroll within their own regions.

Gradient Reset restores the starting slope, intercept, path, and last-update inspection while keeping the current dataset and chosen learning rate.

Completion and previous/next navigation sit below the panels. Completion remains an explicit learner action.

## Exploration

[ParameterFocus](../src/components/math/ParameterFocus.tsx) connects control focus to the equation guide without changing model state. Selecting a term explains its role; focusing the learning-rate slider boxes α in the update rule.

[SymbolDefinitions](../src/components/math/SymbolDefinitions.tsx) retains the complete definition list and opens individual explanations in a focus-managed dialog.

Vector endpoints support pointer dragging, arrow keys, Shift for larger steps, and Home for a zero vector. Sliders provide the same component controls. A circle and diamond distinguish the two endpoints.

The regression challenge is optional. It uses the eight-point example dataset and evaluates mean squared error through the existing engine. Completion records reaching the target during that visit. Restarting clears that achievement; the main Reset also restores the display controls and challenge state.

## Mathematical scenery

[MathematicalBackdrop](../src/components/MathematicalBackdrop.tsx) renders a static, lesson-specific SVG motif and authentic equations. It never consumes experiment parameters or represents live results. It is memoized, inert, hidden from assistive technology, and excluded from pointer input.

Decoration uses roughly 6% opacity, falling to 4% on mobile. Opaque reading surfaces keep the center quiet. There is no animation loop.

## Review changes

Inspect explanation, derivation, code, quiz feedback, and active experiments. Compare 1440, 1024, and 390 px layouts, then check compact widths, enlarged text, keyboard access, and reduced motion. Review contrast on actual surfaces, including hover and focus.

The screenshot command captures the real gradient experiment after nine steps. Browser tests also capture its desktop, tablet, and mobile composition. Automated accessibility checks supplement visual and keyboard review; they do not establish complete conformance.
