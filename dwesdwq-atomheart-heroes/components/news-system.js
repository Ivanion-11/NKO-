
// news-system.js - расширенная версия с администрированием
class NewsSystem {
    constructor() {
        this.newsKey = 'platformNews';
        this.initNews();
    }

    initNews() {
        if (!localStorage.getItem(this.newsKey)) {
            // Примерные начальные новости
            const initialNews = [
                {
                    id: 1,
                    title: "Запуск платформы AtomHeart Heroes",
                    content: "Мы рады представить новую платформу для волонтеров и НКО городов Росатома. Теперь все добрые дела вашего города в одном месте!",
                    excerpt: "Новая платформа для волонтеров и НКО городов Росатома",
                    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
                    author: "Администрация платформы",
                    date: "2024-01-15",
                    city: "all",
                    category: "platform",
                    tags: ["запуск", "новости", "платформа"],
                    files: [],
                    status: "published",
                    views: 245,
                    createdAt: new Date("2024-01-15").toISOString()
                },
                {
                    id: 2,
                    title: "Экологический субботник в Дубне",
                    content: "В прошедшие выходные в Дубне состоялся масштабный экологический субботник. Более 100 волонтеров приняли участие в уборке городского парка и прибрежной зоны.",
                    excerpt: "Более 100 волонтеров приняли участие в уборке городского парка",
                    image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                    author: "Эко-Дубна",
                    date: "2024-01-10",
                    city: "Дубна",
                    category: "ecology",
                    tags: ["экология", "субботник", "Дубна"],
                    files: [],
                    status: "published",
                    views: 156,
                    createdAt: new Date("2024-01-10").toISOString()
                }
            ];
            localStorage.setItem(this.newsKey, JSON.stringify(initialNews));
        }
    }

    // Добавление новости (только для администраторов)
    addNews(newsData) {
        const currentUser = this.getCurrentUser();
        
        // Проверка прав администратора
        if (!currentUser || !currentUser.isAdmin) {
            throw new Error("Только администраторы могут добавлять новости");
        }

        const news = this.getNews();
        const newItem = {
            id: Date.now(),
            ...newsData,
            author: currentUser.name || "Администратор",
            createdAt: new Date().toISOString(),
            status: newsData.status || "published",
            views: 0
        };
        
        news.unshift(newItem);
        this.saveNews(news);
        return newItem;
    }

    // Обновление новости
    updateNews(newsId, updates) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            throw new Error("Только администраторы могут редактировать новости");
        }

        const news = this.getNews();
        const newsIndex = news.findIndex(item => item.id == newsId);
        
        if (newsIndex !== -1) {
            news[newsIndex] = { ...news[newsIndex], ...updates };
            this.saveNews(news);
            return news[newsIndex];
        }
        return null;
    }

    // Удаление новости
    deleteNews(newsId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            throw new Error("Только администраторы могут удалять новости");
        }

        const news = this.getNews();
        const filteredNews = news.filter(item => item.id != newsId);
        this.saveNews(filteredNews);
        return true;
    }

    // Получение новостей с фильтрацией
    getNews(filters = {}) {
        let news = JSON.parse(localStorage.getItem(this.newsKey) || '[]');
        
        // Фильтрация по городу
        if (filters.city && filters.city !== 'all') {
            news = news.filter(item => item.city === filters.city || item.city === 'all');
        }
        
        // Фильтрация по категории
        if (filters.category && filters.category !== 'all') {
            news = news.filter(item => item.category === filters.category);
        }

        // Фильтрация по статусу
        if (filters.status) {
            news = news.filter(item => item.status === filters.status);
        } else {
            // По умолчанию показываем только опубликованные
            news = news.filter(item => item.status === 'published');
        }

        // Фильтрация по поисковому запросу
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            news = news.filter(item => 
                item.title.toLowerCase().includes(searchTerm) ||
                item.content.toLowerCase().includes(searchTerm) ||
                item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Сортировка по дате (новые сначала)
        return news.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Получение одной новости по ID
    getNewsById(id) {
        const news = this.getNews();
        const newsItem = news.find(item => item.id == id);
        
        if (newsItem) {
            // Увеличиваем счетчик просмотров
            newsItem.views = (newsItem.views || 0) + 1;
            this.updateNews(id, { views: newsItem.views });
        }
        
        return newsItem;
    }

    // Получение популярных новостей
    getPopularNews(limit = 5) {
        const news = this.getNews();
        return news
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, limit);
    }

    // Получение новостей по категории
    getNewsByCategory(category, limit = 10) {
        return this.getNews({ category }).slice(0, limit);
    }

    // Сохранение новостей
    saveNews(news) {
        localStorage.setItem(this.newsKey, JSON.stringify(news));
    }

    // Получение текущего пользователя
    getCurrentUser() {
        // В реальном приложении здесь должна быть проверка авторизации
        const currentVolunteer = JSON.parse(localStorage.getItem('currentVolunteer') || 'null');
        const nkoData = JSON.parse(localStorage.getItem('nkoRegistration') || 'null');
        
        // Проверяем, является ли пользователь администратором
        // В демо-версии можно добавить флаг isAdmin в данные пользователя
        if (currentVolunteer && currentVolunteer.isAdmin) {
            return { ...currentVolunteer, type: 'volunteer' };
        }
        
        // Возвращаем null если пользователь не администратор
        return null;
    }

    // Получение категорий новостей
    getCategories() {
        return [
            { value: 'all', label: 'Все категории', icon: 'grid' },
            { value: 'platform', label: 'Новости платформы', icon: 'award' },
            { value: 'ecology', label: 'Экология', icon: 'leaf' },
            { value: 'sport', label: 'Спорт', icon: 'activity' },
            { value: 'education', label: 'Образование', icon: 'book' },
            { value: 'social', label: 'Социальная помощь', icon: 'heart' },
            { value: 'culture', label: 'Культура', icon: 'music' },
            { value: 'volunteer', label: 'Волонтерство', icon: 'users' }
        ];
    }

    // Получение городов для фильтрации
    getCities() {
        return [
            { value: 'all', label: 'Все города' },
            { value: 'Дубна', label: 'Дубна' },
            { value: 'Сосновый Бор', label: 'Сосновый Бор' },
            { value: 'Новоуральск', label: 'Новоуральск' },
            { value: 'Озёрск', label: 'Озёрск' },
            { value: 'Обнинск', label: 'Обнинск' },
            { value: 'Саров', label: 'Саров' }
        ];
    }
}

// Инициализация системы новостей
const newsSystem = new NewsSystem();
