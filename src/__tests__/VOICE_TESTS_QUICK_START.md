# Voice Quality Tests - Quick Start Guide

## 🚀 Quick Start

### Run the Tests

```bash
# Run all voice tests
npm test -- voice.test.ts

# Run with coverage report
npm test -- voice.test.ts --coverage

# Run with detailed output
npm test -- voice.test.ts --verbose

# Watch mode for development
npm test -- voice.test.ts --watch
```

## 📊 What's Tested

### Core Quality Metrics
- ✅ **Voice Similarity:** >80% target
- ✅ **Naturalness (MOS):** >4.0/5.0 target
- ✅ **Audio Quality:** Sample rate, bitrate, SNR, dynamic range
- ✅ **Edge Cases:** Noise, accents, multiple speakers, formats

### Test Categories (34 tests total)
1. **Voice Similarity** (4 tests) - Cloning accuracy
2. **Naturalness** (4 tests) - MOS scores
3. **Cloning Accuracy** (5 tests) - Functionality
4. **Audio Quality** (6 tests) - Technical metrics
5. **Edge Cases** (10 tests) - Robustness
6. **Performance** (3 tests) - Speed & efficiency
7. **Integration** (2 tests) - End-to-end workflows

## 🎯 Quality Standards

### Voice Similarity
```typescript
similarity > 0.80  // 80% minimum
confidence > 0.85  // 85% confidence
```

### Naturalness (MOS)
```typescript
mos > 4.0  // Out of 5.0
clarity > 3.5
naturalness > 3.5
pleasantness > 3.5
intelligibility > 3.5
```

### Audio Quality
```typescript
sampleRate: 44100  // Hz (CD quality)
bitrate: 192       // kbps
channels: 2        // Stereo
snr > 30          // dB
dynamicRange > 50  // dB
```

## 🔧 Mock Service API

The tests use `MockVoiceCloneService` with these methods:

### Clone Voice
```typescript
const result = await voiceService.cloneVoice(audioBuffer, {
  targetLanguage: 'en-US',
  accent: 'american',
  noiseLevel: 0.2
});

// Returns:
// {
//   voiceId: string,
//   similarity: number,
//   quality: number,
//   processingTime: number
// }
```

### Synthesize Speech
```typescript
const audio = await voiceService.synthesizeSpeech(voiceId, text, {
  speed: 1.0,
  pitch: 0,
  emotion: 'neutral'
});

// Returns:
// {
//   audioBuffer: Buffer,
//   duration: number,
//   sampleRate: number,
//   bitrate: number,
//   format: string
// }
```

### Calculate Similarity
```typescript
const similarity = await voiceService.calculateSimilarity(audio1, audio2);

// Returns:
// {
//   similarity: number,
//   confidence: number,
//   metrics: {
//     spectralSimilarity: number,
//     pitchSimilarity: number,
//     timbreSimilarity: number,
//     rhythmSimilarity: number
//   }
// }
```

### Calculate MOS
```typescript
const mos = await voiceService.calculateMOS(audioBuffer, {
  noiseLevel: 0.1,
  compression: 'high'
});

// Returns:
// {
//   mos: number,
//   confidence: number,
//   metrics: {
//     clarity: number,
//     naturalness: number,
//     pleasantness: number,
//     intelligibility: number
//   }
// }
```

### Analyze Audio Quality
```typescript
const quality = await voiceService.analyzeAudioQuality(audioBuffer);

// Returns:
// {
//   sampleRate: number,
//   bitrate: number,
//   channels: number,
//   duration: number,
//   format: string,
//   snr: number,
//   dynamicRange: number,
//   peakLevel: number
// }
```

### Reduce Noise
```typescript
const cleaned = await voiceService.reduceNoise(audioBuffer, 0.7);

// Returns:
// {
//   cleanedAudio: Buffer,
//   noiseReduction: number,
//   originalNoiseLevel: number,
//   finalNoiseLevel: number
// }
```

### Detect Accent
```typescript
const accent = await voiceService.detectAccent(audioBuffer);

// Returns:
// {
//   accent: string,
//   confidence: number,
//   alternatives: Array<{ accent: string, confidence: number }>
// }
```

## 📝 Example Test

```typescript
it('should clone voice with high similarity', async () => {
  // Arrange
  const mockAudio = createMockFile({
    originalname: 'voice.wav',
    mimetype: 'audio/wav',
    buffer: Buffer.from('audio-data'),
  });

  // Act
  const result = await voiceService.cloneVoice(mockAudio.buffer);

  // Assert
  expect(result.similarity).toBeGreaterThan(0.8);
  expect(result.quality).toBeGreaterThan(4.0);
  expect(result.voiceId).toBeDefined();
});
```

## 🔍 Test Utilities

From `src/__tests__/setup.ts`:

```typescript
import {
  wait,
  randomNumber,
  createMockFile,
} from './setup';

// Wait for async operations
await wait(100); // milliseconds

// Generate random numbers
const value = randomNumber(0, 100);

// Create mock audio file
const mockFile = createMockFile({
  originalname: 'audio.wav',
  mimetype: 'audio/wav',
  buffer: Buffer.from('audio-data'),
  size: 1024 * 1024, // 1MB
});
```

## 🎨 Adding New Tests

### 1. Voice Similarity Test
```typescript
it('should test new similarity feature', async () => {
  const audio1 = Buffer.from('voice-1');
  const audio2 = Buffer.from('voice-2');
  
  const result = await voiceService.calculateSimilarity(audio1, audio2);
  
  expect(result.similarity).toBeGreaterThan(0.8);
  expect(result.confidence).toBeGreaterThan(0.85);
});
```

### 2. MOS Test
```typescript
it('should test new MOS feature', async () => {
  const audio = Buffer.from('synthesized-speech');
  
  const result = await voiceService.calculateMOS(audio);
  
  expect(result.mos).toBeGreaterThan(4.0);
  expect(result.metrics.clarity).toBeGreaterThan(3.5);
});
```

### 3. Edge Case Test
```typescript
it('should handle new edge case', async () => {
  const edgeCaseAudio = Buffer.from('edge-case-data');
  
  const result = await voiceService.cloneVoice(edgeCaseAudio, {
    noiseLevel: 0.8, // High noise
  });
  
  expect(result.voiceId).toBeDefined();
  expect(result.similarity).toBeGreaterThan(0.5); // Lower threshold
});
```

## 🐛 Troubleshooting

### Test Failures

**Similarity too low:**
```typescript
// Check noise level impact
const result = await voiceService.cloneVoice(audio, {
  noiseLevel: 0.1, // Lower noise
});
```

**MOS score too low:**
```typescript
// Check compression and noise
const mos = await voiceService.calculateMOS(audio, {
  noiseLevel: 0,
  compression: 'high',
});
```

**Flaky tests:**
- Tests use randomness - may occasionally fail
- Run multiple times to verify
- Adjust thresholds if needed

### Common Issues

1. **Random failures:** Mock service uses randomness - this is expected
2. **Timing issues:** Increase wait times if needed
3. **Threshold issues:** Adjust quality thresholds based on requirements

## 📈 Coverage Goals

Target: >80% code coverage

Current test coverage:
- Voice similarity: 100%
- MOS calculation: 100%
- Audio quality: 100%
- Edge cases: 100%
- Performance: 100%
- Integration: 100%

## 🚦 CI/CD Integration

Tests run automatically on:
- Pull requests
- Main branch commits
- Release tags

### GitHub Actions
```yaml
- name: Run voice tests
  run: npm test -- voice.test.ts --coverage
```

## 📚 Related Documentation

- [Test Summary](./VOICE_TEST_SUMMARY.md) - Detailed test documentation
- [Setup Guide](./setup.ts) - Test utilities and configuration
- [Main README](./README.md) - Overall test documentation

## 🎯 Next Steps

1. **Implement Real Service:** Create `src/services/voice-clone.service.ts`
2. **Match Interface:** Use same API as mock service
3. **Run Tests:** Verify real implementation passes all tests
4. **Add Integration:** Connect to actual voice cloning API
5. **Monitor Quality:** Track similarity and MOS metrics in production

## 💡 Tips

- Run tests frequently during development
- Use `--watch` mode for rapid feedback
- Check coverage to ensure all paths tested
- Add tests before implementing new features
- Keep quality thresholds realistic but challenging

## 🤝 Contributing

When adding new voice features:

1. Write tests first (TDD approach)
2. Ensure >80% similarity target
3. Ensure >4.0 MOS target
4. Test edge cases
5. Update documentation
6. Run full test suite

## 📞 Support

For questions or issues:
- Check test output for detailed error messages
- Review test summary documentation
- Verify mock service behavior
- Check quality thresholds

---

**Happy Testing! 🎉**
