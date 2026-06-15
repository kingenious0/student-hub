# 🔥 NOBLE FUNDED — ANTIGRAVITY DESIGN ARSENAL

## The Most Complete Design Resource Library on the Internet

### For Antigravity IDE · Cursor · Claude Code · Codex · ChatGPT · All AI Agents

> **Status:** Living document — scraped from GitHub, Reddit, X/Twitter, Medium, Dev.to, YouTube, Blogs, Obsidian communities, and deep GitHub topic crawls.  
> **Purpose:** Drop these into your Antigravity IDE as skills, rules, references, or bookmarks. Every entry is real, verified, and additive.

-----

## 📋 TABLE OF CONTENTS

1. [🤖 AI Agent Skills (Antigravity / Claude Code / Cursor / Codex)](#1-ai-agent-skills)
1. [🎨 Cursor Rules for Design](#2-cursor-rules-for-design)
1. [🛠️ MCP Servers for Design](#3-mcp-servers-for-design)
1. [🧩 Component Libraries & UI Kits](#4-component-libraries--ui-kits)
1. [✨ Animation & Motion Libraries](#5-animation--motion-libraries)
1. [🌐 3D, WebGL & Creative Coding](#6-3d-webgl--creative-coding)
1. [🏗️ Design Systems & Style Guides](#7-design-systems--style-guides)
1. [🎨 Color Tools & Palettes](#8-color-tools--palettes)
1. [🔤 Typography & Font Tools](#9-typography--font-tools)
1. [🧱 CSS Magic & Effects](#10-css-magic--effects)
1. [🪙 Design Tokens & Figma Bridge](#11-design-tokens--figma-bridge)
1. [🧠 Obsidian for Designers & Devs](#12-obsidian-for-designers--devs)
1. [💡 Claude Design & DESIGN.md Prompts](#13-claude-design--designmd-prompts)
1. [🎭 Icon Libraries](#14-icon-libraries)
1. [🚀 AI-Powered Design Builders](#15-ai-powered-design-builders)
1. [📚 Mega Awesome Lists (Meta-Collections)](#16-mega-awesome-lists)
1. [🛸 Advanced Frontend Starter Templates](#17-advanced-frontend-starter-templates)
1. [🔧 Dev Tools & Productivity Add-ons](#18-dev-tools--productivity-add-ons)
1. [🎓 Learning & Creative Inspiration](#19-learning--creative-inspiration)
1. [🌍 Communities to Follow](#20-communities-to-follow)

-----

## 1. 🤖 AI AGENT SKILLS

> These are SKILL.md-based libraries. They work natively in Antigravity, Claude Code, Cursor, Codex CLI, Gemini CLI, Windsurf, OpenCode, and GitHub Copilot.

### 🥇 TIER 1 — INSTALL THESE FIRST

|Repo                                                                                                 |Stars   |What It Does                                                                                                                                                            |
|-----------------------------------------------------------------------------------------------------|--------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|[sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)          |40k+    |**THE BIG ONE.** 1,500+ installable agent skills. Best-in-class installer CLI, bundles, workflows. Made for Antigravity first. `npx antigravity-awesome-skills --claude`|
|[VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)                  |—       |1,000+ curated skills, most contributed community repo. Includes official Anthropic + Google + community skills. Works with every agent.                                |
|[anthropics/skills](https://github.com/anthropics/claude-code)                                       |Official|**Anthropic’s official skills.** docx, pptx, xlsx, pdf, data-analysis, frontend-design, algorithmic-art, mcp-builder, and more. Start here for official quality.        |
|[ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)              |—       |Curated shortlist: Brand Build (59-skill library), Brand Guidelines, SEO skills, Domain Brainstormer, Internal Comms, MCP Builder, UI/UX Suite.                         |
|[travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)                  |—       |Focused on Claude Code. Covers webapp-testing, brand-guidelines, internal-comms, skill-creator, superpowers.                                                            |
|[rohitg00/awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit)      |—       |135 agents, 35 curated skills, 42 commands, 176+ plugins. Includes `ui-ux-suite` (12-dimension design audit — WCAG 2.1, APCA, OKLCH scoring).                           |
|[GetBindu/awesome-claude-code-and-skills](https://github.com/GetBindu/awesome-claude-code-and-skills)|—       |Strong quality-over-quantity shortlist. Good for installing lean.                                                                                                       |
|[karanb192/awesome-claude-skills](https://github.com/karanb192/awesome-claude-skills)                |—       |Smaller, community-first Claude library. Good companion to sickn33.                                                                                                     |

### 🎨 DESIGN-SPECIFIC SKILLS

|Repo / Skill                                                                                                                                      |What It Does                                                                                                                                                                         |
|--------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|[anthropics/frontend-design SKILL.md](https://github.com/anthropics/claude-code/blob/main/plugins/frontend-design/skills/frontend-design/SKILL.md)|Official Anthropic frontend-design skill. Auto-loads on frontend prompts. Kills “AI slop” output. Drop into `.claude/skills/`, `.cursor/rules/`, `AGENTS.md`.                        |
|[carmahhawwari/ui-design-brain](https://github.com/carmahhawwari/ui-design-brain)                                                                 |60+ component patterns sourced from component.gallery. Gives AI real knowledge of best practices, accessibility, design philosophy. `git clone into ~/.cursor/skills/ui-design-brain`|
|`Dammyjay93/interface-design` (via sickn33 catalog)                                                                                               |Design engineering for Claude Code. Persistent design system file, `/init`, `/audit`, `/extract` slash commands. Enforces token consistency between sessions.                        |
|`Leonxlnx/taste-skill` (via ComposioHQ/awesome-claude-skills)                                                                                     |Premium UI generation. GSAP motion, brutalist/minimalist/soft variants, 3-dial parameterization (variance, motion, density).                                                         |
|`canvas-design` (via ComposioHQ awesome-claude-skills)                                                                                            |Design philosophy expressed visually: two-phase (philosophy → artifact). 90% visual / 10% text. Anti-template by construction.                                                       |
|`rampstackco/brand-build` (via ComposioHQ)                                                                                                        |59-skill library for full website lifecycle: brand, design, content, SEO, dev, ops, growth. Includes Ahrefs MCP-powered SEO audit.                                                   |
|`OneRedOak/claude-code-workflows → design-review`                                                                                                 |UI/UX review workflow: subagents + `/design-review` slash command + CLAUDE.md memory + Playwright MCP accessibility coverage.                                                        |
|[coleam00/excalidraw-diagram-skill](https://github.com/coleam00/excalidraw-diagram-skill)                                                         |Diagram skill that argues visually. Playwright render-validate loop catches overlap, misalignment, bad spacing.                                                                      |
|`anthropics/algorithmic-art` (Official skill)                                                                                                     |Create generative art using p5.js with seeded randomness.                                                                                                                            |

### 🔧 INSTALL COMMANDS

```bash
# Install the monster bundle (1,500+ skills at once — for Antigravity/Claude Code)
npx antigravity-awesome-skills --claude

# Official Anthropic frontend-design skill only
npx skills add anthropics/frontend-design

# UI-design-brain for Cursor
git clone https://github.com/carmahhawwari/ui-design-brain.git ~/.cursor/skills/ui-design-brain

# Shannon autonomous security pentester (bonus)
npx skills add unicodeveloper/shannon

# Excalidraw diagrammer
npx skills add https://github.com/coleam00/excalidraw-diagram-skill --skill excalidraw-diagram
```

-----

## 2. 🎨 CURSOR RULES FOR DESIGN

> `.mdc` / `.cursorrules` files that load into Cursor automatically and constrain/guide the AI for design work.

|Repo                                                                               |What It Does                                                                                                                                                                                    |
|-----------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|[PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules)  |**The canonical list.** Thousands of `.mdc` cursor rules. Toss-Style Design System, React Chakra, Redux TypeScript, TanStack Router + Query, RTL/i18n, Tailwind, and 100+ more. Updated monthly.|
|[spencergoldade/cursor-designer](https://github.com/spencergoldade/cursor-designer)|Design-first Cursor rules template. Covers UX, UI, IA, accessibility, research-driven design. Drop-in guardrails. Keeps Cursor honest on UX patterns, WCAG, research practices.                 |
|[murataslan1/cursor-ai-tips](https://github.com/murataslan1/cursor-ai-tips)        |Tips, tricks, best practices. Keyboard shortcuts, Composer mode, `.cursorrules` examples, Reddit community wisdom. Good onboarding doc.                                                         |
|GitHub Topic: `cursor-rules`                                                       |[`github.com/topics/cursor-rules`](https://github.com/topics/cursor-rules) — Browse all public cursor rule repos. New ones drop weekly.                                                         |

### ✍️ ANTI-SLOP DESIGN PROMPT (add to CLAUDE.md or .cursorrules)

Drop this into any `CLAUDE.md`, `DESIGN.md`, `.cursorrules`, or system prompt:

```
<frontend_aesthetics>
You tend to converge toward generic, "on distribution" outputs.
In frontend design, this creates what users call the "AI slop" aesthetic.
Avoid this: make creative, distinctive frontends that surprise and delight. Focus on:

- Typography: Choose fonts that are beautiful, unique, and interesting.
  Avoid generic fonts like Arial and Inter. Pick distinctive choices.
- Color & Theme: Commit to a cohesive aesthetic. Use CSS variables for consistency.
  Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
  Draw from IDE themes and cultural aesthetics for inspiration.
- Motion: Use animations for effects and micro-interactions.
  Prioritize CSS-only solutions for HTML artifacts.
- Layout: Break the grid deliberately. Asymmetry is memorable. Symmetry is generic.
- Component Design: Every component should feel intentional — not Bootstrap-default.
</frontend_aesthetics>
```

> Source: [anthropics/claude-cookbooks — prompting_for_frontend_aesthetics.ipynb](https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb) + [Anthropic Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)

-----

## 3. 🛠️ MCP SERVERS FOR DESIGN

> These connect your IDE (Claude Code, Cursor, Antigravity) directly to Figma, design systems, and visual tools.

### Figma MCPs

|Repo                                                                         |Type        |What It Does                                                                                                                                                     |
|-----------------------------------------------------------------------------|------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
|[figma/mcp-server-guide](https://github.com/figma/mcp-server-guide)          |Official    |**Figma’s official MCP.** Read Figma nodes, download images, get design context for AI code generation. Requires Full/Dev seat on paid plan for best rate limits.|
|[GLips/Figma-Context-MCP](https://github.com/GLips/Figma-Context-MCP)        |Community ⭐ |**Framelink** — The most-used community Figma MCP. Simplifies + translates Figma API output for AI. Best for Cursor. Reduces hallucinations dramatically.        |
|[southleft/figma-console-mcp](https://github.com/southleft/figma-console-mcp)|Write Access|Full read + write to Figma. Design components from natural language via Claude Desktop or Claude Code. The official MCP is read-only; this one writes.           |
|[antonytm/figma-mcp-server](https://github.com/antonytm/figma-mcp-server)    |Write Access|Enable AI agents to create and modify Figma designs. Communicates via WebSocket plugin.                                                                          |
|[1yhy/Figma-Context-MCP](https://github.com/1yhy/Figma-Context-MCP)          |Enhanced    |Layout detection and optimization. Includes test scripts for verifying design data.                                                                              |

### Design System MCPs

|Repo                                                                           |What It Does                                                                                                                                                                                                                     |
|-------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|`freema/mcp-design-system-extractor` (via punkpeye/awesome-mcp-servers)        |Extracts component info from **Storybook** design systems. Provides HTML, styles, props, dependencies, theme tokens, component metadata for AI-powered analysis.                                                                 |
|[jau123/MeiGen-AI-Design-MCP](https://github.com/jau123/MeiGen-AI-Design-MCP)  |**CRAZY POWERFUL.** 9 image/video models (GPT Image 2, Midjourney V8.1, Flux 2, Seedream, Veo 3.1, ComfyUI), 1,446 curated prompts, parallel sub-agent orchestration. Works in Claude Code, Cursor, Codex, Windsurf, Antigravity.|
|[punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)|**Master list of ALL MCP servers.** Filter by design, UI, image gen, browser control. Updated weekly.                                                                                                                            |

### MCP Config Snippet (Figma + Framelink)

```json
{
  "mcpServers": {
    "figma-framelink": {
      "command": "npx",
      "args": ["-y", "figma-developer-mcp", "--figma-api-key=YOUR_KEY"]
    },
    "figma-write": {
      "url": "ws://localhost:38450"
    }
  }
}
```

-----

## 4. 🧩 COMPONENT LIBRARIES & UI KITS

### 🔥 Copy-Paste / Production-Ready

|Library                                                   |Stack                                     |GitHub                                                 |Vibe                                                                                                  |
|----------------------------------------------------------|------------------------------------------|-------------------------------------------------------|------------------------------------------------------------------------------------------------------|
|[shadcn/ui](https://github.com/shadcn-ui/ui)              |React, Tailwind, Radix                    |⭐ 85k+                                                 |The baseline. Everything else builds on this.                                                         |
|[Aceternity UI](https://ui.aceternity.com)                |React, Next.js, Tailwind, Framer Motion   |[GitHub](https://github.com/aceternity/ui)             |Mind-blowing effects: aurora backgrounds, background beams, infinite scroll, spotlight cards. Free.   |
|[Magic UI](https://magicui.design)                        |React, TypeScript, Tailwind, Framer Motion|[GitHub](https://github.com/magicuidesign/magicui)     |SaaS/startup landing page blocks. Marquees, animated lists, dock nav, hero dialogs. Pairs with shadcn.|
|[Animate UI](https://animate-ui.com)                      |React, Tailwind, Framer Motion            |[GitHub](https://github.com/animate-ui/animate-ui)     |Motion-focused components. Micro-interactions. Copy-paste.                                            |
|[Luxe UI](https://www.luxeui.com)                         |React, Tailwind                           |—                                                      |Premium design, copy-paste components for SaaS.                                                       |
|[Hero UI (NextUI)](https://www.heroui.com)                |React, Tailwind, React Aria               |[GitHub](https://github.com/heroui-inc/heroui)         |Accessible, production-ready. 40+ components. Strong dark mode.                                       |
|[Kokonut UI](https://kokonutui.com)                       |React, Tailwind                           |—                                                      |Design-style-focused. Subtle animations. Used by startups.                                            |
|[DaisyUI](https://daisyui.com)                            |Tailwind CSS                              |[GitHub](https://github.com/saadeghi/daisyui)          |70+ semantic components with theming. Zero JS dependency.                                             |
|[Mantine](https://mantine.dev)                            |React                                     |[GitHub](https://github.com/mantinedev/mantine)        |120+ components + hooks. Full TypeScript. Rich modals, notifications, tooltips. Underrated.           |
|[Radix UI](https://www.radix-ui.com)                      |React                                     |[GitHub](https://github.com/radix-ui/primitives)       |Unstyled, WAI-ARIA-compliant primitives. The foundation under shadcn.                                 |
|[Chakra UI](https://chakra-ui.com)                        |React                                     |[GitHub](https://github.com/chakra-ui/chakra-ui)       |Simple, accessible, composable. 35k+ stars. Clean.                                                    |
|[React Aria](https://react-spectrum.adobe.com/react-aria/)|React                                     |[GitHub](https://github.com/adobe/react-spectrum)      |Adobe’s accessibility primitives. Craft world-class accessible components.                            |
|[Ark UI](https://ark-ui.com)                              |React/Vue/Solid                           |[GitHub](https://github.com/chakra-ui/ark)             |Headless component library by Chakra team.                                                            |
|[React Bits](https://www.reactbits.dev)                   |React                                     |—                                                      |Components for creative developers.                                                                   |
|[Preline UI](https://preline.co)                          |Tailwind                                  |[GitHub](https://github.com/htmlstreamofficial/preline)|Open-source Tailwind CSS components library.                                                          |
|[Flowbite](https://flowbite.com)                          |Tailwind                                  |[GitHub](https://github.com/themesberg/flowbite)       |700+ UI components for Tailwind.                                                                      |
|[Untitled UI](https://www.untitledui.com)                 |React, Tailwind                           |[GitHub](https://github.com/untitledui/untitled-ui)    |World’s largest collection of React/Tailwind OSS components.                                          |

### 🌈 Awesome Lists for Components

|List                                                                                                               |What It Covers                                                                                                                             |
|-------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
|[birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui)                                |Everything built with or on top of shadcn/ui. Agents UI (LiveKit), billing components, calendar, Tailwind v4 starters, dashboard templates.|
|[brillout/awesome-react-components](https://github.com/brillout/awesome-react-components)                          |Massive curated list of React components & libraries. Drag-drop, charts, forms, media, maps, infinite scroll, physics animations.          |
|[anubhavsrivastava/awesome-ui-component-library](https://github.com/anubhavsrivastava/awesome-ui-component-library)|Framework-specific component libraries (React, Vue, Angular, Svelte, React Native).                                                        |
|[brandonhimpfen/awesome-ui-components](https://github.com/awesomelistsio/awesome-ui-components)                    |Broad list: Framer Motion, React Spring, Lottie, Lucide, Heroicons, DaisyUI.                                                               |

-----

## 5. ✨ ANIMATION & MOTION LIBRARIES

### Core Animation Engines

|Library                                                         |GitHub                                                      |Stars|What It Does                                                                                                                  |
|----------------------------------------------------------------|------------------------------------------------------------|-----|------------------------------------------------------------------------------------------------------------------------------|
|[GSAP (GreenSock)](https://gsap.com)                            |[GitHub](https://github.com/greensock/GSAP)                 |20k+ |**The God of web animation.** ScrollTrigger, Flip, DrawSVG, MorphSVG. Used on Awwwards-winning sites. Free for most use cases.|
|[Framer Motion / Motion](https://motion.dev)                    |[GitHub](https://github.com/framer/motion)                  |25k+ |Declarative React animations. Gestures, drag-drop, layout animation, spring physics. The standard for React.                  |
|[React Spring](https://www.react-spring.dev)                    |[GitHub](https://github.com/pmndrs/react-spring)            |27k+ |Spring-physics animations. Follows natural motion. Great for data viz.                                                        |
|[Anime.js](https://animejs.com)                                 |[GitHub](https://github.com/juliangarnier/anime)            |50k+ |Lightweight, powerful. Handles CSS, SVG, DOM, JS Objects. Timeline sequencing.                                                |
|[Motion Canvas](https://motioncanvas.io)                        |[GitHub](https://github.com/motion-canvas/motion-canvas)    |17k+ |Code-based animations like 3Blue1Brown. For explanatory visual content.                                                       |
|[Lottie Web](https://airbnb.io/lottie)                          |[GitHub](https://github.com/airbnb/lottie-web)              |30k+ |Render After Effects animations in the browser as JSON. Designer-created animations.                                          |
|[React Awesome Reveal](https://react-awesome-reveal.morello.dev)|[GitHub](https://github.com/morellodev/react-awesome-reveal)|—    |Scroll-triggered reveal animations. Fade, slide, zoom, rotate. SSR-compatible.                                                |
|[Popmotion](https://popmotion.io)                               |[GitHub](https://github.com/Popmotion/popmotion)            |20k+ |Functional animation library. Basis for Framer Motion internals.                                                              |
|[Velocity.js](http://velocityjs.org)                            |[GitHub](https://github.com/julianshapiro/velocity)         |17k+ |jQuery-compatible animation engine. Accelerated CSS.                                                                          |
|[Theatre.js](https://www.theatrejs.com)                         |[GitHub](https://github.com/theatre-js/theatre)             |10k+ |Motion design editor for the web. Visual timeline editor. Works with Three.js.                                                |
|[AutoAnimate](https://auto-animate.formkit.com)                 |[GitHub](https://github.com/formkit/auto-animate)           |11k+ |Add animations with one line of code. Zero config. Works with React, Vue, or vanilla JS.                                      |

### GSAP Resources

|Repo                                                                        |What It Covers                                                                                                    |
|----------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|
|[zhengdechang/awesome-gsap](https://github.com/zhengdechang/awesome-gsap)   |Comprehensive GSAP examples: vanilla JS, React, Vue. ScrollTrigger, Timeline, performance optimization.           |
|GitHub Topic: `gsap-scrolltrigger`                                          |[All repos](https://github.com/topics/gsap-scrolltrigger) — Browse 500+ real GSAP projects to steal patterns from.|
|[GSAP ScrollTrigger Plugin](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)|The most-used GSAP plugin. Scroll-driven animations, pinning, scrubbing.                                          |
|[GSAP + Three.js](https://threejsresources.com/tool/gsap)                   |Using GSAP to animate Three.js objects. Timeline management for 3D.                                               |

### Framer Resources

|Repo                                                                                 |What It Covers                                                                    |
|-------------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
|[podo/awesome-framer](https://github.com/podo/awesome-framer)                        |Curated list of Framer prototyping resources, modules, components.                |
|[robbschiller/awesome-framer](https://github.com/robbschiller/awesome-framer)        |Another curated Framer resource list.                                             |
|[rosskhanas/awesome-react-motion](https://github.com/rosskhanas/awesome-react-motion)|React Motion ecosystem.                                                           |
|[SikandarJODD/svelte-animations](https://github.com/SikandarJODD/svelte-animations)  |Svelte versions of Magic UI + Aceternity UI components. Framer Motion equivalents.|

-----

## 6. 🌐 3D, WEBGL & CREATIVE CODING

### Three.js Ecosystem

|Library/Repo                                                           |Stars                                                |What It Does                                                                    |
|-----------------------------------------------------------------------|-----------------------------------------------------|--------------------------------------------------------------------------------|
|[Three.js](https://threejs.org)                                        |[GitHub](https://github.com/mrdoob/three.js)         |103k+                                                                           |
|[react-three-fiber (R3F)](https://docs.pmnd.rs/react-three-fiber)      |[GitHub](https://github.com/pmndrs/react-three-fiber)|28k+                                                                            |
|[drei](https://github.com/pmndrs/drei)                                 |9k+                                                  |150+ helpers for R3F. Environment maps, loaders, effects, controls, gizmos.     |
|[react-postprocessing](https://github.com/pmndrs/react-postprocessing) |—                                                    |Post-processing effects for R3F. Bloom, depth of field, chromatic aberration.   |
|[Leva](https://github.com/pmndrs/leva)                                 |5k+                                                  |GUI controls for R3F / Three.js scenes. Debug panel.                            |
|[three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh)          |3k+                                                  |Collision detection + raycasting via BVH. Must-have for complex scenes.         |
|[Spline](https://spline.design)                                        |Tool                                                 |Design and animate 3D scenes in browser. Export to React.                       |
|[Theatre.js](https://www.theatrejs.com)                                |[GitHub](https://github.com/theatre-js/theatre)      |Visual motion editor for Three.js scenes.                                       |
|[AxiomeCG/awesome-threejs](https://github.com/AxiomeCG/awesome-threejs)|—                                                    |Curated list of THREE.js resources: tools, examples, learning, shaders, physics.|

### Shaders & WebGL Deep End

|Resource                                           |What It Is                                                                            |
|---------------------------------------------------|--------------------------------------------------------------------------------------|
|[The Book of Shaders](https://thebookofshaders.com)|Step-by-step guide to GLSL fragment shaders. Best free resource.                      |
|[Shadertoy](https://www.shadertoy.com)             |Online GLSL editor + community. 100k+ public shaders.                                 |
|[glslify](https://github.com/glslify/glslify)      |Node.js-style module system for GLSL. Import noise functions, effects as npm packages.|
|[glsl-noise](https://github.com/stegu/webgl-noise) |Simplex / Perlin noise for GLSL shaders.                                              |
|[Trois.js](https://github.com/troisjs/trois)       |Vue 3 + Three.js = Trois. Declarative 3D for Vue.                                     |
|[TresJs](https://tresjs.org)                       |Vue + Three.js component library (like R3F for Vue).                                  |
|[WebGL Fundamentals](https://webglfundamentals.org)|Deep-dive WebGL from scratch.                                                         |

### Generative & Creative Coding

|Resource                                                                             |What It Is                                                                                                              |
|-------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
|[terkelg/awesome-creative-coding](https://github.com/terkelg/awesome-creative-coding)|**The mother list.** 2k+ stars. Books, tools, frameworks, shaders, visual programming, sound coding, online communities.|
|[p5.js](https://p5js.org)                                                            |[GitHub](https://github.com/processing/p5.js)                                                                           |
|[Processing](https://processing.org)                                                 |[GitHub](https://github.com/processing/processing)                                                                      |
|[canvas-sketch](https://github.com/mattdesl/canvas-sketch)                           |Matt DesLauriers’ framework for generative art in JS. Export PNG/SVG/video.                                             |
|[OpenProcessing](https://openprocessing.org)                                         |Social platform for p5.js / Processing art. Browse 1M+ sketches.                                                        |
|[Hydra](https://hydra.ojack.xyz)                                                     |Live-codeable video synth. Modular + network-based.                                                                     |
|[P5LIVE](https://teddavis.org/p5live/)                                               |p5.js live-coding environment.                                                                                          |
|[NEORT](https://neort.io)                                                            |Digital art platform: Fragment Shader, JavaScript Canvas.                                                               |
|[Pen.ed](https://codepen.io)                                                         |CodePen — 30M+ web demos. Best place to find CSS/JS effects in the wild.                                                |

-----

## 7. 🏗️ DESIGN SYSTEMS & STYLE GUIDES

### Production Design Systems (Open Source)

|System                                            |Company   |Repo                                                                                                         |Stack                       |
|--------------------------------------------------|----------|-------------------------------------------------------------------------------------------------------------|----------------------------|
|[Primer](https://primer.style)                    |GitHub    |[github/primer-css](https://github.com/primer/css)                                                           |CSS + React + ViewComponents|
|[Carbon](https://carbondesignsystem.com)          |IBM       |[carbon-design-system/carbon](https://github.com/carbon-design-system/carbon)                                |React + Web Components      |
|[Material Design 3](https://m3.material.io)       |Google    |[material-components/material-components-web](https://github.com/material-components/material-components-web)|Web Components              |
|[Fluent UI](https://fluent2.microsoft.design)     |Microsoft |[microsoft/fluentui](https://github.com/microsoft/fluentui)                                                  |React, React Native         |
|[Polaris](https://polaris.shopify.com)            |Shopify   |[shopify/polaris](https://github.com/Shopify/polaris)                                                        |React                       |
|[Lightning](https://www.lightningdesignsystem.com)|Salesforce|[salesforce/lightning-design-system](https://github.com/salesforce-ux/design-system)                         |CSS + React                 |
|[Pajamas](https://design.gitlab.com)              |GitLab    |[gitlab-org/gitlab-ui](https://gitlab.com/gitlab-org/gitlab-ui)                                              |Vue 3                       |
|[Grommet](https://v2.grommet.io)                  |HP        |[grommet/grommet](https://github.com/grommet/grommet)                                                        |React, accessibility-first  |
|[Evergreen](https://evergreen.segment.com)        |Segment   |[segmentio/evergreen](https://github.com/segmentio/evergreen)                                                |React                       |
|[Ant Design](https://ant.design)                  |Alibaba   |[ant-design/ant-design](https://github.com/ant-design/ant-design)                                            |React                       |
|[Elastic UI](https://eui.elastic.co)              |Elastic   |[elastic/eui](https://github.com/elastic/eui)                                                                |React                       |

### Design System Resources

|Repo                                                                                                 |What It Is                                                                                                    |
|-----------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
|[klaufel/awesome-design-systems](https://github.com/klaufel/awesome-design-systems)                  |Curated bookmarks, articles, tools, testing, documentation. Includes Storybook, Chromatic, Figma plugins.     |
|[jbranchaud/awesome-react-design-systems](https://github.com/jbranchaud/awesome-react-design-systems)|All major React design systems in one list.                                                                   |
|[streamich/awesome-styleguides](https://github.com/streamich/awesome-styleguides)                    |Storybook-based style guides from real companies: Coursera, Buffer, Artsy, Lonely Planet.                     |
|[flipflop/Awesome-Design-System](https://github.com/flipflop/Awesome-Design-System)                  |Articles, tools, resources about design systems.                                                              |
|[darelova/Awesome-Design-Resources-List](https://github.com/darelova/Awesome-Design-Resources-List)  |Broad: design tools, articles, inspiration, UI resources. Figma plugins, component libs, illustrations, icons.|
|[Design System Checklist](https://designsystemchecklist.com)                                         |Open-source checklist to plan, build, and grow your design system.                                            |
|[Storybook](https://storybook.js.org)                                                                |[GitHub](https://github.com/storybookjs/storybook)                                                            |
|[Chromatic](https://www.chromatic.com)                                                               |Visual testing for Storybook. Every commit tested for UI regressions.                                         |

-----

## 8. 🎨 COLOR TOOLS & PALETTES

### OKLCH (The Modern Color Standard)

|Tool                                                                                       |What It Does                                                                    |
|-------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
|[oklch.com](https://oklch.com)                                                             |OKLCH color picker + CSS output. Evil Martians. Must-bookmark.                  |
|[Evil Martians Harmonizer](https://oklch-palette.vercel.app)                               |Generates accessible, perceptually-uniform palettes using OKLCH + APCA contrast.|
|[royalfig/color-palette-generator](https://github.com/royalfig/color-palette-generator)    |ColorPalette Pro: synthesizer for OKLCH palettes. Easy export.                  |
|[sebastian-software/effective-color](https://github.com/sebastian-software/effective-color)|TypeScript OKLCH color library. P3 gamut output. Perceptually uniform shades.   |
|OKLCH Figma Plugin (OkColor)                                                               |Use OKLCH directly inside Figma. Third-party color picker.                      |
|[Culori](https://github.com/Evercoder/culori)                                              |JS color conversion library. Powers many OKLCH tools.                           |

### Palette Generation & Color Tools

|Tool/Repo                                                         |What It Does                                                     |
|------------------------------------------------------------------|-----------------------------------------------------------------|
|[Radix Colors](https://www.radix-ui.com/colors)                   |30 beautiful, accessible color scales. Dark mode and P3 variants.|
|[Open Color](https://yeun.github.io/open-color/)                  |[GitHub](https://github.com/yeun/open-color)                     |
|[Tailwind Colors](https://tailwindcss.com/docs/customizing-colors)|The go-to palette. 22 color scales × 11 shades = 242 colors.     |
|[uicolors.app](https://uicolors.app)                              |Generate Tailwind color palettes from any hex.                   |
|[colorhunt.co](https://colorhunt.co)                              |20k+ community-curated palettes.                                 |
|[coolors.co](https://coolors.co)                                  |Quick palette generator with contrast ratio checker.             |
|[Paletter 4](https://www.paletter.app)                            |Extract palettes from images.                                    |
|[Realtimecolors.com](https://www.realtimecolors.com)              |Real-time preview of palettes on a complete landing page.        |
|[Haikei](https://app.haikei.app)                                  |SVG background generators: blobs, waves, grids, gradients.       |
|[GradientArt](https://gra.dient.art)                              |Advanced CSS gradient editor with layering.                      |

-----

## 9. 🔤 TYPOGRAPHY & FONT TOOLS

### Font Resources

|Resource                                     |What It Is                                              |
|---------------------------------------------|--------------------------------------------------------|
|[Google Fonts](https://fonts.google.com)     |1,500+ free fonts. Best free font library.              |
|[Fontsource](https://fontsource.org)         |[GitHub](https://github.com/fontsource/fontsource)      |
|[Variable Fonts](https://v-fonts.com)        |Explore variable fonts. Single font file, multiple axes.|
|[Font of Web](https://fontofweb.com)         |Fonts from the most inspiring websites.                 |
|[Typ.io](https://typ.io)                     |What fonts are websites using and how.                  |
|[Fontjoy](https://fontjoy.com)               |AI-powered font pairing generator.                      |
|[Modular Scale](https://www.modularscale.com)|Type scale calculator. Mathematical type hierarchies.   |
|[Typescale](https://typescale.com)           |Preview and adjust type scales with different fonts.    |
|[Typespiration](https://typespiration.com)   |Complete guide to matching typefaces.                   |
|[Nerd Fonts](https://www.nerdfonts.com)      |[GitHub](https://github.com/ryanoasis/nerd-fonts)       |

### Awesome Typography Lists

|Repo                                                                                       |What It Covers                                                                     |
|-------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------|
|[Jolg42/awesome-typography](https://github.com/Jolg42/awesome-typography)                  |Curated digital typography. Variable fonts, type tools, OpenType, font testing.    |
|[brabadu/awesome-fonts](https://github.com/brabadu/awesome-fonts)                          |Curated fonts + everything. FontVibe AI effects, open-source typefaces, icon fonts.|
|[domenicosolazzo/awesome-typography](https://github.com/domenicosolazzo/awesome-typography)|Typography principles + tools. OpenType, normalize-opentype.css, typebase.css.     |
|[deanhume/typography](https://github.com/deanhume/typography)                              |Curated web typography articles. normalize-opentype.css.                           |

### Typography Tools for Code

```css
/* normalize-opentype.css — add to your global CSS */
@import 'https://cdn.jsdelivr.net/npm/normalize-opentype.css/normalize-opentype.css';

/* typebase.css — minimal typographic stylesheet */
@import 'https://cdn.rawgit.com/devinhunt/typebase.css/master/src/typebase.scss';

/* CSS OpenType Utility Classes */
/* simple utility classes for ligatures, kerning, etc. */
```

-----

## 10. 🧱 CSS MAGIC & EFFECTS

### Core CSS Repos

|Repo                                                                             |Stars                                                     |What It Covers                                                                                                                            |
|---------------------------------------------------------------------------------|----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------|
|[awesome-css-group/awesome-css](https://github.com/awesome-css-group/awesome-css)|4k+                                                       |Curated CSS resources: preprocessors, frameworks, animations, tutorials, tools. Includes GradientArt, Glassmorphism Generator, RevengeCSS.|
|[bradtraversy/50projects50days](https://github.com/bradtraversy/50projects50days)|40k+                                                      |50 raw HTML/CSS/JS mini-projects. Best for learning effects from scratch.                                                                 |
|GitHub Topic: `css-effects`                                                      |[Browse all](https://github.com/topics/css-effects)       |New CSS effect repos. Hologram, liquid glass, glassy buttons, hover animations.                                                           |
|GitHub Topic: `glassmorphism`                                                    |[Browse all](https://github.com/topics/glassmorphism)     |Frosted glass UI effects. Hundreds of open-source examples.                                                                               |
|GitHub Topic: `gsap-scrolltrigger`                                               |[Browse all](https://github.com/topics/gsap-scrolltrigger)|Scroll-driven animation examples.                                                                                                         |
|[apple-liquid-glass](https://github.com/topics/liquid-glass-css)                 |—                                                         |iOS 26 / Apple Vision Pro liquid glass effect in CSS.                                                                                     |

### CSS Tools & Generators

|Tool                                                       |What It Does                                                         |
|-----------------------------------------------------------|---------------------------------------------------------------------|
|[Houdini.how](https://houdini.how)                         |CSS Houdini paint worklets registry. Advanced CSS magic.             |
|[CSS Tricks](https://css-tricks.com)                       |The reference. Thousands of guides, almanac, snippets.               |
|[Magic CSS](https://magic.link)                            |Live CSS editor extension for Chrome/Firefox/Edge.                   |
|[Glassmorphism CSS Generator](https://glassmorphism.com)   |Generate CSS for glassmorphism with sliders.                         |
|[Neumorphism.io](https://neumorphism.io)                   |Generate CSS for soft UI / neomorphism.                              |
|[Uiverse.io](https://uiverse.io)                           |5,000+ open-source CSS UI elements: buttons, loaders, cards, toggles.|
|[CSS Grid Generator](https://cssgrid-generator.netlify.app)|Visual CSS Grid layout tool.                                         |
|[Clippy](https://bennettfeely.com/clippy/)                 |CSS clip-path visual generator.                                      |
|[Animista](https://animista.net)                           |On-demand CSS animations. Copy the CSS.                              |
|[Keyframes.app](https://keyframes.app)                     |Visual animation builder. Timeline editor for CSS keyframes.         |
|[Gradient Magic](https://www.gradientmagic.com)            |1,400+ CSS gradient gallery + generator.                             |
|[CSS Loaders](https://css-loaders.com)                     |600+ CSS-only loading spinners. Zero JS.                             |

-----

## 11. 🪙 DESIGN TOKENS & FIGMA BRIDGE

|Tool/Repo                                                                  |What It Does                                                                                                   |
|---------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
|[tokens-studio/figma-plugin](https://github.com/tokens-studio/figma-plugin)|**Tokens Studio for Figma.** The industry standard. Sync design tokens from Figma to GitHub as JSON.           |
|[Tokens Studio](https://tokens.studio)                                     |Open-source, tool-agnostic. Works with Figma, Penpot, GitHub, VS Code, Framer. CLI/SDK for custom integrations.|
|[amzn/style-dictionary](https://github.com/amzn/style-dictionary)          |Amazon’s design token build tool. Transform tokens for iOS, Android, CSS, SCSS, JS.                            |
|[W3C DTCG Spec](https://github.com/design-tokens/community-group)          |The official Design Token Community Group spec.                                                                |
|[mikaelvesavuori/figmagic](https://github.com/mikaelvesavuori/figmagic)    |Generate design tokens + React components from Figma files. Webpack integration.                               |
|[Theo by Salesforce](https://github.com/salesforce-ux/theo)                |Design token transformer. Similar to Style Dictionary.                                                         |
|[Hadron by Supernova](https://supernova.io)                                |Enterprise design token management + documentation platform.                                                   |
|[Diez](https://diez.org)                                                   |[GitHub](https://github.com/diez/diez)                                                                         |

### Token Workflow

```
Figma Variables
     ↓
Tokens Studio Figma Plugin
     ↓
GitHub Repo (JSON tokens)
     ↓
Style Dictionary / Theo
     ↓
CSS Variables / SCSS / iOS Swift / Android XML
     ↓
Your Design System
```

-----

## 12. 🧠 OBSIDIAN FOR DESIGNERS & DEVS

### Core Setup

|Plugin                                                                         |What It Does                                     |
|-------------------------------------------------------------------------------|-------------------------------------------------|
|[obsidianmd/obsidian-releases](https://github.com/obsidianmd/obsidian-releases)|Official community plugins list (2,754+ plugins).|
|[Obsidian Community Hub](https://obsidian.community)                           |Browse all plugins and themes.                   |

### Must-Install Plugins for Design/Dev Workflows

|Plugin                     |GitHub                                                            |What It Does                                                                                          |
|---------------------------|------------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
|**Templater**              |[GitHub](https://github.com/SilentVoid13/Templater)               |Powerful templating engine. Create note templates for design briefs, component specs, sprint planning.|
|**DataView**               |[GitHub](https://github.com/blacksmithgu/obsidian-dataview)       |Query your vault like a database. Build design system component trackers, asset inventories.          |
|**Excalidraw**             |[GitHub](https://github.com/zsviczian/obsidian-excalidraw-plugin) |Edit and view Excalidraw drawings inside Obsidian. Best for wireframes and system diagrams.           |
|**Kanban**                 |[GitHub](https://github.com/mgmeyers/obsidian-kanban)             |Markdown-backed Kanban boards. Design task tracking without leaving Obsidian.                         |
|**Git**                    |[GitHub](https://github.com/denolehov/obsidian-git)               |Git version control with auto-backup. Sync your vault to GitHub.                                      |
|**Smart Connections**      |[GitHub](https://github.com/brianpetro/obsidian-smart-connections)|AI-powered related notes. Chat with your vault using Claude, GPT-4, local models.                     |
|**Omnisearch**             |[GitHub](https://github.com/scambier/obsidian-omnisearch)         |Full-text search that just works. Finds buried notes in milliseconds.                                 |
|**Tag Wrangler**           |[GitHub](https://github.com/pjeby/tag-wrangler)                   |Rename, merge, toggle, search tags.                                                                   |
|**Style Settings**         |[GitHub](https://github.com/mgmeyers/obsidian-style-settings)     |Adjust CSS variables per theme or plugin.                                                             |
|**Icon Folder**            |[GitHub](https://github.com/FlorianWoelki/obsidian-icon-folder)   |Add icons to files, folders, text.                                                                    |
|**Paste Image Rename**     |[GitHub](https://github.com/reorx/obsidian-paste-image-rename)    |Rename images on paste. Keep vault clean.                                                             |
|**CSS Snippets (built-in)**|—                                                                 |Add custom CSS inside Obsidian. Style your workspace.                                                 |
|**Linter**                 |[GitHub](https://github.com/platers/obsidian-linter)              |Auto-format notes. Consistent knowledge base.                                                         |
|**Homepage**               |[GitHub](https://github.com/mirnovov/obsidian-homepage)           |Custom homepage/dashboard for your vault.                                                             |

### Design Vault Structure (Recommended)

```
📁 00 - INBOX/
📁 01 - PROJECTS/
   📁 Noble Funded/
      📄 DESIGN.md         ← Your brand tokens
      📄 BRAND_GUIDELINES.md
      📄 COMPONENT_LIBRARY.md
📁 02 - RESOURCES/
   📁 UI Patterns/
   📁 Inspiration/
   📁 Color Palettes/
📁 03 - SKILLS/
   📁 Claude Code/
   📁 Cursor Rules/
📁 04 - TEMPLATES/
📁 05 - ARCHIVE/
```

-----

## 13. 💡 CLAUDE DESIGN & DESIGN.MD PROMPTS

### Claude Design (April 2026) Resources

|Repo / Resource                                                                                                                                             |What It Is                                                                                                                                                                                          |
|------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|[rohitg00/awesome-claude-design](https://github.com/rohitg00/awesome-claude-design)                                                                         |**Most complete Claude Design repo.** DESIGN.md prompts by aesthetic family, remix recipes, skills, video teardowns, honest community takes. Anti-slop patterns, Figma MCP integration, cost guides.|
|[anthropics/claude-cookbooks → frontend aesthetics](https://github.com/anthropics/claude-cookbooks/blob/main/coding/prompting_for_frontend_aesthetics.ipynb)|Official Anthropic cookbook on prompting for great UI. The “AI slop” essay + production system prompt.                                                                                              |
|[Claude Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)                 |Official docs. Frontend defaults section is new (2025).                                                                                                                                             |
|[Claude Design Product](https://claude.ai/design)                                                                                                           |The actual product. Pro/Max/Team/Enterprise login.                                                                                                                                                  |
|Thomas Wiegold Blog — [Claude Code Frontend-Design Plugin](https://thomas-wiegold.com/blog/claude-code-frontend-design-plugin/)                             |How to use the frontend-design skill across Cursor, Codex, Antigravity, GitHub Copilot. DESIGN.md workflow.                                                                                         |

### DESIGN.md Template

```markdown
# DESIGN.md — Noble Funded

## Brand Identity
- **Primary Palette:** Royal Emerald (#002B36, #14655B, #A7FFEB)
- **Accent:** Gold (#FFD700), Alert Red (#FF4444)
- **Background:** Deep Navy (#001B24)
- **Surface:** Semi-dark (#003344)

## Typography
- **Display:** [Choose distinctive display font — NOT Inter/Arial]
- **Body:** [Choose complement body font]
- **Mono:** JetBrains Mono / Fira Code
- **Scale:** 12/14/16/20/24/32/48/64px

## Motion Philosophy
- Micro-interactions: 150-200ms ease-out
- Page transitions: 300ms
- ScrollTrigger: 0.8 opacity → 1.0 with subtle translateY

## Layout Principles
- Break grids deliberately. Asymmetry > symmetry.
- Cards: 16px radius, subtle shadow, border on dark bg.
- Hero: Full-bleed, kinetic, must state value in 5s.

## Component Standards
- Buttons: 44px min height, clear hierarchy (primary/ghost/danger)
- Forms: Inline validation, clear error states
- Tables: Sticky headers, row hover, sort indicators
```

-----

## 14. 🎭 ICON LIBRARIES

|Library                                                            |GitHub                                               |Count |Format                                 |
|-------------------------------------------------------------------|-----------------------------------------------------|------|---------------------------------------|
|[Lucide](https://lucide.dev)                                       |[GitHub](https://github.com/lucide-icons/lucide)     |1,500+|SVG, React, Vue, Svelte                |
|[Heroicons](https://heroicons.com)                                 |[GitHub](https://github.com/tailwindlabs/heroicons)  |292   |SVG, React, Vue                        |
|[Phosphor Icons](https://phosphoricons.com)                        |[GitHub](https://github.com/phosphor-icons/homepage) |6,600+|Multi-weight. SVG, React, Vue, Flutter.|
|[Tabler Icons](https://tabler.io/icons)                            |[GitHub](https://github.com/tabler/tabler-icons)     |5,700+|SVG, React, Vue, Figma                 |
|[Remix Icon](https://remixicon.com)                                |[GitHub](https://github.com/Remix-Design/RemixIcon)  |2,800+|Open-source neutral-style system icons |
|[Font Awesome](https://fontawesome.com)                            |[GitHub](https://github.com/FortAwesome/Font-Awesome)|7,000+|The classic. SVG, Web Font             |
|[Bootstrap Icons](https://icons.getbootstrap.com)                  |[GitHub](https://github.com/twbs/icons)              |2,000+|Open-source, official Bootstrap icons  |
|[pqoqubbw/icons](https://icons.pqoqubbw.dev)                       |[GitHub](https://github.com/pqoqubbw/icons)          |—     |Beautifully crafted animated icons     |
|[Iconify](https://iconify.design)                                  |[GitHub](https://github.com/iconify/iconify)         |200k+ |Unified access to 100+ icon sets       |
|[Nerd Fonts](https://www.nerdfonts.com)                            |[GitHub](https://github.com/ryanoasis/nerd-fonts)    |3,600+|For dev terminals/editors              |
|[Solar Icons](https://www.svgrepo.com/collection/solar-bold-icons/)|—                                                    |7,500+|Solar bold/duotone system icons        |

-----

## 15. 🚀 AI-POWERED DESIGN BUILDERS

> Vibe-code tools — describe UI in natural language, get production code.

|Tool                                     |What It Does                                                                         |GitHub                                                  |
|-----------------------------------------|-------------------------------------------------------------------------------------|--------------------------------------------------------|
|[Lovable](https://lovable.dev)           |Describe a web app in plain English → full Next.js + Supabase project. Best for MVPs.|—                                                       |
|[v0 by Vercel](https://v0.dev)           |Describe UI → shadcn/ui + Tailwind code. Instant production components.              |—                                                       |
|[Claude Design](https://claude.ai/design)|Anthropic’s canvas design tool. Launched April 2026. Token-aware, Figma-to-code.     |—                                                       |
|[Bolt.new](https://bolt.new)             |AI full-stack builder by StackBlitz. In-browser. Real terminal.                      |—                                                       |
|[Framer AI](https://www.framer.com/ai)   |Generate Framer sites from text. Good for landing pages.                             |—                                                       |
|[Relume](https://www.relume.io)          |Site maps + wireframes from AI prompts. Exports to Figma or Webflow.                 |—                                                       |
|[Uizard](https://uizard.io)              |Sketch → wireframe → design. AI UX design tool.                                      |—                                                       |
|[Gamma](https://gamma.app)               |Presentations, docs, web pages from prompts. Good for decks.                         |—                                                       |
|[Galileo AI](https://www.usegalileo.ai)  |Describe a UI → Figma file. AI design generation.                                    |—                                                       |
|[Penpot](https://penpot.app)             |[GitHub](https://github.com/penpot/penpot)                                           |Open-source Figma alternative. Self-hostable. Web-based.|

-----

## 16. 📚 MEGA AWESOME LISTS

> These are the meta-lists — collections of collections. Start here for discovery.

|Repo                                                                                               |Stars|What It Covers                                                                            |
|---------------------------------------------------------------------------------------------------|-----|------------------------------------------------------------------------------------------|
|[gztchan/awesome-design](https://github.com/gztchan/awesome-design)                                |16k+ |UI/UX design resources: tools, inspiration, fonts, colors, icon sets, prototyping, mockup.|
|[darelova/Awesome-Design-Resources-List](https://github.com/darelova/Awesome-Design-Resources-List)|—    |Design tools, articles, Figma plugins, illustrations, UI kits, design systems.            |
|[terkelg/awesome-creative-coding](https://github.com/terkelg/awesome-creative-coding)              |13k+ |Generative art, WebGL, shaders, creative tools, books, communities.                       |
|[PatrickJS/awesome-cursorrules](https://github.com/PatrickJS/awesome-cursorrules)                  |10k+ |All cursor rules ever made. Design system rules, Tailwind, React, accessibility.          |
|[sickn33/antigravity-awesome-skills](https://github.com/sickn33/antigravity-awesome-skills)        |40k+ |1,500+ SKILL.md files for all AI agents.                                                  |
|[VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills)                |—    |1,000+ community + official skills.                                                       |
|[punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)                    |50k+ |All MCP servers. Design, web, browser, files, databases, everything.                      |
|[birobirobiro/awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui)                |8k+  |Everything built on shadcn/ui. Templates, components, tools.                              |
|[brillout/awesome-react-components](https://github.com/brillout/awesome-react-components)          |39k+ |All React components ever curated.                                                        |
|[klaufel/awesome-design-systems](https://github.com/klaufel/awesome-design-systems)                |8k+  |Design systems focused on developers.                                                     |
|[brabadu/awesome-fonts](https://github.com/brabadu/awesome-fonts)                                  |2k+  |Fonts + tools + resources.                                                                |
|[Jolg42/awesome-typography](https://github.com/Jolg42/awesome-typography)                          |1k+  |Digital typography resources.                                                             |
|[AxiomeCG/awesome-threejs](https://github.com/AxiomeCG/awesome-threejs)                            |2k+  |All THREE.js resources.                                                                   |
|[awesome-css-group/awesome-css](https://github.com/awesome-css-group/awesome-css)                  |4k+  |CSS frameworks, tools, animations, preprocessors.                                         |
|[rohitg00/awesome-claude-design](https://github.com/rohitg00/awesome-claude-design)                |—    |Claude Design DESIGN.md prompts, skills, community takes.                                 |
|[rohitg00/awesome-claude-code-toolkit](https://github.com/rohitg00/awesome-claude-code-toolkit)    |—    |135 agents, 35 skills, 42 commands, 176+ plugins for Claude Code.                         |

-----

## 17. 🛸 ADVANCED FRONTEND STARTER TEMPLATES

|Template                                                                                            |Stack                                    |GitHub                                            |What It Is                                     |
|----------------------------------------------------------------------------------------------------|-----------------------------------------|--------------------------------------------------|-----------------------------------------------|
|[shadcn-ui/next-shadcn-dashboard-starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)|Next.js + shadcn                         |GitHub                                            |Full dashboard with auth, charts, tables.      |
|[t3-app](https://create.t3.gg)                                                                      |Next.js + Prisma + tRPC + Tailwind + Auth|[GitHub](https://github.com/t3-oss/create-t3-app) |Best full-stack starter. 24k+ stars.           |
|[Next.js Commerce](https://github.com/vercel/commerce)                                              |Next.js + Shopify                        |GitHub                                            |E-commerce starter by Vercel.                  |
|[Taxonomy](https://github.com/shadcn-ui/taxonomy)                                                   |Next.js 14, shadcn, Contentlayer         |GitHub                                            |Full SaaS with blog. By shadcn creator.        |
|[Nextacular](https://nextacular.co)                                                                 |Next.js + Prisma + Stripe                |[GitHub](https://github.com/nextacular/nextacular)|SaaS boilerplate. Multi-tenancy, billing.      |
|[Supastarter](https://supastarter.dev)                                                              |Next.js + Supabase                       |—                                                 |Production-ready SaaS starter.                 |
|[Turborepo Starter](https://github.com/vercel/turbo/tree/main/examples)                             |Turborepo + Tailwind + shadcn            |GitHub                                            |Monorepo starter with design system.           |
|[create-react-app alternatives](https://vitejs.dev)                                                 |Vite                                     |[GitHub](https://github.com/vitejs/vite)          |The modern build tool. React, Vue, Svelte, Lit.|
|[Nextra](https://nextra.site)                                                                       |Next.js + MDX                            |[GitHub](https://github.com/shuding/nextra)       |Documentation + blog sites. Used by Vercel.    |

-----

## 18. 🔧 DEV TOOLS & PRODUCTIVITY ADD-ONS

### Code Quality & DX

|Tool                                                        |What It Does                                                                          |
|------------------------------------------------------------|--------------------------------------------------------------------------------------|
|[Biome](https://biomejs.dev)                                |[GitHub](https://github.com/biomejs/biome) — Replaces ESLint + Prettier. Blazing fast.|
|[Oxlint](https://oxc.rs)                                    |100x faster than ESLint. Rust-based. Zero config.                                     |
|[Prettier](https://prettier.io)                             |[GitHub](https://github.com/prettier/prettier) — Code formatter.                      |
|[Husky](https://typicode.github.io/husky/)                  |Git hooks made easy. Auto-lint on commit.                                             |
|[Commitizen](https://commitizen-tools.github.io/commitizen/)|Standardized commit messages.                                                         |
|[Storybook](https://storybook.js.org)                       |Component dev + visual testing standard.                                              |
|[Ladle](https://ladle.dev)                                  |[GitHub](https://github.com/nicolo-ribaudo/ladle) — Storybook alternative. 60x faster.|
|[Chromatic](https://www.chromatic.com)                      |Visual regression testing for Storybook.                                              |

### Accessibility Tools

|Tool                                               |What It Does                                         |
|---------------------------------------------------|-----------------------------------------------------|
|[axe-core](https://github.com/dequelabs/axe-core)  |Accessibility testing engine. Used by major browsers.|
|[WAVE Tool](https://wave.webaim.org)               |Browser extension for accessibility evaluation.      |
|[Accessible Colors](https://accessible-colors.com) |WCAG color contrast checker.                         |
|[axe DevTools](https://www.deque.com/axe/devtools/)|Chrome extension for WCAG audits.                    |

### Performance

|Tool                                                                  |What It Does                                                                             |
|----------------------------------------------------------------------|-----------------------------------------------------------------------------------------|
|[Lighthouse](https://developers.google.com/web/tools/lighthouse)      |Performance, accessibility, SEO audit built into Chrome DevTools.                        |
|[WebPageTest](https://www.webpagetest.org)                            |Deep performance analysis.                                                               |
|[Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)|Visualize Next.js bundle size.                                                           |
|[Partytown](https://partytown.builder.io)                             |[GitHub](https://github.com/BuilderIO/partytown) — Move 3rd-party scripts to web workers.|

-----

## 19. 🎓 LEARNING & CREATIVE INSPIRATION

### Video Courses & Channels

|Resource                                                                                         |Platform        |What It Covers                                                 |
|-------------------------------------------------------------------------------------------------|----------------|---------------------------------------------------------------|
|[JavaScript Mastery](https://www.youtube.com/@javascriptmastery)                                 |YouTube         |Three.js, GSAP, Next.js, full stack builds. Highest quality.   |
|[Fireship](https://www.youtube.com/@Fireship)                                                    |YouTube         |Fast-paced tech explainers. AI tools, web trends, tools.       |
|[Kevin Powell](https://www.youtube.com/@KevinPowell)                                             |YouTube         |CSS deep dives. Advanced layouts, modern CSS. The CSS teacher. |
|[Matt DesLauriers — Creative Coding WebGL](https://frontendmasters.com/courses/canvas-webgl/)    |Frontend Masters|p5.js, Three.js, GLSL shaders. The best creative coding course.|
|[Advanced WebGL & Shaders — Matt DesLauriers](https://frontendmasters.com/courses/webgl-shaders/)|Frontend Masters|3D vectors, GLSL noise, custom shaders, fragment/vertex.       |
|[Awwwards](https://www.awwwards.com)                                                             |Web             |Best-of-web design awards. Real-world inspiration.             |
|[Dribbble](https://dribbble.com)                                                                 |Web             |UI/UX design inspiration. Search by tag.                       |
|[Behance](https://www.behance.net)                                                               |Web             |Full design portfolios. Motion, branding, web.                 |
|[Codrops](https://tympanus.net/codrops/)                                                         |Web             |Advanced CSS and JS effects with tutorials.                    |

### Books & Structured Learning

|Resource                                                                                  |What It Teaches                                  |
|------------------------------------------------------------------------------------------|-------------------------------------------------|
|[The Book of Shaders](https://thebookofshaders.com)                                       |Fragment shaders, GLSL, noise — free online book.|
|[Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com)                         |Design system methodology. Free online.          |
|[Every Layout](https://every-layout.dev)                                                  |Intrinsic CSS layout patterns.                   |
|[Refactoring UI](https://www.refactoringui.com)                                           |Practical UI design advice by Tailwind creators. |
|[Design Systems by Alla Kholmatova](https://www.smashingmagazine.com/design-systems-book/)|How to build scalable design systems.            |

### Inspiration & Showcase Sites

|Site                                              |What It Has                                             |
|--------------------------------------------------|--------------------------------------------------------|
|[Awwwards](https://www.awwwards.com)              |Site of the Day / Year winners. Cutting-edge web design.|
|[Godly](https://godly.website)                    |Curated web design inspiration. New daily.              |
|[Lapa Ninja](https://www.lapa.ninja)              |Landing page inspiration. Categorized.                  |
|[Screenlane](https://screenlane.com)              |Mobile UI patterns. iOS + Android screenshots.          |
|[Mobbin](https://mobbin.com)                      |300k+ mobile + web UI screenshots from real apps.       |
|[Component Gallery](https://component.gallery)    |Design system component patterns from 50+ real systems. |
|[Interface In Game](https://interfaceingame.com)  |UI from video games.                                    |
|[Game UI Database](https://www.gameuidatabase.com)|1,300+ games, 55,000+ UI screenshots.                   |

-----

## 20. 🌍 COMMUNITIES TO FOLLOW

### GitHub / Dev Communities

|Community               |Link                                             |What’s There                                                  |
|------------------------|-------------------------------------------------|--------------------------------------------------------------|
|**r/webdev**            |[Reddit](https://reddit.com/r/webdev)            |Real developer discussions, tool debates, job posts.          |
|**r/Frontend**          |[Reddit](https://reddit.com/r/Frontend)          |Frontend-specific. Library comparisons, design system debates.|
|**r/ClaudeAI**          |[Reddit](https://reddit.com/r/ClaudeAI)          |Claude tips, skill sharing, design prompt strategies.         |
|**r/cursor_ai**         |[Reddit](https://reddit.com/r/cursor_ai)         |Cursor tips, best cursorrules, community workflows.           |
|**Design Systems Slack**|[Join](https://design-systems.slack.com)         |10k+ designers and devs building design systems.              |
|**Penpot Community**    |[Figma Alternative](https://community.penpot.app)|Open-source Figma users.                                      |

### X / Twitter People to Follow for Design Dev

|Handle        |Why Follow                                            |
|--------------|------------------------------------------------------|
|`@shadcn`     |Creator of shadcn/ui. Drops new components + patterns.|
|`@mannupaaji` |Aceternity UI creator. Advanced animations.           |
|`@rauchg`     |Vercel CEO. Posts about Next.js, design, v0.          |
|`@samselikoff`|Framer Motion, React animation tutorials.             |
|`@Pier_3`     |GSAP tricks and web animation.                        |
|`@maxmckinney`|Creative coding, Three.js experiments.                |
|`@briOS`      |Design system patterns.                               |
|`@UX_Bear`    |UI/UX tips, screenshots, patterns.                    |

-----

## 🚀 QUICK START — NOBLE FUNDED STACK

```bash
# 1. Install all skills at once for Antigravity
npx antigravity-awesome-skills --claude

# 2. Install Figma MCP (Framelink)
npx figma-developer-mcp --figma-api-key=YOUR_KEY

# 3. Clone UI Design Brain for Cursor
git clone https://github.com/carmahhawwari/ui-design-brain.git \
  ~/.cursor/skills/ui-design-brain

# 4. Install MeiGen AI Design MCP (for image gen inside IDE)
npx meigen-ai-design-mcp --config ./mcp-config.json

# 5. Create DESIGN.md at project root
touch DESIGN.md  # Then fill with Noble Funded tokens (see section 13)
```

-----

## 📦 INSTALLATION PATHS BY AGENT

|Agent             |Where Skills Go                         |Where Rules Go                   |
|------------------|----------------------------------------|---------------------------------|
|**Antigravity**   |`.claude/skills/` or `~/.claude/skills/`|`CLAUDE.md`                      |
|**Claude Code**   |`.claude/skills/` or `~/.claude/skills/`|`CLAUDE.md`                      |
|**Cursor**        |`.cursor/skills/`                       |`.cursor/rules/*.mdc`            |
|**Codex CLI**     |`AGENTS.md`                             |`AGENTS.md` system block         |
|**Gemini CLI**    |`.gemini/skills/`                       |`GEMINI.md`                      |
|**GitHub Copilot**|—                                       |`.github/copilot-instructions.md`|
|**Windsurf**      |`.windsurf/skills/`                     |`.windsurf/rules/*.md`           |
|**Kiro**          |`.kiro/skills/`                         |`.kiro/rules/`                   |

-----

## 🔖 RESOURCE INDEX (All GitHub URLs)

```
# SKILLS
https://github.com/sickn33/antigravity-awesome-skills
https://github.com/VoltAgent/awesome-agent-skills
https://github.com/ComposioHQ/awesome-claude-skills
https://github.com/travisvn/awesome-claude-skills
https://github.com/rohitg00/awesome-claude-code-toolkit
https://github.com/GetBindu/awesome-claude-code-and-skills
https://github.com/carmahhawwari/ui-design-brain

# CURSOR RULES
https://github.com/PatrickJS/awesome-cursorrules
https://github.com/spencergoldade/cursor-designer
https://github.com/murataslan1/cursor-ai-tips

# MCP SERVERS
https://github.com/punkpeye/awesome-mcp-servers
https://github.com/figma/mcp-server-guide
https://github.com/GLips/Figma-Context-MCP
https://github.com/southleft/figma-console-mcp
https://github.com/jau123/MeiGen-AI-Design-MCP

# COMPONENT LIBRARIES
https://github.com/shadcn-ui/ui
https://github.com/birobirobiro/awesome-shadcn-ui
https://ui.aceternity.com
https://magicui.design
https://github.com/brillout/awesome-react-components
https://github.com/heroui-inc/heroui
https://github.com/saadeghi/daisyui
https://github.com/mantinedev/mantine
https://github.com/radix-ui/primitives

# ANIMATION
https://gsap.com
https://github.com/greensock/GSAP
https://github.com/zhengdechang/awesome-gsap
https://github.com/framer/motion
https://github.com/pmndrs/react-spring
https://github.com/juliangarnier/anime
https://github.com/airbnb/lottie-web
https://github.com/formkit/auto-animate

# 3D / WEBGL
https://github.com/mrdoob/three.js
https://github.com/pmndrs/react-three-fiber
https://github.com/pmndrs/drei
https://github.com/AxiomeCG/awesome-threejs
https://github.com/terkelg/awesome-creative-coding

# DESIGN SYSTEMS
https://github.com/klaufel/awesome-design-systems
https://github.com/primer/css
https://github.com/carbon-design-system/carbon
https://github.com/microsoft/fluentui
https://github.com/storybookjs/storybook

# DESIGN TOKENS
https://github.com/tokens-studio/figma-plugin
https://github.com/amzn/style-dictionary
https://github.com/mikaelvesavuori/figmagic

# TYPOGRAPHY
https://github.com/Jolg42/awesome-typography
https://github.com/brabadu/awesome-fonts
https://github.com/fontsource/fontsource

# CSS EFFECTS
https://github.com/awesome-css-group/awesome-css
https://github.com/bradtraversy/50projects50days
https://uiverse.io

# COLOR
https://oklch.com
https://github.com/yeun/open-color
https://www.radix-ui.com/colors

# ICONS
https://github.com/lucide-icons/lucide
https://github.com/tailwindlabs/heroicons
https://github.com/phosphor-icons/homepage
https://github.com/tabler/tabler-icons
https://github.com/iconify/iconify

# CLAUDE DESIGN
https://github.com/rohitg00/awesome-claude-design
https://github.com/anthropics/claude-cookbooks

# OBSIDIAN
https://github.com/obsidianmd/obsidian-releases
https://github.com/SilentVoid13/Templater
https://github.com/blacksmithgu/obsidian-dataview
https://github.com/zsviczian/obsidian-excalidraw-plugin
https://github.com/brianpetro/obsidian-smart-connections

# MEGA LISTS
https://github.com/gztchan/awesome-design
https://github.com/darelova/Awesome-Design-Resources-List
https://github.com/terkelg/awesome-creative-coding
```

-----

*Last updated: June 2026 — Compiled from GitHub Topics, Reddit (r/webdev, r/Frontend, r/ClaudeAI, r/cursor_ai), Twitter/X design dev community, Medium, Dev.to, YouTube design channels, Obsidian community forums, Anthropic docs, and direct GitHub topic crawls.*

*For Noble Funded | Built by Biggest Cheque | Antigravity IDE First.*