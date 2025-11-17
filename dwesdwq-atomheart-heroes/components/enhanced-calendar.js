// enhanced-calendar.js
class EnhancedCalendar {
    constructor() {
        this.eventsKey = 'calendarEvents';
        this.initCalendar();
    }

    initCalendar() {
        // Интеграция с календарем (можно использовать FullCalendar или аналоги)
        this.loadEvents();
    }

    addEvent(eventData) {
        const events = this.getEvents();
        const newEvent = {
            id: Date.now(),
            ...eventData,
            createdAt: new Date().toISOString(),
            status: 'pending' // или 'approved' для модераторов
        };
        
        events.push(newEvent);
        this.saveEvents(events);
        return newEvent;
    }

    getEvents(filters = {}) {
        let events = JSON.parse(localStorage.getItem(this.eventsKey) || '[]');
        
        if (filters.city) {
            events = events.filter(event => event.city === filters.city);
        }
        
        if (filters.category) {
            events = events.filter(event => event.category === filters.category);
        }
        
        if (filters.date) {
            events = events.filter(event => event.date === filters.date);
        }

        return events;
    }
}