
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { TrendingUp, TrendingDown, Dumbbell, Anchor, Footprints, HeartPulse } from 'lucide-react';
import HoloPanel from './ui/HoloPanel';

const StockCard = ({ stock, onClick, isPumped }) => {
    const { ticker, currentPrice, history } = stock;

    // Determine Trend
    const lastPrice = history && history.length > 1 ? history[history.length - 2].price : currentPrice;
    const isUp = currentPrice >= lastPrice;
    const percentChange = ((currentPrice - lastPrice) / lastPrice) * 100;

    // Icons Mapping
    const getIcon = () => {
        switch (ticker) {
            case '$PUSH': return <Dumbbell size={120} strokeWidth={1} />;
            case '$PULL': return <Anchor size={120} strokeWidth={1} />;
            case '$LEGS': return <Footprints size={120} strokeWidth={1} />;
            case '$CRDO': return <HeartPulse size={120} strokeWidth={1} />;
            default: return <Dumbbell size={120} />;
        }
    };

    return (
        <HoloPanel
            onClick={() => onClick(stock)}
            className={clsx(
                "relative overflow-hidden p-6 h-64 flex flex-col justify-between cursor-pointer group transition-all",
                isPumped && "ring-2 ring-gold shadow-[0_0_30px_rgba(255,215,0,0.3)]"
            )}
            variant={isUp ? "active" : "danger"}
        >
            {/* Background Icon */}
            <div className={clsx(
                "absolute -right-6 -bottom-6 opacity-5 transform rotate-12 transition-all duration-500 group-hover:scale-110 group-hover:opacity-10 pointer-events-none",
                isUp ? "text-user-accent" : "text-laser-red"
            )}>
                {getIcon()}
            </div>

            {/* Header */}
            <div className="relative z-10 mb-4">
                <h2 className="text-3xl font-black italic text-white tracking-tighter drop-shadow-md group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                    {ticker}
                </h2>

                {/* Trend Badge - Below Title */}
                <div className={clsx(
                    "inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black uppercase border mt-2",
                    isUp ? "bg-neon-green/10 text-neon-green border-neon-green/20" : "bg-laser-red/10 text-laser-red border-laser-red/20"
                )}>
                    {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {Math.abs(percentChange).toFixed(1)}%
                </div>
            </div>

            {/* Price section */}
            <div className="z-10 relative mt-auto">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Cote Actuelle</div>
                <div className="text-4xl font-black text-white tracking-tighter flex items-baseline gap-2">
                    {currentPrice.toFixed(2)} <span className="text-sm text-gray-400 font-bold">$WOL</span>
                </div>
            </div>

            {/* Active Indicator Line */}
            <div className={clsx(
                "absolute bottom-0 left-0 h-1 transition-all duration-300",
                isUp ? "bg-neon-green" : "bg-laser-red"
            )} style={{ width: '100%' }} />

        </HoloPanel>
    );
};

export default StockCard;
