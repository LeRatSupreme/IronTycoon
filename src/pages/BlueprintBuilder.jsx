import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Link } from 'react-router-dom';
import { ChevronLeft, Save, Component, CheckSquare, Square, X, Pencil, RotateCcw, Plus, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import GameButton from '../components/ui/GameButton';

const BlueprintBuilder = () => {
    const exercises = useLiveQuery(() => db.exercises.toArray());
    const blueprints = useLiveQuery(() => db.blueprints.toArray());

    const [name, setName] = useState('');
    const [selectedExos, setSelectedExos] = useState([]);
    const [editingId, setEditingId] = useState(null); // ID of blueprint being edited

    const addExercise = (exo) => {
        setSelectedExos([...selectedExos, {
            exerciseId: exo.id,
            name: exo.name,
            targetSets: 4,
            targetReps: 10,
            restTime: 60,
            uniqueId: Date.now()
        }]);
    };

    const removeExercise = (uniqueId) => {
        setSelectedExos(selectedExos.filter(e => e.uniqueId !== uniqueId));
    };

    const updateExerciseParam = (uniqueId, field, value) => {
        setSelectedExos(selectedExos.map(e =>
            e.uniqueId === uniqueId ? { ...e, [field]: parseFloat(value) } : e
        ));
    };

    const handleEdit = (bp) => {
        setEditingId(bp.id);
        setName(bp.name);

        const hydrated = bp.exercises.map(item => {
            if (typeof item !== 'object') {
                return {
                    exerciseId: item,
                    name: 'Unknown',
                    targetSets: 4, targetReps: 10, restTime: 60,
                    uniqueId: Math.random()
                };
            }
            return { ...item, uniqueId: Math.random() };
        });

        setSelectedExos(hydrated);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setName('');
        setSelectedExos([]);
    };

    const handleSave = async () => {
        if (!name || selectedExos.length === 0) return;

        const blueprintData = {
            name,
            exercises: selectedExos.map(({ uniqueId, ...rest }) => rest),
            created_at: new Date()
        };

        if (editingId) {
            await db.blueprints.update(editingId, blueprintData);
            // alert("Protocole mis à jour.");
            handleCancelEdit();
        } else {
            await db.blueprints.add(blueprintData);
            // alert("Protocole de production validé.");
            setName('');
            setSelectedExos([]);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Détruire ce plan définitivement ?")) {
            await db.blueprints.delete(id);
            if (editingId === id) handleCancelEdit();
        }
    }

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
                        <Component className="text-user-accent" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Bureau d'Études</h1>
                        <p className="text-xs text-user-accent font-bold tracking-[0.2em] uppercase">Architecture & Protocoles</p>
                    </div>
                </div>

                {/* Builder Form */}
                <div className={clsx("border-2 rounded-2xl p-6 mb-8 transition-colors shadow-2xl relative overflow-hidden", editingId ? "bg-slate-900/90 border-gold/50" : "bg-slate-900/90 border-user-accent/30")}>

                    {/* Decorative Corner lines */}
                    <div className="absolute top-0 right-0 p-2 border-l border-b border-white/10 rounded-bl-xl items-center flex gap-2">
                        <div className="w-2 h-2 bg-user-accent rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase text-gray-500">MODE ÉDITION</span>
                    </div>

                    <div className="flex justify-between items-center mb-6 mt-2">
                        <h2 className={clsx("text-sm font-black uppercase tracking-widest", editingId ? "text-gold" : "text-white")}>
                            {editingId ? "REVISION DU PLAN - ID:" + editingId : "NOUVEAU PLAN"}
                        </h2>
                        {editingId && (
                            <button onClick={handleCancelEdit} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300 font-bold uppercase border border-red-500/30 px-2 py-1 rounded bg-red-500/10">
                                <RotateCcw size={12} /> Annuler
                            </button>
                        )}
                    </div>

                    <div className="mb-8">
                        <label className="text-[10px] text-user-accent uppercase font-bold mb-2 block">Identifiant du Projet</label>
                        <input
                            type="text"
                            placeholder="EX: PROJET ALPHA"
                            className="w-full bg-slate-950 border-2 border-user-accent/20 rounded-xl p-4 text-white outline-none focus:border-user-accent focus:shadow-glow-accent transition-all font-bold tracking-widest placeholder-white/20 uppercase"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    {/* Selected List */}
                    <div className="space-y-4 mb-8">
                        <AnimatePresence>
                            {selectedExos.map((item, index) => (
                                <motion.div
                                    key={item.uniqueId}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="bg-slate-950 border border-user-accent/20 rounded-xl p-4 relative group hover:border-user-accent/50 transition-colors"
                                >
                                    <button onClick={() => removeExercise(item.uniqueId)} className="absolute top-2 right-2 p-2 text-slate-700 hover:text-red-500 transition-colors">
                                        <X size={16} strokeWidth={3} />
                                    </button>

                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-user-accent text-slate-950 font-black w-6 h-6 rounded flex items-center justify-center text-xs shadow-lg">
                                            {index + 1}
                                        </div>
                                        <span className="font-bold text-white uppercase tracking-wider text-sm">{item.name}</span>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="text-[9px] text-user-accent uppercase font-black block mb-1 text-center">Séries</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-900 border border-user-accent/30 p-2 rounded text-center text-white text-lg font-bold outline-none focus:border-user-accent focus:bg-slate-800"
                                                value={item.targetSets}
                                                onChange={(e) => updateExerciseParam(item.uniqueId, 'targetSets', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-user-accent uppercase font-black block mb-1 text-center">Réps</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-900 border border-user-accent/30 p-2 rounded text-center text-white text-lg font-bold outline-none focus:border-user-accent focus:bg-slate-800"
                                                value={item.targetReps}
                                                onChange={(e) => updateExerciseParam(item.uniqueId, 'targetReps', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-user-accent uppercase font-black block mb-1 text-center">Repos (s)</label>
                                            <input
                                                type="number"
                                                className="w-full bg-slate-900 border border-user-accent/30 p-2 rounded text-center text-white text-lg font-bold outline-none focus:border-user-accent focus:bg-slate-800"
                                                value={item.restTime}
                                                onChange={(e) => updateExerciseParam(item.uniqueId, 'restTime', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {selectedExos.length === 0 && (
                            <div className="text-center p-8 border-2 border-dashed border-user-accent/20 rounded-xl bg-user-accent/5">
                                <p className="text-user-accent font-bold uppercase text-xs mb-2">Configuration Vide</p>
                                <p className="text-user-accent/50 text-[10px]">INJECTEZ DES MODULES DEPUIS LE CATALOGUE</p>
                            </div>
                        )}
                    </div>

                    {/* Global Catalog */}
                    <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-xs font-black text-user-accent uppercase tracking-widest">Catalogue Modules</p>
                            <span className="text-[10px] text-user-accent font-mono">{exercises?.length || 0} DISPONIBLES</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 h-48 overflow-y-auto custom-scrollbar pr-2">
                            {exercises?.map(exo => (
                                <button
                                    key={exo.id}
                                    onClick={() => addExercise(exo)}
                                    className="flex items-center gap-2 text-left bg-slate-950 border border-user-accent/20 hover:border-user-accent hover:bg-user-accent/10 p-3 rounded-lg group transition-all"
                                >
                                    <div className="bg-user-accent/30 p-1 rounded group-hover:bg-user-accent group-hover:text-black transition-colors">
                                        <Plus size={12} />
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-white truncate uppercase">{exo.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <GameButton
                        onClick={handleSave}
                        variant={editingId ? "gold" : "primary"}
                        disabled={!name || selectedExos.length === 0}
                        className="w-full mt-8"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <Save size={18} />
                            {editingId ? "MISE À JOUR PROTOCOLE" : "VALIDER PROTOCOLE"}
                        </div>
                    </GameButton>
                </div>

                {/* Available Blueprints List */}
                <div className="mb-20">
                    <h3 className="text-xs font-black text-gray-500 uppercase mb-4 pl-2 tracking-widest">Base de Données Plans</h3>
                    <div className="space-y-3">
                        {blueprints?.map(bp => (
                            <div key={bp.id} className={clsx("bg-slate-900 p-4 rounded-xl border-2 flex justify-between items-center group transition-all shadow-lg", editingId === bp.id ? "border-gold shadow-[0_0_15px_rgba(255,215,0,0.2)]" : "border-transparent hover:border-user-accent/50")}>
                                <div className="flex items-center gap-4">
                                    <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center", editingId === bp.id ? "bg-gold text-black" : "bg-user-accent/10 text-user-accent")}>
                                        <CheckSquare size={20} />
                                    </div>
                                    <div>
                                        <p className={clsx("font-black uppercase tracking-wider transition-colors", editingId === bp.id ? "text-gold" : "text-white group-hover:text-user-accent")}>{bp.name}</p>
                                        <div className="flex gap-2 text-[10px] text-gray-500 font-mono mt-1">
                                            <span>{bp.exercises.length} MODULES</span>
                                            <span className="text-gray-700">|</span>
                                            <span>ID: {bp.id}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(bp)} className="p-2 bg-slate-800 hover:bg-blue-600 rounded-lg text-gray-400 hover:text-white transition-colors shadow-md" title="Modifier">
                                        <Pencil size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(bp.id)} className="p-2 bg-slate-800 hover:bg-red-600 rounded-lg text-gray-400 hover:text-white transition-colors shadow-md" title="Supprimer">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlueprintBuilder;
