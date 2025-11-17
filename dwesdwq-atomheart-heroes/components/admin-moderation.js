// admin-moderation.js
class AdminModerationSystem {
    constructor() {
        this.pendingNkoKey = 'pendingNkoRegistrations';
        this.approvedNkoKey = 'approvedNko';
        this.pendingEventsKey = 'pendingEvents';
    }

    // Получение заявок на модерацию
    getPendingRegistrations() {
        return JSON.parse(localStorage.getItem(this.pendingNkoKey) || '[]');
    }

    // Одобрение НКО
    approveNko(registrationId) {
        const pending = this.getPendingRegistrations();
        const registration = pending.find(r => r.id === registrationId);
        
        if (registration) {
            // Добавляем в список одобренных
            const approved = JSON.parse(localStorage.getItem(this.approvedNkoKey) || '[]');
            approved.push({
                ...registration,
                approvedAt: new Date().toISOString(),
                status: 'approved'
            });
            localStorage.setItem(this.approvedNkoKey, JSON.stringify(approved));

            // Удаляем из ожидающих
            const filtered = pending.filter(r => r.id !== registrationId);
            localStorage.setItem(this.pendingNkoKey, JSON.stringify(filtered));

            return true;
        }
        return false;
    }

    // Отклонение НКО
    rejectNko(registrationId, reason) {
        const pending = this.getPendingRegistrations();
        const filtered = pending.filter(r => r.id !== registrationId);
        localStorage.setItem(this.pendingNkoKey, JSON.stringify(filtered));
        
        // Можно сохранить в архив отклоненных
        return true;
    }
}