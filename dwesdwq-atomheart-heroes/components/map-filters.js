// map-filters.js - обновленная версия

// Данные об инициативах (теперь берем из системы событий)
function getInitiativesData() {
    return eventsSystem.getPublicEvents().map(event => ({
        id: event.id,
        title: event.title,
        city: event.city,
        region: getRegionByCity(event.city),
        category: event.category,
        coordinates: getCoordinatesByCity(event.city),
        description: event.description,
        date: event.date,
        organization: event.organization,
        image: event.image,
        address: event.address
    }));
}

function getRegionByCity(city) {
    const regions = {
        'Дубна': 'Московская область',
        'Сосновый Бор': 'Ленинградская область',
        'Новоуральск': 'Свердловская область',
        'Озёрск': 'Челябинская область',
        'Обнинск': 'Калужская область',
        'Саров': 'Нижегородская область'
    };
    return regions[city] || 'Неизвестный регион';
}

function getCoordinatesByCity(city) {
    const coordinates = {
        'Дубна': [56.7333, 37.1667],
        'Сосновый Бор': [59.9000, 29.1167],
        'Новоуральск': [57.2500, 60.0833],
        'Озёрск': [55.7500, 60.7167],
        'Обнинск': [55.1000, 36.6000],
        'Саров': [54.9333, 43.3167]
    };
    return coordinates[city] || [55.7558, 37.6173];
}

let map;
let placemarks = [];
let currentFilters = {
    dates: [],
    regions: [],
    cities: [],
    categories: []
};

// Инициализация карты
function initMap() {
    if (typeof ymaps === 'undefined') {
        console.error('Yandex Maps API not loaded');
        setTimeout(initMap, 100);
        return;
    }

    try {
        map = new ymaps.Map('map', {
            center: [55.7558, 37.6173],
            zoom: 4,
            controls: ['zoomControl', 'fullscreenControl']
        });

        // Показываем все инициативы при загрузке
        const initiatives = getInitiativesData();
        showInitiativesOnMap(initiatives);
        displayFilterResults(initiatives);

        // Назначаем обработчики
        document.getElementById('applyFilters').addEventListener('click', applyFilters);
        document.getElementById('resetFilters').addEventListener('click', resetFilters);

        // Автоматическое применение фильтров при изменении чекбоксов
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });

        console.log('Map initialized successfully');
    } catch (error) {
        console.error('Error initializing map:', error);
    }
}

function showInitiativesOnMap(initiatives) {
    if (!map) {
        console.error('Map not initialized');
        return;
    }

    // Очищаем предыдущие метки
    placemarks.forEach(placemark => map.geoObjects.remove(placemark));
    placemarks = [];

    initiatives.forEach(initiative => {
        try {
            const placemark = new ymaps.Placemark(initiative.coordinates, {
                hintContent: initiative.title,
                balloonContentHeader: initiative.title,
                balloonContentBody: `
                    <div style="width: 300px; padding: 10px;">
                        <img src="${initiative.image}" alt="${initiative.title}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                        <p style="margin: 5px 0; color: #666;">
                            <strong>📍 Место:</strong> ${initiative.address}, ${initiative.city}
                        </p>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>📅 Дата:</strong> ${formatDate(initiative.date)}
                        </p>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>📝 Описание:</strong> ${initiative.description}
                        </p>
                        <p style="margin: 5px 0; color: #666;">
                            <strong>🏢 Организация:</strong> ${initiative.organization}
                        </p>
                        <button onclick="viewInitiative(${initiative.id})" style="margin-top: 10px; background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%;">
                            Подробнее
                        </button>
                    </div>
                `
            }, {
                preset: getPresetByCategory(initiative.category),
                iconColor: getColorByCategory(initiative.category)
            });

            map.geoObjects.add(placemark);
            placemarks.push(placemark);
        } catch (error) {
            console.error('Error creating placemark:', error);
        }
    });

    // Обновляем счетчик
    document.getElementById('selectedCount').textContent = initiatives.length;

    // Автоматически подбираем масштаб, если есть метки
    if (initiatives.length > 0) {
        setTimeout(() => {
            map.setBounds(map.geoObjects.getBounds(), {
                checkZoomRange: true,
                zoomMargin: 20
            });
        }, 500);
    }
}

function applyFilters() {
    console.log('Applying filters...');
    
    const selectedDates = Array.from(document.querySelectorAll('.date-filter:checked')).map(cb => cb.value);
    const selectedRegions = Array.from(document.querySelectorAll('.region-filter:checked')).map(cb => cb.value);
    const selectedCities = Array.from(document.querySelectorAll('.city-filter:checked')).map(cb => cb.value);
    const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);

    const initiatives = getInitiativesData();
    const filteredInitiatives = initiatives.filter(initiative => {
        const dateMatch = selectedDates.length === 0 || selectedDates.includes(initiative.date);
        const regionMatch = selectedRegions.length === 0 || selectedRegions.includes(initiative.region);
        const cityMatch = selectedCities.length === 0 || selectedCities.includes(initiative.city);
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(initiative.category);
        
        return dateMatch && regionMatch && cityMatch && categoryMatch;
    });

    showInitiativesOnMap(filteredInitiatives);
    displayFilterResults(filteredInitiatives);
}

function resetFilters() {
    console.log('Resetting filters...');
    
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    const initiatives = getInitiativesData();
    showInitiativesOnMap(initiatives);
    displayFilterResults(initiatives);
}

function displayFilterResults(initiatives) {
    const resultsContainer = document.getElementById('filterResultsContainer');
    
    if (!resultsContainer) {
        console.error('Results container not found');
        return;
    }

    if (initiatives.length === 0) {
        resultsContainer.innerHTML = `
            <div class="col-span-2 text-center py-12">
                <div class="w-20 h-20 mx-auto mb-4 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400">
                    <i data-feather="search" class="w-10 h-10"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-2">Ничего не найдено</h3>
                <p class="text-gray-600">Попробуйте изменить параметры фильтров</p>
            </div>
        `;
        feather.replace();
        return;
    }

    resultsContainer.innerHTML = initiatives.map(initiative => `
        <div class="card group hover:scale-105 transition-all duration-300">
            <div class="relative overflow-hidden rounded-t-2xl">
                <img src="${initiative.image}" 
                     alt="${initiative.title}" 
                     class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110">
                <div class="absolute top-4 left-4 ${getCategoryColorClass(initiative.category)} text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ${initiative.category}
                </div>
                <div class="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ${formatDate(initiative.date)}
                </div>
            </div>
            <div class="p-6">
                <h4 class="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">${initiative.title}</h4>
                <p class="text-gray-600 text-sm mb-3">${initiative.description}</p>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500 flex items-center">
                        <i data-feather="map-pin" class="w-4 h-4 mr-1"></i>
                        ${initiative.city}
                    </span>
                    <span class="text-blue-600 font-medium">${initiative.organization}</span>
                </div>
                <button onclick="viewInitiative(${initiative.id})" class="btn btn-primary btn-sm w-full mt-3">
                    Узнать больше
                </button>
            </div>
        </div>
    `).join('');

    feather.replace();
}

// Остальные функции остаются без изменений...
function getPresetByCategory(category) {
    const presets = {
        'Экология': 'islands#greenIcon',
        'Спорт': 'islands#redIcon',
        'Образование': 'islands#blueIcon',
        'Благоустройство': 'islands#orangeIcon'
    };
    return presets[category] || 'islands#blueIcon';
}

function getColorByCategory(category) {
    const colors = {
        'Экология': '#10b981',
        'Спорт': '#ef4444',
        'Образование': '#3b82f6',
        'Благоустройство': '#f59e0b'
    };
    return colors[category] || '#3b82f6';
}

function getCategoryColorClass(category) {
    const colors = {
        'Экология': 'bg-green-500',
        'Спорт': 'bg-red-500',
        'Образование': 'bg-blue-500',
        'Благоустройство': 'bg-orange-500'
    };
    return colors[category] || 'bg-blue-500';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

function viewInitiative(id) {
    const initiatives = getInitiativesData();
    const initiative = initiatives.find(i => i.id === id);
    if (initiative) {
        window.location.href = `event-single.html?id=${id}&city=${encodeURIComponent(initiative.city)}`;
    }
}

// Инициализируем карту когда API Яндекс.Карт загрузится
if (typeof ymaps !== 'undefined') {
    ymaps.ready(initMap);
} else {
    console.log('Waiting for Yandex Maps to load...');
    setTimeout(() => {
        if (typeof ymaps !== 'undefined') {
            ymaps.ready(initMap);
        } else {
            console.error('Yandex Maps failed to load');
            document.getElementById('map').innerHTML = `
                <div class="flex items-center justify-center h-full bg-gray-100 rounded-lg">
                    <div class="text-center">
                        <i data-feather="map" class="w-12 h-12 text-gray-400 mx-auto mb-4"></i>
                        <p class="text-gray-600">Не удалось загрузить карту</p>
                        <p class="text-sm text-gray-500 mt-2">Проверьте подключение к интернету</p>
                    </div>
                </div>
            `;
            feather.replace();
        }
    }, 3000);
}