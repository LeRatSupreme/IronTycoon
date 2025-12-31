import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Check, X } from 'lucide-react';
import { useState } from 'react';
import { useWallet } from '../context/WalletContext';

const CHALLENGES = [
    { text: "20 Burpees", reward: 200 },
    { text: "2 Minute Plank", reward: 300 },
    { text: "50 Pushups", reward: 250 },
    { text: "100 Jumping Jacks", reward: 150 },
    { text: "MAX Pullups test", reward: 500 },
];

const FinisherModal = ({ isOpen, onClose, onAccept, onDecline }) => {
    const [challenge] = useState(() => CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="bg-slate-900 border-2 border-red-600 rounded-3xl p-6 w-full max-w-sm shadow-[0_0_50px_rgba(220,38,38,0.3)] text-center"
                >
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-red-500/10 rounded-full border border-red-500 animate-pulse">
                            <Skull size={48} className="text-red-500" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-white italic mb-2">DEAL DU DIABLE</h2>
                    <p className="text-gray-400 mb-6">Le Boss veut jouer.</p>

                    <div className="bg-black/50 p-4 rounded-xl border border-white/10 mb-8">
                        <p className="text-xl font-bold text-red-400 mb-2">{challenge.text}</p>
                        <p className="text-sm text-gold">Récompense : +{challenge.reward} $WOL</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={onDecline}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-800 text-gray-400 hover:bg-slate-700 transition"
                        >
                            <X size={24} className="mb-2" />
                            <span className="text-xs font-bold uppercase">Refuser (Lâche)</span>
                        </button>

                        <button
                            onClick={() => onAccept(challenge.reward)}
                            className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-600/20 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition group"
                        >
                            <Check size={24} className="mb-2 group-hover:scale-125 transition" />
                            <span className="text-xs font-bold uppercase">ACCEPTER</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default FinisherModal;
