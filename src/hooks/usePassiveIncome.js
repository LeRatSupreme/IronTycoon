
import { useEffect, useState } from 'react';
import { db } from '../db';
import { differenceInHours } from 'date-fns';
import { useWallet } from '../context/WalletContext';

export const usePassiveIncome = () => {
    const { addFunds, user } = useWallet();
    const [passiveIncome, setPassiveIncome] = useState(0);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const checkPassiveIncome = async () => {
            const currentUser = await db.user.get(1); // Assuming single user ID 1
            if (!currentUser || !currentUser.ownedUpgrades?.includes('MINING_RIG')) return;

            // Last logged in simulation
            // In a real app we'd track 'lastSessionEnd', but here we can use 'lastWorkoutDate' or a new field 'lastLogin' if we had one.
            // Let's assume we update 'lastLogin' on close or periodically?
            // For now, let's use a stored timestamp in local storage for simplicity as it's "session" based

            const lastLoginStr = localStorage.getItem('lastLogin');
            if (lastLoginStr) {
                const lastLogin = new Date(lastLoginStr);
                const now = new Date();
                const hoursDiff = differenceInHours(now, lastLogin);

                if (hoursDiff > 0) {
                    const effectiveHours = Math.min(hoursDiff, 24); // Cap at 24h
                    const earned = effectiveHours * 100;

                    if (earned > 0) {
                        setPassiveIncome(earned);
                        setShowModal(true);
                        addFunds(earned);
                    }
                }
            }

            // Update lastLogin now for next time
            localStorage.setItem('lastLogin', new Date().toISOString());
        };

        checkPassiveIncome();

        // Update heartbeat
        const interval = setInterval(() => {
            localStorage.setItem('lastLogin', new Date().toISOString());
        }, 60000);

        return () => clearInterval(interval);

    }, []); // Run once on mount

    return { passiveIncome, showModal, closePassiveModal: () => setShowModal(false) };
};
