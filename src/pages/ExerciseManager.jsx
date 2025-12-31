import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Link } from 'react-router-dom';
import { ChevronLeft, Plus, Trash2, Atom, FlaskConical } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import GameButton from '../components/ui/GameButton';

const ExerciseManager = () => {
    const exercises = useLiveQuery(() => db.exercises.toArray());
    const [newExo, setNewExo] = useState({ name: '', category: 'push', multiplier: 1.0 });

    const handleAdd = async () => {
        if (!newExo.name) return;
        await db.exercises.add({
            ...newExo,
            personalRecord: 0
        });
        setNewExo({ name: '', category: 'push', multiplier: 1.0 });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Démanteler cette machine définitivement ?")) {
            await db.exercises.delete(id);
        }
    };

    return (
        <div className="pb-24 pt-4 min-h-screen bg-slate-950 relative overflow-hidden text-user-accent font-mono">
            {/* Blueprint Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--primary)/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--primary)/0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

            <div className="relative z-10 px-4">
                <Link to="/workout" className="flex items-center text-user-accent mb-6 hover:text-white transition-colors">
                    <ChevronLeft size={20} /> <span className="font-bold uppercase text-xs tracking-widest ml-1">Retour Usine</span>
                </Link>

                <div className="flex items-center gap-4 mb-8">
                    <div className="bg-user-accent/10 p-4 rounded-xl border border-user-accent/50 shadow-glow-accent">
                        <FlaskConical className="text-user-accent" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Département R&D</h1>
                        <p className="text-xs text-user-accent font-bold tracking-[0.2em] uppercase">Ingénierie & Prototypes</p>
                    </div>
                </div>

                {/* Formulaire Création */}
                <div className="bg-slate-900/90 border-2 border-user-accent/30 rounded-2xl p-6 mb-8 relative overflow-hidden shadow-2xl">
                    {/* Decorative Corner lines */}
                    <div className="absolute top-0 right-0 p-2 border-l border-b border-white/10 rounded-bl-xl items-center flex gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase text-gray-500">SYSTÈME ACTIF</span>
                    </div>

                    <h2 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                        <Atom size={16} className="text-user-accent" /> Prototype v1.0
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="text-[10px] text-user-accent uppercase font-black block mb-2">Nom de code</label>
                            <input
                                type="text"
                                placeholder="EX: SPARTAN BURPEE"
                                className="w-full bg-slate-950 border-2 border-user-accent/20 rounded-xl p-4 text-white outline-none focus:border-user-accent focus:shadow-glow-accent transition-all font-bold tracking-widest placeholder-white/20 uppercase"
                                value={newExo.name}
                                onChange={e => setNewExo({ ...newExo, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-user-accent uppercase font-black block mb-2">Type Mécanique</label>
                                <select
                                    className="w-full bg-slate-950 border-2 border-user-accent/20 rounded-xl p-4 text-white outline-none focus:border-user-accent font-bold uppercase"
                                    value={newExo.category}
                                    onChange={e => setNewExo({ ...newExo, category: e.target.value })}
                                >
                                    <option value="push">PUSH (POUSSÉE)</option>
                                    <option value="pull">PULL (TIRAGE)</option>
                                    <option value="legs">LEGS (JAMBES)</option>
                                    <option value="cardio">CARDIO</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-user-accent uppercase font-black block mb-2">Facteur Rendement</label>
                                <select
                                    className="w-full bg-slate-950 border-2 border-user-accent/20 rounded-xl p-4 text-white outline-none focus:border-user-accent font-bold uppercase"
                                    value={newExo.multiplier}
                                    onChange={e => setNewExo({ ...newExo, multiplier: parseFloat(e.target.value) })}
                                >
                                    <option value="1">STANDARD (x1.0)</option>
                                    <option value="1.2">AVANCÉ (x1.2)</option>
                                    <option value="1.5">ELITE (x1.5)</option>
                                    <option value="3">SUICIDE (x3.0)</option>
                                </select>
                            </div>
                        </div>

                        <GameButton
                            onClick={handleAdd}
                            variant="primary"
                            className="w-full mt-4"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Plus size={20} strokeWidth={3} /> LANCER LA PRODUCTION
                            </div>
                        </GameButton>
                    </div>
                </div>

                {/* Liste Existant */}
                <div className="mb-20">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-4 pl-2 tracking-widest">Parc Machines Actif</h3>
                    <div className="space-y-3">
                        <AnimatePresence>
                            {exercises?.map(exo => (
                                <motion.div
                                    key={exo.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex justify-between items-center bg-slate-900 border border-user-accent/10 p-4 rounded-xl group hover:border-user-accent transition-all shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={clsx(
                                            "w-10 h-10 rounded-lg flex items-center justify-center font-black text-xs border border-white/5",
                                            exo.category === 'push' && "bg-red-500/20 text-red-400",
                                            exo.category === 'pull' && "bg-blue-500/20 text-blue-400",
                                            exo.category === 'legs' && "bg-green-500/20 text-green-400",
                                            exo.category === 'cardio' && "bg-yellow-500/20 text-yellow-400"
                                        )}>
                                            {exo.category.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm uppercase tracking-wider">{exo.name}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-mono mt-0.5">
                                                TYPE: {exo.category} <span className="text-user-accent/50">|</span> RDMT: x{exo.multiplier}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(exo.id)}
                                        className="text-slate-600 hover:text-red-500 p-2 transition-colors bg-slate-800 hover:bg-red-900/20 rounded-lg"
                                        title="Démanteler"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {(!exercises || exercises.length === 0) && (
                            <div className="text-center p-8 border-2 border-dashed border-white/5 rounded-xl">
                                <p className="text-gray-600 font-bold uppercase text-xs">Aucune machine active</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExerciseManager;
