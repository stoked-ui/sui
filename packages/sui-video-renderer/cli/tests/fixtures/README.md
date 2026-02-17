# Test Fixtures for Video Renderer CLI

This directory contains test fixture files used by the end-to-end test suite.

## Fixture Files

### simple.sue
A minimal project file for basic testing:
- Duration: 3 seconds
- Resolution: 1920x1080
- FPS: 30
- Single solid color background track (dark blue)

Used to test:
- Basic project loading
- Timeline creation
- Single frame rendering
- Frame sequence rendering

### multilayer.sue
A multi-layer project demonstrating layer composition:
- Duration: 5 seconds
- Resolution: 1920x1080
- FPS: 30
- Three tracks:
  1. White solid color background (0-5s)
  2. Image layer with transform (1-4s)
  3. Semi-transparent red overlay (2-5s)

Used to test:
- Multi-track project loading
- Layer composition
- Transform handling
- Opacity/transparency

### animated.sue
A project with animation actions:
- Duration: 4 seconds
- Resolution: 1920x1080
- FPS: 30
- Three tracks with animations:
  1. Dark gray background
  2. Moving green box (moves across screen)
  3. Yellow circle with fade in/out

Used to test:
- Animation action parsing
- Move action
- Fade in/out actions
- Complex timeline interactions

### test_image.png
A simple test image (200x200 pixels):
- Blue square with rounded corners
- Semi-transparent edges
- Used by multilayer.sue fixture

Auto-generated during test execution if not present.

## Usage

These fixtures are automatically loaded by the e2e test suite in `tests/e2e.rs`. The tests verify:
- Correct project file parsing
- Timeline creation from project data
- Frame rendering at various resolutions and framerates
- Error handling for invalid files
