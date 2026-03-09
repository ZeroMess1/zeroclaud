// Инициализация приложения
console.log('Zero Messenger инициализируется...');

// Проверяем подключение к интернету
if (!navigator.onLine) {
    showToast('Проверьте подключение к интернету', 'error');
}

// Загружаем сохраненные настройки при старте
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, приложение готово');

    // Скрываем приложение пока не авторизован пользователь
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');

    if (!currentUser) {
        authContainer.classList.remove('hidden');
        appContainer.classList.add('hidden');
    }

    // Регулярно обновляем статус online
    setInterval(() => {
        if (currentUser) {
            db.collection('users').doc(currentUser.uid).update({
                lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
                online: true
            }).catch(error => {
                console.error('Ошибка обновления статуса:', error);
            });
        }
    }, 30000); // Каждые 30 секунд

    // Обновляем статус при закрытии приложения
    window.addEventListener('beforeunload', () => {
        if (currentUser) {
            navigator.sendBeacon('/api/update-status', JSON.stringify({
                uid: currentUser.uid,
                online: false
            }));
        }
    });
});

// Версия приложения
const APP_VERSION = '1.0.0';
const APP_NAME = 'Zero Messenger';

console.log(`${APP_NAME} v${APP_VERSION} загружен и готов к работе`);
