/**
 * Quick test script to verify video transcription is working
 */

const fs = require('fs');
const path = require('path');

// Test video path
const testVideoPath = './uploads/demo_user/1772952734836-Goa_Memory_Lane.mp4';

async function testTranscriptionFlow() {
  console.log('\n🎬 TESTING VIDEO TRANSCRIPTION FLOW\n');
  console.log('='.repeat(50));
  
  // Check environment
  console.log('\n📋 Environment Check:');
  console.log(`  OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '✅ Set (' + process.env.OPENAI_API_KEY.slice(0,10) + '...)' : '❌ Not set'}`);
  console.log(`  GITHUB_TOKEN: ${process.env.GITHUB_TOKEN ? '✅ Set' : '❌ Not set'}`);
  
  // Check video file
  console.log('\n📹 Test Video:');
  if (fs.existsSync(testVideoPath)) {
    const stats = fs.statSync(testVideoPath);
    console.log(`  Path: ${testVideoPath}`);
    console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Status: ✅ Found`);
  } else {
    console.log(`  Path: ${testVideoPath}`);
    console.log(`  Status: ❌ Not found`);
    return;
  }
  
  // Test the API endpoint
  console.log('\n🚀 Testing Upload-to-Results API...');
  
  try {
    const response = await fetch('http://localhost:3001/api/upload-to-results/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileId: 'test-' + Date.now(),
        fileName: 'Goa_Memory_Lane.mp4',
        mimeType: 'video/mp4',
        userId: 'test_user',
        localPath: path.resolve(testVideoPath),
        platforms: ['youtube', 'instagram', 'tiktok']
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('\n✅ SUCCESS! Content generated from video:\n');
      console.log('='.repeat(50));
      
      // Show viral score
      console.log(`\n📊 Viral Score: ${data.results.viralScore}/100`);
      
      // Show detected domain if available
      if (data.results.analytics?.detectedDomain) {
        console.log(`🎯 Detected Domain: ${data.results.analytics.detectedDomain}`);
      }
      
      // Show generated content for each platform
      const platforms = data.results.platforms;
      for (const [platform, content] of Object.entries(platforms)) {
        console.log(`\n--- ${platform.toUpperCase()} ---`);
        if (content.title) {
          console.log(`Title: ${content.title}`);
        }
        if (content.content) {
          // Show first 300 chars
          const preview = content.content.substring(0, 300);
          console.log(`Content: ${preview}${content.content.length > 300 ? '...' : ''}`);
        }
        if (content.hashtags && content.hashtags.length > 0) {
          console.log(`Hashtags: ${content.hashtags.slice(0, 5).join(' ')}`);
        }
      }
      
      // Show recommendations
      if (data.results.viralAnalysis?.recommendations?.length > 0) {
        console.log('\n💡 AI Recommendations:');
        data.results.viralAnalysis.recommendations.slice(0, 3).forEach((rec, i) => {
          console.log(`  ${i + 1}. ${rec}`);
        });
      }
      
    } else {
      console.log('\n❌ API Error:', data.message || data.error);
    }
    
  } catch (error) {
    console.log('\n❌ Request failed:', error.message);
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('Test complete!\n');
}

testTranscriptionFlow();
