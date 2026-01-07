import { INFRASTRUCTURES } from '../data/upgradesCatalog';
import HoloPanel from './ui/HoloPanel';
import GameButton from './ui/GameButton';
import { useWallet } from '../context/WalletContext';
import { db } from '../db';
import { Lock, CheckCircle, Construction } from 'lucide-react';
import useSound from 'use-sound';
import clsx from 'clsx';
import { useLiveQuery } from 'dexie-react-hooks';

const InfrastructureTab = () => {
    const { user, subtractFunds } = useWallet();
    const [playConstruct] = useSound('/sounds/construct.mp3'); // We'll need this sound, or use generic
    const [playCash] = useSound('/sounds/cash.mp3');

    // Live query for owned upgrades to ensure UI updates
    const ownedUpgrades = useLiveQuery(() =>
        db.user.get(user?.id || 0).then(u => u?.ownedUpgrades || [])
        , [user?.id]);

    const handleBuyUpgrade = async (upgrade) => {
        if (!user) return;
        if (ownedUpgrades?.includes(upgrade.id)) return;

        const success = await subtractFunds(upgrade.price);
        if (success) {
            // Update User
            const currentUpgrades = user.ownedUpgrades || [];
            await db.user.update(user.id, {
                ownedUpgrades: [...currentUpgrades, upgrade.id]
            });
            playConstruct(); // Simulated sound
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-4 pb-20">
            <div className="bg-slate-900/50 border border-user-accent/30 p-4 rounded-xl mb-6 relative overflow-hidden shadow-glow-accent">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                <h2 className="text-user-accent font-black uppercase text-xl italic tracking-tighter flex items-center gap-2 relative z-10">
                    <Construction className="text-user-accent" /> Améliorations
                </h2>
                <p className="text-xs text-user-accent/60 font-mono relative z-10">INVESTISSEZ DANS DES ACTIFS DURABLES.</p>
            </div>

            <div className="grid gap-4">
                {INFRASTRUCTURES.map(upgrade => {
                    const isOwned = ownedUpgrades?.includes(upgrade.id);
                    const canAfford = user.balance >= upgrade.price;
                    const Icon = upgrade.icon;

                    return (
                        <HoloPanel
                            key={upgrade.id}
                            variant={isOwned ? "gold" : "default"}
                            className={clsx(
                                "relative p-4 rounded-xl border-2 transition-all overflow-hidden",
                                isOwned
                                    ? "bg-slate-900 border-gold shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                                    : "bg-slate-900/80 border-white/10"
                            )}
                        >
                            {/* Blueprints Grid Background for aesthetics */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] bg-[size:10px_10px]" />

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex gap-4">
                                    <div className={clsx("w-16 h-16 rounded-lg flex items-center justify-center border", isOwned ? "bg-gold/10 border-gold text-gold" : "bg-slate-800 border-white/10 text-gray-500")}>
                                        <Icon size={32} />
                                    </div>
                                    <div>
                                        <h3 className={clsx("font-black uppercase text-lg", isOwned ? "text-gold" : "text-white")}>{upgrade.name}</h3>
                                        <p className="text-xs text-gray-400 font-mono mb-2 max-w-[200px]">{upgrade.description}</p>

                                        {!isOwned && (
                                            <div className="text-sm font-bold font-mono text-neon-green">
                                                ${upgrade.price.toLocaleString()}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10">
                                {isOwned ? (
                                    <div className="w-full py-2 bg-gold/10 border border-gold/30 text-gold font-black uppercase text-center rounded tracking-[0.2em] flex items-center justify-center gap-2 text-xs">
                                        <CheckCircle size={14} /> INSTALLÉ
                                    </div>
                                ) : (
                                    <GameButton
                                        onClick={() => handleBuyUpgrade(upgrade)}
                                        variant={canAfford ? "primary" : "secondary"}
                                        disabled={!canAfford}
                                        className="w-full text-xs"
                                    >
                                        {canAfford ? "INSTALLER" : "FONDS INSUFFISANTS"}
                                    </GameButton>
                                )}
                            </div>
                        </HoloPanel>
                    );
                })}
            </div>
        </div>
    );
};

export default InfrastructureTab;
