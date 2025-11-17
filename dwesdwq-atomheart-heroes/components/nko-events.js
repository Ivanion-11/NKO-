// Система управления событиями для волонтеров и НКО
class EventsSystem {
    constructor() {
        this.publicEventsKey = 'publicEvents';
        this.nkoEventsKey = 'nkoEvents';
        this.init();
    }

    init() {
        this.ensurePublicEvents();
        this.ensureNkoEvents();
    }

    // Создаем хранилище для публичных событий если его нет
    ensurePublicEvents() {
        if (!localStorage.getItem(this.publicEventsKey)) {
            localStorage.setItem(this.publicEventsKey, JSON.stringify([]));
        }
    }

    // Создаем хранилище для событий НКО если его нет
    ensureNkoEvents() {
        if (!localStorage.getItem(this.nkoEventsKey)) {
            localStorage.setItem(this.nkoEventsKey, JSON.stringify([]));
        }
    }

    // Публикация события для волонтеров
    publishEvent(eventData) {
        const publicEvents = this.getPublicEvents();
        
        const publicEvent = {
            id: eventData.id || Date.now(),
            title: eventData.title,
            description: eventData.description,
            date: eventData.startDate || eventData.date,
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            category: eventData.category,
            city: eventData.city,
            address: eventData.address,
            organization: eventData.organization,
            image: eventData.image || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            participants: eventData.participants || 0,
            maxParticipants: eventData.maxParticipants || 50,
            contactEmail: eventData.contactEmail,
            contactPhone: eventData.contactPhone,
            requirements: eventData.requirements || '',
            skills: eventData.skills || [],
            isPublic: true,
            createdAt: new Date().toISOString(),
            status: 'active',
            registeredVolunteers: [],
            type: eventData.type || 'public',
            createdBy: eventData.createdBy
        };

        publicEvents.push(publicEvent);
        this.savePublicEvents(publicEvents);
        
        // Также сохраняем в событиях НКО
        this.saveToNkoEvents(publicEvent);
        
        return publicEvent;
    }

    // Сохранение в событиях НКО
    saveToNkoEvents(event) {
        const nkoEvents = JSON.parse(localStorage.getItem(this.nkoEventsKey) || '[]');
        
        // Проверяем, нет ли уже такого события
        const existingIndex = nkoEvents.findIndex(e => e.id === event.id);
        if (existingIndex === -1) {
            nkoEvents.push(event);
            localStorage.setItem(this.nkoEventsKey, JSON.stringify(nkoEvents));
        }
    }

    // Обновление публичного события
    updatePublicEvent(eventId, updates) {
        const publicEvents = this.getPublicEvents();
        const eventIndex = publicEvents.findIndex(event => event.id == eventId);
        
        if (eventIndex !== -1) {
            publicEvents[eventIndex] = { ...publicEvents[eventIndex], ...updates };
            this.savePublicEvents(publicEvents);
            
            // Также обновляем в событиях НКО
            this.updateNkoEvent(eventId, updates);
            
            return true;
        }
        return false;
    }

    // Обновление события НКО
    updateNkoEvent(eventId, updates) {
        const nkoEvents = JSON.parse(localStorage.getItem(this.nkoEventsKey) || '[]');
        const eventIndex = nkoEvents.findIndex(event => event.id == eventId);
        
        if (eventIndex !== -1) {
            nkoEvents[eventIndex] = { ...nkoEvents[eventIndex], ...updates };
            localStorage.setItem(this.nkoEventsKey, JSON.stringify(nkoEvents));
            return true;
        }
        return false;
    }

    // Удаление публичного события
    unpublishEvent(eventId) {
        const publicEvents = this.getPublicEvents();
        const filteredEvents = publicEvents.filter(event => event.id != eventId);
        this.savePublicEvents(filteredEvents);
        
        // Также удаляем из событий НКО
        this.deleteNkoEvent(eventId);
    }

    // Удаление события НКО
    deleteNkoEvent(eventId) {
        const nkoEvents = JSON.parse(localStorage.getItem(this.nkoEventsKey) || '[]');
        const filteredEvents = nkoEvents.filter(event => event.id != eventId);
        localStorage.setItem(this.nkoEventsKey, JSON.stringify(filteredEvents));
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

    // Отмена регистрации волонтера
    unregisterVolunteer(eventId, volunteerEmail) {
        const publicEvents = this.getPublicEvents();
        const eventIndex = publicEvents.findIndex(event => event.id == eventId);
        
        if (eventIndex !== -1) {
            const event = publicEvents[eventIndex];
            event.registeredVolunteers = event.registeredVolunteers.filter(
                v => v.email !== volunteerEmail
            );
            event.participants = event.registeredVolunteers.length;
            
            this.savePublicEvents(publicEvents);
            
            // Обновляем также в событиях НКО
            this.updateNkoEventParticipants(eventId, event.participants);
            
            return { success: true, message: 'Регистрация на мероприятие отменена' };
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

        // Фильтрация по организации
        if (filters.organization) {
            events = events.filter(event => event.organization === filters.organization);
        }

        // Фильтрация по статусу
        if (filters.status) {
            events = events.filter(event => event.status === filters.status);
        } else {
            // По умолчанию показываем только активные
            events = events.filter(event => event.status === 'active');
        }
        
        // Сортируем по дате (ближайшие сначала)
        return events.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    // Получение событий по организации
    getOrganizationEvents(orgName) {
        return this.getPublicEvents({ organization: orgName });
    }

    // Получение событий для конкретного волонтера
    getVolunteerEvents(volunteerEmail) {
        const publicEvents = this.getPublicEvents();
        return publicEvents.filter(event => 
            event.registeredVolunteers.some(v => v.email === volunteerEmail)
        );
    }

    // Получение событий НКО
    getNkoEvents(filters = {}) {
        let events = JSON.parse(localStorage.getItem(this.nkoEventsKey) || '[]');
        
        // Фильтрация по организации
        if (filters.organization) {
            events = events.filter(event => event.organization === filters.organization);
        }
        
        // Фильтрация по статусу
        if (filters.status) {
            events = events.filter(event => event.status === filters.status);
        }

        // Фильтрация по городу
        if (filters.city) {
            events = events.filter(event => 
                event.city.toLowerCase().includes(filters.city.toLowerCase())
            );
        }
        
        // Сортируем по дате создания (новые сначала)
        return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Получение события по ID
    getEventById(eventId) {
        const publicEvents = this.getPublicEvents();
        return publicEvents.find(event => event.id == eventId);
    }

    // Получение события НКО по ID
    getNkoEventById(eventId) {
        const nkoEvents = JSON.parse(localStorage.getItem(this.nkoEventsKey) || '[]');
        return nkoEvents.find(event => event.id == eventId);
    }

    // Получение популярных событий
    getPopularEvents(limit = 6) {
        const events = this.getPublicEvents();
        return events
            .sort((a, b) => b.participants - a.participants)
            .slice(0, limit);
    }

    // Получение предстоящих событий
    getUpcomingEvents(limit = 10) {
        const events = this.getPublicEvents();
        const now = new Date();
        return events
            .filter(event => new Date(event.date) >= now)
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, limit);
    }

    // Получение событий по категории
    getEventsByCategory(category, limit = 10) {
        return this.getPublicEvents({ category }).slice(0, limit);
    }

    // Получение событий по городу
    getEventsByCity(city, limit = 10) {
        return this.getPublicEvents({ city }).slice(0, limit);
    }

    // Проверка регистрации волонтера на событие
    isVolunteerRegistered(eventId, volunteerEmail) {
        const event = this.getEventById(eventId);
        return event ? event.registeredVolunteers.some(v => v.email === volunteerEmail) : false;
    }

    // Получение зарегистрированных волонтеров на событие
    getEventVolunteers(eventId) {
        const event = this.getEventById(eventId);
        return event ? event.registeredVolunteers : [];
    }

    // Получение статистики событий
    getEventsStats() {
        const events = this.getPublicEvents();
        const totalEvents = events.length;
        const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).length;
        const totalParticipants = events.reduce((sum, event) => sum + event.participants, 0);
        const totalOrganizations = new Set(events.map(event => event.organization)).size;

        // Статистика по категориям
        const categoryStats = {};
        events.forEach(event => {
            categoryStats[event.category] = (categoryStats[event.category] || 0) + 1;
        });

        // Статистика по городам
        const cityStats = {};
        events.forEach(event => {
            cityStats[event.city] = (cityStats[event.city] || 0) + 1;
        });

        return {
            totalEvents,
            upcomingEvents,
            totalParticipants,
            totalOrganizations,
            categoryStats,
            cityStats
        };
    }

    // Получение статистики для организации
    getOrganizationStats(orgName) {
        const events = this.getOrganizationEvents(orgName);
        const totalEvents = events.length;
        const upcomingEvents = events.filter(event => new Date(event.date) >= new Date()).length;
        const totalParticipants = events.reduce((sum, event) => sum + event.participants, 0);
        const avgParticipants = totalEvents > 0 ? (totalParticipants / totalEvents).toFixed(1) : 0;

        // Статистика по категориям для организации
        const categoryStats = {};
        events.forEach(event => {
            categoryStats[event.category] = (categoryStats[event.category] || 0) + 1;
        });

        return {
            totalEvents,
            upcomingEvents,
            totalParticipants,
            avgParticipants,
            categoryStats
        };
    }

    // Поиск событий
    searchEvents(query, filters = {}) {
        let events = this.getPublicEvents(filters);
        
        if (query) {
            const searchTerm = query.toLowerCase();
            events = events.filter(event => 
                event.title.toLowerCase().includes(searchTerm) ||
                event.description.toLowerCase().includes(searchTerm) ||
                event.organization.toLowerCase().includes(searchTerm) ||
                event.category.toLowerCase().includes(searchTerm) ||
                event.city.toLowerCase().includes(searchTerm)
            );
        }
        
        return events;
    }

    // Получение рекомендуемых событий для волонтера
    getRecommendedEvents(volunteerEmail, limit = 6) {
        const volunteerEvents = this.getVolunteerEvents(volunteerEmail);
        
        // Определяем любимые категории волонтера
        const categoryCount = {};
        volunteerEvents.forEach(event => {
            categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
        });
        
        const favoriteCategories = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(item => item[0]);
        
        // Получаем события из любимых категорий, на которые волонтер еще не зарегистрирован
        const allEvents = this.getPublicEvents();
        const recommended = allEvents.filter(event => 
            favoriteCategories.includes(event.category) &&
            !event.registeredVolunteers.some(v => v.email === volunteerEmail) &&
            new Date(event.date) >= new Date()
        );
        
        return recommended.slice(0, limit);
    }

    // Сохранение публичных событий
    savePublicEvents(events) {
        localStorage.setItem(this.publicEventsKey, JSON.stringify(events));
    }

    // Экспорт событий в формат для календаря
    exportToCalendarFormat() {
        const events = this.getPublicEvents();
        return events.map(event => ({
            id: event.id,
            title: event.title,
            start: event.startDate || event.date,
            end: event.endDate || event.date,
            description: event.description,
            location: `${event.address}, ${event.city}`,
            organizer: event.organization,
            category: event.category,
            participants: event.participants,
            maxParticipants: event.maxParticipants,
            url: `event-details.html?id=${event.id}`
        }));
    }

    // Импорт событий из внешнего источника
    importEvents(eventsData) {
        const publicEvents = this.getPublicEvents();
        
        eventsData.forEach(eventData => {
            const existingEvent = publicEvents.find(event => event.id === eventData.id);
            if (!existingEvent) {
                publicEvents.push({
                    ...eventData,
                    registeredVolunteers: [],
                    participants: 0,
                    status: 'active',
                    createdAt: new Date().toISOString()
                });
            }
        });
        
        this.savePublicEvents(publicEvents);
        return publicEvents.length;
    }

    // Очистка старых событий
    cleanupOldEvents(daysOld = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        const publicEvents = this.getPublicEvents();
        const activeEvents = publicEvents.filter(event => 
            new Date(event.date) >= cutoffDate || event.status === 'active'
        );
        
        this.savePublicEvents(activeEvents);
        
        // Также очищаем события НКО
        const nkoEvents = JSON.parse(localStorage.getItem(this.nkoEventsKey) || '[]');
        const activeNkoEvents = nkoEvents.filter(event => 
            new Date(event.date) >= cutoffDate || event.status === 'active'
        );
        localStorage.setItem(this.nkoEventsKey, JSON.stringify(activeNkoEvents));
        
        return publicEvents.length - activeEvents.length;
    }

    // Создание тестовых данных
    createSampleEvents() {
        const sampleEvents = [
            {
                id: 1,
                title: "Экологический субботник в парке",
                description: "Присоединяйтесь к уборке городского парка. Мы сделаем наш город чище вместе!",
                date: "2024-06-15",
                startDate: "2024-06-15T10:00:00",
                endDate: "2024-06-15T14:00:00",
                category: "Экология",
                city: "Дубна",
                address: "Городской парк",
                organization: "Эко-Дубна",
                image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                participants: 15,
                maxParticipants: 50,
                contactEmail: "eco@dubna.ru",
                contactPhone: "+7 (495) 123-45-67",
                requirements: "Удобная одежда, перчатки",
                skills: [],
                isPublic: true,
                createdAt: "2024-01-10T08:00:00",
                status: "active",
                registeredVolunteers: [],
                type: "public"
            },
            {
                id: 2,
                title: "Благотворительный забег",
                description: "Пробегите дистанцию 5 км и помогите собрать средства для детского дома",
                date: "2024-06-20",
                startDate: "2024-06-20T09:00:00",
                endDate: "2024-06-20T12:00:00",
                category: "Спорт",
                city: "Дубна",
                address: "Центральный стадион",
                organization: "Спорт для всех",
                image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                participants: 8,
                maxParticipants: 100,
                contactEmail: "sport@dubna.ru",
                contactPhone: "+7 (495) 123-45-68",
                requirements: "Спортивная форма",
                skills: [],
                isPublic: true,
                createdAt: "2024-01-12T10:00:00",
                status: "active",
                registeredVolunteers: [],
                type: "public"
            },
            {
                id: 3,
                title: "Мастер-класс по программированию для детей",
                description: "Бесплатный мастер-класс по основам программирования для школьников",
                date: "2024-06-25",
                startDate: "2024-06-25T15:00:00",
                endDate: "2024-06-25T17:00:00",
                category: "Образование",
                city: "Дубна",
                address: "Центр молодежного инновационного творчества",
                organization: "IT-Дубна",
                image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                participants: 5,
                maxParticipants: 20,
                contactEmail: "it@dubna.ru",
                contactPhone: "+7 (495) 123-45-69",
                requirements: "Ноутбук, базовые знания компьютера",
                skills: ["Программирование", "Обучение"],
                isPublic: true,
                createdAt: "2024-01-15T14:00:00",
                status: "active",
                registeredVolunteers: [],
                type: "public"
            }
        ];

        sampleEvents.forEach(event => {
            this.publishEvent(event);
        });

        return sampleEvents.length;
    }
}

// Инициализация системы событий
const eventsSystem = new EventsSystem();

// Глобальные функции для использования в других файлах
if (typeof window !== 'undefined') {
    window.eventsSystem = eventsSystem;
}

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EventsSystem, eventsSystem };
}