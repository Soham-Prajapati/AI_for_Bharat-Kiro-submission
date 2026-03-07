# Demo Video Recording Guide

## Overview
This guide provides step-by-step instructions for recording professional demo videos for the content generation platform.

## Recording Setup

### Software Options

#### Option 1: OBS Studio (Recommended for Desktop)
- **Download**: https://obsproject.com/
- **Pros**: Free, professional features, local recording
- **Best for**: Full-length demos, technical walkthroughs

#### Option 2: Loom
- **Download**: https://www.loom.com/
- **Pros**: Easy to use, cloud storage, quick sharing
- **Best for**: Quick demos, team reviews

#### Option 3: Screen Studio (Mac)
- **Download**: https://www.screen.studio/
- **Pros**: Beautiful automatic zoom effects, professional polish
- **Best for**: Marketing demos, social media content

### Screen Resolution Settings

**Recommended: 1920x1080 (1080p)**

#### Why 1080p?
- Standard for YouTube and most platforms
- Good balance of quality and file size
- Works well on all devices

#### Display Settings
```
Resolution: 1920x1080
Scaling: 100% (no scaling)
Refresh Rate: 60Hz
```

#### Browser Setup
- Use Chrome or Firefox in full-screen mode (F11)
- Zoom level: 100%
- Hide bookmarks bar
- Use incognito/private mode for clean interface

### Audio Setup

#### Microphone Recommendations
1. **Budget**: Blue Snowball ($50-70)
2. **Mid-range**: Audio-Technica AT2020 ($100-150)
3. **Professional**: Shure SM7B ($400+)

#### Audio Settings
```
Sample Rate: 48kHz
Bit Depth: 24-bit
Format: WAV or FLAC (lossless)
Noise Suppression: Enabled
```

#### Audio Testing Checklist
- [ ] Record 10-second test clip
- [ ] Check for background noise
- [ ] Verify volume levels (-12dB to -6dB peak)
- [ ] Test microphone positioning (6-8 inches from mouth)
- [ ] Eliminate echo (use soft furnishings)

### Lighting Setup

#### Basic 3-Point Lighting
1. **Key Light**: Main light source (45° angle, front-left)
2. **Fill Light**: Soften shadows (45° angle, front-right, 50% intensity)
3. **Back Light**: Separate from background (behind, above)

#### Budget Lighting Options
- Ring light ($30-50)
- Desk lamps with daylight bulbs
- Natural window light (face the window)

#### Lighting Checklist
- [ ] Face is evenly lit
- [ ] No harsh shadows
- [ ] Screen not reflecting on face
- [ ] Background is visible but not distracting

### Background Recommendations

#### Professional Backgrounds
- Clean, uncluttered wall
- Bookshelf (organized)
- Plants or minimal decor
- Branded backdrop (if available)

#### Virtual Backgrounds
- Use only if necessary
- Ensure good green screen or edge detection
- Keep it simple and professional

## Recording Checklist

### Pre-Recording (30 minutes before)

#### Environment Setup
- [ ] Close unnecessary applications
- [ ] Disable notifications (Do Not Disturb mode)
- [ ] Clear desktop clutter
- [ ] Set browser to incognito mode
- [ ] Prepare demo environment (run `prepare-demo-environment.sh`)

#### Technical Setup
- [ ] Test microphone levels
- [ ] Verify screen resolution (1920x1080)
- [ ] Check lighting
- [ ] Position camera (if showing face)
- [ ] Test recording software

#### Content Preparation
- [ ] Review demo script
- [ ] Open necessary tabs/applications
- [ ] Prepare sample data
- [ ] Have backup plan ready
- [ ] Water nearby (stay hydrated!)

### During Recording

#### Best Practices
- Speak clearly and at moderate pace
- Pause between sections (easier to edit)
- If you make a mistake, pause and restart that section
- Show, don't just tell
- Keep cursor movements smooth
- Highlight important UI elements

#### Recording Tips
- Take deep breaths before starting
- Smile (it affects your voice tone)
- Use natural hand gestures if on camera
- Maintain energy throughout
- Record in 5-10 minute segments

### Post-Recording

#### Immediate Review
- [ ] Watch entire recording
- [ ] Check audio quality
- [ ] Verify all features were shown
- [ ] Note timestamps for editing
- [ ] Save raw files with clear naming

#### File Management
```
Naming Convention:
demo_[scenario]_[date]_raw.mp4
demo_tech_youtuber_2024-01-15_raw.mp4

Backup Locations:
- Local: /recordings/raw/
- Cloud: Google Drive/Dropbox
- Archive: External hard drive
```

## OBS Studio Configuration

### Scene Setup

#### Scene 1: Full Screen Demo
```
Sources:
- Display Capture (1920x1080)
- Audio Input Capture (Microphone)
```

#### Scene 2: Picture-in-Picture
```
Sources:
- Display Capture (1920x1080)
- Video Capture Device (Webcam, 320x240, bottom-right)
- Audio Input Capture (Microphone)
```

### Output Settings
```
Recording Format: MP4
Video Encoder: x264
Rate Control: CRF
CRF: 18 (high quality)
Keyframe Interval: 2
Preset: Quality
Audio Bitrate: 192kbps
```

### Hotkeys (Recommended)
```
Start Recording: F9
Stop Recording: F10
Pause Recording: F11
Mute/Unmute Mic: F12
```

## Loom Configuration

### Settings
```
Quality: 1080p
Camera: On/Off (your choice)
Microphone: Select your device
System Audio: Off (unless needed)
```

### Recording Tips
- Use countdown timer (3 seconds)
- Enable drawing tools for emphasis
- Use emoji reactions sparingly
- Trim beginning/end in Loom editor

## Editing Guidelines

### Software Options
1. **DaVinci Resolve** (Free, professional)
2. **Adobe Premiere Pro** (Industry standard)
3. **Final Cut Pro** (Mac only)
4. **Camtasia** (Easy for beginners)

### Basic Editing Workflow

#### 1. Import and Organize
- Import raw footage
- Create bins/folders for assets
- Label clips clearly

#### 2. Rough Cut
- Remove mistakes and long pauses
- Arrange clips in sequence
- Add transitions (subtle, 0.5-1 second)

#### 3. Enhance
- Color correction (if needed)
- Audio normalization (-14 LUFS for YouTube)
- Add background music (low volume, 10-15%)
- Insert text overlays for key points

#### 4. Polish
- Add intro/outro (5-10 seconds)
- Include call-to-action
- Add captions/subtitles
- Insert chapter markers

### Export Settings

#### YouTube/Vimeo
```
Format: MP4
Codec: H.264
Resolution: 1920x1080
Frame Rate: 30fps or 60fps
Bitrate: 8-12 Mbps (VBR)
Audio: AAC, 192kbps, 48kHz
```

#### Social Media (Twitter, LinkedIn)
```
Format: MP4
Resolution: 1280x720
Frame Rate: 30fps
Bitrate: 5 Mbps
Duration: Under 2 minutes
```

## Quality Checklist

### Before Publishing
- [ ] Audio is clear and balanced
- [ ] No background noise or echo
- [ ] Video is sharp and properly exposed
- [ ] Transitions are smooth
- [ ] Text is readable (test on mobile)
- [ ] Branding is consistent
- [ ] Call-to-action is clear
- [ ] File size is reasonable
- [ ] Tested on multiple devices

## Time Estimates

### Recording
- Setup: 30 minutes
- Recording (per scenario): 15-30 minutes
- Retakes: 15 minutes
- Total per demo: 1-1.5 hours

### Editing
- Basic edit: 2-3 hours
- Professional edit: 4-6 hours
- Color grading: 1 hour
- Audio mixing: 1 hour

### Total Project Timeline
- 3 demo scenarios: 2-3 days
- With professional editing: 4-5 days

## Resources

### Free Assets
- **Music**: YouTube Audio Library, Epidemic Sound
- **Sound Effects**: Freesound.org, Zapsplat
- **Icons**: Flaticon, Font Awesome
- **Fonts**: Google Fonts

### Learning Resources
- OBS Studio tutorials: YouTube
- Video editing basics: LinkedIn Learning
- Color grading: DaVinci Resolve tutorials
- Audio mixing: Audacity tutorials

## Troubleshooting

See `DEMO_TROUBLESHOOTING.md` for common issues and solutions.

## Next Steps

1. Review `DEMO_SCENARIOS.md` for specific recording scripts
2. Run `prepare-demo-environment.sh` to setup demo data
3. Complete pre-recording checklist
4. Record first demo scenario
5. Review and iterate

---

**Questions?** Contact the video production team or refer to `DEMO_TROUBLESHOOTING.md`.
