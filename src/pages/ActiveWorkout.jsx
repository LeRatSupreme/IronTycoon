import GuidedWorkoutView from '../components/GuidedWorkoutView';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useWallet } from '../context/WalletContext';
import { Plus, Play, Atom, Component, ChevronDown, ChevronUp, Save, Dumbbell, Timer, Zap } from 'lucide-react';
import useSound from 'use-sound';
import Confetti from 'react-confetti';
import FinisherModal from '../components/FinisherModal';
import { useNavigate, Link } from 'react-router-dom';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import GameButton from '../components/ui/GameButton';
import DigitalDisplay from '../components/ui/DigitalDisplay';
import { useMarketMaker } from '../hooks/useMarketMaker';

const ActiveWorkout = () => {
    const { addFunds, user, updateLastWorkout, globalMultiplier } = useWallet();
    const navigate = useNavigate();
    const { triggerMarketPump } = useMarketMaker();
    const [elapsed, setElapsed] = useState(0);

    // Data Loading
    const allExercises = useLiveQuery(() => db.exercises.toArray());
    const blueprints = useLiveQuery(() => db.blueprints.toArray());
    const ownedUpgrades = useLiveQuery(() => db.user.get(user?.id || 1).then(u => u?.ownedUpgrades || []));

    const [phase, setPhase] = useState('setup');
    const [sessionExercises, setSessionExercises] = useState([]);
    const [guidedBlueprintExercises, setGuidedBlueprintExercises] = useState([]);
    const [expandedExoInstanceId, setExpandedExoInstanceId] = useState(null);
    const [sessionTotal, setSessionTotal] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showFinisher, setShowFinisher] = useState(false);

    const [inputs, setInputs] = useState({ weight: '', reps: '', duration: '' });

    const [playCash] = useSound('/sounds/cash.mp3');
    const [playJackpot] = useSound('/sounds/jackpot.mp3');

    // -- SETUP HANDLERS --
    const startFreeSession = () => {
        setSessionExercises([]);
        setPhase('grind');
    };

    const startBlueprint = (blueprint) => {
        if (!allExercises) return;

        const hydrated = blueprint.exercises.map(item => {
            const id = typeof item === 'object' ? item.exerciseId : item;
            const exoDef = allExercises.find(e => e.id === Number(id));

            if (!exoDef) return null;

            return {
                ...exoDef,
                targetSets: item.targetSets || 4,
                targetReps: item.targetReps || 10,
                restTime: item.restTime || 60,
            };
        }).filter(Boolean);

        setGuidedBlueprintExercises(hydrated);
        setPhase('guided');
    };

    // -- SHARED LOGIC --
    const processSetLog = async (exo, w, r, duration, isPerfect = false) => {
        let gain = 0;
        let isPR = false;

        const isCardio = exo.category === 'cardio';

        if (isCardio) {
            gain = (duration * 10) * exo.multiplier;
        } else {
            gain = (w * r) * exo.multiplier;
            if (w > exo.personalRecord) {
                isPR = true;
                gain += 500;
                await db.exercises.update(exo.id, { personalRecord: w });
            }
        }

        if (isPerfect) gain += 10;

        // GLOBAL MULTIPLIERS (Happy Hour + Gold Weights)
        let totalMultiplier = globalMultiplier;
        if (ownedUpgrades?.includes('GOLD_WEIGHTS')) {
            totalMultiplier *= 1.1; // +10%
        }

        gain = gain * totalMultiplier;

        await addFunds(gain);
        setSessionTotal(prev => prev + gain);

        if (isPR) {
            playJackpot();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
        } else {
            playCash();
        }

        return { gain, isPR };
    };

    // -- GUIDED HANDLERS --
    const handleGuidedLog = async (logData) => {
        await processSetLog(logData.exercise, logData.weight, logData.reps, 0, logData.isPerfect);
    };

    // -- GRIND HANDLERS (FREE MODE) --
    const addExerciseToSession = (exoId) => {
        const exoDef = allExercises.find(e => e.id === Number(exoId));
        if (!exoDef) return;

        const newInstance = {
            ...exoDef,
            instanceId: Math.random().toString(36).substr(2, 9),
            sets: []
        };

        setSessionExercises([...sessionExercises, newInstance]);
        setExpandedExoInstanceId(newInstance.instanceId);
    };

    const handleFreeLogSet = async (instanceId) => {
        const exoIndex = sessionExercises.findIndex(e => e.instanceId === instanceId);
        if (exoIndex === -1) return;
        const exo = sessionExercises[exoIndex];
        const isCardio = exo.category === 'cardio';

        const w = parseFloat(inputs.weight) || 0;
        const r = parseFloat(inputs.reps) || 0;
        const d = parseFloat(inputs.duration) || 0;

        if (isCardio && !d) return;
        if (!isCardio && (!w || !r)) return;

        const { gain, isPR } = await processSetLog(exo, w, r, d);

        const logData = isCardio ? { val1: d, desc: `${d} min` } : { val1: w, val2: r, desc: `${w}kg x ${r}` };
        const newSets = [...exo.sets, { ...logData, gain: Math.round(gain), isPR, id: Date.now() }];

        const newSessionList = [...sessionExercises];
        newSessionList[exoIndex] = { ...exo, sets: newSets };
        setSessionExercises(newSessionList);

        setInputs(prev => ({ ...prev, reps: '', duration: '' }));
    };

    const finishSession = () => {
        if (sessionTotal === 0 && sessionExercises.length === 0 && guidedBlueprintExercises.length === 0) {
            navigate('/');
            return;
        }

        // Trigger Market Pump based on session exercises
        let exercisesToConsider = [];
        if (phase === 'grind') {
            exercisesToConsider = sessionExercises;
        } else if (phase === 'guided') {
            exercisesToConsider = guidedBlueprintExercises;
        }

        if (exercisesToConsider.length > 0) {
            const categories = [...new Set(exercisesToConsider.map(e => e.category))];
            categories.forEach(cat => {
                if (cat) triggerMarketPump(cat);
            });
        }

        setShowFinisher(true);
    };

    const finalize = async (finalTotal) => {
        await db.workouts.add({
            date: new Date(),
            duration: 0,
            totalWOL: finalTotal,
            mood: 'neutral'
        });
        await updateLastWorkout();
        navigate('/');
    };

    // Animation Variants (Dashboard Style)
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
    };

    // -- RENDER: SETUP PHASE --
    if (phase === 'setup') {
        return (
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="pt-8 px-4 pb-24 min-h-screen flex flex-col bg-slate-950 relative overflow-hidden"
            >
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

                <div className="relative z-10">
                    <motion.div variants={itemVariants}>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-2 italic">FACTORY OS</h1>
                        <p className="text-user-accent font-mono text-xs mb-8 tracking-widest uppercase">::: SÉLECTION DU PROTOCOLE :::</p>
                    </motion.div>

                    <motion.div variants={containerVariants} className="grid gap-6 mb-8">
                        {/* Free Session Card */}
                        <motion.div
                            variants={itemVariants}
                            onClick={startFreeSession}
                            className="bg-slate-900/90 border-2 border-white/10 hover:border-user-accent/50 p-6 rounded-2xl cursor-pointer group transition-all shadow-[0_4px_20px_rgba(0,0,0,0.3)] relative overflow-hidden"
                        >
                            <div className="absolute right-0 top-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                <Zap size={64} className="text-white transform -rotate-12" />
                            </div>
                            <div className="bg-white/10 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-white/10">
                                <Play fill="white" className="text-white ml-1" size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-1 uppercase italic">SESSION LIBRE</h3>
                            <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">IMPROVISATION TACTIQUE // MODE MANUEL</p>
                        </motion.div>

                        {/* Blueprints */}
                        <motion.div variants={itemVariants} className="space-y-4">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Plans Approuvés</h2>
                            {blueprints?.map(bp => (
                                <motion.div
                                    variants={itemVariants}
                                    key={bp.id}
                                    onClick={() => startBlueprint(bp)}
                                    className="bg-slate-900/80 border border-user-accent/30 hover:border-gold hover:bg-slate-800 p-5 rounded-xl cursor-pointer group transition-all relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2 bg-user-accent/10 rounded-bl-xl border-b border-l border-user-accent/10 group-hover:bg-gold/10 group-hover:border-gold/30 transition-colors">
                                        <span className="text-[10px] font-bold text-user-accent group-hover:text-gold uppercase tracking-wider">Smart GPS</span>
                                    </div>
                                    <h3 className="text-xl font-black text-white mb-2 uppercase group-hover:text-gold transition-colors">{bp.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-black/30 px-2 py-1 rounded text-[10px] font-mono text-gray-400 border border-white/5">
                                            {bp.exercises.length} MODULES
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            {(!blueprints || blueprints.length === 0) && (
                                <div className="text-center p-8 border-2 border-dashed border-white/10 rounded-xl">
                                    <p className="text-gray-600 font-bold uppercase text-xs">AUCUN PLAN DISPONIBLE</p>
                                    <Link to="/blueprints" className="text-user-accent text-xs font-bold hover:underline mt-2 inline-block">CRÉER OU IMPORTER</Link>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="mt-auto grid grid-cols-2 gap-4">
                        <Link to="/manage-exercises">
                            <div className="bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/5 hover:bg-slate-700 transition-colors group">
                                <Atom size={20} className="text-gray-400 group-hover:text-white" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white">R&D</span>
                            </div>
                        </Link>
                        <Link to="/blueprints">
                            <div className="bg-slate-800 p-4 rounded-xl flex flex-col items-center justify-center gap-2 border border-white/5 hover:bg-slate-700 transition-colors group">
                                <Component size={20} className="text-gray-400 group-hover:text-white" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest group-hover:text-white">PLANS</span>
                            </div>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>
        );
    }

    // -- RENDER: GUIDED PHASE --
    if (phase === 'guided') {
        const restMultiplier = ownedUpgrades?.includes('VENT_SYSTEM') ? 0.9 : 1.0;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-screen flex flex-col pt-4 pb-20 bg-slate-950"
            >
                {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}

                <GuidedWorkoutView
                    blueprintExercises={guidedBlueprintExercises}
                    onLogSet={handleGuidedLog}
                    globalFunds={sessionTotal}
                    onFinish={() => setShowFinisher(true)}
                    restMultiplier={restMultiplier}
                />

                <FinisherModal
                    isOpen={showFinisher}
                    onAccept={async (bonus) => await finalize(sessionTotal + bonus)}
                    onDecline={async () => await finalize(sessionTotal)}
                />
            </motion.div>
        );
    }

    // -- RENDER: GRIND PHASE (Free) --
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-32 pt-2 relative bg-slate-950 min-h-screen"
        >
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
            <FinisherModal
                isOpen={showFinisher}
                onAccept={async (bonus) => await finalize(sessionTotal + bonus)}
                onDecline={async () => await finalize(sessionTotal)}
            />

            {/* Header Sticky */}
            <div className="sticky top-0 bg-slate-950/95 backdrop-blur z-40 p-4 border-b border-white/10 mb-6 flex justify-between items-end shadow-2xl">
                <div>
                    <h1 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">RENDEMENT ACTUEL</h1>
                    <DigitalDisplay value={Math.floor(sessionTotal)} size="md" color="green" prefix="$" />
                </div>
                <GameButton
                    onClick={finishSession}
                    variant="danger"
                    size="sm"
                    className="shadow-glow-red"
                >
                    ARRÊT PROD.
                </GameButton>
            </div>

            {/* Exercise List */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4 px-2 relative z-10"
            >
                {sessionExercises.map((exo, index) => {
                    const isOpen = expandedExoInstanceId === exo.instanceId;
                    const isCardio = exo.category === 'cardio';

                    return (
                        <motion.div
                            key={exo.instanceId}
                            variants={itemVariants}
                            layout
                            className={clsx("rounded-2xl border transition-all overflow-hidden", isOpen ? "bg-slate-900 border-user-accent/50 shadow-glow-accent" : "bg-slate-900/50 border-white/5")}
                        >
                            {/* Header clickable */}
                            <div
                                onClick={() => setExpandedExoInstanceId(isOpen ? null : exo.instanceId)}
                                className="p-4 flex justify-between items-center cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm border", isOpen ? "bg-user-accent text-slate-950 border-user-accent" : "bg-white/5 text-gray-500 border-white/10")}>
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className={clsx("font-black uppercase tracking-wider text-lg", isOpen ? "text-white" : "text-gray-400")}>{exo.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-mono tracking-widest">{exo.sets.length} LOTS VALIDÉS</p>
                                    </div>
                                </div>
                                {isOpen ? <ChevronUp size={20} className="text-user-accent" /> : <ChevronDown size={20} className="text-gray-600" />}
                            </div>

                            {/* Content (Sets & Inputs) */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden bg-black/40"
                                    >
                                        <div className="p-4 pt-0 border-t border-white/5">
                                            {/* Previous Sets */}
                                            {exo.sets.length > 0 && (
                                                <div className="mb-4 space-y-2 mt-4 max-h-40 overflow-y-auto custom-scrollbar bg-black/20 p-2 rounded-xl">
                                                    {exo.sets.map(set => (
                                                        <div key={set.id} className="flex justify-between items-center text-xs p-2 rounded border-l-2 border-user-accent bg-slate-800/50">
                                                            <span className="text-gray-300 font-bold uppercase">{set.desc} {set.isPR && <span className="text-gold animate-pulse ml-2">🏆 RECORD</span>}</span>
                                                            <span className="text-user-accent font-black font-mono">+${set.gain}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Inputs */}
                                            <div className="mt-4 flex gap-3 items-end">
                                                {isCardio ? (
                                                    <div className="flex-1">
                                                        <label className="text-[10px] uppercase text-user-accent font-black mb-2 block pl-1">Durée (Min)</label>
                                                        <input
                                                            type="number"
                                                            className="w-full bg-slate-800 border-2 border-slate-700 focus:border-user-accent rounded-xl p-4 text-white font-mono text-2xl font-bold outline-none text-center transition-colors"
                                                            placeholder="30"
                                                            value={inputs.duration}
                                                            onChange={e => setInputs({ ...inputs, duration: e.target.value })}
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] uppercase text-user-accent font-black mb-2 block pl-1">POIDS (KG)</label>
                                                            <input
                                                                type="number"
                                                                className={clsx("w-full bg-slate-800 border-2 rounded-xl p-4 text-white font-mono text-2xl font-bold outline-none text-center focus:border-user-accent transition-colors", parseFloat(inputs.weight) > exo.personalRecord ? "text-user-accent border-user-accent/50" : "border-slate-700")}
                                                                placeholder={exo.personalRecord || "0"}
                                                                value={inputs.weight}
                                                                onChange={e => setInputs({ ...inputs, weight: e.target.value })}
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[10px] uppercase text-user-accent font-black mb-2 block pl-1">RÉPS</label>
                                                            <input
                                                                type="number"
                                                                className="w-full bg-slate-800 border-2 border-slate-700 focus:border-user-accent rounded-xl p-4 text-white font-mono text-2xl font-bold outline-none text-center transition-colors"
                                                                placeholder="10"
                                                                value={inputs.reps}
                                                                onChange={e => setInputs({ ...inputs, reps: e.target.value })}
                                                            />
                                                        </div>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => handleFreeLogSet(exo.instanceId)}
                                                    className="h-[64px] w-[64px] bg-gold text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-glow-gold"
                                                >
                                                    <Plus size={32} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Add Exercise Floating Button or Bottom Section */}
            <div className="px-4 mt-8 pb-8">
                <div className="relative">
                    <select
                        className="w-full bg-slate-900 text-white p-5 rounded-xl border-2 border-user-accent/30 outline-none appearance-none text-center font-black uppercase tracking-widest hover:border-gold hover:bg-slate-800 transition-all cursor-pointer shadow-lg"
                        onChange={(e) => {
                            addExerciseToSession(e.target.value);
                            e.target.value = '';
                        }}
                    >
                        <option value="">+ INSTALLER UNE MACHINE</option>
                        {allExercises?.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <ChevronDown size={20} className="text-gold" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ActiveWorkout;
