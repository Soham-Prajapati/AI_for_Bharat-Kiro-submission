# 🔍 Upload Error Diagnosis

## Error: "Unexpected token 'S', 'Server act'... is not valid JSON"

This error means the frontend is receiving HTML instead of JSON from the backend.

---

## 🎯 Root Cause

The backend server is either:
1. Not running
2. Crashing when handling the upload
3. Returning an HTML error page

---

## ✅ Solution Steps

### Step 1: Check if Backend is Running

Open a terminal and run:
```bash
# Check if port 3001 is in use
lsof -i :3001
```

**Expected output:**
```
COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
node    12345  user   23u  IPv6  ...      0t0  TCP *:3001 (LISTEN)
```

**If nothing shows up:** Backend is NOT running!

### Step 2: Start the Backend

```bash
# Make sure you're in the project root
npm run dev
```

**Expected output:**
```
🚀 Server running on port 3001
✅ All routes registered
```

### Step 3: Check Backend Logs

When you try to upload, watch the backend terminal for errors:
```bash
# Backend should show:
POST /api/upload 200 - 1234ms
```

**If you see errors:** The backend is crashing during upload

### Step 4: Test Backend Directly

Open a new terminal and test the upload endpoint:
```bash
# Create a test file
echo "test content" > test.txt

# Test upload with curl
curl -X POST http://localhost:3001/api/upload \
  -F "file=@test.txt" \
  -F "userId=test-user"
```

**Expected response:**
```json
{
  "success": true,
  "fileId": "test-user/1234567890-test.txt",
  "fileName": "test.txt",
  "mimeType": "text/plain",
  "size": 13,
  "userId": "test-user",
  "url": "...",
  "uploadedAt": "2026-03-01T..."
}
```

**If you get HTML:** Backend has an error

---

## 🐛 Common Issues & Fixes

### Issue 1: Backend Not Running
**Symptom:** `lsof -i :3001` shows nothing

**Fix:**
```bash
npm run dev
```

### Issue 2: Port Already in Use
**Symptom:** Error: "Port 3001 is already in use"

**Fix:**
```bash
# Kill the process using port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Then start backend
npm run dev
```

### Issue 3: AWS S3 Error
**Symptom:** Backend logs show "AWS S3 error"

**Fix:** The upload route uses S3Service. If AWS credentials are missing, it will fail.

**Temporary workaround:** Comment out S3 upload and return mock data:

Edit `src/routes/upload.route.ts`:
```typescript
router.post('/', upload.single('file'), asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ValidationError('No file uploaded');
  }

  const { originalname, mimetype, buffer, size } = req.file;
  const userId = req.body.userId || 'anonymous';
  const sanitizedFilename = sanitizeFilename(originalname);
  const key = `${userId}/${Date.now()}-${sanitizedFilename}`;

  // TEMPORARY: Skip S3 upload for testing
  // try {
  //   const result = await s3Service.upload(buffer, key, mimetype);
  // } catch (error: any) {
  //   throw new AWSError(error.message || 'Upload failed', 'S3');
  // }

  // Return mock response
  res.json({
    success: true,
    fileId: key,
    fileName: sanitizedFilename,
    mimeType: mimetype,
    size,
    userId,
    url: `http://localhost:3001/uploads/${key}`, // Mock URL
    uploadedAt: new Date().toISOString()
  });
}));
```

### Issue 4: CORS Error
**Symptom:** Browser console shows "CORS policy" error

**Fix:** Already configured correctly in `.env`:
```
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Issue 5: Frontend API URL Wrong
**Symptom:** Frontend connects to wrong URL

**Fix:** Check `frontend/.env.local` or `frontend/.env`:
```bash
# Should be:
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 🚀 Quick Fix (Most Likely Solution)

**The backend is probably not running!**

1. Open a terminal
2. Run: `npm run dev`
3. Wait for "Server running on port 3001"
4. Try uploading again in the frontend

---

## 📊 Verification Checklist

After fixing, verify:

- [ ] Backend terminal shows: "Server running on port 3001"
- [ ] `lsof -i :3001` shows node process
- [ ] `curl http://localhost:3001/api/upload` doesn't return HTML
- [ ] Frontend can upload files without JSON parse error
- [ ] Backend logs show successful upload

---

## 🆘 Still Not Working?

If none of the above works, run this diagnostic:

```bash
# Check if backend is accessible
curl http://localhost:3001/api/upload

# If you get HTML starting with "Server act...", the backend has an error
# Check backend terminal for error messages
```

Then share the error message from the backend terminal.

---

**Most Common Solution:** Just start the backend with `npm run dev` 😊
