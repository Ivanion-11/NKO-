// Система управления событиями для волонтеров и НКО
class EventsSystem {
    constructor() {
        this.publicEventsKey = 'publicEvents';
        this.nkoEventsKey = 'nkoEvents';
        this.init();
    }

    init() {
        this.ensurePublicEvents();
    }

    // Создаем хранилище для публичных событий если его нет
    ensurePublicEvents() {
        if (!localStorage.getItem(this.publicEventsKey)) {
            localStorage.setItem(this.publicEventsKey, JSON.stringify([]));
        }
    }

    // Публикация события для волонтеров
    publishEvent(eventData) {
        const publicEvents = this.getPublicEvents();
        
        const publicEvent = {
            id: eventData.id,
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            category: eventData.category,
            city: eventData.city,
            address: eventData.address,
            organization: eventData.organization,
            image: eventData.image,
            participants: eventData.participants || 0,
            maxParticipants: eventData.maxParticipants || 50,
            contactEmail: eventData.contactEmail,
            contactPhone: eventData.contactPhone,
            requirements: eventData.requirements || '',
            skills: eventData.skills || [],
            isPublic: true,
            createdAt: new Date().toISOString(),
            status: 'active',
            registeredVolunteers: []
        };

        publicEvents.push(publicEvent);
        this.savePublicEvents(publicEvents);
        
        return publicEvent;
    }

    // Обновление публичного события
    updatePublicEvent(eventId, updates) {
        const publicEvents = this.getPublicEvents();
        const eventIndex = publicEvents.findIndex(event => event.id == eventId);
        
        if (eventIndex !== -1) {
            publicEvents[eventIndex] = { ...publicEvents[eventIndex], ...updates };
            this.savePublicEvents(publicEvents);
            return true;
        }
        return false;
    }

    // Удаление публичного события
    unpublishEvent(eventId) {
        const publicEvents = this.getPublicEvents();
        const filteredEvents = publicEvents.filter(event => event.id != eventId);
        this.savePublicEvents(filteredEvents);
    }

    // Регистрация волонтера на событие
    registerVolunteer(eventId, volunteerData) {
        const publicEvents = this.getPublicEvents();
        const eventIndex = publicEvents.findIndex(event => event.id == eventId);
        
        if (eventIndex !== -1) {
            const event = publicEvents[eventIndex];
            
            // Проверяем есть ли место
            if (event.registeredVolunteers.length >= event.maxParticipants) {
                return { success: false, message: 'На это мероприятие уже набрано максимальное количество участников' };
            }
            
            // Проверяем не зарегистрирован ли уже волонтер
            const alreadyRegistered = event.registeredVolunteers.some(
                v => v.email === volunteerData.email
            );
            
            if (alreadyRegistered) {
                return { success: false, message: 'Вы уже зарегистрированы на это мероприятие' };
            }
            
            // Добавляем волонтера
            event.registeredVolunteers.push({
                ...volunteerData,
                registeredAt: new Date().toISOString()
            });
            
            // Обновляем количество участников
            event.participants = event.registeredVolunteers.length;
            
            this.savePublicEvents(publicEvents);
            
            // Обновляем также в событиях НКО
            this.updateNkoEventParticipants(eventId, event.participants);
            
            return { success: true, message: 'Вы успешно зарегистрировались на мероприятие!' };
        }
        
        return { success: false, message: 'Мероприятие не найдено' };
    }

    // Обновление количества участников в событиях НКО
    updateNkoEventParticipants(eventId, participantsCount) {
        const nkoEvents = JSON.parse(localStorage.getItem(this.nkoEventsKey) || '[]');
        const eventIndex = nkoEvents.findIndex(event => event.id == eventId);
        
        if (eventIndex !== -1) {
            nkoEvents[eventIndex].participants = participantsCount;
            localStorage.setItem(this.nkoEventsKey, JSON.stringify(nkoEvents));
        }
    }

    // Получение всех публичных событий
    getPublicEvents(filters = {}) {
        let events = JSON.parse(localStorage.getItem(this.publicEventsKey) || '[]');
        
        // Фильтрация по городу
        if (filters.city) {
            events = events.filter(event => 
                event.city.toLowerCase().includes(filters.city.toLowerCase())
            );
        }
        
        // Фильтрация по категории
        if (filters.category) {
            events = events.filter(event => event.category === filters.category);
        }
        
        // Фильтрация по дате
        if (filters.date) {
            events = events.filter(event => event.date === filters.date);
        }
        
        // Сортируем по дате (ближайшие сначала)
        return events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Получение событий для конкретного волонтера
    getVolunteerEvents(volunteerEmail) {
        const publicEvents = this.getPublicEvents();
        return publicEvents.filter(event => 
            event.registeredVolunteers.some(v => v.email === volunteerEmail)
        );
    }

    // Сохранение публичных событий
    savePublicEvents(events) {
        localStorage.setItem(this.publicEventsKey, JSON.stringify(events));
    }

    // Получение событий по организации
    getOrganizationEvents(orgName) {
        return this.getPublicEvents().filter(event => event.organization === orgName);
    }
}

// Инициализация системы событий
const eventsSystem = new EventsSystem();