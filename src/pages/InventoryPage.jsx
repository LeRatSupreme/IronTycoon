import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ITEMS_CATALOG } from '../data/itemsCatalog';
import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { Archive, Layers, Zap, Shield, Box } from 'lucide-react';
import InventorySlot from '../components/ui/InventorySlot';
import ItemInspector from '../components/ui/ItemInspector';
import { useWallet } from '../context/WalletContext';
import DigitalDisplay from '../components/ui/DigitalDisplay';

const InventoryPage = () => {
    const { user } = useWallet();
    const inventory = useLiveQuery(() => db.inventory.toArray());
    const [selectedItem, setSelectedItem] = useState(null);
    const [filter, setFilter] = useState('ALL'); // ALL, CONSUMABLE, PERMANENT

    // Sounds
    const [playSelect] = useSound('/sounds/ui_select.mp3', { volume: 0.5 });
    const [playConsume] = useSound('/sounds/eat.mp3');

    // Grouping Logic
    const groupedItems = useMemo(() => {
        if (!inventory) return [];
        const available = inventory.filter(i => i.status === 'OWNED');
        const groups = {};

        available.forEach(inv => {
            if (!groups[inv.itemId]) {
                const catalogItem = ITEMS_CATALOG.find(i => i.id === inv.itemId);
                if (catalogItem) {
                    groups[inv.itemId] = {
                        ...catalogItem,
                        ...inv,
                        type: catalogItem.type,
                        inventoryType: inv.type,
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
    const GRID_CAPACITY = 50;
    const gridSlots = useMemo(() => {
        const slots = [...filteredItems];
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
        const victimId = selectedItem.instances[0]; // FIFO
        await db.inventory.update(victimId, { status: 'CONSUMED', consumedDate: new Date() });
        if (selectedItem.count === 1) {
            setSelectedItem(null);
        }
    };

    return (
        <div className="min-h-screen pb-32 relative overflow-hidden bg-slate-950 text-user-accent font-mono selection:bg-user-accent/30">
            {/* Background Tech Layer */}
            <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-bl from-user-accent/5 via-transparent to-transparent pointer-events-none" />

            {/* Header / HUD */}
            <div className="relative z-10 p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                            <span className="w-1.5 h-1.5 bg-user-accent rounded-full animate-ping" />
                            STOCKAGE LOCAL
                        </div>
                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-lg flex items-center gap-2">
                            COFFRE <span className="text-user-accent">FORT</span>
                        </h1>
                    </div>
                    <div className="text-right w-32">
                        <div className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1 flex justify-between">
                            <span>Capacité</span>
                            <span>{Math.round(((inventory?.filter(i => i.status === 'OWNED').length || 0) / 50) * 100)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                            <motion.div
                                className="h-full bg-gradient-to-r from-user-accent/50 to-user-accent"
                                initial={{ width: 0 }}
                                animate={{ width: `${((inventory?.filter(i => i.status === 'OWNED').length || 0) / 50) * 100}%` }}
                            />
                        </div>
                        <div className="text-xs font-black text-white font-mono leading-none text-right">
                            {inventory?.filter(i => i.status === 'OWNED').length || 0}<span className="text-gray-600 text-[10px]">/50</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6 px-4 overflow-x-auto pb-2 no-scrollbar">
                {[
                    { id: 'ALL', icon: Layers, label: 'TOUT' },
                    { id: 'CONSUMABLE', icon: Zap, label: 'STIMULANTS' },
                    { id: 'PERMANENT', icon: Shield, label: 'ÉQUIPEMENT' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => { setFilter(tab.id); setSelectedItem(null); }}
                        className={clsx(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
                            filter === tab.id
                                ? "bg-user-accent/20 border-user-accent text-user-accent shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                                : "bg-black/40 text-gray-500 border-white/5 hover:border-white/20 hover:text-gray-300"
                        )}
                    >
                        <tab.icon size={12} /> {tab.label.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* The Grid */}
            <div className="px-4 grid grid-cols-4 gap-3 content-start pb-20">
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
                            className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
                        />
                        <div className="fixed inset-x-0 bottom-0 z-50 p-4 pb-24 pointer-events-none flex justify-center">
                            <ItemInspector
                                item={selectedItem}
                                onClose={() => setSelectedItem(null)}
                                onAction={handleConsume}
                            />
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InventoryPage;
