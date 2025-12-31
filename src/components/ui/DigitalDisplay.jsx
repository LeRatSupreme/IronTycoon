import clsx from 'clsx';
import CountUp from 'react-countup';

const DigitalDisplay = ({ value, label, size = 'md', color = 'green', prefix = '', suffix = '' }) => {

    const colors = {
        green: "text-neon-green shadow-neon-green",
        gold: "text-gold-light shadow-gold-light",
        red: "text-laser-red shadow-laser-red",
        white: "text-white",
        'user-accent': "text-user-accent"
    };

    const textSizes = {
        sm: "text-xl",
        md: "text-3xl",
        lg: "text-5xl",
        xl: "text-7xl"
    };

    return (
        <div className="flex flex-col items-center justify-center">
            {label && <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-1">{label}</span>}
            <div className={clsx("font-mono font-bold leading-none tracking-tighter text-lcd", colors[color], textSizes[size])}>
                <CountUp end={value} duration={1} prefix={prefix} suffix={suffix} preserveValue />
            </div>
        </div>
    );
};

export default DigitalDisplay;
