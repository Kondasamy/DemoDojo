# DemoDojo Technical Roadmap

## Phase 1: MVP Development
- [x] **Browser Extension Features**
  - [x] Implement screen recording with MediaRecorder API
  - [x] ~Add follow-cursor zoom/pan logic~ Not required. Done in the editor.
  - [x] Develop popup UI for recording controls (start, stop, pause)
  - [x] Add tooltips and recording status indicators

- [ ] **Video Upload Flow**
  - [ ] Record and assemble video blobs
  - [ ] Upload videos to storage using presigned URLs or do Local rendering
  - [ ] Optimize upload with multi-part uploads for large files

- [ ] **Core Infrastructure Setup**
  - [ ] Set up FastAPI backend
  - [ ] Configure Supabase for auth, database, and storage
  - [ ] Integrate cloud storage with presigned URLs for uploads

---

## Phase 2: Advanced Editor Development
- [ ] **Video Import and Timeline Management**
  - [ ] Build video editor UI using Next.js, TypeScript, and TailwindCSS + Remotion
  - [ ] Implement timeline editor for trimming, copying, and deleting segments
  - [ ] Add manual zoom/pan adjustment controls

- [ ] **Rendering Pipeline**
  - [ ] Integrate Rendermotion for rendering (optional)
  - [ ] Set up AWS Lambda for distributed video rendering
  - [ ] Implement frame splitting and stitching for efficient processing

---

## Phase 3: Additional Enhancements
- [ ] **Cross-Browser Compatibility**
  - [ ] Test and optimize the extension for macOS, Windows, and Linux.
  - [ ] Ensure compatibility with Edge and Brave browsers.

- [ ] **Export and Customization Features**
  - [ ] Add support for multi-aspect ratio exports (16:9, 9:16, 1:1).
  - [ ] Implement background customization (blur and browser appearance).

---

## Phase 4: Continuous Improvement
- [ ] **User Insights**
  - [ ] Collect feedback on extension and editor usage.
  - [ ] Improve features based on analytics.

- [ ] **Rendering Enhancements**
  - [ ] Add real-time rendering previews in the editor.

- [ ] **Codebase Optimization**
  - [ ] Transition backend from Python to Rust or Go for performance improvements.

---

## Phase 5: Cloud Cost Optimization
- [ ] **Evaluate Alternatives**
  - [ ] Test open-source rendering tools like Revideo or MoviePy.
  - [ ] Benchmark alternatives against current rendering stack.

- [ ] **Transition to Cost-Efficient Rendering**
  - [ ] Implement rendering on Google Cloud Run.
  - [ ] Configure autoscaling to optimize costs for high workloads.
