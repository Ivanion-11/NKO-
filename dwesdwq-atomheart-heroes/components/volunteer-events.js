// Система управления событиями волонтеров
class VolunteerEventsSystem {
    constructor() {
        this.publicEventsKey = 'publicEvents';
        this.volunteersKey = 'volunteersData';
        this.currentVolunteerKey = 'currentVolunteer';
    }

    // Получение текущего волонтера
    getCurrentVolunteer() {
        return JSON.parse(localStorage.getItem(this.currentVolunteerKey) || 'null');
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
        
        // Фильтрация только активных событий
        events = events.filter(event => event.status === 'active');
        
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

    // Проверка регистрации волонтера на событие
    isVolunteerRegistered(eventId, volunteerEmail) {
        const publicEvents = this.getPublicEvents();
        const event = publicEvents.find(e => e.id == eventId);
        return event ? event.registeredVolunteers.some(v => v.email === volunteerEmail) : false;
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
            
            return { success: true, message: 'Регистрация на мероприятие отменена' };
        }
        
        return { success: false, message: 'Мероприятие не найдено' };
    }

    // Сохранение публичных событий
    savePublicEvents(events) {
        localStorage.setItem(this.publicEventsKey, JSON.stringify(events));
    }

    // Получение статистики волонтера
    getVolunteerStats(volunteerEmail) {
        const volunteerEvents = this.getVolunteerEvents(volunteerEmail);
        const totalEvents = volunteerEvents.length;
        const upcomingEvents = volunteerEvents.filter(event => new Date(event.date) >= new Date()).length;
        const completedEvents = totalEvents - upcomingEvents;
        
        return {
            totalEvents,
            upcomingEvents,
            completedEvents,
            favoriteCategory: this.getFavoriteCategory(volunteerEvents),
            organizations: this.getUniqueOrganizations(volunteerEvents)
        };
    }

    // Получение любимой категории волонтера
    getFavoriteCategory(volunteerEvents) {
        const categoryCount = {};
        volunteerEvents.forEach(event => {
            categoryCount[event.category] = (categoryCount[event.category] || 0) + 1;
        });
        
        const favorite = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0];
        return favorite ? favorite[0] : 'Нет данных';
    }

    // Получение уникальных организаций
    getUniqueOrganizations(volunteerEvents) {
        const organizations = new Set();
        volunteerEvents.forEach(event => organizations.add(event.organization));
        return Array.from(organizations);
    }
}

// Инициализация системы
const volunteerEventsSystem = new VolunteerEventsSystem();

// Функции для отображения событий волонтера
function loadVolunteerEvents() {
    const volunteerData = volunteerEventsSystem.getCurrentVolunteer();
    
    if (!volunteerData) {
        showVolunteerNotRegisteredMessage();
        return;
    }

    const volunteerEvents = volunteerEventsSystem.getVolunteerEvents(volunteerData.email);
    displayVolunteerEvents(volunteerEvents);
    updateVolunteerStats(volunteerData.email);
}

function showVolunteerNotRegisteredMessage() {
    const container = document.getElementById('volunteerEventsContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="text-center py-8">
            <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                <i data-feather="user" class="w-8 h-8"></i>
            </div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">Вы не авторизованы</h3>
            <p class="text-gray-600 mb-4">Зарегистрируйтесь как волонтер, чтобы видеть свои мероприятия</p>
            <a href="volunteer-register.html" class="btn btn-primary btn-sm">
                Зарегистрироваться
            </a>
        </div>
    `;
    feather.replace();
}

function displayVolunteerEvents(events) {
    const container = document.getElementById('volunteerEventsContainer');
    
    if (!container) return;

    if (events.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                    <i data-feather="calendar" class="w-8 h-8"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">Вы пока не участвуете в мероприятиях</h3>
                <p class="text-gray-600 mb-4">Найдите интересные мероприятия на главной странице</p>
                <a href="index.html" class="btn btn-primary btn-sm">
                    Найти мероприятия
                </a>
            </div>
        `;
        feather.replace();
        return;
    }

    // Разделяем на предстоящие и завершенные
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) >= now);
    const completedEvents = events.filter(event => new Date(event.date) < now);

    let html = '';

    // Предстоящие мероприятия
    if (upcomingEvents.length > 0) {
        html += `
            <div class="mb-8">
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <i data-feather="clock" class="w-5 h-5 mr-2 text-green-600"></i>
                    Предстоящие мероприятия (${upcomingEvents.length})
                </h3>
                <div class="space-y-4">
                    ${upcomingEvents.map(event => createVolunteerEventCard(event)).join('')}
                </div>
            </div>
        `;
    }

    // Завершенные мероприятия
    if (completedEvents.length > 0) {
        html += `
            <div>
                <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <i data-feather="check-circle" class="w-5 h-5 mr-2 text-blue-600"></i>
                    Завершенные мероприятия (${completedEvents.length})
                </h3>
                <div class="space-y-4">
                    ${completedEvents.map(event => createVolunteerEventCard(event, true)).join('')}
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
    feather.replace();
}

function createVolunteerEventCard(event, isCompleted = false) {
    const volunteerData = volunteerEventsSystem.getCurrentVolunteer();
    const registration = event.registeredVolunteers.find(v => v.email === volunteerData.email);
    
    return `
        <div class="card p-6 hover:scale-105 transition-all duration-300 group">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-start justify-between mb-3">
                        <h4 class="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                            ${event.title}
                        </h4>
                        <div class="flex items-center space-x-2">
                            ${isCompleted ? `
                            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                Завершено
                            </span>
                            ` : `
                            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                Предстоит
                            </span>
                            `}
                            <span class="${getCategoryColorClass(event.category)} text-white px-2 py-1 rounded-full text-xs font-medium">
                                ${event.category}
                            </span>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div class="flex items-center text-gray-600">
                            <i data-feather="map-pin" class="w-4 h-4 mr-2 flex-shrink-0"></i>
                            <span class="text-sm">${event.address}, ${event.city}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i data-feather="calendar" class="w-4 h-4 mr-2 flex-shrink-0"></i>
                            <span class="text-sm">${formatDate(event.date)}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i data-feather="users" class="w-4 h-4 mr-2 flex-shrink-0"></i>
                            <span class="text-sm">${event.organization}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i data-feather="user-check" class="w-4 h-4 mr-2 flex-shrink-0"></i>
                            <span class="text-sm">${event.participants} участников</span>
                        </div>
                    </div>
                    
                    <p class="text-gray-600 text-sm mb-3 leading-relaxed">
                        ${event.description}
                    </p>
                    
                    <div class="flex items-center justify-between">
                        <div class="text-sm text-gray-500">
                            Зарегистрирован: ${formatDate(registration.registeredAt)}
                        </div>
                        ${!isCompleted ? `
                        <button onclick="unregisterFromEvent(${event.id})" class="btn btn-border btn-sm">
                            Отменить участие
                        </button>
                        ` : `
                        <button onclick="viewEventDetails(${event.id})" class="btn btn-glass btn-sm">
                            Подробнее
                        </button>
                        `}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Обновление статистики волонтера
function updateVolunteerStats(volunteerEmail) {
    const stats = volunteerEventsSystem.getVolunteerStats(volunteerEmail);
    const statsContainer = document.getElementById('volunteerStats');
    
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div class="text-center">
                    <div class="text-2xl font-bold text-blue-600">${stats.totalEvents}</div>
                    <div class="text-gray-600 text-sm">Всего мероприятий</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-green-600">${stats.upcomingEvents}</div>
                    <div class="text-gray-600 text-sm">Предстоящих</div>
                </div>
                <div class="text-center">
                    <div class="text-2xl font-bold text-purple-600">${stats.completedEvents}</div>
                    <div class="text-gray-600 text-sm">Завершенных</div>
                </div>
                <div class="text-center">
                    <div class="text-lg font-bold text-orange-600">${stats.favoriteCategory}</div>
                    <div class="text-gray-600 text-sm">Любимая категория</div>
                </div>
            </div>
            
            ${stats.organizations.length > 0 ? `
            <div class="mb-4">
                <h4 class="font-semibold text-gray-800 mb-2">Организации:</h4>
                <div class="flex flex-wrap gap-2">
                    ${stats.organizations.map(org => `
                        <span class="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                            ${org}
                        </span>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        `;
    }
}

// Функция просмотра деталей мероприятия
function viewEventDetails(eventId) {
    const publicEvents = volunteerEventsSystem.getPublicEvents();
    const event = publicEvents.find(e => e.id == eventId);
    
    if (event) {
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">${event.title}</h3>
                        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                            <i data-feather="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    <img src="${event.image}" alt="${event.title}" class="w-full h-48 object-cover rounded-lg mb-4">
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div class="flex items-center text-gray-600">
                            <i data-feather="map-pin" class="w-4 h-4 mr-2"></i>
                            <span>${event.address}, ${event.city}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i data-feather="calendar" class="w-4 h-4 mr-2"></i>
                            <span>${formatDate(event.date)}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i data-feather="users" class="w-4 h-4 mr-2"></i>
                            <span>${event.organization}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i data-feather="user-check" class="w-4 h-4 mr-2"></i>
                            <span>${event.participants} участников</span>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-800 mb-2">Описание:</h4>
                        <p class="text-gray-600">${event.description}</p>
                    </div>
                    
                    ${event.requirements ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-800 mb-2">Требования:</h4>
                        <p class="text-gray-600">${event.requirements}</p>
                    </div>
                    ` : ''}
                    
                    <div class="flex justify-end">
                        <button onclick="closeModal()" class="btn btn-border">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        feather.replace();
    }
}

function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

// Вспомогательные функции
function getCategoryColorClass(category) {
    const colors = {
        'Экология': 'bg-green-500',
        'Спорт': 'bg-red-500',
        'Образование': 'bg-blue-500',
        'Социальная помощь': 'bg-purple-500',
        'Благоустройство': 'bg-orange-500',
        'Культура': 'bg-pink-500'
    };
    return colors[category] || 'bg-blue-500';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    });
}

// Инициализация при загрузке страницы
if (document.getElementById('volunteerEventsContainer')) {
    document.addEventListener('DOMContentLoaded', function() {
        loadVolunteerEvents();
    });
}

// Экспорт для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VolunteerEventsSystem, volunteerEventsSystem };
}
// Добавляем в файл components/volunteer-events.js

// Функция просмотра деталей мероприятия (добавляем в конец файла)
function viewEventDetails(eventId) {
    const publicEvents = volunteerEventsSystem.getPublicEvents();
    const event = publicEvents.find(e => e.id == eventId);
    
    if (event) {
        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-bold text-gray-800">${event.title}</h3>
                        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                            <i data-feather="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    ${event.image ? `
                    <img src="${event.image}" alt="${event.title}" class="w-full h-48 object-cover rounded-lg mb-4">
                    ` : ''}
                    
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div class="flex items-center text-gray-600">
                            <i data-feather="map-pin" class="w-4 h-4 mr-2"></i>
                            <span>${event.address}, ${event.city}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i data-feather="calendar" class="w-4 h-4 mr-2"></i>
                            <span>${formatDate(event.date)}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i data-feather="users" class="w-4 h-4 mr-2"></i>
                            <span>${event.organization}</span>
                        </div>
                        <div class="flex items-center text-gray-600">
                            <i data-feather="user-check" class="w-4 h-4 mr-2"></i>
                            <span>${event.participants} участников</span>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-800 mb-2">Описание:</h4>
                        <p class="text-gray-600">${event.description}</p>
                    </div>
                    
                    ${event.requirements ? `
                    <div class="mb-4">
                        <h4 class="font-semibold text-gray-800 mb-2">Требования:</h4>
                        <p class="text-gray-600">${event.requirements}</p>
                    </div>
                    ` : ''}
                    
                    <div class="flex justify-end space-x-3">
                        <button onclick="closeModal()" class="btn btn-border">
                            Закрыть
                        </button>
                        <button onclick="registerForEvent(${event.id})" class="btn btn-primary">
                            Записаться
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        feather.replace();
    }
}

// Делаем функцию глобальной
window.viewEventDetails = viewEventDetails;