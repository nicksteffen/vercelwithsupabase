// components/Clock.tsx
import React, { useState, useEffect, useRef } from 'react';

interface ClockProps {
  initialTimeInSeconds: number;
  startTrigger: boolean; // Prop to tell the clock to start
  onExpire: () => void; // Callback to notify parent when expired
}

const Clock: React.FC<ClockProps> = ({ initialTimeInSeconds, startTrigger, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Use useRef to hold the timer ID

  // Effect to handle starting and stopping the timer
  useEffect(() => {
    if (startTrigger && timeLeft > 0 && timerRef.current === null) {
      // Start the timer only if startTrigger is true, time is left, and timer isn't already running
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) { // Check for <= 1 to ensure it hits 0 and then clears
            clearInterval(timerRef.current!);
            timerRef.current = null;
            onExpire(); // Notify parent
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    // Cleanup function to clear the interval when the component unmounts
    // or when startTrigger becomes false, or initialTimeInSeconds changes
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [startTrigger, timeLeft, onExpire]); // Dependencies for the effect

  // Reset clock if initialTimeInSeconds changes and timer is not running
  useEffect(() => {
    if (!startTrigger && timeLeft !== initialTimeInSeconds) {
      setTimeLeft(initialTimeInSeconds);
    }
  }, [timeLeft, initialTimeInSeconds, startTrigger]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ fontSize: '2em', fontWeight: 'bold' }}>
      {formatTime(timeLeft)}
    </div>
  );
};

export default Clock;