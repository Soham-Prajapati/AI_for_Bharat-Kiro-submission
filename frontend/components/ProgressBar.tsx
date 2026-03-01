'use client'


interface ProgressBarProps {
  progress: number // 0-100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const isComplete = progress >= 100

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">
          {isComplete ? 'Upload Complete!' : 'Uploading...'}
        </span>
        <span className="text-sm font-semibold text-white">
          {Math.round(progress)}%
        </span>
      </div>
      
      <div className="relative w-full h-3 bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full rounded-full ${
            isComplete
              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}
        />
        
        {/* Animated shimmer effect */}
        {!isComplete && (
          <div
            className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        )}
      </div>
    </div>
  )
}
