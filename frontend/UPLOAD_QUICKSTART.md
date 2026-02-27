# Upload Feature - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd frontend
npm install
```

This will install all required packages including `react-dropzone`.

### Step 2: Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Step 3: Test the Upload Feature
1. Navigate to `http://localhost:3000/upload`
2. Drag a video or audio file onto the upload zone
3. Click "Start Upload"
4. Watch the progress bar
5. Get redirected to the dashboard

## 📁 What Was Created

### Pages
- `/upload` - Main upload page with drag-drop functionality
- `/dashboard` - Success page after upload

### Components
- `FileUploader` - Drag-drop zone with visual feedback
- `FilePreview` - Shows file details with remove button
- `ProgressBar` - Animated progress tracking

### Features
✅ Drag-and-drop file upload
✅ Click to browse files
✅ File type validation (video/audio only)
✅ File preview with size and type
✅ Animated progress bar
✅ Auto-redirect to dashboard
✅ Dark mode design
✅ Fully responsive
✅ Smooth animations

## 🎨 Design Highlights

- **Dark Mode**: Gray-900 background with purple/pink gradients
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Works on mobile, tablet, and desktop
- **Accessible**: Large touch targets and keyboard navigation

## 🔧 Customization

### Change Accepted File Types
Edit `frontend/components/FileUploader.tsx`:
```typescript
accept: {
  'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
  'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg']
}
```

### Adjust Upload Speed Simulation
Edit `frontend/app/upload/page.tsx`:
```typescript
const interval = setInterval(() => {
  setUploadProgress((prev) => {
    if (prev >= 100) {
      clearInterval(interval)
      return 100
    }
    return prev + 2  // Change this value
  })
}, 50)  // Change this interval
```

### Change Redirect Destination
Edit `frontend/app/upload/page.tsx`:
```typescript
setTimeout(() => {
  router.push('/dashboard')  // Change destination
}, 1500)
```

## 🔌 API Integration

To connect to a real backend API, replace the `simulateUpload` function in `app/upload/page.tsx` with actual API calls. See `UPLOAD_FEATURE.md` for detailed integration guide.

## 📱 Testing on Mobile

1. Start the dev server
2. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
3. Access from mobile: `http://YOUR_IP:3000/upload`

## 🐛 Troubleshooting

### "Module not found: react-dropzone"
```bash
cd frontend
npm install react-dropzone
```

### TypeScript errors
```bash
npm run build
```

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000
npm run dev
```

## 📚 Next Steps

1. Review `UPLOAD_FEATURE.md` for detailed documentation
2. Integrate with backend API
3. Add error handling
4. Implement file size validation
5. Add upload history

## 🎯 Key Files

```
frontend/
├── app/
│   ├── upload/page.tsx       ← Main upload page
│   └── dashboard/page.tsx    ← Success page
├── components/
│   ├── FileUploader.tsx      ← Drag-drop component
│   ├── FilePreview.tsx       ← File preview card
│   └── ProgressBar.tsx       ← Progress bar
└── package.json              ← Dependencies
```

## ✨ Demo Flow

1. **Upload Page** → User drags/selects file
2. **File Preview** → Shows file details
3. **Upload Button** → Starts upload
4. **Progress Bar** → Shows progress (0-100%)
5. **Dashboard** → Success message + next actions

Enjoy building with the Content Intelligence Platform! 🚀
