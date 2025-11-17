
// Простой скрипт для тестирования кнопки
document.addEventListener('DOMContentLoaded', function() {
    console.log('Кнопка "Назад" загружена');
    
    // Проверяем, что кнопка существует и видима
    const backButton = document.getElementById('backButton');
    if (backButton) {
        console.log('Кнопка найдена:', backButton);
        
        // Добавляем обработчик для отслеживания событий
        backButton.addEventListener('mouseenter', function() {
            console.log('Наведение на кнопку');
            this.style.opacity = '1';
            this.style.visibility = 'visible';
        });
        
        backButton.addEventListener('mouseleave', function() {
            console.log('Убрали курсор с кнопки');
            this.style.opacity = '1';
            this.style.visibility = 'visible';
        });
    }
});
