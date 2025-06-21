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

  // Effect to handle starting and stopping the timer
  useEffect(() => {
    // Check if startTrigger is true AND the timer is not currently running
    if (startTrigger && timerRef.current === null) {
      // This is the condition to start a NEW timer
      setTimeLeft(initialTimeInSeconds); // Reset time to initial
      setIsExpired(false); // Reset expired status

      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setIsExpired(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (!startTrigger && timerRef.current !== null) {
      // If startTrigger is false AND the timer is running, stop it
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // Note: If startTrigger is false and timerRef.current is null, do nothing (clock is already stopped)

    // Cleanup function to clear the interval when the component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // Dependencies: startTrigger and initialTimeInSeconds.
    // We include initialTimeInSeconds so if the parent changes it while not running,
    // and then sets startTrigger to true, the new initial time is used.
  }, [startTrigger, initialTimeInSeconds]);

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
