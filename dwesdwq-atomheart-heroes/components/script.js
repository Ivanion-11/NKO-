// script.js - основной файл скриптов

// Инициализация анимаций
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Feather Icons
    feather.replace();
    
    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами с анимацией
    document.querySelectorAll('.fade-in-up').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(40px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
    });

    // Создание дополнительных частиц
    createParticles();
    
    // Анимация карточек при наведении
    initCardAnimations();
    
    // Проверяем авторизацию и обновляем интерфейс
    checkAuthAndUpdateUI();
});

// Создание частиц
function createParticles() {
    const container = document.querySelector('.particles-container');
    if (!container) return;
    
    const particleCount = 8;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 6 + 2;
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        const delay = Math.random() * 20;
        const duration = Math.random() * 20 + 20;
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${posX}%`;
        particle.style.top = `${posY}%`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        
        // Случайный цвет частицы
        const colors = [
            'rgba(102, 126, 234, 0.6)',
            'rgba(139, 92, 246, 0.5)',
            'rgba(6, 182, 212, 0.7)',
            'rgba(245, 158, 11, 0.5)',
            'rgba(239, 68, 68, 0.4)',
            'rgba(16, 185, 129, 0.5)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        container.appendChild(particle);
    }
}

// Анимация карточек
function initCardAnimations() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        // Задержка для stagger эффекта
        card.style.transitionDelay = `${index * 0.1}s`;
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Плавная прокрутка
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Добавляем обработчики для плавной прокрутки
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            smoothScrollTo(this.getAttribute('href'));
        });
    });
});

// Функция для показа уведомлений
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    notification.className = `fixed top-6 right-6 ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl transform translate-x-full transition-transform duration-500 z-50`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i data-feather="${type === 'success' ? 'check' : type === 'error' ? 'x' : 'info'}" class="w-5 h-5 mr-3"></i>
            <span class="font-semibold">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    feather.replace();
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 4000);
}

// Функция для проверки авторизации и обновления интерфейса
function checkAuthAndUpdateUI() {
    const currentVolunteer = JSON.parse(localStorage.getItem('currentVolunteer') || 'null');
    const navbar = document.querySelector('custom-navbar');
    
    if (currentVolunteer && navbar) {
        // Обновляем навбар
        if (navbar.checkAuth) {
            navbar.checkAuth();
        }
        
        // Обновляем CTA секцию если находимся на главной
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            if (navbar.updateCTASection) {
                navbar.updateCTASection();
            }
        }
    }
}

// 🌟 ФУНКЦИИ ДЛЯ АНИМАЦИЙ КНОПОК

// Функция для показа анимации загрузки
function showButtonLoading(button) {
    // Сохраняем оригинальный текст
    const originalHTML = button.innerHTML;
    const originalClasses = button.className;
    
    // Добавляем анимацию загрузки
    button.innerHTML = '<i data-feather="loader" class="w-6 h-6"></i>';
    button.classList.add('btn-loading');
    button.disabled = true;
    
    // Обновляем иконки
    feather.replace();
    
    return {
        originalHTML,
        originalClasses,
        stop: function() {
            button.innerHTML = this.originalHTML;
            button.classList.remove('btn-loading');
            button.disabled = false;
            feather.replace();
        }
    };
}

// Функция для показа успешной анимации
function showButtonSuccess(button) {
    const originalHTML = button.innerHTML;
    
    button.innerHTML = '<i data-feather="check" class="w-6 h-6"></i>Успешно!';
    button.classList.remove('btn-primary', 'btn-accent');
    button.classList.add('btn-success', 'bg-green-500');
    
    feather.replace();
    
    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.classList.remove('btn-success', 'bg-green-500');
        button.classList.add('btn-primary');
        feather.replace();
    }, 2000);
}

// Автоматическая инициализация анимаций для кнопок с классом btn-hero
function initButtonAnimations() {
    const heroButtons = document.querySelectorAll('.btn-hero');
    
    heroButtons.forEach((button, index) => {
        // Добавляем задержку для stagger эффекта
        button.style.animationDelay = `${index * 0.2}s`;
        
        // Добавляем дополнительные эффекты при наведении
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initButtonAnimations();
});

// Пример использования для форм
function setupFormButtonAnimations() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        const submitButton = form.querySelector('button[type="submit"]');
        
        if (submitButton) {
            form.addEventListener('submit', function(e) {
                const loading = showButtonLoading(submitButton);
                
                // Имитация отправки формы
                setTimeout(() => {
                    loading.stop();
                    showButtonSuccess(submitButton);
                }, 2000);
            });
        }
    });
}

// Утилиты для работы с датами
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
        day: 'numeric', 
        month: 'long',
        year: 'numeric'
    });
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Валидация форм
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    return re.test(phone);
}

// Локальное хранилище
const storage = {
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },
    
    get: function(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },
    
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Error clearing localStorage:', e);
            return false;
        }
    }
};

// API для работы с событиями
const eventAPI = {
    getAll: function() {
        return storage.get('calendarEvents', []);
    },
    
    getByCity: function(city) {
        const events = this.getAll();
        return events.filter(event => event.city === city);
    },
    
    getByDate: function(date) {
        const events = this.getAll();
        const targetDate = new Date(date).toDateString();
        return events.filter(event => {
            const eventDate = new Date(event.startDate).toDateString();
            return eventDate === targetDate;
        });
    },
    
    create: function(eventData) {
        const events = this.getAll();
        const newEvent = {
            id: Date.now(),
            ...eventData,
            createdAt: new Date().toISOString(),
            status: 'active'
        };
        events.push(newEvent);
        storage.set('calendarEvents', events);
        return newEvent;
    },
    
    update: function(eventId, updates) {
        const events = this.getAll();
        const eventIndex = events.findIndex(event => event.id === eventId);
        if (eventIndex !== -1) {
            events[eventIndex] = { ...events[eventIndex], ...updates };
            storage.set('calendarEvents', events);
            return events[eventIndex];
        }
        return null;
    },
    
    delete: function(eventId) {
        const events = this.getAll();
        const filteredEvents = events.filter(event => event.id !== eventId);
        storage.set('calendarEvents', filteredEvents);
        return true;
    }
};

// Глобальные утилиты
window.utils = {
    formatDate,
    formatDateTime,
    validateEmail,
    validatePhone,
    storage,
    eventAPI,
    showNotification,
    smoothScrollTo,
    checkAuthAndUpdateUI
};

// Глобальные функции
window.checkAuthAndUpdateUI = checkAuthAndUpdateUI;
window.showNotification = showNotification;


function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    notification.className = `fixed top-6 right-6 ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl transform translate-x-full transition-transform duration-500 z-50`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i data-feather="${type === 'success' ? 'check' : type === 'error' ? 'x' : 'info'}" class="w-5 h-5 mr-3"></i>
            <span class="font-semibold">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    feather.replace();
    
    // Анимация появления
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Автоматическое скрытие
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 4000);
}

// Делаем функцию глобальной
window.showNotification = showNotification;