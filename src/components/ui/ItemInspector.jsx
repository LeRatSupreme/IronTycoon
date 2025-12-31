import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ITEM_RARITIES } from '../../data/itemsCatalog';
import GameButton from './GameButton';
import { X } from 'lucide-react';

const ItemInspector = ({ item, onClose, onAction }) => {
    if (!item) return null;

    const rarity = ITEM_RARITIES[item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;

    // Generate a fake lore description based on rarity if we don't have one in DB yet
    const lore = `A standardized ${item.rarity.toLowerCase()} asset issued by the corporation. maximize efficiency.`;

    return (
        <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 z-50 bg-cyber-slate/95 backdrop-blur-xl border-t border-x border-white/10 rounded-t-2xl shadow-2xl p-6 pb-8"
        >
            {/* Close Handle / Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
                <X size={20} />
            </button>

            <div className="flex gap-6 items-start">

                {/* Big Preview */}
                <div className={clsx(
                    "w-24 h-24 rounded-2xl flex items-center justify-center text-6xl shadow-inner border border-white/5 bg-black/30",
                    rarity.twShadow
                )}>
                    {item.icon}
                </div>

                {/* Details */}
                <div className="flex-1">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{item.name}</h2>
                    <p className={clsx("text-xs font-bold uppercase tracking-widest mb-2", rarity.twText)}>
                        {item.rarity} CLASS
                    </p>
                    <p className="text-xs text-gray-400 font-mono leading-relaxed mb-4 border-l-2 border-white/10 pl-3 italic">
                        "{lore}"
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/5 pt-4">
                <div className="text-xs text-gray-500 font-mono">
                    IN STOCK: <span className="text-white font-bold">{item.count}</span>
                </div>

                {['equipment', 'apparel'].includes(item.type) ? (
                    <GameButton
                        onClick={onAction}
                        variant="secondary"
                        disabled={true}
                        className="flex-1 opacity-50 cursor-not-allowed"
                    >
                        EQUIP (LOCKED)
                    </GameButton>
                ) : (
                    <GameButton
                        onClick={onAction}
                        variant="success"
                        className="flex-1"
                    >
                        CONSUME ASSET
                    </GameButton>
                )}
            </div>
        </motion.div>
    );
};

export default ItemInspector;
