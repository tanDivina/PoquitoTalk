---
name: sd25-pe
description: >-
  Prompt engineering guidelines, multimodal reference asset rules, task instruction parameters,
  and prompt structuring techniques for Dreamina Seedance 2.5 (sd25-pe) video generation. Use when optimizing,
  writing, or structuring video generation prompts for Seedance 2.5, including reference-to-video (R2V),
  video editing, first/last frame generation, 3D clay-model (whitemodel) rendering, keyframe sequences,
  storyboards, and video extension workflows.
---

# Dreamina Seedance 2.5 (sd25-pe) Prompt Engineering Skill

This skill provides prompt optimization guidelines, reference asset constraints, task parameters, and structured prompt engineering templates for **Dreamina Seedance 2.5** (hereafter referred to as **Seedance 2.5**).

---

## 1. Capabilities & Core Specs Overview

Seedance 2.5 is designed for production-ready, long-form video generation workflows:
* **Max Single Video Duration**: Up to **30 seconds**.
* **Max Reference Assets**: Up to **50 total assets** per request (combining images, audio, and video).
* **Multilingual Generation**: Native generation in 10+ languages with precise lip-sync and audio controls.
* **Format Recommendation**: Use `mov` output format for video extension and editing tasks to preserve color, light, and audio-visual consistency.

---

## 2. Locked vs. Unlocked Tasks & Parameter Rules

Seedance 2.5 categorizes generation tasks into **Locked** and **Unlocked** based on whether reference assets constrain the output timeline, ratio, or duration.

### Locked Tasks
The input asset strictly dictates segment bounds or video geometry.

| Task Type | Aspect Ratio Rule | Duration Rule | Trigger Keywords in Prompt |
| :--- | :--- | :--- | :--- |
| **Editing** | **Locked**: Set `ratio = adaptive` (matches input video) | **Locked**: Set `duration = -1` (matches input, ~0.3s variance allowed) | `edit video`, `add`, `insert`, `remove`, `delete`, `modify`, `replace`, `change to` |
| **First Frame / First & Last Frame** | **Locked**: Set `ratio = adaptive` (strictly matches 1st frame) | **User-Defined** | Set asset `content.role = first_frame` or `last_frame` |
| **Extension** | **Locked**: Set `ratio = adaptive` (matches input video) | **User-Defined** | `extend forward`, `extend backward`, `continue`, `continue from`, `extend the story` |

> [!IMPORTANT]
> - For **Editing**, if a video generated natively by Seedance 2.5 is used as input, the output duration will match the input exactly.
> - For **First & Last Frame**, ensure both keyframes share the exact same aspect ratio; otherwise, the final frame will stretch.
> - For **Extension**, select `mov` format for both input and output to ensure smooth audio/video continuity.

### Unlocked Tasks
Standard Reference-to-Video (R2V), Multi-Panel Storyboards, and Keyframe Sequences permit user-customized aspect ratios (`ratio`) and durations.

---

## 3. Reference Asset Limits & Best Practices

Maximum **50 assets** per request:

| Asset Type | Maximum Limit | Recommended Operating Limits & Guidelines |
| :--- | :--- | :--- |
| **Images** | Up to 30 images (up to 4K) | - **1–8 subjects**: Optimal stability.<br>- **9–12 subjects**: Supported, but stability may decrease.<br>- **Viewpoints**: Single-view or multi-view supported for 1–5 subjects. For >5 subjects, use separate single-view images per angle. |
| **Videos** | Up to 10 videos | - Total combined duration **<= 30 seconds**.<br>- **Video Editing**: Source video within **20 seconds** delivers the best results. |
| **Audio** | Up to 10 clips | - Total combined duration **<= 30 seconds**.<br>- Ideal clip length for subject voice/audio: **5–10 seconds**. |
| **Storyboards** | Multi-panel images | - **15 panels or fewer** per storyboard image.<br>- Use simple line-art or stick figures. Avoid embedding text on the image. |
| **3D Clay-Model** | Whitemodel videos | - Coarse-grained simple geometric primitives yield better motion/camera alignment than overly complex geometry. |
| **Edit Ref Images** | Reference images | - **1–5 reference images** per edit operation for best stability. |

---

## 4. Prompt Structure & Writing Guidelines

Always format prompts as a structured visual production brief:

```text
[Visual Style & Technical Specs]
[Asset Mapping / Bindings]
[One-Sentence Summary]
[Timeline / Shot-by-Shot Plot Description]
[Camera Language, Movement & Transitions]
[Audio / Dialogue / Negative Controls]
```

### 1. Asset Referencing & Binding (`@Asset` Notation)
* Explicitly map uploaded assets in order: `@Image1`, `@Image2`, `@Video1`, `@Audio1`.
* **Single & Multi-Subject Mapping**: List character/object bindings explicitly in text.
  * *Good*: `"Image 1 depicts John (uses voice from Audio 1). Image 2 depicts Sarah."`
  * *Bad*: Writing names directly on the input image and omitting text mappings.
* **Partial Reference**: Specify exact aspects to reference (e.g., `"Refer to Video 1 for camera orbiting and Image 1 for warm dusk lighting."`).

### 2. Timestamps & Time Control
* Use **1-second integer intervals** as the basic time unit (e.g., `0s-3s`, `3s-8s` or `[1s-4s]`).
* Keep pace balanced: Avoid cramming too many actions into a 2-second window.
* **Supported Formats**:
  * *Intervals*: `0s-3s: [Description] ... 3s-7s: [Description]`
  * *Point Triggers*: `"At the 5-second mark, a quick left wipe transition occurs."`
  * *Relative Delay*: `"John pauses. After 3 seconds, the surrounding crowd turns around."`

### 3. Negative Controls
* **Subtitles**: `"Do not add subtitles."` / `"No subtitles."`
* **Audio**: `"No BGM; generate only environmental sounds and footstep audio."` / `"No audio."`

### 4. Camera Language & Micro-Expressions
* Use professional terminology: Extreme wide shot (EWS), medium shot (MS), close-up (CU), rack focus, dolly zoom, FPV, speed ramp, handheld breathing.
* For complex moves, use `[Term + Explanation]` (e.g., `"Rack focus: foreground flowers blur while the background character comes into sharp focus"`).
* Describe facial expressions dynamically using physical changes rather than idioms.

---

## 5. Advanced Task Workflows

### A. 3D Clay-Model / Whitemodel Reference
1. **Coarse-Grained (Previs & Motion Capture)**:
   - Use simple geometric models to dictate camera path, shot rhythm, and character motion.
   - Prompt Mapping: `"Map the red primitive model in Video 1 to character @Image1 and the gray primitive to @Image2."`
2. **Fine-Grained (Re-rendering / Coloring)**:
   - Provide a clean 3D clay video free of grid lines or wireframe overlays.
   - Specify environment, materials, and lighting in detail.

### B. Multi-Panel Storyboards vs. Keyframe Sequences
* **Multi-Panel Storyboard (Unlocked)**:
  - High-level plot and shot rhythm reference.
  - Use simple line-art storyboards (<= 15 panels).
  - Storyboard visuals serve as guidance; strict frame-by-frame match is not enforced.
* **Keyframe Sequence (Strict Alignment)**:
  - Use when exact visual match is mandatory across shots.
  - Upload each keyframe frame as an individual image.
  - First prompt sentence: `"Use Images 1 to N in order as keyframes."`

### C. Video Editing Workflows
1. **Instruction Edit**: Describe state change from A to B (`"Change the character's action from drinking coffee to sweeping the floor from 4s-6s in Video 1"`).
2. **Reference Image Edit**: Combine `@Video1` with `@Image1` (`"Replace the knight in Video 1 with character @Image1"`).
3. **Audio Edit & Lip Sync**: `"Translate spoken dialogue in Video 1 to Spanish, update lip movements to match, and keep background ambiance unchanged."`

### D. Video Extension
- Set prompt trigger: `"Extend Video 1 backward by 5 seconds: [Describe continuation]"`
- Always set `output_format = mov` to prevent visual/audio stitching seams.

---

## 6. Differences: Seedance 2.5 vs. Seedance 2.0

1. **Integer Timestamps**: 2.5 natively obeys integer-second timestamp controls (`0s-3s`, `3s-8s`).
2. **Multi-View Subject Images**: 2.5 natively ingests multi-angle character references.
3. **Flexible Aspect Ratios**: Supports any continuous aspect ratio between **[0.4, 2.5]** via input assets.
4. **MOV Container Support**: Native `MOV` output eliminates color drift, brightness shifting, and audio popping in edit/extension tasks.

---

## 7. Prompt Optimization Templates

### Template 1: Comprehensive R2V / Production Brief
```text
[Visual Style]: Cinematic 35mm film, natural lighting, subtle film grain, realistic skin textures, 16:9 widescreen.
[Asset Bindings]: Subject @Image1, Environment @Image2, Voice @Audio1.

[Shot 1 (0s-4s)]: Medium shot, handheld camera with gentle breathing motion. @Image1 stands near the window in @Image2. Morning sunlight streams through the glass, casting soft shadows.

[Shot 2 (4s-10s)]: Close-up shot. @Image1 turns head toward camera, eyes softening. Dialogue using @Audio1: "We need to leave before dawn."

[Additional Details]: Low camera angle, shallow depth of field, natural room acoustics and light wind sounds. No BGM. No subtitles.
```

### Template 3D Clay-Model Re-render
```text
Use 3D clay-model video @Video1 strictly for camera movement, shot pacing, and character motion trajectories. Do not reference its visual texture.

Replace the pink clay figure in @Video1 with character @Image1, and the gray figure with @Image2. Render in a dark cyberpunk city style with neon blue reflections and rain-slicked pavement. Keep original action timing identical to @Video1.
```

### Template Keyframe Sequence
```text
Use Images 1 to 5 in order as keyframes.

Generate a seamless 25-second continuous short film following the visual progression from Image 1 through Image 5. Maintain strict character appearance consistency with @Image1 across all transitions. Style: Stylized anime illustration with vibrant ambient lighting.
```
