// Генерируем уникальный 4-значный ID
function generateUserId() {
    return Math.floor(1000 + Math.random() * 9000);
}

// Получить инициалы из имени
function getInitials(name) {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Форматировать время
function formatTime(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes}м назад`;
    if (hours < 24) return `${hours}ч назад`;
    if (days < 7) return `${days}д назад`;
    
    const options = { month: 'short', day: 'numeric' };
    if (date.getFullYear() !== now.getFullYear()) {
        options.year = 'numeric';
    }
    return date.toLocaleDateString('ru-RU', options);
}

// Форматировать время сообщения
function formatMessageTime(timestamp) {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Форматировать дату рождения
function formatBirthday(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Валидация email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Валидация пароля
function validatePassword(password) {
    return password.length >= 6;
}

// Проверка пустого значения
function isEmpty(value) {
    return value === null || value === undefined || value === '';
}

// Дебаунс функции
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Генерирование уникального ID для чата
function generateChatId(userId1, userId2) {
    const ids = [userId1, userId2].sort();
    return `${ids[0]}_${ids[1]}`;
}

// Получить цвет для аватара
function getAvatarColor(id) {
    const colors = [
        'linear-gradient(135deg, #00D9FF 0%, #00B8D4 100%)',
        'linear-gradient(135deg, #FF6B6B 0%, #FF8E72 100%)',
        'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
        'linear-gradient(135deg, #95E1D3 0%, #38A169 100%)',
        'linear-gradient(135deg, #A8E6CF 0%, #56AB2F 100%)',
        'linear-gradient(135deg, #FFD3B6 0%, #FFAAA5 100%)',
        'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)',
        'linear-gradient(135deg, #FAD0C4 0%, #FFF1D2 100%)',
    ];
    
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = ((hash << 5) - hash) + id.charCodeAt(i);
        hash = hash & hash;
    }
    
    return colors[Math.abs(hash) % colors.length];
}

// Установить цвет аватара для элемента
function setAvatarColor(element, id) {
    if (element) {
        element.style.background = getAvatarColor(id);
    }
}

// Зашифровать пароль (обычно это делается на сервере, но для демо...)
// Firebase Auth обрабатывает это автоматически

// Скопировать текст в буфер обмена
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Ошибка копирования:', err);
        return false;
    }
}

// Получить расширение файла
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

// Проверить, является ли строка ссылкой
function isUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Добавить ноль в начало числа
function padZero(num) {
    return String(num).padStart(2, '0');
}

// Получить название дня недели
function getDayName(date) {
    const days = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
    return days[date.getDay()];
}

// Последний день месяца
function getLastDayOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

// Ограничить строку длиной
function truncateString(str, length = 50) {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
}

// Удалить HTML теги
function stripHtmlTags(html) {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Экранировать HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Сортировка по дате
function sortByDate(array, dateField, ascending = false) {
    return array.sort((a, b) => {
        const dateA = a[dateField].toDate ? a[dateField].toDate() : new Date(a[dateField]);
        const dateB = b[dateField].toDate ? b[dateField].toDate() : new Date(b[dateField]);
        return ascending ? dateA - dateB : dateB - dateA;
    });
}

// Проверить, что объект пустой
function isEmptyObject(obj) {
    return Object.keys(obj).length === 0;
}

// Объединить объекты
function mergeObjects(obj1, obj2) {
    return { ...obj1, ...obj2 };
}

// Получить URL аватара из Canvas (для сохранения в Firestore)
function getCanvasImageData(canvas) {
    return canvas.toDataURL('image/png');
}

// Проверить, включен ли режим в браузере
function isDarkMode() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Получить случайный элемент из массива
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Проверить, является ли идентификатор действительным
function isValidUserId(userId) {
    return /^\d{4}$/.test(userId);
}

// Проверить подключение к интернету
function isOnline() {
    return navigator.onLine;
}

// Показать уведомление о состоянии сети
window.addEventListener('offline', function() {
    showToast('Интернет соединение потеряно', 'error');
});

window.addEventListener('online', function() {
    showToast('Интернет соединение восстановлено', 'success');
});

console.log('Utils загружены');
