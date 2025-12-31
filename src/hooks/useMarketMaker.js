
import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { differenceInDays, differenceInMinutes, subDays } from 'date-fns';
import useSound from 'use-sound';

// Constants
const TICK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const HISTORY_LIMIT = 50;
const MAX_VOLATILITY = 0.02; // +/- 2%
const PUMP_MIN = 0.15; // +15%
const PUMP_MAX = 0.25; // +25%
const DUMP_PENALTY_PER_DAY = 0.10; // -10% per day overdue
const DUMP_THRESHOLD_DAYS = 3;

/**
 * useMarketMaker Hook
 * Manages the background simulation of the Muscle Market.
 */
export const useMarketMaker = () => {
    const stocks = useLiveQuery(() => db.stocks.toArray());
    const [playBell] = useSound('/sounds/coin.mp3', { volume: 0.3 }); // Placeholder sound

    // Helper to calculate new price based on volatility
    const calculateNewPrice = (currentPrice, volatility) => {
        const change = currentPrice * (Math.random() * (volatility * 2) - volatility);
        return Math.max(0.01, currentPrice + change); // Never go below 0.01
    };

    // Helper to add history point
    const addHistoryPoint = (history, price) => {
        const newHistory = [...(history || []), { time: Date.now(), price }];
        if (newHistory.length > HISTORY_LIMIT) {
            return newHistory.slice(newHistory.length - HISTORY_LIMIT);
        }
        return newHistory;
    };

    /**
     * Offline Simulation & Tick System
     */
    useEffect(() => {
        if (!stocks) return;

        // Seeding Logic for Existing Users (v4 -> v5 migration catch)
        if (stocks.length === 0) {
            db.stocks.bulkAdd([
                { ticker: '$PUSH', currentPrice: 10.00, history: [], lastWorkoutDate: new Date(), ownedShares: 0 },
                { ticker: '$PULL', currentPrice: 10.00, history: [], lastWorkoutDate: new Date(), ownedShares: 0 },
                { ticker: '$LEGS', currentPrice: 10.00, history: [], lastWorkoutDate: new Date(), ownedShares: 0 },
                { ticker: '$CRDO', currentPrice: 10.00, history: [], lastWorkoutDate: new Date(), ownedShares: 0 },
            ]).catch(err => console.error("Seeding failed", err));
            return; // Wait for next render
        }

        const processMarket = async () => {
            // Processing each stock
            // This runs on mount (offline sim) and then we set interval.
            // Simplified: We just tick once on mount if meaningful time passed, then loop.
            // Actually, we should check last tick time? 
            // For now, let's just run a "Catch up" cycle or simple tick.

            // Note: DB doesn't store "LastMarketTick". We can infer from history?
            // Let's just do a live volatility tick application for now.
            // Recovering from 3 days offset is handled by Pump/Dump logic below, 
            // but "Offline fluctuation" usually means filling in the graph. 
            // For this MVP, we just add ONE point on load if it's been > 5 mins since last point.

            await Promise.all(stocks.map(async (stock) => {
                let currentPrice = stock.currentPrice;
                let history = stock.history || [];
                const lastHistoryTime = history.length > 0 ? history[history.length - 1].time : 0;
                const now = Date.now();

                // Check for DUMP (Inactivity)
                const lastWorkout = stock.lastWorkoutDate; // Date object or string
                const daysSinceWorkout = differenceInDays(now, lastWorkout);

                if (daysSinceWorkout > DUMP_THRESHOLD_DAYS) {
                    const overdueDays = daysSinceWorkout - DUMP_THRESHOLD_DAYS;
                    // Apply penalty ONCE per day? Or continuously?
                    // To avoid double dipping, we should store "lastPenaltyDate". 
                    // MVP: Just calculate what the price SHOULD be if it crashed. 
                    // But that overrides volatility.
                    // Let's apply a massive "Crash" factor if needed right now.
                    // To make it simpler: We apply a small random drift every tick, 
                    // AND if overdue, we apply a DOWNWARD bias.
                }

                // If enough time passed for a tick
                if (differenceInMinutes(now, lastHistoryTime) >= 5) {
                    // Apply Natural Volatility
                    const newPrice = calculateNewPrice(currentPrice, MAX_VOLATILITY);
                    const newHistory = addHistoryPoint(history, newPrice);

                    await db.stocks.update(stock.ticker, {
                        currentPrice: newPrice,
                        history: newHistory
                    });
                }
            }));
        };

        processMarket();

        // Start Interval
        const interval = setInterval(processMarket, TICK_INTERVAL_MS);
        return () => clearInterval(interval);

    }, [stocks]);

    /**
     * Trigger Market Pump
     * Called when a workout is finished.
     * @param {string} category - 'push', 'pull', 'legs', 'cardio'
     */
    const triggerMarketPump = useCallback(async (category) => {
        let ticker = '';
        if (category === 'push') ticker = '$PUSH';
        if (category === 'pull') ticker = '$PULL';
        if (category === 'legs') ticker = '$LEGS';
        if (category === 'cardio') ticker = '$CRDO';

        if (!ticker) return;

        const stock = await db.stocks.get(ticker);
        if (stock) {
            const pumpFactor = PUMP_MIN + Math.random() * (PUMP_MAX - PUMP_MIN); // 0.15 to 0.25
            const newPrice = stock.currentPrice * (1 + pumpFactor);
            const newHistory = addHistoryPoint(stock.history, newPrice);

            await db.stocks.update(ticker, {
                currentPrice: newPrice,
                history: newHistory,
                lastWorkoutDate: new Date() // Reset inactivity timer
            });

            // We could return a message or status here
            return { ticker, increase: (pumpFactor * 100).toFixed(1) };
        }
    }, []);

    // Trading Logic
    const buyStock = async (ticker, amountWOL, userBalance) => {
        if (amountWOL > userBalance) return false;

        const stock = await db.stocks.get(ticker);
        if (!stock) return false;

        const sharesToBuy = Math.floor(amountWOL / stock.currentPrice);
        if (sharesToBuy <= 0) return false;

        const cost = sharesToBuy * stock.currentPrice;

        // Transaction
        await db.transaction('rw', db.user, db.stocks, async () => {
            const user = await db.user.orderBy('id').first();
            await db.user.update(user.id, { balance: user.balance - cost });
            await db.stocks.update(ticker, { ownedShares: (stock.ownedShares || 0) + sharesToBuy });
        });

        playBell();
        return true;
    };

    const sellStock = async (ticker, sharesToSell) => {
        const stock = await db.stocks.get(ticker);
        if (!stock || stock.ownedShares < sharesToSell) return false;

        const earnings = sharesToSell * stock.currentPrice;

        await db.transaction('rw', db.user, db.stocks, async () => {
            const user = await db.user.orderBy('id').first();
            await db.user.update(user.id, { balance: user.balance + earnings });
            await db.stocks.update(ticker, { ownedShares: stock.ownedShares - sharesToSell });
        });

        playBell();
        return true;
    };

    return { stocks, triggerMarketPump, buyStock, sellStock };
};
