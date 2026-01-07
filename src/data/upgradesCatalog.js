import { Fan, Dumbbell, Server, Music } from 'lucide-react';

export const INFRASTRUCTURES = [
    {
        id: 'VENT_SYSTEM',
        name: 'Ventilation High-Tech',
        price: 15000,
        description: 'Réduit les temps de repos de 10%.',
        icon: Fan,
        effectType: 'REST_REDUCTION',
        value: 0.90
    },
    {
        id: 'GOLD_WEIGHTS',
        name: 'Haltères en Or',
        price: 30000,
        description: 'Multiplicateur de gains x1.1 sur tout.',
        icon: Dumbbell,
        effectType: 'GLOBAL_MULTIPLIER',
        value: 1.10
    },
    {
        id: 'MINING_RIG',
        name: 'Serveur de Minage Crypto',
        price: 50000,
        description: 'Génère 100 $WOL/h (Max 24h sans connexion).',
        icon: Server,
        effectType: 'PASSIVE_INCOME',
        value: 100
    },
    {
        id: 'JUKEBOX_PRO',
        name: 'Juke-box Motivation',
        price: 5000,
        description: 'Débloque des sons SFX "Elite" exclusifs.',
        icon: Music,
        effectType: 'AUDIO_UNLOCK',
        value: true
    }
];
