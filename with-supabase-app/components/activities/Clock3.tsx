import React, { useState, useEffect, useRef } from 'react';

interface ClockProps {
  initialTimeInSeconds: number;
  startTrigger: boolean; // Prop to tell the clock to start
  // Removed the onExpire prop
  isExpiredStatus?: (expired: boolean) => void; // New optional prop to signal expired status
}

export default function Clock3({ initialTimeInSeconds, startTrigger, isExpiredStatus }: ClockProps) { // Use isExpiredStatus prop
  const [timeLeft, setTimeLeft] = useState(initialTimeInSeconds);
  const [isExpired, setIsExpired] = useState(false); // Internal state for expired status
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect to initialize or reset the time when initialTimeInSeconds changes
  useEffect(() => {
    setTimeLeft(initialTimeInSeconds);
    setIsExpired(false); // Reset expired status when initial time changes
  }, [initialTimeInSeconds]);

  // Effect to handle starting and stopping the timer based on startTrigger
  useEffect(() => {
    if (startTrigger) {
      // Clear any existing timer before starting a new one
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Ensure isExpired is false when starting
      setIsExpired(false);

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsExpired(true); // Set internal expired state
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // If startTrigger is false, clear the interval
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Do NOT reset time here when stopped.
    }

    // Cleanup function to clear the interval
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // Dependencies: Only startTrigger
  }, [startTrigger]); // Removed onExpire from dependencies

  // NEW useEffect to signal expired status to parent
  useEffect(() => {
      if (isExpired && isExpiredStatus) {
          isExpiredStatus(true); // Call parent callback with true when expired
      }
      // You might also want to call with false when starting if needed by the parent
      // else if (!isExpired && isExpiredStatus) {
      //     isExpiredStatus(false);
      // }
  }, [isExpired, isExpiredStatus]); // Depends on internal isExpired state and the parent callback

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
}
