import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ITEMS_CATALOG, ITEM_RARITIES } from '../data/itemsCatalog';
import { useEffect, useState } from 'react';

export const useDailyShop = () => {
    // 1. Get State from DB
    const shopState = useLiveQuery(() => db.daily_shop.get(1));
    const [msUntilRefresh, setMsUntilRefresh] = useState(0);

    // 2. Logic to Refresh
    const refreshShop = async () => {
        // RNG Logic
        const newSlots = [];
        const pickedIds = new Set();

        // Safety Break after 50 attempts
        let attempts = 0;

        while (newSlots.length < 4 && attempts < 50) {
            attempts++;
            const item = pickRandomItem();

            if (item && !pickedIds.has(item.id)) {
                pickedIds.add(item.id);
                newSlots.push({
                    itemId: item.id,
                    soldOut: false
                });
            }
        }

        await db.daily_shop.put({
            id: 1,
            lastRefresh: Date.now(),
            slots: newSlots
        });
    };

    const pickRandomItem = () => {
        const totalWeight = Object.values(ITEM_RARITIES).reduce((acc, r) => acc + r.weight, 0);
        let random = Math.random() * totalWeight;

        let selectedRarity = ITEM_RARITIES.COMMON.id;
        for (const rarityKey in ITEM_RARITIES) {
            const rarity = ITEM_RARITIES[rarityKey];
            if (random < rarity.weight) {
                selectedRarity = rarity.id;
                break;
            }
            random -= rarity.weight;
        }

        const pool = ITEMS_CATALOG.filter(i => i.rarity.toLowerCase() === selectedRarity.toLowerCase());

        if (pool.length === 0) return null; // Should not happen

        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    };

    const markAsSold = async (itemId) => {
        if (!shopState) return;
        const newSlots = shopState.slots.map(s => s.itemId === itemId ? { ...s, soldOut: true } : s);
        await db.daily_shop.update(1, { slots: newSlots });
    };

    // 3. Auto-Check on Mount & Timer
    useEffect(() => {
        // Ensure db is ready
        if (!db) return;

        const checkRotation = async () => {
            // We need to fetch directly to avoid infinite loop with useLiveQuery if we're not careful
            // But useLiveQuery handles subscriptions.
            // The issue might be initial load.
            const current = await db.daily_shop.get(1);

            if (!current) {
                await refreshShop();
                return;
            }

            // --- FORCE FIX FOR DUPLICATES FROM OLD LOGIC ---
            const ids = new Set();
            let hasDuplicates = false;
            current.slots.forEach(s => {
                if (ids.has(s.itemId)) hasDuplicates = true;
                ids.add(s.itemId);
            });

            if (hasDuplicates) {
                console.warn("Duplicates detected in Daily Shop. Forcing refresh...");
                await refreshShop();
                return;
            }
            // -----------------------------------------------

            const now = Date.now();
            const OneDay = 24 * 60 * 60 * 1000;
            const nextRefresh = current.lastRefresh + OneDay;

            if (now > nextRefresh) {
                await refreshShop();
            } else {
                setMsUntilRefresh(nextRefresh - now);
            }
        };

        checkRotation();

        const interval = setInterval(() => {
            if (shopState) {
                const now = Date.now();
                const OneDay = 24 * 60 * 60 * 1000;
                const next = shopState.lastRefresh + OneDay;
                const diff = next - now;
                if (diff <= 0) {
                    refreshShop(); // Will trigger DB update -> new shopState -> re-render
                } else {
                    setMsUntilRefresh(diff);
                }
            }
        }, 1000);

        return () => clearInterval(interval);

    }, [shopState]); // Re-run if shopState changes (e.g. after refresh)

    const formatTime = (ms) => {
        if (ms <= 0) return "00:00:00";
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
    };

    const dailyItems = shopState?.slots?.map(slot => {
        const catItem = ITEMS_CATALOG.find(i => i.id === slot.itemId);
        if (!catItem) return null;
        return {
            ...catItem,
            soldOut: slot.soldOut
        };
    }).filter(Boolean) || [];

    return {
        dailyItems,
        msUntilRefresh,
        timeString: formatTime(msUntilRefresh),
        markAsSold,
        // Debug helper
        forceRefresh: refreshShop
    };
};
