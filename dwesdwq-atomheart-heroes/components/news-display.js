
// news-display.js - компонент для отображения и управления новостями
class NewsDisplay {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 6;
        this.currentFilters = {
            city: 'all',
            category: 'all',
            search: ''
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadNews();
        this.updateCategoryCounts();
        this.checkAdminRights();
    }

    setupEventListeners() {
        // Фильтры
        document.getElementById('cityFilter').addEventListener('change', (e) => {
            this.currentFilters.city = e.target.value;
            this.loadNews();
        });

        document.getElementById('categoryFilter').addEventListener('change', (e) => {
            this.currentFilters.category = e.target.value;
            this.loadNews();
        });

        document.getElementById('newsSearch').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.loadNews();
        });

        // Кнопки категорий в боковой панели
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.currentFilters.category = category;
                document.getElementById('categoryFilter').value = category;
                this.loadNews();
            });
        });

        // Форма добавления/редактирования новости
        document.getElementById('newsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveNews();
        });
    }

    loadNews() {
        const news = newsSystem.getNews(this.currentFilters);
        this.displayNews(news);
        this.displayPopularNews();
        this.updatePagination(news.length);
    }

    displayNews(news) {
        const container = document.getElementById('newsContainer');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const paginatedNews = news.slice(startIndex, startIndex + this.itemsPerPage);

        if (paginatedNews.length === 0) {
            container.innerHTML = this.getNoNewsHTML();
            return;
        }

        container.innerHTML = paginatedNews.map(item => this.createNewsCard(item)).join('');
        feather.replace();
    }

    createNewsCard(newsItem) {
        const isAdmin = newsSystem.getCurrentUser();
        const cityBadge = newsItem.city === 'all' ? 
            '<span class="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">Все города</span>' :
            `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">${newsItem.city}</span>`;

        return `
            <div class="card p-6 mb-6 group hover:scale-105 transition-all duration-300">
                <div class="flex flex-col lg:flex-row gap-6">
                    ${newsItem.image ? `
                    <div class="lg:w-1/3">
                        <img src="${newsItem.image}" alt="${newsItem.title}" 
                             class="w-full h-48 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                    </div>
                    ` : ''}
                    
                    <div class="${newsItem.image ? 'lg:w-2/3' : 'w-full'}">
                        <div class="flex flex-wrap items-center gap-2 mb-3">
                            ${cityBadge}
                            <span class="${this.getCategoryColorClass(newsItem.category)} text-white px-2 py-1 rounded-full text-xs font-medium">
                                ${this.getCategoryLabel(newsItem.category)}
                            </span>
                            <span class="text-gray-500 text-sm">${this.formatDate(newsItem.date)}</span>
                            <span class="text-gray-500 text-sm flex items-center">
                                <i data-feather="eye" class="w-4 h-4 mr-1"></i>
                                ${newsItem.views || 0}
                            </span>
                        </div>
                        
                        <h3 class="text-xl font-bold text-gray-800 mb-3 group-hover:text-blue-600 transition-colors">
                            <a href="javascript:void(0)" onclick="newsDisplay.viewNews(${newsItem.id})">
                                ${newsItem.title}
                            </a>
                        </h3>
                        
                        <p class="text-gray-600 mb-4 leading-relaxed">${newsItem.excerpt}</p>
                        
                        <div class="flex flex-wrap gap-2 mb-4">
                            ${newsItem.tags.map(tag => `
                                <span class="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">#${tag}</span>
                            `).join('')}
                        </div>
                        
                        <div class="flex items-center justify-between">
                            <div class="flex items-center text-gray-600 text-sm">
                                <i data-feather="user" class="w-4 h-4 mr-2"></i>
                                ${newsItem.author}
                            </div>
                            <div class="flex items-center space-x-2">
                                <button onclick="newsDisplay.viewNews(${newsItem.id})" class="btn btn-glass btn-sm">
                                    Читать далее
                                </button>
                                ${isAdmin ? `
                                <button onclick="newsDisplay.editNews(${newsItem.id})" class="btn btn-border btn-sm">
                                    <i data-feather="edit" class="w-4 h-4"></i>
                                </button>
                                <button onclick="newsDisplay.deleteNews(${newsItem.id})" class="btn btn-border btn-sm text-red-600 hover:text-red-700">
                                    <i data-feather="trash" class="w-4 h-4"></i>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getNoNewsHTML() {
        return `
            <div class="text-center py-12">
                <div class="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                    <i data-feather="file-text" class="w-12 h-12"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Новости не найдены</h3>
                <p class="text-gray-600 mb-6">Попробуйте изменить параметры фильтров</p>
                <button onclick="newsDisplay.resetFilters()" class="btn btn-primary">
                    Сбросить фильтры
                </button>
            </div>
        `;
    }

    displayPopularNews() {
        const popularNews = newsSystem.getPopularNews(3);
        const container = document.getElementById('popularNews');

        if (popularNews.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-sm">Популярные новости появятся позже</p>';
            return;
        }

        container.innerHTML = popularNews.map(item => `
            <div class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" 
                 onclick="newsDisplay.viewNews(${item.id})">
                ${item.image ? `
                <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded-lg flex-shrink-0">
                ` : `
                <div class="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                    <i data-feather="file-text" class="w-6 h-6"></i>
                </div>
                `}
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-semibold text-gray-800 mb-1 truncate">${item.title}</h4>
                    <p class="text-xs text-gray-500">${this.formatDate(item.date)}</p>
                    <div class="flex items-center text-xs text-gray-500 mt-1">
                        <i data-feather="eye" class="w-3 h-3 mr-1"></i>
                        ${item.views || 0}
                    </div>
                </div>
            </div>
        `).join('');

        feather.replace();
    }

    updateCategoryCounts() {
        const categories = newsSystem.getCategories();
        categories.forEach(category => {
            const count = newsSystem.getNews({ category: category.value }).length;
            const element = document.getElementById(`count-${category.value}`);
            if (element) {
                element.textContent = count;
            }
        });
    }

    updatePagination(totalItems) {
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const pagination = document.getElementById('pagination');

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        
        // Предыдущая страница
        if (this.currentPage > 1) {
            html += `<button onclick="newsDisplay.changePage(${this.currentPage - 1})" class="btn btn-glass btn-sm mx-1">
                <i data-feather="chevron-left" class="w-4 h-4"></i>
            </button>`;
        }

        // Страницы
        for (let i = 1; i <= totalPages; i++) {
            if (i === this.currentPage) {
                html += `<button class="btn btn-primary btn-sm mx-1">${i}</button>`;
            } else {
                html += `<button onclick="newsDisplay.changePage(${i})" class="btn btn-glass btn-sm mx-1">${i}</button>`;
            }
        }

        // Следующая страница
        if (this.currentPage < totalPages) {
            html += `<button onclick="newsDisplay.changePage(${this.currentPage + 1})" class="btn btn-glass btn-sm mx-1">
                <i data-feather="chevron-right" class="w-4 h-4"></i>
            </button>`;
        }

        pagination.innerHTML = html;
        feather.replace();
    }

    changePage(page) {
        this.currentPage = page;
        this.loadNews();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    viewNews(newsId) {
        const newsItem = newsSystem.getNewsById(newsId);
        if (!newsItem) return;

        const modalHTML = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                        <h2 class="text-2xl font-bold text-gray-800">${newsItem.title}</h2>
                        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600">
                            <i data-feather="x" class="w-6 h-6"></i>
                        </button>
                    </div>
                    
                    <div class="p-6">
                        ${newsItem.image ? `
                        <img src="${newsItem.image}" alt="${newsItem.title}" class="w-full h-64 object-cover rounded-xl mb-6">
                        ` : ''}
                        
                        <div class="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
                            <span class="flex items-center">
                                <i data-feather="calendar" class="w-4 h-4 mr-2"></i>
                                ${this.formatDate(newsItem.date)}
                            </span>
                            <span class="flex items-center">
                                <i data-feather="user" class="w-4 h-4 mr-2"></i>
                                ${newsItem.author}
                            </span>
                            <span class="flex items-center">
                                <i data-feather="eye" class="w-4 h-4 mr-2"></i>
                                ${newsItem.views || 0} просмотров
                            </span>
                            ${newsItem.city !== 'all' ? `
                            <span class="flex items-center">
                                <i data-feather="map-pin" class="w-4 h-4 mr-2"></i>
                                ${newsItem.city}
                            </span>
                            ` : ''}
                        </div>
                        
                        <div class="flex flex-wrap gap-2 mb-6">
                            <span class="${this.getCategoryColorClass(newsItem.category)} text-white px-3 py-1 rounded-full text-sm font-medium">
                                ${this.getCategoryLabel(newsItem.category)}
                            </span>
                            ${newsItem.tags.map(tag => `
                                <span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">#${tag}</span>
                            `).join('')}
                        </div>
                        
                        <div class="prose max-w-none text-gray-700 leading-relaxed">
                            <p class="text-lg font-semibold mb-4 text-gray-800">${newsItem.excerpt}</p>
                            <div class="whitespace-pre-line">${newsItem.content}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);
        feather.replace();
    }

    openAddNewsModal() {
        document.getElementById('newsModalTitle').textContent = 'Добавить новость';
        document.getElementById('newsForm').reset();
        document.getElementById('newsId').value = '';
        document.getElementById('newsModal').classList.remove('hidden');
    }

    editNews(newsId) {
        const newsItem = newsSystem.getNewsById(newsId);
        if (!newsItem) return;

        document.getElementById('newsModalTitle').textContent = 'Редактировать новость';
        document.getElementById('newsId').value = newsItem.id;
        document.getElementById('newsTitle').value = newsItem.title;
        document.getElementById('newsExcerpt').value = newsItem.excerpt;
        document.getElementById('newsContent').value = newsItem.content;
        document.getElementById('newsCity').value = newsItem.city;
        document.getElementById('newsCategory').value = newsItem.category;
        document.getElementById('newsImage').value = newsItem.image || '';
        document.getElementById('newsTags').value = newsItem.tags.join(', ');
        
        // Устанавливаем статус
        document.querySelector(`input[name="newsStatus"][value="${newsItem.status}"]`).checked = true;

        document.getElementById('newsModal').classList.remove('hidden');
    }

    async saveNews() {
        const formData = new FormData(document.getElementById('newsForm'));
        const newsData = {
            title: formData.get('newsTitle'),
            excerpt: formData.get('newsExcerpt'),
            content: formData.get('newsContent'),
            city: formData.get('newsCity'),
            category: formData.get('newsCategory'),
            image: formData.get('newsImage'),
            tags: formData.get('newsTags').split(',').map(tag => tag.trim()).filter(tag => tag),
            status: formData.get('newsStatus'),
            date: new Date().toISOString().split('T')[0]
        };

        try {
            const newsId = document.getElementById('newsId').value;
            let result;

            if (newsId) {
                // Редактирование существующей новости
                result = newsSystem.updateNews(newsId, newsData);
            } else {
                // Добавление новой новости
                result = newsSystem.addNews(newsData);
            }

            if (result) {
                this.closeNewsModal();
                this.loadNews();
                this.updateCategoryCounts();
                this.showNotification(newsId ? 'Новость успешно обновлена' : 'Новость успешно добавлена', 'success');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    async deleteNews(newsId) {
        if (!confirm('Вы уверены, что хотите удалить эту новость?')) {
            return;
        }

        try {
            const success = newsSystem.deleteNews(newsId);
            if (success) {
                this.loadNews();
                this.updateCategoryCounts();
                this.showNotification('Новость успешно удалена', 'success');
            }
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }

    closeNewsModal() {
        document.getElementById('newsModal').classList.add('hidden');
    }

    resetFilters() {
        this.currentFilters = { city: 'all', category: 'all', search: '' };
        document.getElementById('cityFilter').value = 'all';
        document.getElementById('categoryFilter').value = 'all';
        document.getElementById('newsSearch').value = '';
        this.currentPage = 1;
        this.loadNews();
    }

    checkAdminRights() {
        const isAdmin = newsSystem.getCurrentUser();
        const adminControls = document.getElementById('adminNewsControls');
        
        if (isAdmin && adminControls) {
            adminControls.style.display = 'block';
        }
    }

    // Вспомогательные методы
    getCategoryLabel(categoryValue) {
        const categories = newsSystem.getCategories();
        const category = categories.find(cat => cat.value === categoryValue);
        return category ? category.label : categoryValue;
    }

    getCategoryColorClass(category) {
        const colors = {
            'platform': 'bg-purple-500',
            'ecology': 'bg-green-500',
            'sport': 'bg-red-500',
            'education': 'bg-blue-500',
            'social': 'bg-orange-500',
            'culture': 'bg-pink-500',
            'volunteer': 'bg-indigo-500'
        };
        return colors[category] || 'bg-gray-500';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    showNotification(message, type = 'success') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Глобальные функции для вызова из HTML
function openAddNewsModal() {
    newsDisplay.openAddNewsModal();
}

function closeNewsModal() {
    newsDisplay.closeNewsModal();
}

function closeModal() {
    const modal = document.querySelector('.fixed.inset-0');
    if (modal) {
        modal.remove();
    }
}

// Инициализация при загрузке страницы
const newsDisplay = new NewsDisplay();
