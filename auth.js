// Текущий пользователь
let currentUser = null;
let currentUserData = null;

// Слушатель аутентификации
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('Пользователь вошел:', user.uid);
        currentUser = user;
        
        // Получаем данные профиля
        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                currentUserData = userDoc.data();
                console.log('Данные пользователя загружены:', currentUserData);
                
                // Показываем приложение
                showApp();
                
                // Загружаем чаты
                loadChats();
            } else {
                // Документ не найден — выходим
                console.warn('Профиль не найден в Firestore');
                await auth.signOut();
            }
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            showToast('Ошибка загрузки профиля', 'error');
            logout();
        }
    } else {
        console.log('Пользователь вышел');
        currentUser = null;
        currentUserData = null;
        hideApp();
    }
});

// Регистрация
async function register(name, email, password) {
    try {
        // Валидация
        if (!name || !email || !password) {
            showToast('Заполните все поля', 'error');
            return false;
        }

        if (!validateEmail(email)) {
            showToast('Некорректный email', 'error');
            return false;
        }

        if (!validatePassword(password)) {
            showToast('Пароль должен быть минимум 6 символов', 'error');
            return false;
        }

        // Создаем аккаунт
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const uid = userCredential.user.uid;

        // Генерируем уникальный ID
        let userId;
        let userExists = true;
        while (userExists) {
            userId = generateUserId();
            const checkDoc = await db.collection('users').where('userId', '==', userId).get();
            userExists = !checkDoc.empty;
        }

        // Сохраняем профиль в Firestore
        const userData = {
            uid: uid,
            userId: userId,
            name: name,
            email: email,
            avatar: '',
            about: '',
            birthday: '',
            hideAbout: false,
            hideBirthday: false,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
            online: true
        };

        await db.collection('users').doc(uid).set(userData);

        console.log('Пользователь зарегистрирован:', uid);
        showToast('Регистрация успешна!', 'success');
        return true;

    } catch (error) {
        console.error('Ошибка регистрации:', error);
        
        if (error.code === 'auth/email-already-in-use') {
            showToast('Email уже зарегистрирован', 'error');
        } else if (error.code === 'auth/weak-password') {
            showToast('Слишком слабый пароль', 'error');
        } else if (error.code === 'auth/invalid-email') {
            showToast('Некорректный email', 'error');
        } else {
            showToast('Ошибка регистрации: ' + error.message, 'error');
        }
        return false;
    }
}

// Вход
async function login(email, password) {
    try {
        // Валидация
        if (!email || !password) {
            showToast('Заполните все поля', 'error');
            return false;
        }

        if (!validateEmail(email)) {
            showToast('Некорректный email', 'error');
            return false;
        }

        // Вход в аккаунт
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        
        // Обновляем lastSeen и online статус
        await db.collection('users').doc(userCredential.user.uid).update({
            lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
            online: true
        });

        console.log('Пользователь вошел');
        showToast('Вы вошли в аккаунт!', 'success');
        return true;

    } catch (error) {
        console.error('Ошибка входа:', error);
        
        if (error.code === 'auth/user-not-found') {
            showToast('Пользователь не найден', 'error');
        } else if (error.code === 'auth/wrong-password') {
            showToast('Неверный пароль', 'error');
        } else if (error.code === 'auth/invalid-email') {
            showToast('Некорректный email', 'error');
        } else if (error.code === 'auth/invalid-credential') {
            showToast('Неверный email или пароль', 'error');
        } else {
            showToast('Ошибка входа: ' + error.message, 'error');
        }
        return false;
    }
}

// Выход
async function logout() {
    try {
        // Обновляем статус
        if (currentUser) {
            await db.collection('users').doc(currentUser.uid).update({
                online: false,
                lastSeen: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // Выход
        await auth.signOut();
        
        console.log('Пользователь вышел');
        showToast('Вы вышли из аккаунта', 'success');
        return true;

    } catch (error) {
        console.error('Ошибка выхода:', error);
        showToast('Ошибка выхода: ' + error.message, 'error');
        return false;
    }
}

// Смена пароля
async function changePassword(currentPassword, newPassword) {
    try {
        if (!currentPassword || !newPassword) {
            showToast('Заполните все поля', 'error');
            return false;
        }

        if (!validatePassword(newPassword)) {
            showToast('Пароль должен быть минимум 6 символов', 'error');
            return false;
        }

        // Повторно аутентифицируем пользователя
        const user = auth.currentUser;
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        await user.reauthenticateWithCredential(credential);

        // Меняем пароль
        await user.updatePassword(newPassword);

        showToast('Пароль изменен', 'success');
        return true;

    } catch (error) {
        console.error('Ошибка смены пароля:', error);
        
        if (error.code === 'auth/wrong-password') {
            showToast('Неверный текущий пароль', 'error');
        } else {
            showToast('Ошибка смены пароля: ' + error.message, 'error');
        }
        return false;
    }
}

// Обновление email
async function updateEmail(newEmail) {
    try {
        if (!validateEmail(newEmail)) {
            showToast('Некорректный email', 'error');
            return false;
        }

        const user = auth.currentUser;
        await user.updateEmail(newEmail);
        
        // Обновляем в Firestore
        await db.collection('users').doc(user.uid).update({
            email: newEmail
        });

        showToast('Email обновлен', 'success');
        return true;

    } catch (error) {
        console.error('Ошибка обновления email:', error);
        
        if (error.code === 'auth/email-already-in-use') {
            showToast('Этот email уже используется', 'error');
        } else if (error.code === 'auth/invalid-email') {
            showToast('Некорректный email', 'error');
        } else {
            showToast('Ошибка обновления email: ' + error.message, 'error');
        }
        return false;
    }
}

// Восстановление пароля
async function resetPassword(email) {
    try {
        if (!validateEmail(email)) {
            showToast('Некорректный email', 'error');
            return false;
        }

        await auth.sendPasswordResetEmail(email);
        showToast('Ссылка восстановления отправлена на email', 'success');
        return true;

    } catch (error) {
        console.error('Ошибка восстановления пароля:', error);
        
        if (error.code === 'auth/user-not-found') {
            showToast('Пользователь не найден', 'error');
        } else {
            showToast('Ошибка отправки: ' + error.message, 'error');
        }
        return false;
    }
}

// Обработка формы входа
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const success = await login(email, password);
    
    if (success) {
        // Форма очищается автоматически при переходе
    }
});

// Обработка формы регистрации
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    const success = await register(name, email, password);
    
    if (success) {
        // Переходим на экран входа
        setTimeout(() => {
            switchToLogin();
        }, 1000);
    }
});

console.log('Auth загружен');
