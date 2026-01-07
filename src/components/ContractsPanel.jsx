import { motion, AnimatePresence } from 'framer-motion';
import { useContractSystem } from '../hooks/useContractSystem';
import { FileText, Clock, AlertTriangle, CheckCircle, XCircle, Briefcase, Lock } from 'lucide-react';
import HoloPanel from './ui/HoloPanel';
import GameButton from './ui/GameButton';
import clsx from 'clsx';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const ContractsPanel = () => {
    const { weeklyContracts, activeContract, signContract } = useContractSystem();
    const [selectedOffer, setSelectedOffer] = useState(null);

    // Offers (Status: OFFERED)
    const offers = weeklyContracts?.filter(c => c.status === 'OFFERED') || [];

    // Allow user to close the "dossier" modal
    const closeOffer = () => setSelectedOffer(null);

    if (!offers.length && !activeContract) {
        // All discarded or none?
        // If contracts exist but none offered/active -> likely DISCARDED/COMPLETED/FAILED loop state?
        // But activeContract covers COMPLETED/FAILED/active. 
        // So if none offered and no activeContract found via hook variable...
        // The hook returns activeContract as find(ACTIVE/COMPLETED/FAILED).
        // If the week just started, offers should be there.
        return null;
    }

    return (
        <div className="mb-8">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Briefcase size={10} /> CONTRATS CORPORATIFS
            </h2>

            {/* ACTIVE OR COMPLETED VIEW */}
            {activeContract ? (
                <HoloPanel
                    variant={activeContract.status === 'COMPLETED' ? 'gold' : activeContract.status === 'FAILED' ? 'red' : 'active'}
                    className="p-4 relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                {activeContract.status === 'ACTIVE' && <span className="animate-pulse w-2 h-2 rounded-full bg-neon-green" />}
                                <h3 className="font-black text-lg uppercase italic text-white">{activeContract.title}</h3>
                            </div>
                            <p className="text-xs text-user-accent/80 font-mono mb-4 max-w-[200px]">{activeContract.description}</p>
                        </div>
                        <div className="text-right">
                            {activeContract.status === 'ACTIVE' ? (
                                <div className="text-xs font-mono text-white bg-red-900/30 border border-red-500/50 px-2 py-1 rounded flex items-center gap-1">
                                    <Clock size={12} className="text-red-500" />
                                    <Countdown target={activeContract.deadline} />
                                </div>
                            ) : (
                                <div className={clsx("font-black text-xs px-2 py-1 rounded uppercase border",
                                    activeContract.status === 'COMPLETED' ? "border-gold text-gold bg-gold/10" : "border-red-500 text-red-500 bg-red-900/10"
                                )}>
                                    {activeContract.status === 'COMPLETED' ? "COMPLETE" : "ECHEC"}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="relative h-4 bg-slate-900 rounded-full overflow-hidden border border-white/10 mb-2">
                        <motion.div
                            className={clsx("h-full",
                                activeContract.status === 'COMPLETED' ? "bg-gold" :
                                    activeContract.status === 'FAILED' ? "bg-red-600" : "bg-user-accent"
                            )}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, (activeContract.currentProgress / activeContract.targetValue) * 100)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white/80 z-10 mix-blend-difference font-mono">
                            {Math.round(activeContract.currentProgress)} / {activeContract.targetValue}
                        </div>
                    </div>

                    <div className="flex justify-between text-[10px] font-mono text-gray-500 uppercase">
                        <span>Prime: ${activeContract.reward}</span>
                        <span>Risque: -${activeContract.penalty}</span>
                    </div>

                    {/* Stamps */}
                    {activeContract.status === 'COMPLETED' && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-gold text-gold font-black text-3xl uppercase p-2 rotate-12 opacity-80 mask-grunge pointer-events-none">
                            MISSION ACCOMPLISHED
                        </div>
                    )}
                    {activeContract.status === 'FAILED' && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-red-600 text-red-600 font-black text-3xl uppercase p-2 -rotate-12 opacity-80 mask-grunge pointer-events-none">
                            TERMINATED
                        </div>
                    )}

                </HoloPanel>
            ) : (
                /* OFFERS (GRID) */
                <div className="grid grid-cols-3 gap-2">
                    {offers.map(offer => (
                        <motion.button
                            key={offer.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedOffer(offer)}
                            className="aspect-[3/4] bg-slate-800 border-2 border-slate-600 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-slate-700 hover:border-user-accent transition-all relative overflow-hidden group shadow-lg"
                        >
                            <div className="absolute top-0 right-0 p-1 opacity-50">
                                <Lock size={12} className="text-gray-400" />
                            </div>
                            <FileText size={24} className="text-gray-500 group-hover:text-user-accent transition-colors" />
                            <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest group-hover:text-white">
                                TOP SECRET
                            </div>
                            <div className="w-8 h-0.5 bg-gray-600 group-hover:bg-user-accent my-1" />
                            <div className="text-[8px] font-mono text-gray-500">
                                CLASSIFIED
                            </div>
                        </motion.button>
                    ))}
                </div>
            )}

            {/* MODAL FOR OFFER DETAILS */}
            <AnimatePresence>
                {selectedOffer && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#dcd0c0] text-black w-full max-w-sm rounded-[2px] shadow-2xl relative p-6 font-mono border-l-4 border-l-red-800 rotate-1 transform"
                            style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }} // Optional texture, fallback is fine
                        >
                            {/* "Paper" Look */}
                            <div className="absolute top-2 right-2 border-2 border-red-800 px-2 py-1 text-red-800 font-bold text-xs uppercase -rotate-12 opacity-80">
                                CONFIDENTIEL
                            </div>

                            <h2 className="text-xl font-black uppercase mb-4 border-b-2 border-black pb-2 tracking-tighter">
                                {selectedOffer.title}
                            </h2>

                            <div className="space-y-4 mb-6 text-sm font-bold opacity-80">
                                <p>{selectedOffer.description}</p>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="border border-black p-2">
                                        <div className="text-[10px] uppercase">Objectif</div>
                                        <div className="text-lg">{selectedOffer.targetValue} {selectedOffer.type === 'HEAVY_LIFT' ? 'KG' : 'UNITS'}</div>
                                    </div>
                                    <div className="border border-black p-2">
                                        <div className="text-[10px] uppercase">Délai</div>
                                        <div className="text-lg">{selectedOffer.durationHours} H</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center bg-black/5 p-2 rounded">
                                    <div className="text-green-800">
                                        PRIME: +${selectedOffer.reward}
                                    </div>
                                    <div className="text-red-800">
                                        RISQUE: -${selectedOffer.penalty}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={closeOffer}
                                    className="flex-1 py-3 text-xs font-bold uppercase border-2 border-black hover:bg-black/10 transition-colors"
                                >
                                    REFUSER
                                </button>
                                <button
                                    onClick={() => { signContract(selectedOffer); closeOffer(); }}
                                    className="flex-1 py-3 text-xs font-bold uppercase bg-red-800 text-white border-2 border-red-800 hover:bg-red-900 transition-colors shadow-lg"
                                >
                                    SIGNER
                                </button>
                            </div>

                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Countdown = ({ target }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const tick = () => {
            const now = new Date();
            const end = new Date(target);
            if (now > end) {
                setTimeLeft("EXPIRÉ");
                return;
            }
            setTimeLeft(formatDistanceToNow(end, { locale: fr, addSuffix: true }));
        };
        tick();
        const interval = setInterval(tick, 60000); // every minute
        return () => clearInterval(interval);
    }, [target]);

    return <span>{timeLeft}</span>;
}

export default ContractsPanel;
