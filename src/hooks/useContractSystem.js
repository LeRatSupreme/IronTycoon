import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { differenceInDays, startOfWeek, format } from 'date-fns';
import useSound from 'use-sound';
import { useWallet } from '../context/WalletContext';

export const useContractSystem = () => {
    const { user, addFunds, subtractFunds } = useWallet();

    // Get current week ID (e.g., "2026-W02")
    const getCurrentWeekId = () => {
        const now = new Date();
        // Force Monday as start of week for ID generation
        const start = startOfWeek(now, { weekStartsOn: 1 });
        return format(start, 'yyyy-II'); // ISO Week Date format
    };

    const currentWeekId = getCurrentWeekId();

    // Query contracts for this week
    const weeklyContracts = useLiveQuery(() =>
        db.contracts.where('weekId').equals(currentWeekId).toArray()
        , [currentWeekId]);

    const activeContract = weeklyContracts?.find(c => c.status === 'ACTIVE' || c.status === 'COMPLETED' || c.status === 'FAILED');

    // Sounds
    const [playSign] = useSound('/sounds/ui_select.mp3'); // Need a specific paper sound ideally
    const [playSuccess] = useSound('/sounds/jackpot.mp3');
    const [playFail] = useSound('/sounds/fail.mp3');

    // -- GENERATION LOGIC --
    const generateWeeklyOffers = async () => {
        // If already exists for this week, skip
        const existing = await db.contracts.where('weekId').equals(currentWeekId).first();
        if (existing) return;

        const baseDifficulty = Math.max(1000, user?.totalEarned * 0.1 || 1000); // Scale with earnings

        const offers = [
            // Offer 1: Heavy Lift (Tonnage)
            {
                id: uuidv4(),
                weekId: currentWeekId,
                type: 'HEAVY_LIFT',
                title: 'OPERATION TITAN',
                description: 'Soulever un volume total massif.',
                difficulty: 'HARD',
                targetValue: Math.floor(baseDifficulty * 0.3), // Reduced difficulty
                reward: 800,
                penalty: 500,
                status: 'OFFERED',
                currentProgress: 0,
                deadline: null, // Set on sign
                durationHours: 48
            },
            // Offer 2: Cardio Rush
            {
                id: uuidv4(),
                weekId: currentWeekId,
                type: 'CARDIO_RUSH',
                title: 'PROTOCOLE VITESSE',
                description: 'Générer des crédits via exercices Cardio.',
                difficulty: 'MEDIUM',
                targetValue: 250, // Reduced requirement
                reward: 450,
                penalty: 300,
                status: 'OFFERED',
                currentProgress: 0,
                deadline: null,
                durationHours: 72
            },
            // Offer 3: Consistency / Income
            {
                id: uuidv4(),
                weekId: currentWeekId,
                type: 'INCOME_STREAM',
                title: 'RENDEMENT CORPORATIF',
                description: 'Gagner un total net sur cette séance.',
                difficulty: 'EASY',
                targetValue: 300,
                reward: 150,
                penalty: 100,
                status: 'OFFERED',
                currentProgress: 0,
                deadline: null,
                durationHours: 24
            }
        ];

        await db.contracts.bulkAdd(offers);
    };

    // -- ACTIONS --
    const signContract = async (contract) => {
        if (activeContract) return; // Already signed one this week

        // Delete other offers for this week? 
        // User said "User can sign ONLY ONE".
        // Strategy: Mark selected as ACTIVE, others as 'ARCHIVED' or just leave them 'OFFERED' but unselectable.
        // Let's mark others as 'DISCARDED'.

        const others = weeklyContracts.filter(c => c.id !== contract.id);
        const deadline = new Date(Date.now() + contract.durationHours * 60 * 60 * 1000);

        await db.transaction('rw', db.contracts, async () => {
            await db.contracts.update(contract.id, {
                status: 'ACTIVE',
                deadline: deadline
            });
            for (const other of others) {
                await db.contracts.update(other.id, { status: 'DISCARDED' });
            }
        });
        playSign();
    };

    const trackProgress = async (sessionData) => {
        // sessionData: { exercises: [], totalWOL: number }
        // Fetch fresh status in case useLiveQuery is lagging? No, assume called in valid state.

        // We need to fetch the Active Contract directly from DB to be safe
        const contracts = await db.contracts.where('weekId').equals(currentWeekId).toArray();
        const active = contracts.find(c => c.status === 'ACTIVE');

        if (!active) return;

        // Check Deadline
        if (new Date() > active.deadline) {
            await failContract(active);
            return;
        }

        let progressDelta = 0;

        if (active.type === 'HEAVY_LIFT') {
            // Sum tonnage of the session
            // logs are not passed directly, but sessionExercises normally have Sets inside
            // sessionData.exercises = [{ sets: [{weight, reps}, ...] }]
            sessionData.exercises?.forEach(exo => {
                exo.sets?.forEach(set => {
                    progressDelta += (Number(set.weight) * Number(set.reps));
                });
            });
        }
        else if (active.type === 'CARDIO_RUSH') {
            // Count WOL gained from Cardio exercises
            sessionData.exercises?.forEach(exo => {
                if (exo.category === 'cardio') {
                    // Re-calculate gain approximately or pass it?
                    // We need the gain.
                    // ActiveWorkout calculates gain. We should pass the actual gains maybe?
                    // Simplified: Assume session data has gain, or re-calc.
                    // Let's assume re-calc for now: (duration * 10) * multiplier
                    // Actually ActiveWorkout processSetLog adds funds immediately. 
                    // We might need to sum it up.

                    // Allow simple approximation:
                    // If it's cardio, use sets duration * 10 * mult
                    exo.sets?.forEach(set => {
                        const duration = Number(set.duration || 0); // ActiveWorkout sets might use 'reps' field for duration or separate
                        // In ActiveWorkout: processSetLog(exo, w, r, duration)
                        // It stores in db.logs.
                        // Ideally trackProgress receives explicit "+500 WOL" signals, but finalizing is easier.
                        // Let's assume we pass { cardioWOL: 123 } from finalize
                        progressDelta += (set.gain || 0); // We need 'gain' in the set object passed from finalize
                    });
                }
            });
        }
        else if (active.type === 'INCOME_STREAM') {
            progressDelta = sessionData.totalWOL;
        }

        const newProgress = active.currentProgress + progressDelta;

        // Update DB
        await db.contracts.update(active.id, { currentProgress: newProgress });

        // Check Completion
        if (newProgress >= active.targetValue) {
            await completeContract(active);
        }
    };

    const completeContract = async (contract) => {
        await db.contracts.update(contract.id, { status: 'COMPLETED' });
        await addFunds(contract.reward);
        playSuccess();
        alert(`CONTRAT REMPLI ! PRIME VERSÉE : +$${contract.reward}`);
    };

    const failContract = async (contract) => {
        await db.contracts.update(contract.id, { status: 'FAILED' });
        await subtractFunds(contract.penalty);
        playFail();
        alert(`CONTRAT ROMPU (Deadline). PÉNALITÉ : -$${contract.penalty}`);
    };

    // Initial Check
    if (user && !weeklyContracts?.length) {
        generateWeeklyOffers();
    }

    return {
        weeklyContracts,
        activeContract,
        signContract,
        trackProgress,
        timeRemaining: activeContract?.deadline ? activeContract.deadline - new Date() : null
    };
};
