import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useWallet } from '../context/WalletContext';
import { useMemo } from 'react';
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';
import { ITEMS_CATALOG } from '../data/itemsCatalog';

export const useProfileStats = () => {
    const { user } = useWallet();
    const inventory = useLiveQuery(() => db.inventory.toArray());
    const shopItems = useLiveQuery(() => db.shop.toArray());
    // ^ Wait, legacy shop had prices. 
    // New inventory items don't store "cost" at purchase time in my previous impl (bug?).
    // Checking Marketplace.jsx... I only stored itemId, status, type, acquiredDate.
    // I need the COST to calculate "Total Spend".
    // I should join with ITEMS_CATALOG or store cost.
    // Ideally I join with ITEMS_CATALOG.

    const logs = useLiveQuery(() => db.logs.toArray());

    const stats = useMemo(() => {
        if (!user || !inventory || !logs) return null;

        // 1. Tonnage
        const totalTonnage = logs.reduce((acc, log) => acc + (log.weight * log.reps), 0);

        // 2. Spend
        const totalSpend = inventory.reduce((acc, inv) => {
            const item = ITEMS_CATALOG.find(i => i.id === inv.itemId);
            return acc + (item ? item.cost : 0);
        }, 0);

        return {
            tonnage: (totalTonnage / 1000).toFixed(2), // Tonnes with 2 decimals
            spend: totalSpend,
            inventoryCount: inventory.length,
            inventory: inventory,
            itemsConsumed: inventory.filter(i => i.status === 'CONSUMED').reverse(), // Newest first
        };
    }, [user, inventory, logs]);

    // Avatar
    const avatarUri = useMemo(() => {
        if (!user) return '';
        return createAvatar(bottts, {
            seed: user.name,
            radius: 10,
            backgroundColor: ['2a2a2a'],
            backgroundType: ['solid']
        }).toDataUri();
    }, [user?.name]);

    return {
        stats,
        avatarUri,
        user
    };
};
