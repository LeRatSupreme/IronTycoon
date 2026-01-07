import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Volume2, Shield, Info, Monitor, Upload, Download, Plane, Scale } from 'lucide-react';
import HoloPanel from '../components/ui/HoloPanel';
import GameButton from '../components/ui/GameButton';
import { useWallet } from '../context/WalletContext';
import { useRef } from 'react';

const ToggleSwitch = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
        <span className="text-sm font-bold text-gray-300 uppercase">{label}</span>
        <div
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 border ${checked ? 'bg-emerald-500/20 border-emerald-500' : 'bg-slate-800 border-slate-600'}`}
        >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all duration-300 ${checked ? 'left-[calc(100%-1.25rem)] bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'left-1 bg-gray-500'}`} />
        </div>
    </div>
);

const SettingsPage = () => {
    const navigate = useNavigate();
    const { user, resetData, exportData, importData, updateSettings, toggleHolidayMode, updateTheme } = useWallet();
    const fileInputRef = useRef(null);

    const handleImportClick = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) importData(file);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { x: -20, opacity: 0 },
        visible: { x: 0, opacity: 1 }
    };

    return (
        <div className="min-h-screen pb-24 relative overflow-hidden bg-slate-950 text-user-accent font-mono selection:bg-user-accent/30">
            {/* Background Tech Layer */}
            <div className="absolute inset-0 bg-[linear-gradient(rgb(var(--primary)/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(var(--primary)/0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

            <div className="relative z-10 p-4">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">Configuration Système</h1>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* Section 1: Audio & Haptique */}
                    <motion.div variants={itemVariants}>
                        <HoloPanel className="p-6" variant="default">
                            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="text-user-accent">[</span>
                                <Volume2 size={12} /> SYSTEM_AUDIO
                                <span className="text-user-accent">]</span>
                            </h2>
                            <div className="space-y-4">
                                <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                    <div className="flex justify-between mb-3">
                                        <span className="text-sm font-bold text-gray-300 uppercase">Interface Link</span>
                                    </div>
                                    <div className="flex gap-2 justify-between">
                                        {[
                                            { id: 'default', color: 'bg-emerald-400', label: 'ECO' },
                                            { id: 'cyber', color: 'bg-fuchsia-500', label: 'NEO' },
                                            { id: 'gold', color: 'bg-amber-400', label: 'LUX' },
                                            { id: 'red', color: 'bg-rose-600', label: 'SITH' },
                                            { id: 'blue', color: 'bg-sky-400', label: 'ICE' },
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => updateTheme(t.id)}
                                                className={`flex-1 h-12 rounded-lg flex flex-col items-center justify-center gap-1 transition-all border-2 ${user?.theme === t.id || (!user?.theme && t.id === 'default') ? 'border-white scale-105 shadow-glow-accent' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                            >
                                                <div className={`w-3 h-3 rounded-full ${t.color}`} />
                                                <span className="text-[8px] font-bold uppercase">{t.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <ToggleSwitch
                                    label="Retour Haptique"
                                    checked={user?.settings?.hapticsEnabled ?? true}
                                    onChange={(val) => updateSettings({ hapticsEnabled: val })}
                                />
                            </div>
                        </HoloPanel>
                    </motion.div>

                    {/* Section 2: Calibration */}
                    <motion.div variants={itemVariants}>
                        <HoloPanel className="p-6" variant="active">
                            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="text-user-accent">[</span>
                                <Scale size={12} /> CALIBRATION
                                <span className="text-user-accent">]</span>
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                    <span className="text-sm font-bold text-gray-300 uppercase">Unité de Poids</span>
                                    <div className="flex bg-slate-800 rounded-lg p-1 border border-white/10">
                                        <button
                                            onClick={() => updateSettings({ unitSystem: 'kg' })}
                                            className={`px-3 py-1 text-xs font-bold rounded ${(!user?.settings?.unitSystem || user?.settings?.unitSystem === 'kg') ? 'bg-user-accent text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                        >KG</button>
                                        <button
                                            onClick={() => updateSettings({ unitSystem: 'lbs' })}
                                            className={`px-3 py-1 text-xs font-bold rounded ${user?.settings?.unitSystem === 'lbs' ? 'bg-user-accent text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                                        >LBS</button>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-900/80 rounded-xl border border-blue-500/30 relative overflow-hidden">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-bold text-blue-200 uppercase flex items-center gap-2">
                                            <Plane size={16} /> Mode Vacances
                                        </span>
                                        <ToggleSwitch
                                            label=""
                                            checked={user?.settings?.holidayMode ?? false}
                                            onChange={toggleHolidayMode}
                                        />
                                    </div>
                                    <p className="text-[10px] text-blue-400 font-mono leading-tight">
                                        Empêche la taxation d'inactivité (-10%). <br />
                                        <span className="text-white font-bold">COÛT ACTIVATION: 500 $WOL</span>
                                    </p>
                                </div>
                            </div>
                        </HoloPanel>
                    </motion.div>

                    {/* Section 3: Data Protocol */}
                    <motion.div variants={itemVariants}>
                        <HoloPanel className="p-6" variant="default">
                            <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 border-b border-white/5 pb-2">
                                <span className="text-user-accent">[</span>
                                <Save size={12} /> DATA_PROTOCOL
                                <span className="text-user-accent">]</span>
                            </h2>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <GameButton variant="default" onClick={exportData} className="flex flex-col items-center justify-center py-4 gap-2 text-xs">
                                    <Download size={20} className="text-user-accent" />
                                    BACKUP .JSON
                                </GameButton>
                                <GameButton variant="default" onClick={handleImportClick} className="flex flex-col items-center justify-center py-4 gap-2 text-xs">
                                    <Upload size={20} className="text-blue-400" />
                                    RESTAURER
                                </GameButton>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                            </div>

                            <div className="border-t border-red-900/50 pt-4 mt-4">
                                <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-xl flex items-center justify-between group">
                                    <div>
                                        <h3 className="text-red-500 font-black text-xs uppercase flex items-center gap-2">
                                            <Shield size={12} /> Factory Reset
                                        </h3>
                                        <p className="text-[9px] text-red-400/70 font-mono mt-1">EFFACEMENT TOTAL IRRÉVERSIBLE</p>
                                    </div>
                                    <button
                                        onClick={resetData}
                                        className="w-8 h-8 rounded bg-red-500/10 border border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-black transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </HoloPanel>
                    </motion.div>

                    {/* Footer Info */}
                    <motion.div variants={itemVariants} className="pt-8 text-center opacity-30">
                        <div className="text-[10px] text-gray-500 font-mono font-bold">
                            FIRMWARE: IRON_CORE v1.0.0
                        </div>
                        <div className="text-[9px] text-gray-700 mt-1 uppercase tracking-widest">
                            Built by RatusDev
                        </div>
                    </motion.div>

                </motion.div>
            </div>
        </div>
    );
};

export default SettingsPage;
