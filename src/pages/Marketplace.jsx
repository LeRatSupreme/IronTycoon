import { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useDailyShop } from '../hooks/useDailyShop';
import DailyItemCard from '../components/DailyItemCard';
import InfrastructureTab from '../components/InfrastructureTab';
import HoloPanel from '../components/ui/HoloPanel';
import DigitalDisplay from '../components/ui/DigitalDisplay';
import { Timer, ShoppingBag, Construction } from 'lucide-react';
import { db } from '../db';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import useSound from 'use-sound';
import GameButton from '../components/ui/GameButton';

const Marketplace = () => {
    const { user, subtractFunds } = useWallet();
    const { dailyItems, refreshTime, refreshShop, markAsSold, timeString } = useDailyShop();
    const [shakeId, setShakeId] = useState(null);
    const [receipt, setReceipt] = useState(null); // { name, rarity, icon }

    // TABS
    const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'infra'

    const [playBuy] = useSound('/sounds/cash.mp3');
    const [playFail] = useSound('/sounds/fail.mp3');
    const [playLegendary] = useSound('/sounds/jackpot.mp3');

    // Timer Logic included in useDailyShop

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

            // Show Receipt
            setReceipt({ name: item.name, rarity: item.rarity, icon: item.icon });
        } else {
            playFail();
            setShakeId(item.id);
            setTimeout(() => setShakeId(null), 500);
        }
    };

    if (!user) return <div className="p-10 text-center animate-pulse">CONNECTING TO BLACK MARKET...</div>;

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden bg-slate-950 text-user-accent font-mono selection:bg-user-accent/30">
            {/* Background Tech Layer from Dashboard */}
            <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-bl from-user-accent/5 via-transparent to-transparent pointer-events-none" />

            {/* Header / HUD */}
            <div className="relative z-10 p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                            <span className="w-1.5 h-1.5 bg-user-accent rounded-full animate-ping" />
                            ACCÈS RÉSEAU
                        </div>
                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-lg flex items-center gap-2">
                            MARKET <span className="text-user-accent">NEXUS</span>
                        </h1>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1 justify-end">
                            SOLDE DISPONIBLE
                        </div>
                        <DigitalDisplay value={user?.balance || 0} size="md" color="gold" prefix="$" />
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 px-2">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={clsx("flex-1 py-3 font-bold uppercase tracking-wider text-xs rounded-t-xl border-b-2 transition-all", activeTab === 'daily' ? "bg-white/5 border-user-accent text-user-accent shadow-[0_4px_20px_-5px_rgba(var(--primary),0.3)]" : "text-gray-600 border-transparent hover:text-gray-400")}
                >
                    <div className="flex items-center justify-center gap-2"><ShoppingBag size={14} /> QUOTIDIEN</div>
                </button>
                <button
                    onClick={() => setActiveTab('infra')}
                    className={clsx("flex-1 py-3 font-bold uppercase tracking-wider text-xs rounded-t-xl border-b-2 transition-all", activeTab === 'infra' ? "bg-white/5 border-user-accent text-user-accent shadow-[0_4px_20px_-5px_rgba(var(--primary),0.3)]" : "text-gray-600 border-transparent hover:text-gray-400")}
                >
                    <div className="flex items-center justify-center gap-2"><Construction size={14} /> INFRASTRUCTURE</div>
                </button>
            </div>


            {/* CONTENT */}
            <div className="px-2">
                {activeTab === 'daily' ? (
                    <>
                        <div className="bg-black/40 rounded-lg p-2 flex items-center justify-between border border-white/5 mb-4">
                            <div className="flex items-center gap-2 text-gray-400">
                                <Timer size={14} />
                                <span className="text-[10px] font-bold uppercase">Réappro dans</span>
                            </div>
                            <div className="font-mono text-user-accent font-bold text-sm tracking-widest">
                                {timeString}
                            </div>
                        </div>

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
                                    CONNEXION AU MARCHÉ NOIR...
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <InfrastructureTab />
                )}
            </div>

            {/* RECEIPT MODAL */}
            <AnimatePresence>
                {receipt && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 pointer-events-none bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: 10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="bg-cyber-slate border-2 border-user-accent p-0 relative max-w-xs w-full shadow-glow-accent overflow-hidden rounded-xl pointer-events-auto"
                        >
                            <div className="bg-user-accent p-4 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-scanlines opacity-10" />
                                <h2 className="text-black font-black text-2xl uppercase tracking-tighter relative z-10">ACQUISITION</h2>
                            </div>

                            <div className="p-6 text-center space-y-6">
                                <div className="text-8xl filter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-bounce">
                                    {receipt.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white uppercase mb-1">{receipt.name}</h3>
                                    <p className="text-xs text-user-accent font-mono uppercase tracking-widest border border-user-accent/30 inline-block px-2 py-1 rounded">
                                        ACTIF {receipt.rarity}
                                    </p>
                                </div>

                                <GameButton onClick={() => setReceipt(null)} variant="primary" className="w-full">
                                    CONFIRMER
                                </GameButton>
                            </div>
                        </motion.div>
                    </div>
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
