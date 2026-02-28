import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface Task {
  id: string;
  title: string;
  steps: TaskStep[];
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface TaskStep {
  id: string;
  description: string;
  completed: boolean;
  duration?: number; // in minutes
}

export interface PomodoroSession {
  id: string;
  type: 'work' | 'break';
  duration: number; // in seconds
  completedAt: Date;
  taskId?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  target: number;
}

export interface SessionStats {
  totalSessions: number;
  totalWorkTime: number; // in minutes
  tasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
}

// ============================================================================
// Mock Data
// ============================================================================

const mockAchievements: Achievement[] = [
  {
    id: '1',
    title: 'First Steps',
    description: 'Complete your first Pomodoro session',
    icon: '🎯',
    unlockedAt: new Date('2024-01-15'),
    progress: 1,
    target: 1,
  },
  {
    id: '2',
    title: 'Focus Master',
    description: 'Complete 10 Pomodoro sessions',
    icon: '🔥',
    progress: 7,
    target: 10,
  },
  {
    id: '3',
    title: 'Task Crusher',
    description: 'Complete 25 tasks',
    icon: '⚡',
    progress: 18,
    target: 25,
  },
  {
    id: '4',
    title: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '🏆',
    progress: 4,
    target: 7,
  },
];

const mockSessionHistory: PomodoroSession[] = [
  {
    id: '1',
    type: 'work',
    duration: 1500,
    completedAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    type: 'break',
    duration: 300,
    completedAt: new Date('2024-01-15T11:05:00'),
  },
  {
    id: '3',
    type: 'work',
    duration: 1500,
    completedAt: new Date('2024-01-15T11:35:00'),
  },
];

const mockStats: SessionStats = {
  totalSessions: 47,
  totalWorkTime: 1175, // minutes
  tasksCompleted: 18,
  currentStreak: 4,
  longestStreak: 7,
};

// ============================================================================
// Main Component
// ============================================================================

export const ADHDNavigator: React.FC = () => {
  // Timer state
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'break'>('work');
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // UI state
  const [focusMode, setFocusMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Task state
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [stepInput, setStepInput] = useState('');
  
  // Data
  const [achievements] = useState<Achievement[]>(mockAchievements);
  const [stats] = useState<SessionStats>(mockStats);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Timer Logic
  // ============================================================================

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSessionComplete();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft]);

  const handleSessionComplete = () => {
    setIsActive(false);
    setShowCelebration(true);
    setCompletedSessions((prev) => prev + 1);
    
    // Play celebration and switch session type
    setTimeout(() => {
      setShowCelebration(false);
      if (sessionType === 'work') {
        setSessionType('break');
        setTimeLeft(5 * 60); // 5 minute break
      } else {
        setSessionType('work');
        setTimeLeft(25 * 60); // 25 minute work session
      }
    }, 3000);
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionType === 'work' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    const total = sessionType === 'work' ? 25 * 60 : 5 * 60;
    return ((total - timeLeft) / total) * 100;
  };

  // ============================================================================
  // Task Management
  // ============================================================================

  const createTask = () => {
    if (!taskInput.trim()) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskInput,
      steps: [],
      completed: false,
      createdAt: new Date(),
    };
    
    setCurrentTask(newTask);
    setTaskInput('');
  };

  const addStep = () => {
    if (!stepInput.trim() || !currentTask) return;
    
    const newStep: TaskStep = {
      id: Date.now().toString(),
      description: stepInput,
      completed: false,
    };
    
    setCurrentTask({
      ...currentTask,
      steps: [...currentTask.steps, newStep],
    });
    setStepInput('');
  };

  const toggleStep = (stepId: string) => {
    if (!currentTask) return;
    
    const updatedSteps = currentTask.steps.map((step) =>
      step.id === stepId ? { ...step, completed: !step.completed } : step
    );
    
    const allCompleted = updatedSteps.every((step) => step.completed);
    
    setCurrentTask({
      ...currentTask,
      steps: updatedSteps,
      completed: allCompleted && updatedSteps.length > 0,
    });
    
    if (allCompleted && updatedSteps.length > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  };

  const clearTask = () => {
    setCurrentTask(null);
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="adhd-navigator">
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="celebration-content">
            <div className="celebration-emoji">🎉</div>
            <h2 className="celebration-text">Amazing Work!</h2>
            <p className="celebration-subtext">
              {sessionType === 'work' ? 'Time for a break!' : 'Ready for another session?'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="navigator-header">
        <h1 className="navigator-title">Focus Navigator</h1>
        <div className="header-controls">
          <button
            className={`control-btn ${focusMode ? 'active' : ''}`}
            onClick={() => setFocusMode(!focusMode)}
            aria-label="Toggle focus mode"
          >
            {focusMode ? '👁️' : '👁️‍🗨️'}
          </button>
          <button
            className="control-btn"
            onClick={() => setShowStats(!showStats)}
            aria-label="View statistics"
          >
            📊
          </button>
          <button
            className="control-btn"
            onClick={() => setShowAchievements(!showAchievements)}
            aria-label="View achievements"
          >
            🏆
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`navigator-content ${focusMode ? 'focus-mode' : ''}`}>
        {/* Pomodoro Timer */}
        <div className="timer-section">
          <div className="session-indicator">
            <span className={`session-badge ${sessionType}`}>
              {sessionType === 'work' ? '🎯 Work Time' : '☕ Break Time'}
            </span>
          </div>
          
          <div className="timer-display">
            {formatTime(timeLeft)}
          </div>
          
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
          
          <div className="timer-controls">
            <button
              className="timer-btn primary"
              onClick={toggleTimer}
              aria-label={isActive ? 'Pause timer' : 'Start timer'}
            >
              {isActive ? '⏸️ Pause' : '▶️ Start'}
            </button>
            <button
              className="timer-btn secondary"
              onClick={resetTimer}
              aria-label="Reset timer"
            >
              🔄 Reset
            </button>
          </div>
          
          <div className="session-counter">
            Sessions Today: <strong>{completedSessions}</strong>
          </div>
        </div>

        {/* Task Section */}
        {!focusMode && (
          <div className="task-section">
            <h2 className="section-title">Current Task</h2>
            
            {!currentTask ? (
              <div className="task-input-container">
                <input
                  type="text"
                  className="task-input"
                  placeholder="What are you working on?"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createTask()}
                />
                <button className="add-btn" onClick={createTask}>
                  ➕ Add Task
                </button>
              </div>
            ) : (
              <div className="current-task">
                <div className="task-header">
                  <h3 className="task-title">{currentTask.title}</h3>
                  <button className="clear-btn" onClick={clearTask}>
                    ✖️
                  </button>
                </div>
                
                <div className="steps-container">
                  <h4 className="steps-title">Break it down:</h4>
                  
                  {currentTask.steps.map((step) => (
                    <div key={step.id} className="step-item">
                      <button
                        className={`step-checkbox ${step.completed ? 'checked' : ''}`}
                        onClick={() => toggleStep(step.id)}
                        aria-label={step.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {step.completed ? '✅' : '⬜'}
                      </button>
                      <span className={`step-text ${step.completed ? 'completed' : ''}`}>
                        {step.description}
                      </span>
                    </div>
                  ))}
                  
                  <div className="step-input-container">
                    <input
                      type="text"
                      className="step-input"
                      placeholder="Add a small step..."
                      value={stepInput}
                      onChange={(e) => setStepInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addStep()}
                    />
                    <button className="add-step-btn" onClick={addStep}>
                      ➕
                    </button>
                  </div>
                </div>
                
                {currentTask.completed && (
                  <div className="task-complete-badge">
                    ✨ Task Complete! ✨
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Statistics Panel */}
        {showStats && !focusMode && (
          <div className="stats-panel">
            <h2 className="section-title">Your Progress</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats.totalSessions}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{Math.floor(stats.totalWorkTime / 60)}h</div>
                <div className="stat-label">Focus Time</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.tasksCompleted}</div>
                <div className="stat-label">Tasks Done</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.currentStreak} 🔥</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements Panel */}
        {showAchievements && !focusMode && (
          <div className="achievements-panel">
            <h2 className="section-title">Achievements</h2>
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`achievement-card ${achievement.unlockedAt ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <h3 className="achievement-title">{achievement.title}</h3>
                    <p className="achievement-description">{achievement.description}</p>
                    <div className="achievement-progress">
                      <div className="achievement-progress-bar">
                        <div
                          className="achievement-progress-fill"
                          style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                        />
                      </div>
                      <span className="achievement-progress-text">
                        {achievement.progress}/{achievement.target}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`

        .adhd-navigator {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #1a1a2e;
          min-height: 100vh;
          color: #eee;
        }

        /* Header */
        .navigator-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          padding-bottom: 1.5rem;
          border-bottom: 3px solid #16213e;
        }

        .navigator-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          color: #4ecca3;
          letter-spacing: -0.5px;
        }

        .header-controls {
          display: flex;
          gap: 1rem;
        }

        .control-btn {
          background: #16213e;
          border: 2px solid #4ecca3;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: #4ecca3;
          transform: scale(1.1);
        }

        .control-btn.active {
          background: #4ecca3;
          box-shadow: 0 0 20px rgba(78, 204, 163, 0.5);
        }

        /* Main Content */
        .navigator-content {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .navigator-content.focus-mode .task-section,
        .navigator-content.focus-mode .stats-panel,
        .navigator-content.focus-mode .achievements-panel {
          display: none;
        }

        /* Timer Section */
        .timer-section {
          background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
          border-radius: 24px;
          padding: 3rem;
          text-align: center;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          border: 3px solid #4ecca3;
        }

        .session-indicator {
          margin-bottom: 2rem;
        }

        .session-badge {
          display: inline-block;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .session-badge.work {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .session-badge.break {
          background: linear-gradient(135deg, #4ecca3 0%, #2ecc71 100%);
          color: white;
        }

        .timer-display {
          font-size: 8rem;
          font-weight: 900;
          color: #4ecca3;
          margin: 2rem 0;
          font-variant-numeric: tabular-nums;
          text-shadow: 0 0 30px rgba(78, 204, 163, 0.5);
          line-height: 1;
        }

        .progress-bar-container {
          width: 100%;
          height: 20px;
          background: #0f1419;
          border-radius: 10px;
          overflow: hidden;
          margin: 2rem 0;
          border: 2px solid #16213e;
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ecca3 0%, #2ecc71 100%);
          transition: width 1s linear;
          box-shadow: 0 0 20px rgba(78, 204, 163, 0.6);
        }

        .timer-controls {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          margin: 2rem 0;
        }

        .timer-btn {
          padding: 1.5rem 3rem;
          font-size: 1.75rem;
          font-weight: 700;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .timer-btn.primary {
          background: linear-gradient(135deg, #4ecca3 0%, #2ecc71 100%);
          color: white;
          box-shadow: 0 6px 20px rgba(78, 204, 163, 0.4);
        }

        .timer-btn.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(78, 204, 163, 0.6);
        }

        .timer-btn.secondary {
          background: #16213e;
          color: #4ecca3;
          border: 3px solid #4ecca3;
        }

        .timer-btn.secondary:hover {
          background: #4ecca3;
          color: white;
          transform: translateY(-3px);
        }

        .session-counter {
          font-size: 1.5rem;
          color: #93a5b1;
          margin-top: 1.5rem;
        }

        .session-counter strong {
          color: #4ecca3;
          font-size: 1.75rem;
        }

        /* Task Section */
        .task-section {
          background: #16213e;
          border-radius: 24px;
          padding: 2.5rem;
          border: 3px solid #0f3460;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 2rem 0;
          color: #4ecca3;
        }

        .task-input-container {
          display: flex;
          gap: 1rem;
        }

        .task-input {
          flex: 1;
          padding: 1.5rem;
          font-size: 1.5rem;
          border: 3px solid #0f3460;
          border-radius: 12px;
          background: #0f1419;
          color: #eee;
          outline: none;
        }

        .task-input:focus {
          border-color: #4ecca3;
          box-shadow: 0 0 0 3px rgba(78, 204, 163, 0.2);
        }

        .add-btn {
          padding: 1.5rem 2.5rem;
          font-size: 1.5rem;
          font-weight: 700;
          background: #4ecca3;
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-btn:hover {
          background: #2ecc71;
          transform: scale(1.05);
        }

        .current-task {
          background: #0f1419;
          border-radius: 16px;
          padding: 2rem;
          border: 2px solid #0f3460;
        }

        .task-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #16213e;
        }

        .task-title {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          color: #eee;
        }

        .clear-btn {
          background: #e74c3c;
          border: none;
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-btn:hover {
          background: #c0392b;
          transform: scale(1.1);
        }

        .steps-container {
          margin-top: 1.5rem;
        }

        .steps-title {
          font-size: 1.25rem;
          color: #93a5b1;
          margin-bottom: 1rem;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          margin-bottom: 0.75rem;
          background: #16213e;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .step-item:hover {
          background: #1a2942;
        }

        .step-checkbox {
          background: transparent;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          transition: transform 0.2s ease;
          padding: 0;
        }

        .step-checkbox:hover {
          transform: scale(1.2);
        }

        .step-text {
          font-size: 1.25rem;
          color: #eee;
          flex: 1;
        }

        .step-text.completed {
          text-decoration: line-through;
          color: #93a5b1;
        }

        .step-input-container {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .step-input {
          flex: 1;
          padding: 1rem;
          font-size: 1.25rem;
          border: 2px solid #16213e;
          border-radius: 12px;
          background: #1a1a2e;
          color: #eee;
          outline: none;
        }

        .step-input:focus {
          border-color: #4ecca3;
        }

        .add-step-btn {
          background: #4ecca3;
          border: none;
          border-radius: 12px;
          padding: 1rem 1.5rem;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-step-btn:hover {
          background: #2ecc71;
          transform: scale(1.1);
        }

        .task-complete-badge {
          margin-top: 2rem;
          padding: 1.5rem;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 12px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        /* Stats Panel */
        .stats-panel {
          background: #16213e;
          border-radius: 24px;
          padding: 2.5rem;
          border: 3px solid #0f3460;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #0f3460 0%, #16213e 100%);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          border: 2px solid #4ecca3;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(78, 204, 163, 0.3);
        }

        .stat-value {
          font-size: 3rem;
          font-weight: 900;
          color: #4ecca3;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1.125rem;
          color: #93a5b1;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Achievements Panel */
        .achievements-panel {
          background: #16213e;
          border-radius: 24px;
          padding: 2.5rem;
          border: 3px solid #0f3460;
        }

        .achievements-grid {
          display: grid;
          gap: 1.5rem;
        }

        .achievement-card {
          display: flex;
          gap: 1.5rem;
          background: #0f1419;
          border-radius: 16px;
          padding: 1.5rem;
          border: 2px solid #0f3460;
          transition: all 0.3s ease;
        }

        .achievement-card.unlocked {
          border-color: #4ecca3;
        }

        .achievement-card.locked {
          opacity: 0.6;
        }

        .achievement-card:hover {
          transform: translateX(5px);
        }

        .achievement-icon {
          font-size: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .achievement-info {
          flex: 1;
        }

        .achievement-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #eee;
        }

        .achievement-description {
          font-size: 1.125rem;
          color: #93a5b1;
          margin: 0 0 1rem 0;
        }

        .achievement-progress {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .achievement-progress-bar {
          flex: 1;
          height: 12px;
          background: #16213e;
          border-radius: 6px;
          overflow: hidden;
        }

        .achievement-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4ecca3 0%, #2ecc71 100%);
          transition: width 0.5s ease;
        }

        .achievement-progress-text {
          font-size: 1rem;
          color: #4ecca3;
          font-weight: 700;
          min-width: 50px;
        }

        /* Celebration Overlay */
        .celebration-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .celebration-content {
          text-align: center;
          animation: bounceIn 0.6s ease;
        }

        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .celebration-emoji {
          font-size: 8rem;
          margin-bottom: 1rem;
          animation: rotate 2s ease-in-out infinite;
        }

        @keyframes rotate {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(10deg); }
        }

        .celebration-text {
          font-size: 4rem;
          font-weight: 900;
          color: #4ecca3;
          margin: 0 0 1rem 0;
          text-shadow: 0 0 30px rgba(78, 204, 163, 0.8);
        }

        .celebration-subtext {
          font-size: 2rem;
          color: #93a5b1;
          margin: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .adhd-navigator {
            padding: 1rem;
          }

          .navigator-title {
            font-size: 2rem;
          }

          .timer-display {
            font-size: 5rem;
          }

          .timer-btn {
            padding: 1rem 2rem;
            font-size: 1.25rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .celebration-emoji {
            font-size: 5rem;
          }

          .celebration-text {
            font-size: 2.5rem;
          }

          .celebration-subtext {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ADHDNavigator;
