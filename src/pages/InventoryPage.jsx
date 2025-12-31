import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ITEMS_CATALOG } from '../data/itemsCatalog';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { Archive, Layers, Zap, Shield } from 'lucide-react';

import InventorySlot from '../components/ui/InventorySlot';
import ItemInspector from '../components/ui/ItemInspector';

const InventoryPage = () => {
    // raw inventory entries
    const inventory = useLiveQuery(() => db.inventory.toArray());

    const [selectedItem, setSelectedItem] = useState(null);
    const [filter, setFilter] = useState('ALL'); // ALL, CONSUMABLE, PERMANENT

    // Sounds
    const [playSelect] = useSound('/sounds/ui_select.mp3', { volume: 0.5 }); // Placeholder, might fail if file missing but standard practice
    const [playConsume] = useSound('/sounds/eat.mp3');

    // Grouping Logic
    const groupedItems = useMemo(() => {
        if (!inventory) return [];

        // 1. Filter out consumed
        const available = inventory.filter(i => i.status === 'OWNED');

        // 2. Group by itemId
        const groups = {};

        available.forEach(inv => {
            if (!groups[inv.itemId]) {
                const catalogItem = ITEMS_CATALOG.find(i => i.id === inv.itemId);
                if (catalogItem) {
                    groups[inv.itemId] = {
                        ...catalogItem, // This has specific 'type' (e.g. 'equipment')
                        ...inv,         // This has generic 'type' (e.g. 'PERMANENT') and 'status'
                        type: catalogItem.type, // Explicitly force catalog type
                        inventoryType: inv.type, // Keep generic type as separate field if needed
                        count: 0,
                        instances: []
                    };
                }
            }
            if (groups[inv.itemId]) {
                groups[inv.itemId].count++;
                groups[inv.itemId].instances.push(inv.id);
            }
        });

        return Object.values(groups);
    }, [inventory]);

    // Apply Filter
    const filteredItems = useMemo(() => {
        if (filter === 'ALL') return groupedItems;
        return groupedItems.filter(i => i.type === filter);
    }, [groupedItems, filter]);

    // Grid Generation (Fixed Capacity)
    const GRID_CAPACITY = 20;
    const gridSlots = useMemo(() => {
        const slots = [...filteredItems];
        // Fill the rest with nulls
        while (slots.length < GRID_CAPACITY) {
            slots.push(null);
        }
        return slots;
    }, [filteredItems]);


    const handleSelect = (item) => {
        if (!item) return;
        playSelect();
        setSelectedItem(item);
    };

    const handleConsume = async () => {
        if (!selectedItem || selectedItem.count <= 0) return;

        playConsume();

        // Consume one instance (FIFO - first in first out)
        const victimId = selectedItem.instances[0]; // oldest

        await db.inventory.update(victimId, { status: 'CONSUMED', consumedDate: new Date() });

        // Auto-close if it was the last one, or just update UI handled by reactivity
        if (selectedItem.count === 1) {
            setSelectedItem(null);
        } else {
            // Optimistic update for UI feel if needed, but db reactivity is fast
        }
    };

    return (
        <div className="pt-4 pb-32 px-4 min-h-screen bg-cyber-black flex flex-col">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                    <Archive className="text-user-accent" /> STORAGE A1
                </h1>
                <div className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-1 rounded">
                    CAPACITY: {inventory?.filter(i => i.status === 'OWNED').length || 0}/50
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                {[
                    { id: 'ALL', icon: Layers, label: 'ALL' },
                    { id: 'CONSUMABLE', icon: Zap, label: 'STIMS' },
                    { id: 'PERMANENT', icon: Shield, label: 'GEAR' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setFilter(tab.id); setSelectedItem(null); }}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                            filter === tab.id
                                ? "bg-user-accent text-black border-user-accent shadow-glow-accent"
                                : "bg-black/40 text-gray-500 border-white/5 hover:border-white/20"
                        )}
                    >
                        <tab.icon size={12} /> {tab.label}
                    </button>
                ))}
            </div>

            {/* The Grid */}
            <div className="grid grid-cols-4 gap-3 content-start">
                {gridSlots.map((item, index) => (
                    <InventorySlot
                        key={item ? `item-${item.id}` : `empty-${index}`}
                        item={item}
                        isEmpty={!item}
                        isSelected={selectedItem?.id === item?.id}
                        onClick={() => handleSelect(item)}
                    />
                ))}
            </div>

            {/* Backdrop for Inspector */}
            <AnimatePresence>
                {selectedItem && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-[2px]"
                        />
                        <ItemInspector
                            item={selectedItem}
                            onClose={() => setSelectedItem(null)}
                            onAction={handleConsume}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryPage;
