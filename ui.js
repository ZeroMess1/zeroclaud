// =====================
// ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ
// =====================

function switchToLogin() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('registerScreen').classList.remove('active');
}

function switchToRegister() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('registerScreen').classList.add('active');
}

// =====================
// ПЕРЕКЛЮЧЕНИЕ ПРЕДСТАВЛЕНИЙ
// =====================

function switchView(view) {
    // Скрываем все представления
    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });

    // Скрываем все кнопки навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Показываем выбранное представление
    if (view === 'chats') {
        document.getElementById('chatsView').classList.add('active');
        document.querySelector('[data-view="chats"]').classList.add('active');
        displayChats();
    } else if (view === 'profile') {
        document.getElementById('profileView').classList.add('active');
        document.querySelector('[data-view="profile"]').classList.add('active');
        loadProfileView();
    } else if (view === 'settings') {
        document.getElementById('settingsView').classList.add('active');
        document.querySelector('[data-view="settings"]').classList.add('active');
        loadSettingsView();
    } else if (view === 'chatDetail') {
        document.getElementById('chatDetailView').classList.add('active');
    }
}

// =====================
// ОТОБРАЖЕНИЕ ПРИЛОЖЕНИЯ
// =====================

function showApp() {
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');

    authContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    // Обновляем информацию в сайдбаре
    updateSidebarInfo();
    
    // Загружаем и отображаем чаты
    displayChats();
}

function hideApp() {
    const authContainer = document.getElementById('authContainer');
    const appContainer = document.getElementById('appContainer');

    authContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
    
    // Переходим на экран входа
    switchToLogin();
}

// =====================
// ИНФОРМАЦИЯ О ПОЛЬЗОВАТЕЛЕ
// =====================

function updateSidebarInfo() {
    if (!currentUserData) return;

    const avatar = document.getElementById('sidebarAvatar');
    const name = document.getElementById('appUserName');
    const userId = document.getElementById('displayUserId');

    name.textContent = currentUserData.name;
    userId.textContent = `#${String(currentUserData.userId).padStart(4, '0')}`;
    
    avatar.style.background = getAvatarColor(currentUserData.userId);
    avatar.textContent = getInitials(currentUserData.name);
}

// =====================
// ПРОФИЛЬ
// =====================

function loadProfileView() {
    if (!currentUserData) return;

    // Заполняем поля профиля
    document.getElementById('profileId').value = `#${String(currentUserData.userId).padStart(4, '0')}`;
    document.getElementById('profileName').value = currentUserData.name || '';
    document.getElementById('profileAbout').value = currentUserData.about || '';
    document.getElementById('profileBirthday').value = currentUserData.birthday || '';

    // Обновляем аватар
    const profileAvatar = document.getElementById('profileAvatar');
    profileAvatar.style.background = getAvatarColor(currentUserData.userId);
    profileAvatar.textContent = getInitials(currentUserData.name);
}

async function saveProfile() {
    const name = document.getElementById('profileName').value;
    const about = document.getElementById('profileAbout').value;
    const birthday = document.getElementById('profileBirthday').value;

    if (!name) {
        showToast('Имя не может быть пустым', 'error');
        return;
    }

    const success = await updateUserProfile(currentUser.uid, {
        name: name,
        about: about,
        birthday: birthday
    });

    if (success) {
        updateSidebarInfo();
    }
}

function triggerAvatarUpload() {
    document.getElementById('avatarInput').click();
}

async function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Проверяем размер файла
    if (file.size > 1000000) { // 1MB
        showToast('Файл слишком большой (макс 1MB)', 'error');
        return;
    }

    try {
        // Читаем файл как Data URL
        const reader = new FileReader();
        reader.onload = async (e) => {
            const imageData = e.target.result;

            // Сохраняем в Firestore
            await updateUserProfile(currentUser.uid, {
                avatar: imageData
            });

            // Обновляем аватар на экране
            const profileAvatar = document.getElementById('profileAvatar');
            profileAvatar.style.background = `url('${imageData}')`;
            profileAvatar.style.backgroundSize = 'cover';
            profileAvatar.style.backgroundPosition = 'center';
            profileAvatar.textContent = '';

            updateSidebarInfo();
            showToast('Аватар обновлен', 'success');
        };
        reader.readAsDataURL(file);

    } catch (error) {
        console.error('Ошибка загрузки аватара:', error);
        showToast('Ошибка загрузки аватара', 'error');
    }

    // Очищаем input
    event.target.value = '';
}

// =====================
// НАСТРОЙКИ
// =====================

function loadSettingsView() {
    if (!currentUserData) return;

    // Загружаем сохраненные настройки
    document.getElementById('hideAbout').checked = currentUserData.hideAbout || false;
    document.getElementById('hideBirthday').checked = currentUserData.hideBirthday || false;
    
    // Загружаем тему
    const isDark = document.body.classList.contains('dark-theme');
    document.getElementById('darkTheme').checked = isDark;

    // Загружаем размер шрифта
    const fontSize = localStorage.getItem('fontSize') || 'medium';
    document.getElementById('fontSizeSelect').value = fontSize;
}

async function savePrivacySettings() {
    const hideAbout = document.getElementById('hideAbout').checked;
    const hideBirthday = document.getElementById('hideBirthday').checked;

    await updateUserProfile(currentUser.uid, {
        hideAbout: hideAbout,
        hideBirthday: hideBirthday
    });
}

function changeFontSize() {
    const size = document.getElementById('fontSizeSelect').value;
    document.body.classList.remove('font-size-small', 'font-size-large');
    
    if (size === 'small') {
        document.body.classList.add('font-size-small');
    } else if (size === 'large') {
        document.body.classList.add('font-size-large');
    }

    localStorage.setItem('fontSize', size);
    showToast('Размер шрифта изменен', 'success');
}

function toggleDarkTheme() {
    const isDark = document.getElementById('darkTheme').checked;
    
    if (isDark) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }

    localStorage.setItem('darkTheme', isDark);
    showToast(isDark ? 'Темная тема включена' : 'Светлая тема включена', 'success');
}

// Добавляем слушатели для переключателей в настройках
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('hideAbout')?.addEventListener('change', savePrivacySettings);
    document.getElementById('hideBirthday')?.addEventListener('change', savePrivacySettings);
    document.getElementById('darkTheme')?.addEventListener('change', toggleDarkTheme);
    
    // Загружаем сохраненные настройки при загрузке
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    if (savedFontSize === 'small') {
        document.body.classList.add('font-size-small');
    } else if (savedFontSize === 'large') {
        document.body.classList.add('font-size-large');
    }

    if (localStorage.getItem('darkTheme') === 'true') {
        document.body.classList.add('dark-theme');
    }
});

// =====================
// TOAST УВЕДОМЛЕНИЯ
// =====================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    // Удаляем через 3 секунды
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// =====================
// ВЫХОД
// =====================

async function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        const success = await logout();
        if (success) {
            hideApp();
        }
    }
}

// Переопределяем функцию logout из auth.js чтобы обработать переход
const originalLogout = logout;
async function logout() {
    try {
        if (currentUser) {
            await db.collection('users').doc(currentUser.uid).update({
                online: false,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        await auth.signOut();
        
        console.log('Пользователь вышел');
        showToast('Вы вышли из аккаунта', 'success');
        hideApp();
        return true;

    } catch (error) {
        console.error('Ошибка выхода:', error);
        showToast('Ошибка выхода: ' + error.message, 'error');
        return false;
    }
}

// =====================
// ИНИЦИАЛИЗАЦИЯ
// =====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('UI инициализирован');
    
    // Проверяем сохраненные настройки
    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    if (savedFontSize === 'small') {
        document.body.classList.add('font-size-small');
    } else if (savedFontSize === 'large') {
        document.body.classList.add('font-size-large');
    }

    if (localStorage.getItem('darkTheme') === 'true') {
        document.body.classList.add('dark-theme');
    }

    // Устанавливаем обработчик поиска по Enter
    document.getElementById('searchUserId')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            findUserById();
        }
    });
});

console.log('UI загружен');
