import Dexie from 'dexie';

export const db = new Dexie('IronTycoonDB');

// Database Version 5 (Muscle Market)
db.version(5).stores({
    user: '++id, name, balance, totalEarned, currentRank, lastWorkoutDate, lifetimeEarnings, totalTonnage, avatarId, theme',
    exercises: '++id, name, category, multiplier, personalRecord', // multiplier (1.0 to 2.0)
    workouts: '++id, date, duration, totalWOL, mood',
    logs: '++id, exerciseId, weight, reps, date', // Details
    shop: '++id, name, cost, type, purchasedCount, icon', // Keeping for legacy/inventory stats if needed
    blueprints: '++id, name, created_at, exercises', // exercises: array of objects
    daily_shop: 'id, lastRefresh, slots', // singleton id=1. slots: array of {itemId, soldOut}
    inventory: '++id, itemId, status, type, acquiredDate', // status: 'OWNED' | 'CONSUMED'
    stocks: 'ticker, currentPrice, lastWorkoutDate' // history included in object
});

db.version(6).stores({
    user: '++id, name, balance, totalEarned, currentRank, lastWorkoutDate, lifetimeEarnings, totalTonnage, avatarId, theme, *ownedUpgrades', // *ownedUpgrades for multi-entry index if needed
    exercises: '++id, name, category, multiplier, personalRecord',
    workouts: '++id, date, duration, totalWOL, mood',
    logs: '++id, exerciseId, weight, reps, date',
    shop: '++id, name, cost, type, purchasedCount, icon',
    blueprints: '++id, name, created_at, exercises',
    daily_shop: 'id, lastRefresh, slots',
    inventory: '++id, itemId, status, type, acquiredDate',
    stocks: 'ticker, currentPrice, lastWorkoutDate'
});

db.on('populate', async () => {
    // Initialize User
    await db.user.add({
        balance: 0,
        totalEarned: 0,
        currentRank: 'Stagiaire',
        lastWorkoutDate: new Date(),
        settings: {
            soundEnabled: true,
            theme: 'default'
        }
    });

    // Seed Exercises
    await db.exercises.bulkAdd([
        { name: 'Bench Press', category: 'push', multiplier: 1.5, personalRecord: 0 },
        { name: 'Squat', category: 'legs', multiplier: 1.5, personalRecord: 0 },
        { name: 'Deadlift', category: 'pull', multiplier: 1.5, personalRecord: 0 },
        { name: 'Overhead Press', category: 'push', multiplier: 1.2, personalRecord: 0 },
        { name: 'Pull Ups', category: 'pull', multiplier: 1.2, personalRecord: 0 },
        { name: 'Dumbbell Curl', category: 'pull', multiplier: 1.0, personalRecord: 0 },
        { name: 'Tricep Extension', category: 'push', multiplier: 1.0, personalRecord: 0 },
        { name: 'Running (min)', category: 'cardio', multiplier: 1.0, personalRecord: 0 },
    ]);

    // Seed Stocks
    await db.stocks.bulkAdd([
        { ticker: '$PUSH', currentPrice: 10.00, history: [], lastWorkoutDate: new Date(), ownedShares: 0 },
        { ticker: '$PULL', currentPrice: 10.00, history: [], lastWorkoutDate: new Date(), ownedShares: 0 },
        { ticker: '$LEGS', currentPrice: 10.00, history: [], lastWorkoutDate: new Date(), ownedShares: 0 },
        { ticker: '$CRDO', currentPrice: 10.00, history: [], lastWorkoutDate: new Date(), ownedShares: 0 },
    ]);

    // Seed Shop Items (Legacy/Base)
    await db.shop.bulkAdd([
        { name: 'Protein Shake', cost: 500, icon: '🥤', type: 'food', purchasedCount: 0 },
        { name: 'Creatine', cost: 1500, icon: '🧪', type: 'food', purchasedCount: 0 },
        { name: 'Gym Membership', cost: 5000, icon: '💳', type: 'leisure', purchasedCount: 0 },
        { name: 'New Sneakers', cost: 8000, icon: '👟', type: 'gear', purchasedCount: 0 },
        { name: 'Smart Watch', cost: 15000, icon: '⌚', type: 'gear', purchasedCount: 0 },
        { name: 'Home Gym', cost: 50000, icon: '🏋️', type: 'gear', purchasedCount: 0 },
        { name: 'Private Jet', cost: 1000000, icon: '✈️', type: 'leisure', purchasedCount: 0 },
    ]);
});
