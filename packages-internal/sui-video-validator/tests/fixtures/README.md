# Test Video Fixtures

Place test video files in this directory for integration tests.

## Required Files

- `reference.mp4`: Reference video for validation tests
- `output.mp4`: Output/rendered video for validation tests

## Creating Test Videos

You can generate simple test videos using FFmpeg:

```bash
# Generate a 3-second test pattern video
ffmpeg -f lavfi -i testsrc=duration=3:size=1920x1080:rate=30 \
  -c:v libx264 -pix_fmt yuv420p \
  reference.mp4

# Create a slightly different version for testing
ffmpeg -f lavfi -i testsrc=duration=3:size=1920x1080:rate=30 \
  -vf "hue=s=0.8" \
  -c:v libx264 -pix_fmt yuv420p \
  output.mp4
```

## Notes

- Keep test videos small (< 5 seconds, < 1MB)
- Use common codecs (H.264, AAC)
- Resolution: 1920x1080 recommended
- These files are gitignored (see .gitignore)
