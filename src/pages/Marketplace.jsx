import { useWallet } from '../context/WalletContext';
import { db } from '../db';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Timer, RefreshCw } from 'lucide-react';
import useSound from 'use-sound';
import { useState } from 'react';
import clsx from 'clsx';
import HoloPanel from '../components/ui/HoloPanel';
import GameButton from '../components/ui/GameButton';
import DigitalDisplay from '../components/ui/DigitalDisplay';
import { useDailyShop } from '../hooks/useDailyShop';
import DailyItemCard from '../components/DailyItemCard';

const Marketplace = () => {
    const { user, subtractFunds } = useWallet();
    const { dailyItems, timeString, markAsSold } = useDailyShop();

    const [playBuy] = useSound('/sounds/cash.mp3');
    const [playFail] = useSound('/sounds/fail.mp3');
    const [playLegendary] = useSound('/sounds/jackpot.mp3');

    const [receipt, setReceipt] = useState(null);
    const [shakeId, setShakeId] = useState(null);

    const handleBuy = async (item) => {
        if (!user || item.soldOut) return;

        const success = await subtractFunds(item.cost);
        if (success) {
            item.rarity === 'LEGENDARY' ? playLegendary() : playBuy();

            // 1. Mark as sold in daily shop
            await markAsSold(item.id);

            // 2. Add to Inventory
            await db.inventory.add({
                itemId: item.id,
                status: 'OWNED',
                // Anything not equipment/apparel is technically consumable in this simplified economy
                type: ['equipment', 'apparel'].includes(item.type) ? 'PERMANENT' : 'CONSUMABLE',
                acquiredDate: new Date()
            });

            // 3. Update User Stats (Lifetime Spend hidden metric if needed, or just inventory count)
            // (Optional)

            setReceipt(item);
        } else {
            playFail();
            setShakeId(item.id);
            setTimeout(() => setShakeId(null), 500);
        }
    };

    return (
        <div className="pt-4 pb-20 px-2 min-h-screen relative overflow-hidden">

            {/* Header */}
            <div className="bg-cyber-slate/90 p-4 rounded-2xl border border-white/10 backdrop-blur-md sticky top-2 z-30 shadow-2xl mb-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h1 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                            <span className="text-user-accent">DAILY</span> DROP
                        </h1>
                        <p className="text-[10px] text-gray-500 font-mono">BLACK MARKET ROTATION</p>
                    </div>
                    <div className="text-right">
                        <DigitalDisplay value={user?.balance || 0} size="sm" color="gold" prefix="$" />
                    </div>
                </div>

                {/* Timer Bar */}
                <div className="bg-black/40 rounded-lg p-2 flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Timer size={14} />
                        <span className="text-[10px] font-bold uppercase">Restock In</span>
                    </div>
                    <div className="font-mono text-user-accent font-bold text-sm tracking-widest">
                        {timeString}
                    </div>
                </div>
            </div>

            {/* Daily Grid */}
            <div className="grid grid-cols-2 gap-3 relative z-10">
                {dailyItems.map((item) => (
                    <DailyItemCard
                        key={item.id}
                        item={item}
                        canAfford={user?.balance >= item.cost}
                        onBuy={() => handleBuy(item)}
                        isShake={shakeId === item.id}
                    />
                ))}

                {dailyItems.length === 0 && (
                    <div className="col-span-2 text-center p-10 opacity-50 font-mono animate-pulse">
                        CONNECTING TO BLACK MARKET RELAY...
                    </div>
                )}
            </div>

            {/* Legendary Background Effect if a Legendary item is present and not sold */}
            {dailyItems.some(i => i.rarity === 'LEGENDARY' && !i.soldOut) && (
                <div className="fixed inset-0 pointer-events-none z-0 bg-gold-light/5 mix-blend-screen animate-pulse" />
            )}

            {/* Receipt Modal */}
            <AnimatePresence>
                {receipt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-cyber-black/90 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: 10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-cyber-slate border-2 border-user-accent p-0 relative max-w-xs w-full shadow-glow-accent overflow-hidden rounded-xl"
                        >
                            <div className="bg-user-accent p-4 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-scanlines opacity-10" />
                                <h2 className="text-black font-black text-2xl uppercase tracking-tighter relative z-10">ACQUIRED</h2>
                            </div>

                            <div className="p-6 text-center space-y-6">
                                <div className="text-8xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-bounce">
                                    {receipt.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white uppercase mb-1">{receipt.name}</h3>
                                    <p className="text-xs text-user-accent font-mono uppercase tracking-widest border border-user-accent/30 inline-block px-2 py-1 rounded">
                                        {receipt.rarity} ASSET
                                    </p>
                                </div>

                                <GameButton onClick={() => setReceipt(null)} variant="primary" className="w-full">
                                    COMPLETE DEAL
                                </GameButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 3;
                }
            `}</style>
        </div>
    );
};

export default Marketplace;
