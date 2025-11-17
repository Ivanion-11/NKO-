// favorites-system.js
class FavoritesSystem {
    constructor() {
        this.favoritesKey = 'userFavorites';
    }

    addToFavorites(userId, itemId, itemType) {
        const favorites = this.getUserFavorites(userId);
        
        if (!favorites[itemType]) {
            favorites[itemType] = [];
        }
        
        if (!favorites[itemType].includes(itemId)) {
            favorites[itemType].push(itemId);
            this.saveUserFavorites(userId, favorites);
        }
    }

    removeFromFavorites(userId, itemId, itemType) {
        const favorites = this.getUserFavorites(userId);
        
        if (favorites[itemType]) {
            favorites[itemType] = favorites[itemType].filter(id => id !== itemId);
            this.saveUserFavorites(userId, favorites);
        }
    }

    getUserFavorites(userId) {
        const allFavorites = JSON.parse(localStorage.getItem(this.favoritesKey) || '{}');
        return allFavorites[userId] || { news: [], events: [], materials: [] };
    }
}