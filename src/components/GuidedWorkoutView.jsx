import { useState, useEffect } from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, FastForward, Award, Play } from 'lucide-react';
import useSound from 'use-sound';
import HoloPanel from './ui/HoloPanel';
import GameButton from './ui/GameButton';
import DigitalDisplay from './ui/DigitalDisplay';

const GuidedWorkoutView = ({ blueprintExercises, onLogSet, globalFunds, onFinish, restMultiplier = 1 }) => {

    // State Machine
    const [status, setStatus] = useState('WORKING'); // 'WORKING' | 'RESTING' | 'FINISHED'

    // Pointers
    const [currentExoIndex, setCurrentExoIndex] = useState(0);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);

    // Current Exercise Data
    const currentExo = blueprintExercises[currentExoIndex];
    const totalSets = currentExo?.targetSets || 4;
    const targetReps = currentExo?.targetReps || 10;

    // Inputs
    const [weight, setWeight] = useState(currentExo?.personalRecord || 0);
    const [reps, setReps] = useState(targetReps);

    // Gamification
    const [showPerfectBatch, setShowPerfectBatch] = useState(false);

    // Timer Hook
    const { secondsLeft, start: startTimer, addTime, skip: skipTimer } = useCountdown(currentExo?.restTime || 60, () => {
        handleRestComplete();
    });

    useEffect(() => {
        if (currentExo) {
            setWeight(currentExo.personalRecord || 0);
            setReps(currentExo.targetReps || 10);
        }
    }, [currentExoIndex, currentExo]);

    const handleValidateSet = () => {
        const isPerfect = Number(reps) === Number(targetReps);

        onLogSet({
            exercise: currentExo,
            weight,
            reps,
            isPerfect
        });

        if (isPerfect) {
            setShowPerfectBatch(true);
            setTimeout(() => setShowPerfectBatch(false), 2000);
        }

        const isLastSet = currentSetIndex + 1 >= totalSets;
        const isLastExo = currentExoIndex + 1 >= blueprintExercises.length;

        if (isLastSet && isLastExo) {
            setStatus('FINISHED');
            onFinish();
        } else {
            setStatus('RESTING');
            const baseRest = currentExo.restTime || 60;
            startTimer(Math.round(baseRest * restMultiplier));
        }
    };

    const handleRestComplete = () => {
        setStatus('WORKING');
        if (currentSetIndex + 1 >= totalSets) {
            setCurrentExoIndex(prev => prev + 1);
            setCurrentSetIndex(0);
        } else {
            setCurrentSetIndex(prev => prev + 1);
        }
    };

    if (status === 'FINISHED') return null; // Parent handles showFinisher

    // Progress Bar Logic
    const totalSetsAllExos = blueprintExercises.reduce((acc, ex) => acc + (ex.targetSets || 0), 0);
    const currentGlobalSet = blueprintExercises.slice(0, currentExoIndex).reduce((acc, ex) => acc + (ex.targetSets || 0), 0) + currentSetIndex + 1;
    const progressPerc = (currentGlobalSet / totalSetsAllExos) * 100;

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    const contentVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { delay: 0.2, type: "spring", stiffness: 100 } }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col h-full relative overflow-hidden bg-slate-950"
        >
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            {/* Top HUD */}
            <motion.div variants={contentVariants} className="p-4 z-10 relative bg-slate-900/50 border-b border-white/5 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-2">
                    <div className="text-xs font-black text-gray-500 tracking-widest uppercase">
                        AVANCEMENT <span className="text-neon-green">{Math.round(progressPerc)}%</span>
                    </div>
                    <div className="text-right">
                        <DigitalDisplay value={globalFunds} size="sm" color="gold" prefix="$" />
                    </div>
                </div>
                <div className="h-4 bg-black w-full rounded-full overflow-hidden border border-white/10 relative">
                    <div className="absolute inset-0 bg-white/5" />
                    <motion.div
                        className="h-full bg-neon-green shadow-[0_0_10px_#39ff14]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPerc}%` }}
                    />
                </div>
            </motion.div>

            {/* REST MODE OVERLAY */}
            <AnimatePresence>
                {status === 'RESTING' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 space-y-12 backdrop-blur-xl"
                    >
                        {/* Circle Timer */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                            <div className="relative z-10 bg-black/50 p-8 rounded-full border-4 border-blue-500/30 w-64 h-64 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                                <DigitalDisplay value={secondsLeft} size="xl" color={secondsLeft < 10 ? 'red' : 'blue'} suffix="s" />
                                <span className="text-xs text-blue-400 font-bold uppercase mt-2 tracking-widest">REFROIDISSEMENT</span>
                            </div>
                        </div>

                        <div className="w-full max-w-sm space-y-6">
                            <div className="text-center bg-slate-900 p-4 rounded-xl border border-white/10">
                                <p className="text-gray-500 text-xs font-bold uppercase mb-1">PROCHAINE MACHINE</p>
                                <p className="text-white font-black text-xl uppercase tracking-wider">{currentSetIndex + 1 >= totalSets ? blueprintExercises[currentExoIndex + 1]?.name : currentExo.name}</p>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => addTime(30)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl border border-white/10 transition-colors uppercase text-sm">
                                    +30 SECONDES
                                </button>
                                <GameButton variant="gold" onClick={skipTimer} className="flex-1">
                                    <div className="flex items-center justify-center gap-2">
                                        <Play size={18} fill="black" /> REPRENDRE
                                    </div>
                                </GameButton>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* WORKING MODE MAIN PANEL */}
            <motion.div
                variants={contentVariants}
                className="flex-1 flex flex-col relative z-20 px-4 pb-6 pt-4"
            >

                {/* Exercise Info Card */}
                <div className="mb-6 p-6 text-center bg-slate-900/80 border-2 border-blue-500/20 rounded-2xl relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                    <div className="flex justify-between items-start mb-4 opacity-50">
                        <span className="text-xs font-black uppercase tracking-widest text-blue-400">LOT EN COURS</span>
                        <span className="text-xs font-mono font-bold bg-black/30 px-2 py-1 rounded text-white">{currentSetIndex + 1} / {totalSets}</span>
                    </div>

                    <h2 className="text-3xl font-black uppercase italic mb-4 tracking-tighter text-white drop-shadow-md leading-none">{currentExo.name}</h2>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-neon-green/30">
                        <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
                        <span className="text-xs font-bold font-mono text-neon-green tracking-widest">OBJECTIF : {targetReps} REPS</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-[10px] text-blue-400 font-black uppercase block mb-2 pl-2 tracking-widest">POIDS (KG)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-neon-green text-center text-5xl font-black font-mono text-white p-6 rounded-3xl outline-none shadow-inner transition-colors"
                                value={weight}
                                onChange={e => setWeight(e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-[10px] text-blue-400 font-black uppercase block mb-2 pl-2 tracking-widest">RÉPS</label>
                            <input
                                type="number"
                                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-neon-green text-center text-5xl font-black font-mono text-white p-6 rounded-3xl outline-none shadow-inner transition-colors"
                                value={reps}
                                onChange={e => setReps(e.target.value)}
                            />
                        </div>
                    </div>

                    <GameButton size="xl" onClick={handleValidateSet} className="w-full py-8 mt-auto shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:shadow-[0_0_50px_rgba(57,255,20,0.5)] transition-shadow">
                        <div className="flex items-center justify-center gap-3 text-xl">
                            <Check size={32} strokeWidth={4} /> VALIDER LE LOT
                        </div>
                    </GameButton>
                </div>
            </motion.div>

            {/* Perfect Badge Overlay */}
            <AnimatePresence>
                {showPerfectBatch && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1, opacity: 1, rotate: -12 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
                    >
                        <div className="bg-neon-green text-black font-black px-12 py-6 border-8 border-white shadow-[0_0_100px_rgba(57,255,20,0.8)] text-4xl flex items-center gap-4 whitespace-nowrap italic -skew-x-12 transform">
                            <Award size={48} strokeWidth={3} /> PARFAIT !
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default GuidedWorkoutView;
