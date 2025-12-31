import { useState } from 'react';
import { useProfileStats } from '../hooks/useProfileStats';
import { useWallet } from '../context/WalletContext';
import { Link, useNavigate } from 'react-router-dom';
import HoloPanel from '../components/ui/HoloPanel';
import DigitalDisplay from '../components/ui/DigitalDisplay';
import { Edit2, Save, Wallet, Dumbbell, ShoppingCart, ArrowLeft, Factory, History, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { ITEMS_CATALOG } from '../data/itemsCatalog';
import { db } from '../db';


const ProfileHQ = () => {
    const { stats, avatarUri, user } = useProfileStats();
    const navigate = useNavigate();
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState("");
    const { updateTheme } = useWallet(); // updateTheme might not be needed if removed from UI, keeping for safety if reused



    if (!user || !stats) return <div className="p-10 text-center text-user-accent font-mono animate-pulse">CONNECTING TO HQ...</div>;

    const handleEditName = () => {
        setTempName(user.name);
        setIsEditingName(true);
    };

    const saveName = async () => {
        if (tempName.trim()) {
            // We need db access here. 
            // Since I cannot easily change imports in the middle of a file write, I will assume db is imported at top.
            // Wait, I will include the import in the full file content.
        }
        setIsEditingName(false);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden bg-slate-950 text-user-accent font-mono selection:bg-user-accent/30">
            {/* Background Tech Layer */}
            <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

            <div className="relative z-10 p-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/')} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">QG Opérateur</h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Dossier Personnel #88-X</p>
                    </div>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 gap-4"
                >
                    {/* 1. Identity Card (Full Width) */}
                    <motion.div variants={itemVariants} className="col-span-2">
                        <HoloPanel className="p-4 sm:p-6 relative overflow-hidden group" variant="active">
                            <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-user-accent/10 to-transparent pointer-events-none" />

                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative z-10 w-full">
                                {/* Avatar Section */}
                                <div className="relative shrink-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-user-accent/50 overflow-hidden bg-slate-900 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                                        <img src={avatarUri} alt="Avatar" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-user-accent text-user-accent text-[10px] font-bold px-2 py-0.5 rounded uppercase shadow-lg">
                                        LVL {Math.floor(user.totalEarned / 5000) + 1}
                                    </div>
                                </div>

                                {/* Details Section */}
                                <div className="flex-1 w-full min-w-0">
                                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left gap-2 mb-4">
                                        <div className="min-w-0 w-full">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Matricule</p>
                                            {isEditingName ? (
                                                <div className="flex justify-center sm:justify-start gap-2 w-full">
                                                    <input
                                                        value={tempName}
                                                        onChange={(e) => setTempName(e.target.value)}
                                                        className="bg-slate-900 border border-user-accent text-white px-2 py-1 rounded text-lg font-bold uppercase w-full outline-none min-w-0"
                                                        autoFocus
                                                    />
                                                    <button onClick={() => {
                                                        if (tempName.trim()) {
                                                            db.user.update(user.id, { name: tempName });
                                                        }
                                                        setIsEditingName(false);
                                                    }} className="p-2 bg-user-accent text-black rounded shrink-0"><Save size={16} /></button>
                                                </div>
                                            ) : (
                                                <h2 onClick={handleEditName} className="text-xl sm:text-2xl font-black text-white italic uppercase tracking-tighter flex justify-center sm:justify-start items-center gap-2 cursor-pointer hover:text-user-accent transition-colors group/edit w-full min-w-0">
                                                    <span className="truncate block">{user.name}</span>
                                                    <Edit2 size={12} className="opacity-0 group-hover/edit:opacity-100 transition-opacity text-gray-500 shrink-0" />
                                                </h2>
                                            )}
                                        </div>
                                        <div className="shrink-0">
                                            <div className="text-[10px] font-bold text-user-accent bg-user-accent/10 px-2 py-1 rounded border border-user-accent/20 inline-block uppercase whitespace-nowrap">
                                                {user.currentRank}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 w-full">
                                        <div className="bg-slate-900/50 p-2 rounded border border-white/5 text-center overflow-hidden">
                                            <div className="text-[9px] text-gray-500 uppercase truncate">XP</div>
                                            <div className="text-xs font-bold text-white truncate">{(user.totalEarned % 5000) / 50}%</div>
                                        </div>
                                        <div className="bg-slate-900/50 p-2 rounded border border-white/5 text-center overflow-hidden">
                                            <div className="text-[9px] text-gray-500 uppercase truncate">Karma</div>
                                            <div className="text-xs font-bold text-emerald-500 truncate">GOOD</div>
                                        </div>
                                        <div className="bg-slate-900/50 p-2 rounded border border-white/5 text-center overflow-hidden">
                                            <div className="text-[9px] text-gray-500 uppercase truncate">Status</div>
                                            <div className="text-xs font-bold text-user-accent animate-pulse truncate">ACTIVE</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </HoloPanel>
                    </motion.div>

                    {/* 2. Stats Grid */}
                    <motion.div variants={itemVariants} className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-gold/50 transition-colors group relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                            <Wallet size={80} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                            <Globe size={12} /> Net Worth
                        </div>
                        <div>
                            <span className="text-2xl font-black text-white font-mono tracking-tighter">
                                <DigitalDisplay value={user.totalEarned} prefix="$" size="inherit" color="gold" />
                            </span>
                            <div className="text-[9px] text-gray-500 mt-1 font-mono">CUMUL CARRIÈRE</div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="bg-slate-900/50 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:border-user-accent/50 transition-colors group relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity rotate-12">
                            <Dumbbell size={80} />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                            <Factory size={12} /> Tonnage
                        </div>
                        <div>
                            <span className="text-2xl font-black text-white font-mono tracking-tighter">
                                {stats.tonnage > 1000 ? (stats.tonnage / 1000).toFixed(1) + 'k' : stats.tonnage}
                            </span>
                            <span className="text-xs font-bold text-user-accent ml-1">KG</span>
                            <div className="text-[9px] text-gray-500 mt-1 font-mono">VOLUME TOTAL</div>
                        </div>
                    </motion.div>

                    {/* 3. Transaction Log */}
                    <motion.div variants={itemVariants} className="col-span-2 mt-4">
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <History size={12} /> Journal Logistique
                            </h3>
                            <span className="text-[9px] font-mono text-gray-600">DERNIERS MOUVEMENTS</span>
                        </div>

                        <div className="space-y-2">
                            {stats.itemsConsumed.length === 0 ? (
                                <div className="text-center p-8 border border-dashed border-white/10 rounded-xl bg-slate-900/30">
                                    <p className="text-[10px] text-gray-500 font-mono uppercase">Aucune donnée transactionnelle</p>
                                </div>
                            ) : (
                                stats.itemsConsumed.slice(0, 5).map(inv => {
                                    const item = ITEMS_CATALOG.find(i => i.id === inv.itemId);
                                    return (
                                        <div key={inv.id} className="bg-slate-900 border border-white/5 hover:border-white/20 p-3 rounded-lg flex justify-between items-center transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-lg grayscale group-hover:grayscale-0 transition-all">
                                                    {item?.icon}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white uppercase group-hover:text-user-accent transition-colors">{item?.name || 'Item Inconnu'}</div>
                                                    <div className="text-[9px] text-gray-600 font-mono">{new Date(inv.acquiredDate).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold font-mono text-red-400 bg-red-400/10 px-2 py-1 rounded">
                                                -${item?.cost}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
};

export default ProfileHQ;
