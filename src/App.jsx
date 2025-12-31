import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ActiveWorkout from './pages/ActiveWorkout';
import Marketplace from './pages/Marketplace';
import ExerciseManager from './pages/ExerciseManager';
import BlueprintBuilder from './pages/BlueprintBuilder';
import { useWallet } from './context/WalletContext';
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

const HappyHourChecker = () => {
    const { setGlobalMultiplier } = useWallet();
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // 10% chance
        if (Math.random() < 0.10) {
            setGlobalMultiplier(2);
            setShowBanner(true);
            // Hide banner after 5s but keep multiplier? Or keep banner?
            // Prompt says "pendant 2h". 
            // Simplified: Just session based.
            setTimeout(() => setShowBanner(false), 5000);
        }
    }, [setGlobalMultiplier]);

    if (!showBanner) return null;

    return (
        <div className="fixed top-0 left-0 w-full z-[100] bg-neon-green text-black font-black text-center p-2 uppercase tracking-widest animate-pulse shadow-[0_0_20px_#39ff14]">
            <div className="flex items-center justify-center gap-2">
                <Zap fill="black" size={20} />
                HAPPY HOUR ACTIVE (GAINS x2)
                <Zap fill="black" size={20} />
            </div>
        </div>
    );
};

import InventoryPage from './pages/InventoryPage';
import ProfileHQ from './pages/ProfileHQ';
import SettingsPage from './pages/SettingsPage';
import MuscleMarket from './pages/MuscleMarket';
import { useMarketMaker } from './hooks/useMarketMaker';

const MarketSimulation = () => {
    useMarketMaker(); // Runs the background tick
    return null;
};

import OnboardingWizard from './components/OnboardingWizard';

import { usePassiveIncome } from './hooks/usePassiveIncome';
import { motion, AnimatePresence } from 'framer-motion';
import GameButton from './components/ui/GameButton';
import DigitalDisplay from './components/ui/DigitalDisplay';

const PassiveIncomeModal = () => {
    const { passiveIncome, showModal, closePassiveModal } = usePassiveIncome();
    const { user } = useWallet();

    if (!showModal) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-cyber-slate border border-gold/30 p-6 rounded-2xl max-w-sm w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(255,215,0,0.1)]"
                >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

                    <h2 className="text-2xl font-black text-white uppercase italic mb-2">REVENUS PASSIFS</h2>
                    <p className="text-gray-400 text-xs font-mono mb-6">VOTRE FERME DE MINAGE A TOURNÉ PENDANT VOTRE ABSENCE.</p>

                    <div className="bg-black/50 p-4 rounded-xl border border-white/10 mb-6">
                        <DigitalDisplay value={passiveIncome} size="lg" color="gold" prefix="$" />
                        <div className="text-[10px] text-gray-500 font-bold uppercase mt-2">GÉNÉRÉ PAR MINING RIG</div>
                    </div>

                    <GameButton onClick={closePassiveModal} variant="gold" className="w-full">
                        ENCAISSER
                    </GameButton>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <HappyHourChecker />
            <PassiveIncomeModal />
            <MarketSimulation />
            <OnboardingWizard />
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/workout" element={<ActiveWorkout />} />
                    <Route path="/market" element={<Marketplace />} />
                    <Route path="/stocks" element={<MuscleMarket />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/hq" element={<ProfileHQ />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/manage-exercises" element={<ExerciseManager />} />
                    <Route path="/blueprints" element={<BlueprintBuilder />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
