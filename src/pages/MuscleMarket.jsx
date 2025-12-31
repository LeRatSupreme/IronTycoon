import { useState, useMemo } from 'react';
import { useMarketMaker } from '../hooks/useMarketMaker';
import { useWallet } from '../context/WalletContext';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { X, TrendingUp, TrendingDown, Wallet, BarChart3, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import StockCard from '../components/StockCard';
import { differenceInHours } from 'date-fns';
import GameButton from '../components/ui/GameButton';
import DigitalDisplay from '../components/ui/DigitalDisplay';

const MuscleMarket = () => {
    const { stocks, buyStock, sellStock } = useMarketMaker();
    const { user } = useWallet();
    const [selectedStock, setSelectedStock] = useState(null); // Stock object
    const [sliderValue, setSliderValue] = useState(0); // 0-100 percentage
    const [processMsg, setProcessMsg] = useState('');

    // Sounds
    const [playKaching] = useSound('/sounds/cash.mp3', { volume: 0.5 });
    const [playSelect] = useSound('/sounds/click.mp3', { volume: 0.2 });
    const [playError] = useSound('/sounds/ui_error.mp3', { volume: 0.5 });

    // Portfolio Valuation
    const portfolioValue = useMemo(() => {
        if (!stocks) return 0;
        return stocks.reduce((acc, s) => acc + (s.ownedShares || 0) * s.currentPrice, 0);
    }, [stocks]);

    if (!stocks || stocks.length === 0) return <div className="min-h-screen bg-black flex items-center justify-center text-neon-green font-mono animate-pulse">CONNEXION AU MARCHÉ...</div>;

    // --- MODAL LOGIC ---
    const handleCloseModal = () => {
        setSelectedStock(null);
        setSliderValue(0);
        setProcessMsg('');
    };

    const handleSelectStock = (stock) => {
        playSelect();
        setSelectedStock(stock);
        setSliderValue(0);
    };

    // Calculate Trade Values
    const maxBuyCost = user.balance;
    const maxSellShares = selectedStock ? (selectedStock.ownedShares || 0) : 0;

    const sliderPercentage = sliderValue / 100;

    const buyCost = Math.floor(maxBuyCost * sliderPercentage);
    const buyShares = selectedStock ? Math.floor(buyCost / selectedStock.currentPrice) : 0;

    const sellShares = Math.floor(maxSellShares * sliderPercentage);
    const sellEarnings = selectedStock ? (sellShares * selectedStock.currentPrice) : 0;

    const handleAction = async (action) => {
        if (sliderValue === 0) return;

        let success = false;
        if (action === 'BUY') {
            if (buyShares <= 0) { playError(); return; }
            success = await buyStock(selectedStock.ticker, buyCost, user.balance);
        } else {
            if (sellShares <= 0) { playError(); return; }
            success = await sellStock(selectedStock.ticker, sellShares);
        }

        if (success) {
            playKaching();
            setProcessMsg(action === 'BUY' ? 'ORDRE ACHAT EXÉCUTÉ' : 'VENTE TERMINÉE');
            setTimeout(handleCloseModal, 1000);
        } else {
            playError();
            setProcessMsg('ERREUR FONDS INSUFFISANTS');
        }
    };

    // Chart Data for Sparkline
    const getChartData = (stock) => {
        if (!stock?.history) return [];
        return stock.history.map(h => ({ price: h.price }));
    };

    // Animation Variants
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-32 min-h-screen bg-slate-950 relative overflow-hidden text-white font-mono"
        >
            {/* Background Tech Layer */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,100,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.03)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

            {/* Header */}
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-slate-900/90 backdrop-blur z-20 p-4 border-b border-white/10 shadow-lg">
                <div>
                    <div className="text-[10px] text-neon-green font-black uppercase tracking-widest flex items-center gap-2 mb-1">
                        <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse"></span>
                        LIVE MARKET DATA
                    </div>
                    <h1 className="text-2xl font-black italic uppercase text-white tracking-tighter">
                        MUSCLE MARKET
                    </h1>
                </div>
                <div className="bg-black/40 px-4 py-2 rounded-xl border border-white/10 shadow-inner">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider text-right">PORTEFEUILLE</div>
                    <DigitalDisplay value={portfolioValue} size="md" color="gold" prefix="$" />
                </div>
            </div>

            {/* Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-4 px-4 max-w-2xl mx-auto pb-4"
            >
                {stocks.map(stock => {
                    // Check if pumped recently (last workout within 1h)
                    const isPumped = differenceInHours(new Date(), new Date(stock.lastWorkoutDate)) < 1;

                    return (
                        <motion.div key={stock.ticker} variants={itemVariants}>
                            <StockCard
                                stock={stock}
                                onClick={handleSelectStock}
                                isPumped={isPumped}
                            />
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Trading Modal */}
            <AnimatePresence>
                {selectedStock && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="bg-slate-900 border border-white/20 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl relative"
                        >
                            {/* Close Button */}
                            <button onClick={handleCloseModal} className="absolute top-4 right-4 bg-white/5 hover:bg-white/10 p-2 rounded-full text-white z-20 transition-colors">
                                <X size={24} />
                            </button>

                            {/* Modal Header */}
                            <div className="p-6 text-center border-b border-white/10 bg-black/40 relative overflow-hidden">
                                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                                <h2 className="text-5xl font-black italic text-white mb-2 tracking-tighter shadow-black drop-shadow-lg">{selectedStock.ticker}</h2>
                                <div className="text-3xl font-bold text-neon-green tracking-tight font-mono">${selectedStock.currentPrice.toFixed(2)}</div>
                                <div className="text-[10px] bg-white/5 inline-block px-3 py-1 rounded-full mt-2 uppercase font-mono tracking-widest text-gray-400 border border-white/5">
                                    POSSESSION: <span className="text-white font-bold">{selectedStock.ownedShares || 0}</span>
                                </div>
                            </div>

                            {/* Sparkline */}
                            <div className="h-40 bg-slate-950 relative w-full border-b border-white/10">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={getChartData(selectedStock)}>
                                        <defs>
                                            <linearGradient id="modalGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#39ff14" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#39ff14" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis hide />
                                        <YAxis hide domain={['auto', 'auto']} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                                            labelStyle={{ display: 'none' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="price"
                                            stroke="#39ff14"
                                            strokeWidth={3}
                                            fill="url(#modalGradient)"
                                            isAnimationActive={true}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Controls */}
                            <div className="p-6 space-y-6 bg-slate-900">
                                {processMsg ? (
                                    <div className="text-center py-10">
                                        <motion.div
                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className="inline-block p-4 rounded-full bg-neon-green/20 text-neon-green mb-4 border border-neon-green/50"
                                        >
                                            <TrendingUp size={48} />
                                        </motion.div>
                                        <div className="font-black text-xl text-white uppercase tracking-widest">{processMsg}</div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Slider */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                                                <span>Volume Transaction</span>
                                                <span className="text-white">{sliderValue}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0"
                                                max="100"
                                                value={sliderValue}
                                                onChange={(e) => setSliderValue(Number(e.target.value))}
                                                className="w-full accent-neon-green h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer hover:bg-slate-700 transition-colors"
                                            />
                                        </div>

                                        {/* Dynamic Values Display */}
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                            <div className="bg-slate-950 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-neon-green opacity-50" />
                                                <div className="text-[10px] text-green-500 font-bold uppercase tracking-wider mb-1">Potentiel Achat</div>
                                                <div className="text-2xl font-black text-white font-mono">${buyCost}</div>
                                                <div className="text-[10px] text-gray-500 mt-1">+{buyShares} Actions</div>
                                            </div>
                                            <div className="bg-slate-950 p-4 rounded-xl border border-white/5 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-red-500 opacity-50" />
                                                <div className="text-[10px] text-red-500 font-bold uppercase tracking-wider mb-1">Potentiel Vente</div>
                                                <div className="text-2xl font-black text-white font-mono">${(sellEarnings).toFixed(0)}</div>
                                                <div className="text-[10px] text-gray-500 mt-1">-{sellShares} Actions</div>
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <GameButton
                                                onClick={() => handleAction('BUY')}
                                                disabled={buyShares <= 0}
                                                variant="success"
                                                size="lg"
                                                className="w-full shadow-glow-green"
                                            >
                                                ACHETER
                                            </GameButton>
                                            <GameButton
                                                onClick={() => handleAction('SELL')}
                                                disabled={sellShares <= 0}
                                                variant="danger"
                                                size="lg"
                                                className="w-full shadow-glow-red"
                                            >
                                                VENDRE
                                            </GameButton>
                                        </div>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default MuscleMarket;
