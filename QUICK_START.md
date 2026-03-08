# Quick Start Guide - Content Intelligence Platform

## Test the Upload-to-Results Flow Right Now

### 1. Verify Backend is Running
```bash
# Check if backend is running on port 3001
curl http://localhost:3001/health

# Expected response:
# {"status":"ok","timestamp":"2024-..."}
```

If not running:
```bash
npm run dev
```

### 2. Verify Frontend is Running
Open browser to: http://localhost:3000/upload

If not running:
```bash
cd frontend
npm run dev
```

### 3. Test Upload Flow

**Option A: Upload a Video File**
1. Go to http://localhost:3000/upload
2. Click "Choose File" or drag & drop a video (MP4, MOV, etc.)
3. Click "Process Content"
4. Wait 30-60 seconds
5. Open browser console (F12) to see generated content

**Option B: Use YouTube URL**
1. Go to http://localhost:3000/upload
2. Paste a YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
3. Click "Process Content"
4. Wait 30-60 seconds
5. Check browser console for results

### 4. What You'll See

The backend generates content for 8 platforms:
- ▶ YouTube: SEO title, video script, timestamps, description, tags
- ◎ Instagram: Reel caption with 20-30 hashtags
- ♪ TikTok: Short-form caption with #FYP
- in LinkedIn: Professional article-style post
- 𝕏 Twitter: Thread with 5-10 tweets
- 📝 Blog: Full blog post
- 🎙 Podcast: Script with intro/outro
- 📊 Analytics: Word count, sentiment, readability

Plus:
- Viral Score (0-100)
- Estimated Reach & Engagement
- Content Quality Grade
- Viral Analysis (patterns, hooks, recommendations)
- Domain Detection (Technology, Business, Health, etc.)

---

## Troubleshooting

### "Generation timed out after 2 minutes"
**Cause:** AI services are taking too long

**Solutions:**
1. Try a shorter video (< 5 minutes)
2. Check backend logs for errors
3. Verify GitHub token is set in `.env`
4. Restart backend: `npm run dev`

### "Failed to upload file"
**Cause:** Backend not running or file too large

**Solutions:**
1. Check backend is running: `curl http://localhost:3001/health`
2. Check file size (max 100MB)
3. Check file format (MP4, MOV, AVI, MP3, WAV, M4A, WebM)

### "Backend not responding"
**Cause:** Port 3001 is blocked or backend crashed

**Solutions:**
1. Kill existing process: `lsof -ti:3001 | xargs kill -9`
2. Restart backend: `npm run dev`
3. Check logs for errors

### Content Not Showing in UI
**Cause:** Results page not implemented yet

**Workaround:**
1. Open browser console (F12)
2. Look for the API response with generated content
3. Copy the content from console

---

## Quick API Test (Without Frontend)

### Test with cURL

**1. Upload a file:**
```bash
curl -X POST http://localhost:3001/api/upload \
  -F "file=@test-video.mp4" \
  -F "userId=test-user"
```

**2. Process the file:**
```bash
curl -X POST http://localhost:3001/api/upload-to-results/process \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "test-user/test-video.mp4",
    "fileName": "test-video.mp4",
    "mimeType": "video/mp4",
    "userId": "test-user",
    "platforms": ["youtube", "instagram", "tiktok", "linkedin", "twitter", "blog", "podcast", "analytics"]
  }' | jq
```

**3. Check results:**
```bash
curl http://localhost:3001/api/upload-to-results/results/JOB_ID | jq
```

---

## Environment Variables

Make sure your `.env` file has:
```env
GITHUB_TOKEN=your_github_token_here
PORT=3001
NODE_ENV=development
```

Optional (for real transcription):
```env
OPENAI_API_KEY=your_openai_key_here
```

---

## File Locations

### Uploaded Files
Files are saved to: `./uploads/`

### Logs
Backend logs: Console output when running `npm run dev`

### Generated Content
Stored in memory (expires after 1 hour)

---

## Demo Tips

### For Hackathon Presentation

1. **Prepare a test video** (2-3 minutes, clear audio)
2. **Have YouTube URL ready** (backup if file upload fails)
3. **Open browser console** before uploading (to show generated content)
4. **Explain the AI services** while processing:
   - "Extracting metadata..."
   - "Generating transcript with AI..."
   - "Creating content for 8 platforms..."
   - "Analyzing viral potential..."
5. **Show the console output** with generated content
6. **Highlight key features**:
   - Real AI viral prediction
   - Platform-specific optimization
   - 8 formats from 1 video
   - 30-60 second processing time

### What to Say

"Our platform takes any video and generates optimized content for 8 different platforms in under a minute. We use AI to analyze the content, predict viral potential, and create platform-specific formats - from YouTube scripts with timestamps to TikTok captions with trending hashtags. All powered by GitHub Models API, no AWS required."

---

## Next Steps After Demo

1. **Build Results Page** - Display generated content in nice UI
2. **Add Copy/Edit/Regenerate** - Interactive features
3. **Mobile Responsive** - Works on all devices
4. **Performance Optimization** - Faster processing
5. **Deploy to Production** - AWS or Vercel

---

## Support

If you run into issues:
1. Check `docs/UPLOAD_TO_RESULTS_STATUS.md` for detailed status
2. Check `IMPLEMENTATION_SUMMARY.md` for what's implemented
3. Check `docs/AWS_SERVICES_SETUP.md` for AWS setup (if needed)
4. Check backend logs for error messages
5. Ask me for help!

---

## Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] `.env` file has GITHUB_TOKEN
- [ ] Can access http://localhost:3000/upload
- [ ] Can upload a file or YouTube URL
- [ ] Processing completes in 30-60 seconds
- [ ] Generated content visible in browser console
- [ ] All 8 platforms have content
- [ ] Viral score is calculated
- [ ] No errors in backend logs

If all checked, you're ready to demo! 🎉
