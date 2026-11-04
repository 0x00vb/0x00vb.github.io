# Design

## Scene
A visitor opens a shared engineering article in a bright office, then returns to browse; another reader switches to dark mode at night. Light is the first-visit default, with a persistent explicit toggle.

## Direction
A quiet personal machine. Cool paper, ink, violet detail. Lowercase custom wordmark, an inline knowledge graph that filters the archive, precise mono metadata, readable sans body. Inspired by the independence of alexine.rip without reproducing its assets or copy.

## Layout
A 1000px page with a narrow left annotation gutter and a 760px reading/index surface. Spacious introduction, a chronological archive grouped by year with compact title/ISO-date rows, no cards or repeated rules. No arrows, graph caption, or explanatory section copy. About is an inline disclosure; the graph lives in the hero. Reading measure 67ch. Mobile collapses the gutter and wraps filters without horizontal scrolling.

## Typography
System sans for reading. Locally bundled Geist Mono for the wordmark and technical metadata, chosen for its square-cut, machine-label shapes. No remote font requests.

## Color
Restrained. Cool white and charcoal neutrals with violet links and wireframe. Dark mode uses violet-black rather than pure black. CSS tokens use OKLCH.

## Motion
The graph uses a small transparent WebGL edge layer with shallow node depth and spring-smoothed pointer parallax, capped at a few pixels. Accessible DOM labels share the same perspective projection. SVG remains the flat fallback for unavailable/lost WebGL, touch-only pointers and reduced motion. The graph drifts by a few pixels briefly, then settles. Hover pulls connected neighbors slightly; direct dragging preserves the grab point, moves connected edges, and hands release velocity into a critically damped spring. Motion pauses offscreen and for keyboard use; reduced motion keeps positions static except while directly dragging. Brief initial text reveal, 160ms press feedback, 180ms crossfade for pointer navigation where supported. Search and keyboard actions update immediately. No scroll hijacking or hidden reading content.
