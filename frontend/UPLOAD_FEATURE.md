# Upload Feature Documentation

## Overview
The upload feature allows users to upload video and audio files for content processing. It includes drag-and-drop functionality, file preview, progress tracking, and automatic redirection to the dashboard upon completion.

## Components

### 1. FileUploader (`components/FileUploader.tsx`)
Drag-and-drop file upload component using react-dropzone.

**Features:**
- Drag-and-drop zone with visual feedback
- Click to browse file selection
- Accepts video and audio files only
- Single file upload
- Animated states (idle, drag active, drag reject, file selected)
- Corner accent animations on drag

**Props:**
- `onFileSelect: (file: File) => void` - Callback when file is selected
- `selectedFile: File | null` - Currently selected file

**Accepted File Types:**
- Video: `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`
- Audio: `.mp3`, `.wav`, `.m4a`, `.aac`, `.ogg`

### 2. FilePreview (`components/FilePreview.tsx`)
Displays selected file information with remove functionality.

**Features:**
- File icon based on type (video/audio)
- File name with truncation for long names
- File size in human-readable format
- File type display
- Remove button with hover effects
- Smooth animations

**Props:**
- `file: File` - File to preview
- `onRemove: () => void` - Callback to remove file

### 3. ProgressBar (`components/ProgressBar.tsx`)
Animated progress bar for upload tracking.

**Features:**
- Smooth progress animation (0-100%)
- Percentage display
- Color transition (blue → green when complete)
- Shimmer effect during upload
- Completion state

**Props:**
- `progress: number` - Progress value (0-100)

### 4. Upload Page (`app/upload/page.tsx`)
Main upload page with complete upload flow.

**Features:**
- File selection via FileUploader
- File preview display
- Upload progress tracking
- Automatic redirect to dashboard on completion
- Cancel button to return home
- Info cards showing platform features
- Animated background elements
- Responsive design (mobile, tablet, desktop)

**Flow:**
1. User drags file or clicks to browse
2. File preview appears with file details
3. User clicks "Start Upload" button
4. Progress bar shows upload progress
5. On completion, redirects to `/dashboard`

### 5. Dashboard Page (`app/dashboard/page.tsx`)
Success page after upload completion.

**Features:**
- Upload success message
- Processing status cards
- Actions to upload another file or return home
- Consistent dark mode design

## Installation

### 1. Install Dependencies
```bash
cd frontend
npm install
# or
yarn install
```

The `react-dropzone` package has been added to `package.json`.

### 2. Run Development Server
```bash
npm run dev
# or
yarn dev
```

### 3. Access Upload Page
Navigate to `http://localhost:3000/upload`

## Design System

### Colors
- Background: `bg-gray-900` with gradient overlays
- Primary gradient: Purple to Pink (`from-purple-600 to-pink-600`)
- Secondary gradient: Blue to Purple (`from-blue-500 to-purple-500`)
- Success: Green (`from-green-500 to-emerald-500`)
- Text: White and gray variants

### Animations
- Framer Motion for all animations
- Smooth transitions (0.3s - 0.6s)
- Hover effects with scale transforms
- Background blob animations (8-10s loops)
- Progress bar shimmer effect

### Responsive Breakpoints
- Mobile: Default
- Tablet: `sm:` (640px)
- Desktop: `lg:` (1024px)

### Touch Targets
- Buttons: Minimum 44x44px (py-4 px-8)
- Remove button: 40x40px (p-2 with icon)
- Large drag-drop zone for easy interaction

## API Integration (TODO)

The upload page currently uses a simulated upload. To integrate with a real API:

1. Replace the `simulateUpload` function in `app/upload/page.tsx`
2. Implement actual file upload with progress tracking:

```typescript
const handleUpload = async () => {
  if (!selectedFile) return
  
  const formData = new FormData()
  formData.append('file', selectedFile)
  
  try {
    const xhr = new XMLHttpRequest()
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100
        setUploadProgress(progress)
      }
    })
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    })
    
    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  } catch (error) {
    console.error('Upload failed:', error)
    setIsUploading(false)
    setUploadProgress(0)
  }
}
```

## File Structure
```
frontend/
├── app/
│   ├── upload/
│   │   └── page.tsx          # Upload page
│   └── dashboard/
│       └── page.tsx          # Dashboard page
├── components/
│   ├── FileUploader.tsx      # Drag-drop uploader
│   ├── FilePreview.tsx       # File preview card
│   └── ProgressBar.tsx       # Progress bar
└── package.json              # Dependencies
```

## Testing Checklist

- [ ] Drag and drop video file
- [ ] Drag and drop audio file
- [ ] Click to browse and select file
- [ ] Try to upload invalid file type
- [ ] Remove selected file
- [ ] Upload file and watch progress
- [ ] Verify redirect to dashboard
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] Verify animations are smooth
- [ ] Check accessibility (keyboard navigation)

## Browser Support
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Accessibility
- Keyboard navigation supported
- ARIA labels on interactive elements
- Focus states on all buttons
- Screen reader friendly
- High contrast text
- Large touch targets for mobile

## Future Enhancements
- [ ] Multiple file upload
- [ ] File validation (size limits)
- [ ] Thumbnail generation for videos
- [ ] Upload queue management
- [ ] Pause/resume upload
- [ ] Error handling and retry
- [ ] Upload history
- [ ] File type icons library
