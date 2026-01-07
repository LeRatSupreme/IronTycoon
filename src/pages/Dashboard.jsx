import { useWallet } from '../context/WalletContext';
import { Link } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { AlertTriangle, TrendingUp, Trophy, Activity, Zap, BarChart3, Factory, ShoppingCart, User, Settings, ArrowRight } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';
import { useMemo } from 'react';
import HoloPanel from '../components/ui/HoloPanel';
import DigitalDisplay from '../components/ui/DigitalDisplay';
import GameButton from '../components/ui/GameButton';
import clsx from 'clsx';

const Dashboard = () => {
    const { user, showInactivityModal, setShowInactivityModal, inactivityPenalty } = useWallet();

    // Fetch workout history for chart
    const history = useLiveQuery(async () => {
        const workouts = await db.workouts.orderBy('date').limit(14).toArray(); // Last 14 sessions
        return workouts.map(w => ({
            date: w.date.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' }),
            val: w.totalWOL
        }));
    });

    const rankProgress = useLiveQuery(async () => {
        // Placeholder logic for XP/Rank progress if needed later
        return 75;
    });

    // Avatar Generation
    const avatarUri = useMemo(() => {
        if (!user) return '';
        return createAvatar(bottts, {
            seed: user.name,
            radius: 5,
            backgroundColor: ['transparent'],
            backgroundType: ['solid']
        }).toDataUri();
    }, [user?.name]);

    if (!user) return <div className="p-10 text-center text-user-accent font-mono animate-pulse">INITIALISATION DU NOYAU...</div>;

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

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden bg-slate-950 text-user-accent font-mono selection:bg-user-accent/30">
            {/* Background Tech Layer */}
            <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-3/4 h-3/4 bg-gradient-to-bl from-user-accent/5 via-transparent to-transparent pointer-events-none" />

            {/* Header / HUD */}
            <div className="relative z-10 p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <Link to="/hq">
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="relative w-16 h-16 cursor-pointer group"
                            >
                                <div className="absolute inset-0 bg-user-accent/20 rounded-lg animate-pulse" />
                                <div className="absolute inset-0 border-2 border-user-accent/50 rounded-lg transform rotate-3 group-hover:rotate-0 transition-transform" />
                                <div className="relative z-10 w-full h-full bg-slate-900 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                                    <img src={avatarUri} alt="Profile" className="w-14 h-14" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 z-20 shadow-[0_0_10px_#10b981]" />
                            </motion.div>
                        </Link>

                        <div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">
                                <span className="w-1.5 h-1.5 bg-user-accent rounded-full animate-ping" />
                                OPÉRATEUR CONNECTÉ
                            </div>
                            <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-lg">
                                {user.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="bg-user-accent text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                                    RANG {user.currentRank}
                                </span>
                                <span className="text-[10px] text-gray-400 font-mono tracking-wider px-2 border-l border-white/10">
                                    ID: 7X-{Math.floor(Math.random() * 9999)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Link to="/settings" className="p-2 border border-white/10 rounded-lg hover:bg-white/5 hover:border-user-accent/50 transition-colors group">
                        <Settings size={20} className="text-gray-500 group-hover:text-user-accent transition-colors" />
                    </Link>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="p-4 grid grid-cols-2 gap-3 relative z-10"
            >
                {/* 1. Main Balance (Full Width) */}
                <motion.div variants={itemVariants} className="col-span-2">
                    <HoloPanel className="p-6 relative overflow-hidden group hover:border-user-accent/50 transition-colors" variant="active">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <Activity className="text-user-accent animate-pulse" size={24} />
                        </div>
                        <h2 className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                            <Trophy size={12} className="text-gold" /> Trésorerie Globale
                        </h2>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-white tracking-tighter font-mono filter drop-shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                                <DigitalDisplay value={user.balance} prefix="$" size="inherit" color="white" />
                            </span>
                        </div>
                        <div className="mt-4 w-full bg-slate-950/50 h-1.5 rounded-full overflow-hidden flex">
                            <div className="h-full bg-user-accent shadow-[0_0_10px_rgb(var(--primary))] w-3/4" />
                        </div>
                        <div className="flex justify-between mt-1 text-[9px] font-mono text-gray-500 uppercase">
                            <span>Flux journalier</span>
                            <span className="text-user-accent">+12.5%</span>
                        </div>
                    </HoloPanel>
                </motion.div>

                {/* 2. Quick Actions (Buttons) */}
                <motion.div variants={itemVariants} className="col-span-2 grid grid-cols-3 gap-3">
                    <Link to="/workout" className="col-span-2 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-user-accent to-user-accent/80 p-1 shadow-lg shadow-user-accent/20">
                        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-white" />
                        <div className="h-full bg-slate-900/10 backdrop-blur-sm rounded-xl p-5 flex flex-col justify-between relative overflow-hidden border border-white/10 group-hover:bg-transparent transition-colors">
                            <div className="absolute right-0 top-0 p-3 opacity-20 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
                                <Factory size={48} className="text-slate-900" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-1">Production</h3>
                                <p className="text-[10px] text-slate-800/80 font-bold uppercase leading-tight">Lancer une session</p>
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-slate-900 font-black text-xs uppercase bg-white/20 w-fit px-2 py-1 rounded backdrop-blur-md">
                                Go <ArrowRight size={12} />
                            </div>
                        </div>
                    </Link>

                    <Link to="/stocks" className="col-span-1 group relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 hover:border-gold transition-all">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950" />
                        <div className="relative z-10 p-4 h-full flex flex-col justify-center items-center text-center">
                            <Activity size={24} className="text-gray-500 group-hover:text-gold mb-2 transition-colors" />
                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider group-hover:text-white">Bourse</span>
                        </div>
                    </Link>
                </motion.div>

                {/* 3. Performance Chart (Full Width) */}
                <motion.div variants={itemVariants} className="col-span-2">
                    <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 backdrop-blur-sm relative">
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-user-accent/10 rounded border border-user-accent/20">
                                    <BarChart3 size={14} className="text-user-accent" />
                                </div>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Analyse Rendement</span>
                            </div>
                            <select className="bg-transparent text-[10px] font-bold text-gray-500 outline-none uppercase cursor-pointer hover:text-white">
                                <option>30 Derniers Jours</option>
                            </select>
                        </div>

                        <div className="h-40 w-full">
                            {history && history.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={history}>
                                        <defs>
                                            <linearGradient id="gradientColor" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.4} />
                                                <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgb(var(--primary))', borderRadius: '8px' }}
                                            itemStyle={{ color: 'rgb(var(--primary))', fontFamily: 'monospace', fontSize: '12px' }}
                                            labelStyle={{ color: '#64748b', fontSize: '10px' }}
                                            cursor={{ stroke: 'rgb(var(--primary))', strokeWidth: 1, strokeDasharray: '5 5' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="val"
                                            stroke="rgb(var(--primary))"
                                            strokeWidth={2}
                                            fill="url(#gradientColor)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl bg-white/5">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold">En attente de données...</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* 4. Secondary Actions Grid */}
                <motion.div variants={itemVariants} className="col-span-1">
                    <Link to="/blueprints" className="block h-full bg-slate-900 border border-white/10 rounded-2xl p-4 hover:bg-slate-800 hover:border-user-accent/50 transition-all group">
                        <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center mb-3 group-hover:bg-user-accent/20 transition-colors">
                            <Factory size={16} className="text-blue-400 group-hover:text-user-accent transition-colors" />
                        </div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1">Plans</h3>
                        <p className="text-[9px] text-gray-500 uppercase">Gérer les protocoles</p>
                    </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="col-span-1">
                    <Link to="/market" className="block h-full bg-slate-900 border border-white/10 rounded-2xl p-4 hover:bg-slate-800 hover:border-gold/50 transition-all group">
                        <div className="w-8 h-8 rounded bg-gold/10 flex items-center justify-center mb-3 group-hover:bg-gold/20 transition-colors">
                            <ShoppingCart size={16} className="text-gold" />
                        </div>
                        <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1">Marché</h3>
                        <p className="text-[9px] text-gray-500 uppercase">Acheter Équipement</p>
                    </Link>
                </motion.div>

                {/* 5. Stats Footer */}
                <motion.div variants={itemVariants} className="col-span-2 mt-2">
                    <div className="flex justify-between items-center px-2 py-3 bg-black/20 rounded-xl border border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">Total Sessions</span>
                            <span className="text-lg font-black text-white font-mono leading-none">{history ? history.length : 0}</span>
                        </div>
                        <div className="h-8 w-px bg-white/10" />
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">Revenus Cumulés</span>
                            <span className="text-lg font-black text-gold font-mono leading-none">${(user.totalEarned / 1000).toFixed(1)}k</span>
                        </div>
                    </div>
                </motion.div>

            </motion.div>

            {/* Inactivity Modal */}
            {showInactivityModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-slate-950 border-2 border-red-500 p-8 max-w-sm w-full relative overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.4)]"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(239,68,68,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-scan" />
                        <div className="relative z-10 text-center">
                            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30 animate-pulse">
                                <AlertTriangle className="text-red-500" size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter italic">Pénalité Appliquée</h2>
                            <p className="text-red-400 mb-8 font-mono text-xs font-bold uppercase tracking-wide leading-relaxed">
                                Détection d'inactivité prolongée.<br />
                                Protocole de liquidation activé.
                            </p>
                            <div className="bg-black/50 p-6 mb-8 border border-red-500/20 rounded-xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
                                <span className="relative text-4xl font-mono text-red-500 font-bold tracking-tighter">-{inactivityPenalty} WOL</span>
                            </div>
                            <GameButton
                                onClick={() => setShowInactivityModal(false)}
                                variant="danger"
                                className="w-full"
                            >
                                Accepter la Sanction
                            </GameButton>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
