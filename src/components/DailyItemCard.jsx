import { motion } from 'framer-motion';
import clsx from 'clsx';
import { ITEM_RARITIES } from '../data/itemsCatalog';
import GameButton from './ui/GameButton';
import HoloPanel from './ui/HoloPanel';

const DailyItemCard = ({ item, onBuy, canAfford, isShake }) => {
    // Determine Rarity Styles
    const rarityKey = item.rarity.toUpperCase();
    const rarityStyle = ITEM_RARITIES[rarityKey] || ITEM_RARITIES.COMMON;

    return (
        <HoloPanel
            variant="default"
            className={clsx(
                "relative p-4 flex flex-col justify-between h-full bg-slate-900/50 backdrop-blur group hover:scale-[1.02] transition-transform",
                rarityStyle.twBorder,
                rarityStyle.twShadow,
                isShake && "animate-shake"
            )}
            style={{
                boxShadow: item.soldOut ? 'none' : undefined,
                borderColor: item.soldOut ? '#333' : undefined
            }}
        >
            {/* Rarity Label */}
            <div className={clsx("absolute top-0 right-0 px-2 py-1 text-[10px] font-bold uppercase rounded-bl-xl border-b border-l", rarityStyle.twText, "border-white/10 bg-black/50")}>
                {rarityStyle.label}
            </div>

            {/* Icon */}
            <div className={clsx("flex-1 flex items-center justify-center py-6 text-6xl filter drop-shadow-lg", item.soldOut ? "grayscale opacity-20" : "")}>
                {item.icon}
            </div>

            {/* Info */}
            <div className={clsx(item.soldOut ? "opacity-50" : "")}>
                <h3 className={clsx("font-bold text-sm uppercase leading-tight mb-1", item.rarity === 'LEGENDARY' ? "text-gold-light animate-pulse" : "text-white")}>
                    {item.name}
                </h3>
                <p className="text-[10px] text-gray-500 uppercase font-mono mb-4">{item.type}</p>

                {item.soldOut ? (
                    <div className="bg-red-900/10 border border-red-900 text-red-700 font-black text-center py-2 rounded uppercase tracking-widest text-xs">
                        ÉPUISÉ
                    </div>
                ) : (
                    <GameButton
                        size="sm"
                        onClick={onBuy}
                        variant={canAfford ? (item.rarity === 'LEGENDARY' ? 'gold' : 'secondary') : 'danger'}
                        disabled={false}
                        className={clsx("w-full text-xs py-3", canAfford && !item.soldOut && "hover:bg-white/10")}
                    >
                        ${item.cost.toLocaleString()}
                    </GameButton>
                )}
            </div>

            {/* Sold Out Overlay Stamp */}
            {item.soldOut && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="border-4 border-red-600 text-red-600 font-black text-2xl uppercase p-2 rotate-[-20deg] opacity-80 mask-grunge">
                        VENDU
                    </div>
                </div>
            )}
        </HoloPanel>
    );
};

export default DailyItemCard;
