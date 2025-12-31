import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, ShoppingBag, Radio, Shield, Archive, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'QG' },
        { path: '/workout', icon: Dumbbell, label: 'USINE' },
        { path: '/stocks', icon: TrendingUp, label: 'BOURSE' },
        { path: '/market', icon: ShoppingBag, label: 'MARCHÉ' },
        { path: '/inventory', icon: Archive, label: 'COFFRE' },
    ];

    return (
        <div className="min-h-screen bg-cyber-black text-white font-sans overflow-x-hidden selection:bg-user-accent selection:text-black">

            {/* Optional: Top Bar for Brand */}
            {/* Optional: Top Bar for Brand */}
            <div className="fixed top-0 left-0 w-full z-30 p-4 flex justify-between items-start opacity-50 mix-blend-screen pointer-events-none">
                <h1 className="text-[10px] font-bold tracking-[0.5em] text-user-accent uppercase writing-vertical-rl">IRON TYCOON v0.5</h1>
            </div>

            <main className="p-4 max-w-md mx-auto min-h-screen pb-32">
                {children}
            </main>

            {/* Floating Modern Nav */}
            <nav className="fixed bottom-6 left-0 w-full z-50 px-4">
                <div className="max-w-md mx-auto bg-cyber-slate/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 flex justify-between items-center relative overflow-hidden">
                    {/* Neon Glow Line at bottom */}
                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-user-accent to-transparent opacity-50" />

                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex-1 flex flex-col items-center justify-center py-2"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-white/5 rounded-xl"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}

                                <div className={clsx("relative z-10 transition-colors duration-300", isActive ? "text-user-accent drop-shadow-[0_0_8px_rgba(var(--primary-glow),0.8)]" : "text-gray-500 hover:text-gray-300")}>
                                    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                                </div>
                                {isActive && (
                                    <motion.span
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-[8px] font-bold uppercase tracking-widest mt-1 text-white"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default Layout;
