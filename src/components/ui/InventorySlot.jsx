import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ITEM_RARITIES } from '../../data/itemsCatalog';

const InventorySlot = ({ item, isSelected, onClick, isEmpty }) => {

    if (isEmpty) {
        return (
            <div
                className="aspect-square bg-slate-900/30 border border-white/5 rounded-lg flex items-center justify-center relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-scanlines opacity-5 pointer-events-none" />
                <div className="w-2 h-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors" />
            </div>
        );
    }

    const rarity = ITEM_RARITIES[item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={clsx(
                "aspect-square relative rounded-lg border-2 flex items-center justify-center outline-none transition-all overflow-hidden",
                isSelected
                    ? "border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] bg-white/10"
                    : `${rarity.twBorder} bg-slate-900/80`
            )}
        >
            {/* Rarity Background Glow */}
            <div className={clsx("absolute inset-0 opacity-20 bg-gradient-to-br",
                item.rarity === 'COMMON' && "from-gray-500 to-transparent",
                item.rarity === 'UNCOMMON' && "from-neon-green to-transparent",
                item.rarity === 'RARE' && "from-blue-500 to-transparent",
                item.rarity === 'EPIC' && "from-purple-500 to-transparent",
                item.rarity === 'LEGENDARY' && "from-gold to-transparent",
            )} />

            {/* Icon */}
            <div className="relative z-10 text-2xl filter drop-shadow-md">
                {item.icon}
            </div>

            {/* Quantity Badge */}
            {item.count > 1 && (
                <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono font-bold px-1 rounded text-white border border-white/10">
                    x{item.count}
                </div>
            )}
        </motion.button>
    );
};

export default InventorySlot;
