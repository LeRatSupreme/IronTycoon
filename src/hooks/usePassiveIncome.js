import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { db } from '../db';
import { INFRASTRUCTURES } from '../data/upgradesCatalog';

export const usePassiveIncome = () => {
    const { user, addFunds } = useWallet();
    const [passiveIncome, setPassiveIncome] = useState(0);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const checkPassiveIncome = async () => {
            if (!user) return;

            // Check if user owns MINING_RIG
            const upgrades = user.ownedUpgrades || [];
            if (!upgrades.includes('MINING_RIG')) return;

            // Check last login (using lastWorkoutDate as proxy for now, or we should add lastLogin)
            // Ideally we track lastAPPLogin separately but let's use lastWorkoutDate or a specific lastLogin if available.
            // The prompt said "Calcule diff = Date.now() - user.lastLogin".
            // Since I don't have lastLogin, I'll use lastWorkoutDate BUT updates to lastWorkoutDate only happen on finish.
            // Actually, let's look at db.js... no lastLogin.
            // I will use a local storage timestamp for "lastSessionEnd" or just use lastWorkoutDate?
            // "lastWorkoutDate" might be too old if they just logged in yesterday but didn't workout.
            // Let's stick effectively to "Time passed since last check".

            // To be safe and simple: I'll save a "lastPassiveCheck" in localStorage or use lastWorkoutDate.
            // Let's check against lastWorkoutDate for simplicity as per request context, but request said "lastLogin".
            // I will add a localStorage sync for "last_seen".

            const lastSeenStr = localStorage.getItem('iron_tycoon_last_seen');
            const now = Date.now();

            if (lastSeenStr) {
                const lastSeen = parseInt(lastSeenStr);
                const diffMs = now - lastSeen;
                const diffHours = diffMs / (1000 * 60 * 60);

                if (diffHours > 0.1) { // Min 6 mins to trigger
                    // Cap at 24h
                    const effectiveHours = Math.min(diffHours, 24);
                    const rig = INFRASTRUCTURES.find(u => u.id === 'MINING_RIG');
                    const rate = rig ? rig.value : 100;

                    const earned = Math.floor(effectiveHours * rate);

                    if (earned > 0) {
                        setPassiveIncome(earned);
                        setShowModal(true);
                    }
                }
            }

            // Update last seen
            localStorage.setItem('iron_tycoon_last_seen', now.toString());
        };

        checkPassiveIncome();

        // Heartbeat to update last seen while app is open
        const interval = setInterval(() => {
            localStorage.setItem('iron_tycoon_last_seen', Date.now().toString());
        }, 60000);

        return () => clearInterval(interval);

    }, [user]);

    const closePassiveModal = async () => {
        if (passiveIncome > 0) {
            await addFunds(passiveIncome);
        }
        setShowModal(false);
    };

    return {
        passiveIncome,
        showModal,
        closePassiveModal
    };
};
