// components/nko-management.js
class NkoManagementSystem {
    constructor() {
        this.nkoKey = 'nkoRegistrations';
        this.pendingNkoKey = 'pendingNkoRegistrations';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.nkoKey)) {
            localStorage.setItem(this.nkoKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.pendingNkoKey)) {
            localStorage.setItem(this.pendingNkoKey, JSON.stringify([]));
        }
    }

    registerNKO(nkoData) {
        const pendingRegistrations = this.getPendingRegistrations();
        
        const registration = {
            id: Date.now(),
            ...nkoData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            approved: false
        };

        pendingRegistrations.push(registration);
        localStorage.setItem(this.pendingNkoKey, JSON.stringify(pendingRegistrations));
        
        return registration;
    }

    getPendingRegistrations() {
        return JSON.parse(localStorage.getItem(this.pendingNkoKey) || '[]');
    }

    getApprovedNKO() {
        return JSON.parse(localStorage.getItem(this.nkoKey) || '[]');
    }

    approveNKO(registrationId) {
        const pending = this.getPendingRegistrations();
        const registration = pending.find(r => r.id === registrationId);
        
        if (registration) {
            const approved = this.getApprovedNKO();
            approved.push({
                ...registration,
                status: 'approved',
                approvedAt: new Date().toISOString()
            });
            
            localStorage.setItem(this.nkoKey, JSON.stringify(approved));
            
            // Удаляем из ожидающих
            const filtered = pending.filter(r => r.id !== registrationId);
            localStorage.setItem(this.pendingNkoKey, JSON.stringify(filtered));
            
            return true;
        }
        return false;
    }
}

const nkoSystem = new NkoManagementSystem();