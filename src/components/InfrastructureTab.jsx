
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { INFRASTRUCTURES } from '../data/upgradesCatalog';
import { useWallet } from '../context/WalletContext';
import { Check, Lock, Hammer, Bolt } from 'lucide-react';
import useSound from 'use-sound';
import clsx from 'clsx';
import { useState } from 'react';

const InfrastructureTab = () => {
    const { user, spendFunds } = useWallet();
    const ownedUpgrades = useLiveQuery(() => db.user.get(user?.id || 1).then(u => u?.ownedUpgrades || []));

    // Sounds
    const [playConstruction] = useSound('/sounds/construction.mp3', { volume: 0.6 }); // Placeholder path
    const [playError] = useSound('/sounds/ui_error.mp3', { volume: 0.5 });

    const handlePurchase = async (item) => {
        if (!user || user.balance < item.price) {
            playError();
            return;
        }

        const success = await spendFunds(item.price);
        if (success) {
            playConstruction();
            // Update DB
            await db.user.where('id').equals(user.id).modify(u => {
                if (!u.ownedUpgrades) u.ownedUpgrades = [];
                u.ownedUpgrades.push(item.id);
            });
        }
    };

    if (!ownedUpgrades) return <div className="p-4 text-center animate-pulse">CHARGEMENT DES PLANS...</div>;

    return (
        <div className="space-y-4 pb-20">
            <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-xs font-mono text-blue-300 mb-6">
                <div className="flex items-center gap-2 mb-2">
                    <Bolt size={14} className="animate-pulse" />
                    <span className="font-bold uppercase tracking-widest">Mode Architecte</span>
                </div>
                <p>Investissez dans des infrastructures durables pour maximiser votre production de $WOL.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {INFRASTRUCTURES.map((item) => {
                    const isOwned = ownedUpgrades.includes(item.id);
                    const canAfford = user.balance >= item.price;
                    const Icon = item.icon;

                    return (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={!isOwned && canAfford ? { scale: 1.02 } : {}}
                            className={clsx(
                                "relative overflow-hidden rounded-xl border-2 p-4 transition-all",
                                isOwned
                                    ? "bg-slate-900/80 border-gold/50 shadow-[0_0_15px_rgba(255,215,0,0.1)]"
                                    : "bg-cyber-slate/50 border-white/10"
                            )}
                        >
                            {/* Blueprints Grid Background */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className={clsx(
                                        "p-3 rounded-lg border",
                                        isOwned
                                            ? "bg-gold/10 border-gold text-gold"
                                            : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                                    )}>
                                        <Icon size={32} strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <h3 className={clsx("font-black text-lg uppercase", isOwned ? "text-gold" : "text-white")}>
                                            {item.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 font-medium mt-1 max-w-[200px] leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    {isOwned ? (
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="bg-gold text-black text-[10px] font-black px-2 py-1 rounded border border-yellow-600 uppercase shadow-lg transform -rotate-6">
                                                INSTALLÉ
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-end">
                                            <div className={clsx(
                                                "text-xl font-black tabular-nums",
                                                canAfford ? "text-neon-green" : "text-gray-500"
                                            )}>
                                                {item.price.toLocaleString()} <span className="text-xs text-gray-400">$WOL</span>
                                            </div>
                                            <button
                                                onClick={() => handlePurchase(item)}
                                                disabled={!canAfford}
                                                className={clsx(
                                                    "mt-2 px-4 py-2 rounded-lg font-black text-xs uppercase transition-all flex items-center gap-2",
                                                    canAfford
                                                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg tooltip-trigger"
                                                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                                )}
                                            >
                                                {canAfford ? 'Construire' : <><Lock size={10} /> Verrouillé</>}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default InfrastructureTab;
