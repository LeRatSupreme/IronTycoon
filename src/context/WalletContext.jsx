import { createContext, useContext, useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { differenceInDays } from 'date-fns';
import useSound from 'use-sound';

const WalletContext = createContext();

// Ranks definition
const RANKS = [
    { name: 'Stagiaire', threshold: 0 },
    { name: 'Trader', threshold: 5000 },
    { name: 'Broker', threshold: 20000 },
    { name: 'Shark', threshold: 50000 },
    { name: 'Wolf of Wall Street', threshold: 100000 },
    { name: 'Iron Tycoon', threshold: 1000000 },
];

export const WalletProvider = ({ children }) => {
    const user = useLiveQuery(() => db.user.orderBy('id').first());
    const [showInactivityModal, setShowInactivityModal] = useState(false);
    const [inactivityPenalty, setInactivityPenalty] = useState(0);

    // Audio (Generic fail sound for taxes)
    const [playFail] = useSound('/sounds/fail.mp3');

    // Global Multiplier (Happy Hour)
    const [globalMultiplier, setGlobalMultiplier] = useState(1);



    const addFunds = async (amount) => {
        if (!user) return;
        const newTotal = user.totalEarned + amount;
        const newBalance = user.balance + amount;

        // Check Rank Upgrade
        const newRank = RANKS.reduce((prev, curr) =>
            newTotal >= curr.threshold ? curr.name : prev
            , user.currentRank);

        await db.user.update(user.id, {
            balance: newBalance,
            totalEarned: newTotal,
            currentRank: newRank
        });
    };

    const subtractFunds = async (amount) => {
        if (!user) return false;
        if (user.balance < amount) return false;

        await db.user.update(user.id, {
            balance: user.balance - amount
        });
        return true;
    };

    const updateLastWorkout = async () => {
        if (!user) return;
        await db.user.update(user.id, {
            lastWorkoutDate: new Date()
        });
    };

    // Generic Settings Update
    const updateTheme = async (themeName) => {
        if (!user) return;
        await db.user.update(user.id, { theme: themeName });
    };

    const updateSettings = async (newSettings) => {
        if (!user) return;
        const updated = { ...user.settings, ...newSettings };
        await db.user.update(user.id, { settings: updated });

        // Apply side effects
        if (newSettings.theme) {
            // Theme is also stored at root level for legacy, sync it
            await db.user.update(user.id, { theme: newSettings.theme });
        }
    };

    const toggleHolidayMode = async () => {
        if (!user) return;
        const isActive = user.settings?.holidayMode;

        if (!isActive) {
            // Activating: Costs 500
            if (user.balance < 500) {
                alert("FONDS INSUFFISANTS. COÛT: 500 $WOL");
                return;
            }
            await subtractFunds(500);
            await updateSettings({ holidayMode: true });
        } else {
            // Deactivating: Free
            await updateSettings({ holidayMode: false });
        }
    };

    const exportData = async () => {
        const data = {
            user: await db.user.toArray(),
            workouts: await db.workouts.toArray(),
            logs: await db.logs.toArray(),
            inventory: await db.inventory.toArray(),
            stocks: await db.stocks.toArray(),
            blueprints: await db.blueprints.toArray(),
            shop: await db.shop.toArray(), // status of shop items
            timestamp: new Date().toISOString(),
            version: "1.0.0"
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `iron-tycoon-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    const importData = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.version || !data.user) throw new Error("Format Invalide");

                await db.transaction('rw', db.user, db.workouts, db.logs, db.inventory, db.stocks, db.blueprints, db.shop, async () => {
                    await db.user.clear(); await db.user.bulkAdd(data.user);
                    await db.workouts.clear(); await db.workouts.bulkAdd(data.workouts || []);
                    await db.logs.clear(); await db.logs.bulkAdd(data.logs || []);
                    if (data.inventory) { await db.inventory.clear(); await db.inventory.bulkAdd(data.inventory); }
                    if (data.stocks) { await db.stocks.clear(); await db.stocks.bulkAdd(data.stocks); }
                    if (data.blueprints) { await db.blueprints.clear(); await db.blueprints.bulkAdd(data.blueprints); }
                    if (data.shop) { await db.shop.clear(); await db.shop.bulkAdd(data.shop); }
                });
                window.location.reload();
            } catch (err) {
                alert("Erreur Import: " + err.message);
            }
        };
        reader.readAsText(file);
    };

    const resetData = async () => {
        if (!user) return;
        if (window.confirm("FATAL: ERASE ALL CORPORATE DATA? (IRREVERSIBLE)")) {
            if (window.confirm("ARE YOU SURE?")) {
                await db.delete();
                window.location.reload();
            }
        }
    };

    const completeOnboarding = async (name) => {
        if (!user) return;
        await db.user.update(user.id, {
            name: name,
            onboardingComplete: true
        });
    };

    useEffect(() => {
        const checkInflation = async () => {
            if (!user) return;

            // Check Holiday Mode
            if (user.settings?.holidayMode) return;

            const lastWorkout = user.lastWorkoutDate;
            const today = new Date();
            const daysDiff = differenceInDays(today, lastWorkout);

            if (daysDiff > 3) {
                const penalty = daysDiff * 50;
                const newBalance = Math.max(0, user.balance - penalty);

                await db.user.update(user.id, {
                    balance: newBalance,
                });

                setInactivityPenalty(penalty);
                setShowInactivityModal(true);
                playFail();
            }
        };

        checkInflation();
    }, [user?.lastWorkoutDate, user?.settings?.holidayMode]); // Re-run if holiday mode changes? No, mainly on load.

    useEffect(() => {
        const theme = user?.theme || 'default';
        document.body.className = ''; // reset
        if (theme === 'cyber') document.body.classList.add('theme-cyber');
        if (theme === 'gold') document.body.classList.add('theme-gold');
        // default uses root vars
    }, [user?.theme]);

    return (
        <WalletContext.Provider value={{
            user,
            addFunds,
            subtractFunds,
            updateLastWorkout,
            showInactivityModal,
            setShowInactivityModal,
            inactivityPenalty,
            globalMultiplier,
            setGlobalMultiplier,
            updateTheme, // Legacy support
            updateSettings,
            toggleHolidayMode,
            exportData,
            importData,
            resetData,
            completeOnboarding
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => useContext(WalletContext);
