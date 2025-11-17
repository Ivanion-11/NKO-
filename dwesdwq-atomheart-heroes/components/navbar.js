// components/navbar.js - обновленная версия с календарем и новостями

class CustomNavbar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <nav class="bg-gray-900 border-b border-gray-800 backdrop-blur-lg bg-opacity-90 sticky top-0 z-40">
                <div class="container mx-auto px-4">
                    <div class="flex justify-between items-center py-4">
                        <!-- Логотип и название -->
                        <div class="flex items-center space-x-3">
                            <a href="index.html" class="flex items-center space-x-3 group">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    A
                                </div>
                                <div>
                                    <div class="text-white font-black text-xl leading-tight">AtomHeart</div>
                                    <div class="text-blue-300 text-sm font-medium">Heroes</div>
                                </div>
                            </a>
                        </div>

                        <!-- Основная навигация -->
                        <div class="hidden md:flex items-center space-x-1">
                            <a href="index.html" class="nav-link text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10">
                                <i data-feather="home" class="w-4 h-4 inline mr-2"></i>
                                Главная
                            </a>
                            <a href="calendar.html" class="nav-link text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10">
                                <i data-feather="calendar" class="w-4 h-4 inline mr-2"></i>
                                Календарь
                            </a>
                            <a href="cities.html" class="nav-link text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10">
                                <i data-feather="map-pin" class="w-4 h-4 inline mr-2"></i>
                                Города
                            </a>
                            <a href="nko.html" class="nav-link text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10">
                                <i data-feather="users" class="w-4 h-4 inline mr-2"></i>
                                НКО
                            </a>
                            <a href="events.html" class="nav-link text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10">
                                <i data-feather="activity" class="w-4 h-4 inline mr-2"></i>
                                Мероприятия
                            </a>
                            <a href="news.html" class="nav-link text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10">
                                <i data-feather="file-text" class="w-4 h-4 inline mr-2"></i>
                                Новости
                            </a>
                        </div>

                        <!-- Кнопки авторизации -->
                        <div class="flex items-center space-x-3" id="authLinks">
                            <!-- Содержимое будет обновлено динамически -->
                        </div>

                        <!-- Мобильное меню -->
                        <div class="md:hidden">
                            <button id="mobileMenuButton" class="text-gray-300 hover:text-white p-2">
                                <i data-feather="menu" class="w-6 h-6"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Мобильное меню (скрыто по умолчанию) -->
                <div id="mobileMenu" class="md:hidden hidden bg-gray-800 border-t border-gray-700">
                    <div class="container mx-auto px-4 py-4 space-y-3">
                        <a href="index.html" class="block nav-link text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                            <i data-feather="home" class="w-4 h-4 inline mr-3"></i>
                            Главная
                        </a>
                        <a href="calendar.html" class="block nav-link text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                            <i data-feather="calendar" class="w-4 h-4 inline mr-3"></i>
                            Календарь
                        </a>
                        <a href="cities.html" class="block nav-link text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                            <i data-feather="map-pin" class="w-4 h-4 inline mr-3"></i>
                            Города
                        </a>
                        <a href="nko.html" class="block nav-link text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                            <i data-feather="users" class="w-4 h-4 inline mr-3"></i>
                            НКО
                        </a>
                        <a href="events.html" class="block nav-link text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                            <i data-feather="activity" class="w-4 h-4 inline mr-3"></i>
                            Мероприятия
                        </a>
                        <a href="news.html" class="block nav-link text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                            <i data-feather="file-text" class="w-4 h-4 inline mr-3"></i>
                            Новости
                        </a>
                        <div class="border-t border-gray-700 pt-3 mt-3" id="mobileAuthLinks">
                            <!-- Мобильные кнопки авторизации -->
                        </div>
                    </div>
                </div>
            </nav>
        `;

        // Инициализируем мобильное меню
        this.initMobileMenu();
        // Проверяем авторизацию
        this.checkAuth();
        // Обновляем иконки
        feather.replace();
        
        // Добавляем обработчики для ссылок навигации
        this.setupNavigationHandlers();
    }

    setupNavigationHandlers() {
        // Обработчики для десктопных ссылок
        const navLinks = this.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href !== '#' && !href.startsWith('javascript')) {
                    // Проверяем существование страницы перед переходом
                    this.checkPageExists(href).then(exists => {
                        if (!exists) {
                            e.preventDefault();
                            this.showPageNotFoundMessage(href);
                        }
                    }).catch(() => {
                        // В случае ошибки разрешаем переход
                        console.log('Переход по ссылке:', href);
                    });
                }
            });
        });

        // Обработчик для мобильных ссылок
        const mobileLinks = this.querySelectorAll('#mobileMenu .nav-link');
        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href !== '#' && !href.startsWith('javascript')) {
                    this.checkPageExists(href).then(exists => {
                        if (!exists) {
                            e.preventDefault();
                            this.showPageNotFoundMessage(href);
                            // Закрываем мобильное меню
                            this.closeMobileMenu();
                        }
                    });
                }
            });
        });
    }

    // Проверка существования страницы
    async checkPageExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch (error) {
            console.warn('Не удалось проверить существование страницы:', url, error);
            return true; // Разрешаем переход в случае ошибки
        }
    }

    // Показать сообщение о ненайденной странице
    showPageNotFoundMessage(pageName) {
        const pageTitles = {
            'nko.html': 'НКО',
            'events.html': 'Мероприятия',
            'news.html': 'Новости',
            'calendar.html': 'Календарь',
            'cities.html': 'Города'
        };
        
        const title = pageTitles[pageName] || pageName;
        
        // Показываем уведомление
        if (typeof showNotification === 'function') {
            showNotification(`Страница "${title}" находится в разработке`, 'info');
        } else {
            alert(`Страница "${title}" находится в разработке. Скоро она будет доступна!`);
        }
    }

    initMobileMenu() {
        const menuButton = document.getElementById('mobileMenuButton');
        const mobileMenu = document.getElementById('mobileMenu');

        if (menuButton && mobileMenu) {
            menuButton.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            // Закрытие меню при клике вне его области
            document.addEventListener('click', (e) => {
                if (!this.contains(e.target) && !mobileMenu.classList.contains('hidden')) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuButton = document.getElementById('mobileMenuButton');
        
        if (mobileMenu && menuButton) {
            const isHidden = mobileMenu.classList.contains('hidden');
            if (isHidden) {
                this.openMobileMenu();
            } else {
                this.closeMobileMenu();
            }
        }
    }

    openMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuButton = document.getElementById('mobileMenuButton');
        
        if (mobileMenu && menuButton) {
            mobileMenu.classList.remove('hidden');
            menuButton.innerHTML = '<i data-feather="x" class="w-6 h-6"></i>';
            feather.replace();
        }
    }

    closeMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        const menuButton = document.getElementById('mobileMenuButton');
        
        if (mobileMenu && menuButton) {
            mobileMenu.classList.add('hidden');
            menuButton.innerHTML = '<i data-feather="menu" class="w-6 h-6"></i>';
            feather.replace();
        }
    }

    // Проверка авторизации волонтёра и НКО
    checkAuth() {
        const currentVolunteer = JSON.parse(localStorage.getItem('currentVolunteer') || 'null');
        const nkoLoggedIn = localStorage.getItem('nkoLoggedIn') === 'true';
        const nkoData = JSON.parse(localStorage.getItem('nkoRegistration') || 'null');
        
        this.updateAuthLinks(currentVolunteer, nkoLoggedIn, nkoData);
        this.updateMobileAuthLinks(currentVolunteer, nkoLoggedIn, nkoData);
        
        // Скрываем/показываем CTA блок в зависимости от авторизации
        if (currentVolunteer) {
            this.hideCTABlock();
        } else {
            this.showCTABlock();
        }
    }

    updateAuthLinks(currentVolunteer, nkoLoggedIn, nkoData) {
        const authLinks = document.getElementById('authLinks');
        
        if (authLinks) {
            if (currentVolunteer) {
                // Показать профиль волонтёра
                authLinks.innerHTML = `
                    <div class="hidden md:flex items-center space-x-3">
                        <div class="relative group">
                            <button onclick="toggleProfileMenu()" class="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                    ${currentVolunteer.fullName.charAt(0)}
                                </div>
                                <span class="text-sm font-medium">${currentVolunteer.fullName.split(' ')[0]}</span>
                                <i data-feather="chevron-down" class="w-4 h-4 transition-transform group-hover:rotate-180"></i>
                            </button>
                            
                            <!-- Выпадающее меню профиля -->
                            <div id="profileDropdown" class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 hidden group-hover:block hover:block z-50">
                                <a href="account.html" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                                    <i data-feather="user" class="w-4 h-4 mr-3"></i>
                                    Личный кабинет
                                </a>
                                <a href="#" onclick="logoutVolunteer()" class="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                                    <i data-feather="log-out" class="w-4 h-4 mr-3"></i>
                                    Выйти
                                </a>
                            </div>
                        </div>
                    </div>
                `;
                
            } else if (nkoLoggedIn && nkoData) {
                // Показать профиль НКО
                authLinks.innerHTML = `
                    <div class="hidden md:flex items-center space-x-3">
                        <a href="nko-dashboard.html" class="flex items-center space-x-2 text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10">
                            <div class="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                ${nkoData.orgName.substring(0, 2)}
                            </div>
                            <span class="text-sm font-medium">${nkoData.orgName}</span>
                        </a>
                        <a href="#" onclick="logoutNKO()" class="text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/10">
                            <i data-feather="log-out" class="w-4 h-4"></i>
                        </a>
                    </div>
                `;
            } else {
                // Показать кнопки регистрации и входа
                authLinks.innerHTML = `
                    <div class="hidden md:flex items-center space-x-3">
                        <a href="volunteer-login.html" class="text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10">
                            <i data-feather="log-in" class="w-4 h-4 inline mr-1"></i>
                            Войти
                        </a>
                        <a href="volunteer-register.html" class="btn btn-primary btn-sm">
                            Стать волонтёром
                        </a>
                        <a href="register-nko.html" class="btn btn-accent btn-sm">
                            Для НКО
                        </a>
                    </div>
                `;
            }
            feather.replace();
        }
    }

    updateMobileAuthLinks(currentVolunteer, nkoLoggedIn, nkoData) {
        const mobileAuthLinks = document.getElementById('mobileAuthLinks');
        
        if (mobileAuthLinks) {
            if (currentVolunteer) {
                mobileAuthLinks.innerHTML = `
                    <a href="account.html" class="block text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                        <i data-feather="user" class="w-4 h-4 inline mr-3"></i>
                        ${currentVolunteer.fullName}
                    </a>
                    <a href="#" onclick="logoutVolunteer()" class="block text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                        <i data-feather="log-out" class="w-4 h-4 inline mr-3"></i>
                        Выйти
                    </a>
                `;
            } else if (nkoLoggedIn && nkoData) {
                mobileAuthLinks.innerHTML = `
                    <a href="nko-dashboard.html" class="block text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                        <i data-feather="settings" class="w-4 h-4 inline mr-3"></i>
                        Панель НКО
                    </a>
                    <a href="#" onclick="logoutNKO()" class="block text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                        <i data-feather="log-out" class="w-4 h-4 inline mr-3"></i>
                        Выйти
                    </a>
                `;
            } else {
                mobileAuthLinks.innerHTML = `
                    <a href="volunteer-login.html" class="block text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                        <i data-feather="log-in" class="w-4 h-4 inline mr-3"></i>
                        Войти
                    </a>
                    <a href="volunteer-register.html" class="block text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                        <i data-feather="user-plus" class="w-4 h-4 inline mr-3"></i>
                        Стать волонтёром
                    </a>
                    <a href="register-nko.html" class="block text-gray-300 hover:text-white py-2 px-4 rounded-lg hover:bg-white/10 transition-all duration-200">
                        <i data-feather="users" class="w-4 h-4 inline mr-3"></i>
                        Для НКО
                    </a>
                `;
            }
            feather.replace();
        }
    }

    // Новый метод для скрытия CTA блока
    hideCTABlock() {
        const ctaBlock = document.getElementById('ctaBlock');
        if (ctaBlock) {
            ctaBlock.style.display = 'none';
        }
    }

    // Новый метод для показа CTA блока
    showCTABlock() {
        const ctaBlock = document.getElementById('ctaBlock');
        if (ctaBlock) {
            ctaBlock.style.display = 'block';
        }
    }

    // Обновление CTA секции на главной странице
    updateCTASection() {
        const currentVolunteer = JSON.parse(localStorage.getItem('currentVolunteer') || 'null');
        const ctaSection = document.getElementById('ctaSection');
        
        if (ctaSection && currentVolunteer) {
            ctaSection.innerHTML = `
                <section class="glass-dark rounded-3xl p-12 md:p-16 text-white mb-16 text-center fade-in-up">
                    <div class="relative z-10">
                        <div class="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-2xl shadow-2xl">
                            <i data-feather="check-circle" class="w-12 h-12"></i>
                        </div>
                        <h2 class="text-5xl md:text-6xl font-black mb-8 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent leading-tight">
                            Добро пожаловать,<br>${currentVolunteer.fullName.split(' ')[0]}!
                        </h2>
                        <p class="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed">
                            Теперь вы можете участвовать в мероприятиях,<br>отслеживать свою активность и находить новые возможности
                        </p>
                        <div class="flex flex-col sm:flex-row justify-center gap-6 stagger-animate">
                            <a href="events.html" class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-blue-600 hover:to-purple-700 border-2 border-transparent hover:border-white/30 gap-3 text-lg">
                                <i data-feather="calendar" class="w-6 h-6"></i>
                                Найти мероприятия
                            </a>
                            
                            <a href="account.html" class="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 gap-3 text-lg">
                                <i data-feather="user" class="w-6 h-6"></i>
                                Личный кабинет
                            </a>
                        </div>
                    </div>
                </section>
            `;
            feather.replace();
        } else if (ctaSection) {
            // Стандартная CTA для незарегистрированных пользователей
            const nkoLoggedIn = localStorage.getItem('nkoLoggedIn') === 'true';
            const nkoData = JSON.parse(localStorage.getItem('nkoRegistration') || 'null');
            
            if (nkoLoggedIn && nkoData) {
                // Если НКО зарегистрирована, показываем другой контент
                ctaSection.innerHTML = `
                    <section class="glass-dark rounded-3xl p-12 md:p-16 text-white mb-16 text-center fade-in-up">
                        <div class="relative z-10">
                            <div class="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white text-2xl shadow-2xl">
                                <i data-feather="check-circle" class="w-12 h-12"></i>
                            </div>
                            <h2 class="text-5xl md:text-6xl font-black mb-8 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent leading-tight">
                                Ваша организация<br>зарегистрирована!
                            </h2>
                            <p class="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed">
                                Теперь вы можете создавать мероприятия, управлять волонтёрами<br>и отслеживать статистику вашей организации
                            </p>
                            <div class="flex flex-col sm:flex-row justify-center gap-6 stagger-animate">
                                <a href="nko-dashboard.html" class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-green-600 hover:to-blue-600 border-2 border-transparent hover:border-white/30 gap-3 text-lg">
                                    <i data-feather="settings" class="w-6 h-6"></i>
                                    Перейти в панель управления
                                </a>
                                
                                <a href="calendar.html" class="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 gap-3 text-lg">
                                    <i data-feather="calendar" class="w-6 h-6"></i>
                                    Календарь событий
                                </a>
                            </div>
                        </div>
                    </section>
                `;
            } else {
                // Стандартная CTA
                ctaSection.innerHTML = `
                    <section class="glass-dark rounded-3xl p-12 md:p-16 text-white mb-16 text-center fade-in-up">
                        <div class="relative z-10">
                            <div class="w-24 h-24 mx-auto mb-8 rounded-3xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-2xl">
                                <i data-feather="heart" class="w-12 h-12"></i>
                            </div>
                            <h2 class="text-5xl md:text-6xl font-black mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent leading-tight">
                                Станьте частью<br>добрых дел!
                            </h2>
                            <p class="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 leading-relaxed">
                                Присоединяйтесь к волонтёрскому движению в вашем городе<br>или зарегистрируйте свою организацию
                            </p>
                            <div class="flex flex-col sm:flex-row justify-center gap-6 stagger-animate">
                                <!-- Кнопка 1 - Стать волонтёром -->
                                <a href="volunteer-register.html" class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-blue-600 hover:to-purple-700 border-2 border-transparent hover:border-white/30 gap-3 text-lg">
                                    <i data-feather="heart" class="w-6 h-6"></i>
                                    Стать волонтёром
                                </a>
                                
                                <!-- Кнопка 2 - Зарегистрировать НКО -->
                                <a href="register-nko.html" class="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:from-cyan-600 hover:to-blue-600 border-2 border-transparent hover:border-white/30 gap-3 text-lg">
                                    <i data-feather="users" class="w-6 h-6"></i>
                                    Зарегистрировать НКО
                                </a>
                                
                                <!-- Кнопка 3 - Панель НКО -->
                                <a href="nko-dashboard.html" class="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 hover:bg-white/20 border-2 border-white/20 hover:border-white/40 gap-3 text-lg">
                                    <i data-feather="settings" class="w-6 h-6"></i>
                                    Панель НКО
                                </a>
                            </div>
                        </div>
                    </section>
                `;
            }
            feather.replace();
        }
    }

    // Получение текущего волонтера
    getCurrentVolunteer() {
        return JSON.parse(localStorage.getItem('currentVolunteer') || 'null');
    }

    // Обновление активной ссылки в навигации
    updateActiveNavLink() {
        const currentPath = window.location.pathname;
        const navLinks = this.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (currentPath.endsWith(href) || (currentPath === '/' && href === 'index.html')) {
                link.classList.add('bg-white/20', 'text-white');
                link.classList.remove('text-gray-300', 'hover:bg-white/10');
            } else {
                link.classList.remove('bg-white/20', 'text-white');
                link.classList.add('text-gray-300', 'hover:bg-white/10');
            }
        });
    }
}

// Функция выхода для волонтёра
function logoutVolunteer() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem('currentVolunteer');
        window.location.href = 'index.html';
    }
}

// Функция выхода для НКО
function logoutNKO() {
    if (confirm('Вы уверены, что хотите выйти из панели НКО?')) {
        localStorage.removeItem('nkoLoggedIn');
        window.location.href = 'index.html';
    }
}

// Функция для переключения меню профиля
function toggleProfileMenu() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('hidden');
    }
}

// Закрытие меню при клике вне его
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('profileDropdown');
    const profileButton = document.querySelector('[onclick="toggleProfileMenu()"]');
    
    if (dropdown && profileButton) {
        if (!dropdown.contains(e.target) && !profileButton.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    }
});

// Функция для проверки авторизации и обновления интерфейса
function checkAuthAndUpdateUI() {
    const currentVolunteer = JSON.parse(localStorage.getItem('currentVolunteer') || 'null');
    const navbar = document.querySelector('custom-navbar');
    
    if (currentVolunteer && navbar) {
        // Обновляем навбар
        navbar.checkAuth();
        
        // Обновляем CTA секцию если находимся на главной
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            if (navbar.updateCTASection) {
                navbar.updateCTASection();
            }
        }
    }
}

// Функция для показа уведомлений (если не определена в script.js)
if (typeof showNotification === 'undefined') {
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : 
                       type === 'error' ? 'bg-red-500' : 
                       type === 'info' ? 'bg-blue-500' : 'bg-gray-500';
        
        notification.className = `fixed top-6 right-6 ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl transform translate-x-full transition-transform duration-500 z-50`;
        notification.innerHTML = `
            <div class="flex items-center">
                <i data-feather="${type === 'success' ? 'check' : type === 'error' ? 'x' : 'info'}" class="w-5 h-5 mr-3"></i>
                <span class="font-semibold">${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        if (typeof feather !== 'undefined') {
            feather.replace();
        }
        
        // Анимация появления
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);
        
        // Автоматическое скрытие
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }
    window.showNotification = showNotification;
}

// Проверяем авторизацию при загрузке
document.addEventListener('DOMContentLoaded', function() {
    // Регистрируем кастомный элемент
    if (!customElements.get('custom-navbar')) {
        customElements.define('custom-navbar', CustomNavbar);
    }
    
    // Обновляем интерфейс
    setTimeout(() => {
        checkAuthAndUpdateUI();
        
        // Обновляем активные ссылки в навигации
        const navbar = document.querySelector('custom-navbar');
        if (navbar && navbar.updateActiveNavLink) {
            navbar.updateActiveNavLink();
        }
    }, 100);
});

// Глобальные функции для использования в других файлах
window.logoutVolunteer = logoutVolunteer;
window.logoutNKO = logoutNKO;
window.checkAuthAndUpdateUI = checkAuthAndUpdateUI;
window.toggleProfileMenu = toggleProfileMenu;