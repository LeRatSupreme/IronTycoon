
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import useSound from 'use-sound';
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';
import { ChevronRight, Zap, CheckCircle, Terminal } from 'lucide-react';
import Joyride from 'react-joyride';
import Confetti from 'react-confetti';

import { useNavigate } from 'react-router-dom';

const OnboardingWizard = () => {
    const { user, completeOnboarding, addFunds } = useWallet();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Identity, 2: Calibration, 3: Deployment
    const [name, setName] = useState('');
    const [calibrationCount, setCalibrationCount] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showJoyride, setShowJoyride] = useState(false);

    // Sounds (Placeholders - assuming generic sounds exist or fallback)
    const [playType] = useSound('/sounds/type.mp3', { volume: 0.2 });
    const [playCling] = useSound('/sounds/coin.mp3', { volume: 0.5 });
    const [playLevelUp] = useSound('/sounds/levelup.mp3');
    const [playClick] = useSound('/sounds/click.mp3');
    const [playDeploy] = useSound('/sounds/startup.mp3');

    // Avatar Preview
    const avatarUri = name ? createAvatar(bottts, { seed: name, radius: 10, backgroundColor: ['2a2a2a'] }).toDataUri() : null;

    useEffect(() => {
        if (user?.onboardingComplete) return; // Should not render anyway
    }, [user]);

    const handleNameSubmit = (e) => {
        e.preventDefault();
        if (name.length < 3) return;
        playClick();
        setStep(2);
    };

    const handleCalibration = () => {
        if (calibrationCount >= 10) return;

        playCling();
        const newCount = calibrationCount + 1;
        setCalibrationCount(newCount);

        if (newCount === 10) {
            playLevelUp();
            setShowConfetti(true);
            addFunds(100); // Initial Capital
            setTimeout(() => {
                setStep(3);
                playDeploy();
            }, 2000);
        }
    };

    const handleFinish = async () => {
        await completeOnboarding(name); // Flags as complete
        navigate('/'); // Redirect to Dashboard
    };

    // Joyride Steps (for Step 3 overlay)
    const steps = [
        {
            target: 'body',
            content: <div className="text-center font-bold">BIENVENUE, PDG {name && name.toUpperCase()}.<br />INITIALISATION DE L'INTERFACE...</div>,
            placement: 'center',
            disableBeacon: true,
        },
        {
            target: 'a[href="/workout"]', // Assuming standard link
            content: <div className="text-center"><strong>L'USINE</strong><br />Votre source de revenus principale. Transformez l'effort physique en capital numérique ($WOL).</div>,
        },
        {
            target: 'a[href="/market"]',
            content: <div className="text-center"><strong>LE MARCHÉ NOIR</strong><br />Investissez vos gains dans des améliorations, des stimulants et des équipements de contrebande.</div>,
        },
        {
            target: 'a[href="/hq"]', // Or profile link
            content: <div className="text-center"><strong>QUARTIER GÉNÉRAL</strong><br />Gérez votre empire, surveillez vos statistiques et personnalisez votre interface.</div>,
        },
    ];

    const handleStartTour = () => {
        setStep(4); // Use step 4 as "Tour Mode"
        setShowJoyride(true);
    };

    if (!user || user.onboardingComplete) return null;

    // During Step 4 (Tour), we want the overlay to be invisible so we can see the app
    const isTourMode = step === 4;

    return (
        <>
            {/* Main Overlay - Hidden during Tour */}
            <AnimatePresence>
                {!isTourMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-cyber-black/95 backdrop-blur-xl flex items-center justify-center overflow-hidden font-sans text-white/90"
                    >
                        {/* Background Effects */}
                        <div className="absolute inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/80 pointer-events-none" />

                        {/* Animated Scanline */}
                        <div className="absolute inset-0 bg-scanlines opacity-10 pointer-events-none" />

                        <AnimatePresence mode="wait">

                            {/* STEP 1: IDENTITY */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                    className="max-w-md w-full p-8 border border-white/10 bg-black/40 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-md"
                                >
                                    {/* Decorative Borders */}
                                    <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-user-accent/50 rounded-tl-3xl" />
                                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-user-accent/50 rounded-br-3xl" />

                                    <div className="flex justify-center mb-8">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-user-accent/20 to-transparent flex items-center justify-center border border-user-accent/30 shadow-glow-accent animate-pulse">
                                            <Terminal className="text-user-accent w-8 h-8" />
                                        </div>
                                    </div>

                                    <h1 className="text-3xl font-black mb-2 text-center tracking-tighter italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                                        IRON OPERATING SYSTEM
                                    </h1>
                                    <p className="text-sm text-user-accent font-mono mb-8 text-center uppercase tracking-widest opacity-80">
                                        &gt; INITIALISATION DU PROTOCOLE
                                    </p>

                                    <form onSubmit={handleNameSubmit} className="space-y-8 relative z-10">
                                        <div className="relative group">
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">Identifiant Opérateur</label>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => { setName(e.target.value); playType(); }}
                                                className="w-full bg-white/5 border-2 border-white/10 rounded-xl text-center text-2xl py-4 focus:outline-none focus:border-user-accent focus:bg-user-accent/5 transition-all text-white font-bold tracking-wider placeholder:text-gray-700 font-mono"
                                                placeholder="PSEUDO..."
                                                autoFocus
                                            />
                                        </div>

                                        {avatarUri && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="flex justify-center"
                                            >
                                                <div className="relative">
                                                    <div className="absolute inset-0 bg-user-accent blur-xl opacity-20" />
                                                    <img src={avatarUri} className="w-24 h-24 rounded-2xl border-2 border-user-accent/50 shadow-2xl relative z-10 bg-black" alt="Avatar" />
                                                </div>
                                            </motion.div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={name.length < 3}
                                            className="w-full py-4 rounded-xl bg-user-accent text-black font-black text-lg hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-glow-accent disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                                        >
                                            INITIALISER <ChevronRight size={20} className="stroke-[3]" />
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {/* STEP 2: CALIBRATION */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="text-center max-w-lg w-full p-8 relative"
                                >
                                    <h2 className="text-2xl font-black mb-2 text-white italic uppercase tracking-tight">CALIBRAGE SYSTÈME</h2>
                                    <p className="text-gray-400 font-mono text-sm mb-12 border-b border-gray-800 pb-4 inline-block px-8">
                                        GÉNÉREZ DE L'ÉNERGIE CINÉTIQUE ({calibrationCount}/10)
                                    </p>

                                    <div className="relative w-64 h-64 mx-auto mb-12">
                                        {/* Particles Ring */}
                                        <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
                                        <div className="absolute inset-4 rounded-full border border-white/5 animate-[spin_5s_linear_infinite_reverse]" />

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleCalibration}
                                            className="w-full h-full rounded-full bg-gradient-to-br from-gray-900 to-black border-4 border-gray-800 shadow-2xl relative group overflow-hidden flex items-center justify-center z-10 focus:outline-none"
                                        >
                                            {/* Progress Fill */}
                                            <div
                                                className="absolute bottom-0 left-0 w-full bg-user-accent transition-all duration-200 ease-out opacity-20"
                                                style={{ height: `${(calibrationCount / 10) * 100}%` }}
                                            />

                                            <div className="relative z-20 p-6 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
                                                <Zap size={48} className={`text-user-accent transition-all duration-100 ${calibrationCount % 2 === 0 ? 'scale-110 brightness-150' : 'scale-100'}`} fill="currentColor" />
                                            </div>

                                            {/* Shockwave */}
                                            <div className="absolute inset-0 rounded-full border-2 border-user-accent opacity-0 group-active:animate-ping" />
                                        </motion.button>
                                    </div>

                                    {calibrationCount > 0 && (
                                        <motion.div
                                            key={calibrationCount}
                                            initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, y: -40, scale: 1.2 }}
                                            exit={{ opacity: 0 }}
                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
                                        >
                                            <span className="text-3xl font-black text-user-accent drop-shadow-lg italic">+10 $WOL</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 3: DEPLOYMENT */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center space-y-8 max-w-md w-full bg-black/50 backdrop-blur-xl p-10 rounded-3xl border border-white/10"
                                >
                                    <div className="w-24 h-24 mx-auto bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-500 shadow-glow-green">
                                        <CheckCircle size={48} className="text-green-500" />
                                    </div>

                                    <div>
                                        <h2 className="text-4xl font-black text-white italic uppercase mb-2">PRÊT AU DÉPLOIEMENT</h2>
                                        <p className="text-gray-400">Votre empire vous attend, {name}.</p>
                                    </div>

                                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-4">
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">SOLDE INITIAL</span>
                                            <span className="text-2xl font-black text-white">$100.00</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">STATUT</span>
                                            <span className="text-green-400 text-xs font-black bg-green-400/20 px-3 py-1 rounded-full border border-green-400/30">EN LIGNE</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleStartTour}
                                        className="w-full py-4 bg-white text-black font-black rounded-xl hover:scale-105 transition-all shadow-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2"
                                    >
                                        ACCÉDER AU TERMINAL <ChevronRight size={16} strokeWidth={3} />
                                    </button>
                                </motion.div>
                            )}

                        </AnimatePresence>

                        {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Joyride for Tutorial - Renders only when visible */}
            {showJoyride && (
                <Joyride
                    steps={steps}
                    continuous
                    showSkipButton
                    styles={{
                        options: {
                            arrowColor: '#0f172a',
                            backgroundColor: '#0f172a',
                            overlayColor: 'rgba(0, 0, 0, 0.85)',
                            primaryColor: '#34d399', // We might want dynamic color here?
                            textColor: '#fff',
                            width: 380,
                            zIndex: 10000,
                        },
                        tooltipContainer: {
                            textAlign: 'left',
                            borderRadius: '16px',
                            padding: '10px'
                        },
                        buttonNext: {
                            backgroundColor: '#fff',
                            color: '#000',
                            fontWeight: '900',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontFamily: 'inherit',
                            fontSize: '12px',
                            letterSpacing: '1px'
                        },
                        buttonBack: {
                            color: '#9ca3af',
                            marginRight: '10px',
                            fontWeight: 'bold'
                        },
                        buttonSkip: {
                            color: '#ef4444',
                            fontWeight: 'bold'
                        }
                    }}
                    callback={(data) => {
                        if (data.status === 'finished' || data.status === 'skipped') {
                            handleFinish();
                        }
                    }}
                />
            )}
        </>
    );
};

export default OnboardingWizard;
