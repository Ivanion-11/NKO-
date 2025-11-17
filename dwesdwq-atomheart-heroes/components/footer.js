// components/footer.js
class CustomFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
            <footer class="bg-gray-800 border-t border-gray-700 py-12">
                <div class="container mx-auto px-4">
                    <div class="grid md:grid-cols-4 gap-8">
                        <div>
                            <div class="flex items-center space-x-3 mb-4">
                                <div class="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                                    A
                                </div>
                                <div>
                                    <div class="text-white font-black text-lg">AtomHeart</div>
                                    <div class="text-blue-300 text-sm">Heroes</div>
                                </div>
                            </div>
                            <p class="text-gray-400 text-sm">
                                Платформа для волонтеров и НКО городов Росатома
                            </p>
                        </div>
                        
                        <div>
                            <h4 class="text-white font-semibold mb-4">Навигация</h4>
                            <div class="space-y-2">
                                <a href="index.html" class="block text-gray-400 hover:text-white text-sm">Главная</a>
                                <a href="calendar.html" class="block text-gray-400 hover:text-white text-sm">Календарь</a>
                                <a href="cities.html" class="block text-gray-400 hover:text-white text-sm">Города</a>
                                <a href="nko.html" class="block text-gray-400 hover:text-white text-sm">НКО</a>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="text-white font-semibold mb-4">Аккаунт</h4>
                            <div class="space-y-2">
                                <a href="volunteer-register.html" class="block text-gray-400 hover:text-white text-sm">Стать волонтером</a>
                                <a href="register-nko.html" class="block text-gray-400 hover:text-white text-sm">Для НКО</a>
                                <a href="volunteer-login.html" class="block text-gray-400 hover:text-white text-sm">Войти</a>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="text-white font-semibold mb-4">Контакты</h4>
                            <div class="space-y-2 text-sm text-gray-400">
                                <p>support@atomheart.ru</p>
                                <p>+7 (800) 123-45-67</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
                        <p>© 2024 AtomHeart Heroes. Все права защищены.</p>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('custom-footer', CustomFooter);