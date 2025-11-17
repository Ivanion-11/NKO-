// calendar-system.js - система управления календарем событий

class CalendarSystem {
    constructor() {
        this.eventsKey = 'calendarEvents';
        this.currentView = 'month';
        this.currentDate = new Date();
        this.selectedCity = '';
        this.init();
    }

    init() {
        this.ensureEventsStorage();
        this.setupEventListeners();
        this.renderCalendar();
        this.updateStats();
    }

    ensureEventsStorage() {
        if (!localStorage.getItem(this.eventsKey)) {
            localStorage.setItem(this.eventsKey, JSON.stringify([]));
        }
    }

    setupEventListeners() {
        // Выбор города
        const citySelect = document.getElementById('citySelect');
        if (citySelect) {
            citySelect.addEventListener('change', (e) => {
                this.selectedCity = e.target.value;
                this.renderCalendar();
                this.updateStats();
            });
        }

        // Выбор даты
        const datePicker = document.getElementById('datePicker');
        if (datePicker) {
            flatpickr("#datePicker", {
                locale: "ru",
                dateFormat: "d.m.Y",
                onChange: (selectedDates) => {
                    if (selectedDates.length > 0) {
                        this.currentDate = selectedDates[0];
                        this.setView('day');
                    }
                }
            });
        }

        // Форма добавления события
        const eventForm = document.getElementById('eventForm');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addEvent();
            });
        }
    }

    // Добавление события
    addEvent() {
        const formData = new FormData(document.getElementById('eventForm'));
        const currentUser = this.getCurrentUser();
        
        if (!currentUser) {
            this.showNotification('Для добавления событий необходимо войти в систему', 'error');
            return;
        }

        const eventData = {
            id: Date.now(),
            title: formData.get('eventTitle'),
            description: formData.get('eventDescription'),
            startDate: formData.get('eventStartDate'),
            endDate: formData.get('eventEndDate') || formData.get('eventStartDate'),
            city: formData.get('eventCity'),
            category: formData.get('eventCategory'),
            address: formData.get('eventAddress'),
            organization: formData.get('eventOrganization'),
            contactEmail: formData.get('eventContactEmail'),
            contactPhone: formData.get('eventContactPhone'),
            type: formData.get('eventType'),
            createdBy: currentUser.email,
            createdAt: new Date().toISOString(),
            status: 'active',
            // Добавляем поля для системы мероприятий
            participants: 0,
            maxParticipants: 50,
            registeredVolunteers: [],
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
            requirements: '',
            skills: []
        };

        const events = this.getEvents();
        events.push(eventData);
        this.saveEvents(events);

        // Также сохраняем в систему публичных событий
        if (typeof eventsSystem !== 'undefined') {
            eventsSystem.publishEvent(eventData);
        }

        this.closeAddEventModal();
        this.renderCalendar();
        this.updateStats();

        // Показываем уведомление об успешном создании
        this.showNotification('Мероприятие успешно создано!', 'success');
        
        // Перенаправляем в профиль НКО если пользователь - НКО
        if (currentUser.type === 'nko') {
            setTimeout(() => {
                window.location.href = 'nko-dashboard.html';
            }, 1500);
        }
    }

    // Получение текущего пользователя
    getCurrentUser() {
        const currentVolunteer = JSON.parse(localStorage.getItem('currentVolunteer') || 'null');
        const nkoData = JSON.parse(localStorage.getItem('nkoRegistration') || 'null');
        
        if (currentVolunteer) {
            return { ...currentVolunteer, type: 'volunteer' };
        } else if (nkoData) {
            return { ...nkoData, type: 'nko', email: nkoData.contactEmail };
        }
        
        return null;
    }

    // Получение событий с фильтрацией
    getEvents(filters = {}) {
        let events = JSON.parse(localStorage.getItem(this.eventsKey) || '[]');
        
        // Фильтрация по городу
        if (filters.city || this.selectedCity) {
            const city = filters.city || this.selectedCity;
            events = events.filter(event => event.city === city);
        }

        // Фильтрация по дате
        if (filters.date) {
            events = events.filter(event => {
                const eventDate = new Date(event.startDate).toDateString();
                const filterDate = new Date(filters.date).toDateString();
                return eventDate === filterDate;
            });
        }

        // Фильтрация по периоду
        if (filters.startDate && filters.endDate) {
            events = events.filter(event => {
                const eventDate = new Date(event.startDate);
                return eventDate >= new Date(filters.startDate) && eventDate <= new Date(filters.endDate);
            });
        }

        return events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }

    // Сохранение событий
    saveEvents(events) {
        localStorage.setItem(this.eventsKey, JSON.stringify(events));
    }

    // Установка вида календаря
    setView(view) {
        this.currentView = view;
        
        // Обновляем активные кнопки
        document.querySelectorAll('[id^="view"]').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-glass');
        });
        
        const viewButton = document.getElementById(`view${view.charAt(0).toUpperCase() + view.slice(1)}`);
        if (viewButton) {
            viewButton.classList.add('btn-primary');
            viewButton.classList.remove('btn-glass');
        }
        
        this.renderCalendar();
    }

    // Рендер календаря
    renderCalendar() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;
        
        switch (this.currentView) {
            case 'month':
                container.innerHTML = this.renderMonthView();
                break;
            case 'week':
                container.innerHTML = this.renderWeekView();
                break;
            case 'day':
                container.innerHTML = this.renderDayView();
                break;
            case 'list':
                container.innerHTML = this.renderListView();
                break;
        }

        this.updateCalendarTitle();
        this.renderMiniCalendar();
    }

    // Рендер месячного вида
    renderMonthView() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        let html = `
            <div class="card p-6">
                <div class="grid grid-cols-7 gap-2 mb-4">
                    ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => `
                        <div class="text-center font-semibold text-gray-600 py-2">${day}</div>
                    `).join('')}
                </div>
                <div class="grid grid-cols-7 gap-2">
        `;

        const currentDate = new Date(startDate);
        for (let i = 0; i < 42; i++) {
            const dayEvents = this.getEvents({ 
                date: currentDate.toISOString().split('T')[0]
            });
            
            const isCurrentMonth = currentDate.getMonth() === month;
            const isToday = currentDate.toDateString() === new Date().toDateString();
            
            html += `
                <div class="min-h-24 p-2 border border-gray-200 rounded-lg ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${isToday ? 'border-blue-500 border-2' : ''}">
                    <div class="flex justify-between items-start mb-1">
                        <span class="text-sm font-medium ${
                            isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        } ${isToday ? 'text-blue-600 font-bold' : ''}">
                            ${currentDate.getDate()}
                        </span>
                        ${dayEvents.length > 0 ? `
                            <span class="text-xs bg-blue-500 text-white rounded-full px-2 py-1">
                                ${dayEvents.length}
                            </span>
                        ` : ''}
                    </div>
                    <div class="space-y-1 max-h-20 overflow-y-auto">
                        ${dayEvents.slice(0, 3).map(event => `
                            <div class="text-xs p-1 rounded ${this.getCategoryColor(event.category)} text-white cursor-pointer hover:opacity-80"
                                 onclick="calendarSystem.viewEvent(${event.id})">
                                ${event.title}
                            </div>
                        `).join('')}
                        ${dayEvents.length > 3 ? `
                            <div class="text-xs text-gray-500 text-center">
                                +${dayEvents.length - 3} ещё
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            currentDate.setDate(currentDate.getDate() + 1);
        }

        html += `</div></div>`;
        return html;
    }

    // Рендер недельного вида
    renderWeekView() {
        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(this.currentDate.getDate() - this.currentDate.getDay() + 1);
        
        let html = `
            <div class="card p-6">
                <div class="grid grid-cols-8 gap-2">
                    <div class="font-semibold text-gray-600 py-2">Время</div>
                    ${Array.from({ length: 7 }, (_, i) => {
                        const date = new Date(startOfWeek);
                        date.setDate(startOfWeek.getDate() + i);
                        return `
                            <div class="text-center font-semibold text-gray-600 py-2">
                                <div>${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i]}</div>
                                <div class="text-sm ${date.toDateString() === new Date().toDateString() ? 'text-blue-600 font-bold' : ''}">
                                    ${date.getDate()}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
        `;

        // Часы дня
        for (let hour = 8; hour < 20; hour++) {
            html += `<div class="grid grid-cols-8 gap-2 border-t border-gray-200">`;
            html += `<div class="py-2 text-sm text-gray-500 text-right pr-2">${hour}:00</div>`;
            
            for (let day = 0; day < 7; day++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + day);
                date.setHours(hour);
                
                const hourEvents = this.getEvents({
                    startDate: date.toISOString(),
                    endDate: new Date(date.getTime() + 60 * 60 * 1000).toISOString()
                });
                
                html += `
                    <div class="min-h-12 p-1 relative">
                        ${hourEvents.map(event => `
                            <div class="text-xs p-1 rounded ${this.getCategoryColor(event.category)} text-white mb-1 cursor-pointer hover:opacity-80"
                                 onclick="calendarSystem.viewEvent(${event.id})">
                                ${event.title}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
            
            html += `</div>`;
        }

        html += `</div>`;
        return html;
    }

    // Рендер дневного вида
    renderDayView() {
        const dayEvents = this.getEvents({ date: this.currentDate.toISOString().split('T')[0] });
        
        let html = `
            <div class="card p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4">
                    ${this.currentDate.toLocaleDateString('ru-RU', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </h3>
        `;

        if (dayEvents.length === 0) {
            html += `
                <div class="text-center py-8">
                    <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                        <i data-feather="calendar" class="w-8 h-8"></i>
                    </div>
                    <h4 class="text-lg font-bold text-gray-800 mb-2">Событий нет</h4>
                    <p class="text-gray-600">На этот день не запланировано мероприятий</p>
                </div>
            `;
        } else {
            html += `
                <div class="space-y-4">
                    ${dayEvents.map(event => `
                        <div class="border-l-4 ${this.getCategoryColor(event.category)} p-4 bg-gray-50 rounded-r-lg">
                            <div class="flex justify-between items-start">
                                <h4 class="font-semibold text-gray-800">${event.title}</h4>
                                <span class="text-sm text-gray-500">
                                    ${new Date(event.startDate).toLocaleTimeString('ru-RU', { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </span>
                            </div>
                            <p class="text-gray-600 text-sm mt-1">${event.description}</p>
                            <div class="flex items-center justify-between mt-2">
                                <span class="text-sm text-gray-500">${event.organization}</span>
                                <button onclick="calendarSystem.viewEvent(${event.id})" class="btn btn-glass btn-xs">
                                    Подробнее
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        html += `</div>`;
        return html;
    }

    // Рендер списка
    renderListView() {
        const events = this.getEvents();
        
        let html = `
            <div class="card p-6">
                <h3 class="text-lg font-bold text-gray-800 mb-4">Все события</h3>
        `;

        if (events.length === 0) {
            html += `
                <div class="text-center py-8">
                    <div class="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                        <i data-feather="calendar" class="w-8 h-8"></i>
                    </div>
                    <h4 class="text-lg font-bold text-gray-800 mb-2">Событий нет</h4>
                    <p class="text-gray-600">Добавьте первое событие в календарь</p>
                </div>
            `;
        } else {
            html += `
                <div class="space-y-4">
                    ${events.map(event => `
                        <div class="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                            <div class="bg-gradient-to-r ${this.getCategoryColor(event.category)} text-white rounded-xl p-3 text-center w-20 mr-4 shadow-lg">
                                <div class="text-lg font-bold">${new Date(event.startDate).getDate()}</div>
                                <div class="text-xs uppercase">${new Date(event.startDate).toLocaleString('ru', { month: 'short' })}</div>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-semibold text-gray-800 mb-1">${event.title}</h4>
                                <p class="text-gray-600 text-sm mb-2">${event.description}</p>
                                <div class="flex items-center text-sm text-gray-500 space-x-4">
                                    <span class="flex items-center">
                                        <i data-feather="map-pin" class="w-4 h-4 mr-1"></i>
                                        ${event.address}, ${event.city}
                                    </span>
                                    <span class="flex items-center">
                                        <i data-feather="clock" class="w-4 h-4 mr-1"></i>
                                        ${new Date(event.startDate).toLocaleTimeString('ru-RU', { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                    <span>${event.organization}</span>
                                </div>
                            </div>
                            <button onclick="calendarSystem.viewEvent(${event.id})" class="btn btn-glass btn-sm ml-4">
                                Подробнее
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        html += `</div>`;
        return html;
    }

    // Рендер мини-календаря
    renderMiniCalendar() {
        const miniCalendar = document.getElementById('miniCalendar');
        if (!miniCalendar) return;

        const today = new Date();
        const currentMonth = this.currentDate.getMonth();
        const currentYear = this.currentDate.getFullYear();
        const firstDay = new Date(currentYear, currentMonth, 1);
        
        let html = '';
        
        // Дни недели
        html += `<div class="grid grid-cols-7 gap-1 mb-2">`;
        ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].forEach(day => {
            html += `<div class="text-xs text-center text-gray-500">${day}</div>`;
        });
        html += `</div>`;
        
        // Дни месяца
        html += `<div class="grid grid-cols-7 gap-1">`;
        
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay() + 1);
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = date.getMonth() === currentMonth;
            const isToday = date.toDateString() === today.toDateString();
            const hasEvents = this.getEvents({ date: date.toISOString().split('T')[0] }).length > 0;
            
            html += `
                <div class="text-xs text-center p-1 rounded cursor-pointer ${
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                } ${
                    isToday ? 'bg-blue-500 text-white' : ''
                } ${
                    hasEvents && isCurrentMonth ? 'font-bold' : ''
                }"
                     onclick="calendarSystem.selectDate('${date.toISOString()}')">
                    ${date.getDate()}
                </div>
            `;
        }
        
        html += `</div>`;
        
        miniCalendar.innerHTML = html;
        feather.replace();
    }

    // Выбор даты в мини-календаре
    selectDate(dateString) {
        this.currentDate = new Date(dateString);
        this.setView('day');
    }

    // Просмотр события
    viewEvent(eventId) {
        const events = this.getEvents();
        const event = events.find(e => e.id == eventId);
        
        if (!event) return;

        const viewEventTitle = document.getElementById('viewEventTitle');
        const viewEventContent = document.getElementById('viewEventContent');
        
        if (viewEventTitle) viewEventTitle.textContent = event.title;
        
        if (viewEventContent) {
            viewEventContent.innerHTML = `
                <div class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <strong class="text-gray-700">Дата и время:</strong>
                            <p>${new Date(event.startDate).toLocaleString('ru-RU')}</p>
                        </div>
                        <div>
                            <strong class="text-gray-700">Город:</strong>
                            <p>${event.city}</p>
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <strong class="text-gray-700">Категория:</strong>
                            <p><span class="${this.getCategoryColor(event.category)} text-white px-2 py-1 rounded-full text-sm">${event.category}</span></p>
                        </div>
                        <div>
                            <strong class="text-gray-700">Адрес:</strong>
                            <p>${event.address}</p>
                        </div>
                    </div>
                    
                    <div>
                        <strong class="text-gray-700">Описание:</strong>
                        <p class="text-gray-600">${event.description}</p>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-4">
                        <div>
                            <strong class="text-gray-700">Организатор:</strong>
                            <p>${event.organization}</p>
                        </div>
                        <div>
                            <strong class="text-gray-700">Контакт:</strong>
                            <p>${event.contactEmail || 'Не указан'}<br>${event.contactPhone || 'Не указан'}</p>
                        </div>
                    </div>
                    
                    <div class="flex justify-end space-x-3 pt-4">
                        <button onclick="calendarSystem.closeViewEventModal()" class="btn btn-border">
                            Закрыть
                        </button>
                        ${this.canEditEvent(event) ? `
                            <button onclick="calendarSystem.editEvent(${event.id})" class="btn btn-primary">
                                Редактировать
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        const viewEventModal = document.getElementById('viewEventModal');
        if (viewEventModal) {
            viewEventModal.classList.remove('hidden');
        }
        feather.replace();
    }

    // Проверка прав на редактирование
    canEditEvent(event) {
        const currentUser = this.getCurrentUser();
        return currentUser && (
            currentUser.type === 'nko' || 
            event.createdBy === currentUser.email
        );
    }

    // Обновление статистики
    updateStats() {
        const statsContainer = document.getElementById('calendarStats');
        if (!statsContainer) return;

        const events = this.getEvents();
        const today = new Date().toISOString().split('T')[0];
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const todayEvents = events.filter(event => 
            event.startDate.split('T')[0] === today
        ).length;

        const weekEvents = events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate >= weekStart && eventDate <= weekEnd;
        }).length;

        const monthEvents = events.filter(event => {
            const eventDate = new Date(event.startDate);
            return eventDate.getMonth() === this.currentDate.getMonth() &&
                   eventDate.getFullYear() === this.currentDate.getFullYear();
        }).length;

        statsContainer.innerHTML = `
            <div class="flex justify-between items-center">
                <span class="text-gray-600">Сегодня</span>
                <span class="font-bold text-blue-600">${todayEvents}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-600">На неделе</span>
                <span class="font-bold text-green-600">${weekEvents}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-600">В этом месяце</span>
                <span class="font-bold text-purple-600">${monthEvents}</span>
            </div>
            <div class="flex justify-between items-center">
                <span class="text-gray-600">Всего</span>
                <span class="font-bold text-orange-600">${events.length}</span>
            </div>
        `;
    }

    // Обновление заголовка календаря
    updateCalendarTitle() {
        const title = document.getElementById('calendarTitle');
        if (!title) return;

        const cityText = this.selectedCity ? ` в ${this.selectedCity}` : '';
        
        switch (this.currentView) {
            case 'month':
                title.textContent = `${this.currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}${cityText}`;
                break;
            case 'week':
                title.textContent = `Неделя${cityText}`;
                break;
            case 'day':
                title.textContent = `${this.currentDate.toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${cityText}`;
                break;
            case 'list':
                title.textContent = `Все события${cityText}`;
                break;
        }
    }

    // Цвета категорий
    getCategoryColor(category) {
        const colors = {
            'Экология': 'bg-green-500',
            'Спорт': 'bg-red-500',
            'Образование': 'bg-blue-500',
            'Социальная помощь': 'bg-purple-500',
            'Благоустройство': 'bg-orange-500',
            'Культура': 'bg-pink-500'
        };
        return colors[category] || 'bg-gray-500';
    }

    // Навигация по календарю
    previousPeriod() {
        switch (this.currentView) {
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                break;
            case 'week':
                this.currentDate.setDate(this.currentDate.getDate() - 7);
                break;
            case 'day':
                this.currentDate.setDate(this.currentDate.getDate() - 1);
                break;
        }
        this.renderCalendar();
    }

    nextPeriod() {
        switch (this.currentView) {
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                break;
            case 'week':
                this.currentDate.setDate(this.currentDate.getDate() + 7);
                break;
            case 'day':
                this.currentDate.setDate(this.currentDate.getDate() + 1);
                break;
        }
        this.renderCalendar();
    }

    resetCalendar() {
        this.currentDate = new Date();
        this.renderCalendar();
    }

    // Быстрая навигация
    showTodayEvents() {
        this.currentDate = new Date();
        this.setView('day');
    }

    showWeekEvents() {
        this.currentDate = new Date();
        this.setView('week');
    }

    showMonthEvents() {
        this.currentDate = new Date();
        this.setView('month');
    }

    // Модальные окна
    openAddEventModal() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) {
            this.showNotification('Для добавления событий необходимо войти в систему', 'error');
            return;
        }

        // Заполняем организацию для НКО
        if (currentUser.type === 'nko') {
            const orgInput = document.getElementById('eventOrganization');
            const emailInput = document.getElementById('eventContactEmail');
            const phoneInput = document.getElementById('eventContactPhone');
            
            if (orgInput) orgInput.value = currentUser.orgName;
            if (emailInput) emailInput.value = currentUser.contactEmail;
            if (phoneInput) phoneInput.value = currentUser.contactPhone;
        }

        // Устанавливаем текущую дату и время
        const now = new Date();
        const localDateTime = now.toISOString().slice(0, 16);
        const startDateInput = document.getElementById('eventStartDate');
        const endDateInput = document.getElementById('eventEndDate');
        
        if (startDateInput) startDateInput.value = localDateTime;
        if (endDateInput) endDateInput.value = localDateTime;

        const modal = document.getElementById('addEventModal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    closeAddEventModal() {
        const modal = document.getElementById('addEventModal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        const form = document.getElementById('eventForm');
        if (form) {
            form.reset();
        }
    }

    closeViewEventModal() {
        const modal = document.getElementById('viewEventModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    // Функция показа уведомления
    showNotification(message, type = 'success') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Глобальная инициализация
const calendarSystem = new CalendarSystem();

// Глобальные функции для вызова из HTML
function setView(view) {
    calendarSystem.setView(view);
}

function previousPeriod() {
    calendarSystem.previousPeriod();
}

function nextPeriod() {
    calendarSystem.nextPeriod();
}

function resetCalendar() {
    calendarSystem.resetCalendar();
}

function showTodayEvents() {
    calendarSystem.showTodayEvents();
}

function showWeekEvents() {
    calendarSystem.showWeekEvents();
}

function showMonthEvents() {
    calendarSystem.showMonthEvents();
}

function openAddEventModal() {
    calendarSystem.openAddEventModal();
}

function closeAddEventModal() {
    calendarSystem.closeAddEventModal();
}

function closeViewEventModal() {
    calendarSystem.closeViewEventModal();
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    feather.replace();
});