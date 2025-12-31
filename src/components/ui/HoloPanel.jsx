import clsx from 'clsx';
import { motion } from 'framer-motion';

const HoloPanel = ({ children, className, variant = 'default', ...props }) => {
    const variants = {
        default: "border-white/10 shadow-panel",
        active: "border-user-accent/50 shadow-glow-accent bg-user-accent/5",
        danger: "border-laser-red/50 shadow-glow-red bg-laser-red/5",
        gold: "border-gold-light/50 shadow-glow-gold bg-gold-light/5",
    };

    return (
        <motion.div
            layout
            className={clsx(
                "relative backdrop-blur-md bg-cyber-slate/80 border-2 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(var(--primary-glow),0.05)] transition-colors duration-500",
                variants[variant],
                className
            )}
            {...props}
        >
            {/* Decorative Corner accents (Sci-fi) */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-inherit opacity-50 rounded-tl mt-1 ml-1" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-inherit opacity-50 rounded-tr mt-1 mr-1" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-inherit opacity-50 rounded-bl mb-1 ml-1" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-inherit opacity-50 rounded-br mb-1 mr-1" />

            {children}
        </motion.div>
    );
};

export default HoloPanel;
