import { useState, useEffect, useCallback } from 'react';
import useSound from 'use-sound';

export const useCountdown = (initialSeconds, onComplete) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const [isActive, setIsActive] = useState(false);

    // Audio
    const [playAlarm] = useSound('/sounds/alarm.mp3');

    const start = useCallback((seconds) => {
        setSecondsLeft(seconds);
        setIsActive(true);
    }, []);

    const pause = useCallback(() => {
        setIsActive(false);
    }, []);

    const addTime = useCallback((amount) => {
        setSecondsLeft(prev => prev + amount);
    }, []);

    const skip = useCallback(() => {
        setSecondsLeft(0);
    }, []);

    useEffect(() => {
        let interval = null;

        if (isActive && secondsLeft > 0) {
            interval = setInterval(() => {
                setSecondsLeft(seconds => seconds - 1);
            }, 1000);
        } else if (isActive && secondsLeft === 0) {
            // Finished
            setIsActive(false);

            // Feedback
            playAlarm();
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate([200, 100, 200]);
            }

            if (onComplete) onComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, secondsLeft, onComplete, playAlarm]);

    return { secondsLeft, start, pause, addTime, skip, isActive };
};
