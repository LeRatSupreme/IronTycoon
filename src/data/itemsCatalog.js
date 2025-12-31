export const ITEM_RARITIES = {
    COMMON: { id: 'common', label: 'Common', color: 'gray', weight: 50, twBorder: 'border-gray-500', twShadow: 'shadow-gray-500/50', twText: 'text-gray-400' },
    UNCOMMON: { id: 'uncommon', label: 'Uncommon', color: 'green', weight: 30, twBorder: 'border-neon-green', twShadow: 'shadow-neon-green/50', twText: 'text-neon-green' },
    RARE: { id: 'rare', label: 'Rare', color: 'blue', weight: 15, twBorder: 'border-blue-500', twShadow: 'shadow-blue-500/50', twText: 'text-blue-400' },
    EPIC: { id: 'epic', label: 'Epic', color: 'purple', weight: 4, twBorder: 'border-purple-500', twShadow: 'shadow-purple-500/50', twText: 'text-purple-400' },
    LEGENDARY: { id: 'legendary', label: 'Legendary', color: 'gold', weight: 1, twBorder: 'border-gold-light', twShadow: 'shadow-gold-light/50', twText: 'text-gold-light' },
};

export const ITEMS_CATALOG = [
    // COMMON (50%)
    { id: 1, name: "Shake Protéiné", cost: 150, type: "consumable", rarity: "COMMON", icon: "🥤" },
    { id: 2, name: "Repos 15min", cost: 0, type: "activity", rarity: "COMMON", icon: "😴" }, // Free items can exist? Cost 0 might break logic, lets say cost 50
    { id: 3, name: "Bouteille d'eau", cost: 200, type: "consumable", rarity: "COMMON", icon: "💧" },
    { id: 4, name: "Playlist Boost", cost: 300, type: "bonus", rarity: "COMMON", icon: "🎵" },
    { id: 5, name: "Café Noir", cost: 250, type: "consumable", rarity: "COMMON", icon: "☕" },

    // UNCOMMON (30%)
    { id: 10, name: "Barre Énergétique", cost: 500, type: "consumable", rarity: "UNCOMMON", icon: "🍫" },
    { id: 11, name: "Straps de Tirage", cost: 1200, type: "equipment", rarity: "UNCOMMON", icon: "🧣" },
    { id: 12, name: "Ceinture de Force", cost: 1500, type: "equipment", rarity: "UNCOMMON", icon: "🥋" },
    { id: 13, name: "Douche Chaude", cost: 400, type: "comfort", rarity: "UNCOMMON", icon: "🚿" },

    // RARE (15%)
    { id: 20, name: "Séance Ciné", cost: 5000, type: "leisure", rarity: "RARE", icon: "🍿" },
    { id: 21, name: "Cheat Meal", cost: 4000, type: "consumable", rarity: "RARE", icon: "🍔" },
    { id: 22, name: "Massage Deep Tissue", cost: 6000, type: "recovery", rarity: "RARE", icon: "💆‍♂️" },
    { id: 23, name: "Nouveaux Écouteurs", cost: 8000, type: "equipment", rarity: "RARE", icon: "🎧" },

    // EPIC (4%)
    { id: 30, name: "Resto Sushi à Volonté", cost: 15000, type: "leisure", rarity: "EPIC", icon: "🍣" },
    { id: 31, name: "Nouveau T-shirt Tech", cost: 12000, type: "apparel", rarity: "EPIC", icon: "👕" },
    { id: 32, name: "Soirée Casino (Vraie)", cost: 20000, type: "leisure", rarity: "EPIC", icon: "🎰" },

    // LEGENDARY (1%)
    { id: 40, name: "Nouvelles Baskets Pro", cost: 50000, type: "apparel", rarity: "LEGENDARY", icon: "👟" },
    { id: 41, name: "Console Next-Gen", cost: 100000, type: "leisure", rarity: "LEGENDARY", icon: "🎮" },
    { id: 42, name: "Voyage Week-end", cost: 150000, type: "leisure", rarity: "LEGENDARY", icon: "✈️" },
    { id: 43, name: "Home Gym Set", cost: 250000, type: "equipment", rarity: "LEGENDARY", icon: "🏋FO️" },
];
