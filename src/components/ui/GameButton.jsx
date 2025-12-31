import clsx from 'clsx';
import { motion } from 'framer-motion';

const GameButton = ({ children, onClick, variant = 'primary', className, disabled, size = 'md', ...props }) => {

    const variants = {
        primary: "bg-gradient-to-b from-user-accent to-black/80 border-b-4 border-user-accent/50 text-black shadow-glow-accent",
        secondary: "bg-slate-700 border-b-4 border-slate-900 text-gray-300 hover:bg-slate-600",
        danger: "bg-gradient-to-b from-rose-500 to-rose-700 border-b-4 border-rose-900 text-white shadow-glow-red",
        gold: "bg-gradient-to-b from-gold-light to-gold-dark border-b-4 border-yellow-900 text-black shadow-glow-gold",
        ghost: "bg-transparent border-none text-gray-400 hover:text-white"
    };

    const sizes = {
        sm: "py-2 px-3 text-xs",
        md: "py-3 px-6 text-sm",
        lg: "py-4 px-8 text-lg uppercase tracking-widest",
        xl: "py-6 px-8 text-2xl uppercase tracking-widest font-black"
    };

    if (disabled) {
        return (
            <button
                disabled
                className={clsx("opacity-50 cursor-not-allowed bg-slate-800 border-b-4 border-slate-900 text-gray-500 rounded-xl font-bold font-mono", sizes[size], className)}
                {...props}
            >
                {children}
            </button>
        )
    }

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95, y: 2 }}
            onClick={onClick}
            className={clsx(
                "rounded-xl font-bold font-mono transition-all relative overflow-hidden",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
        </motion.button>
    );
};

export default GameButton;
