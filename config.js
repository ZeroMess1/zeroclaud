// Firebase credentials для Zero Messenger
const firebaseConfig = {
    apiKey: "AIzaSyBkoYTbw0X8fMeuNYoLUTc8AOZ4AiG1AaM",
    authDomain: "zeroclaud-1f971.firebaseapp.com",
    projectId: "zeroclaud-1f971",
    storageBucket: "zeroclaud-1f971.firebasestorage.app",
    messagingSenderId: "748338592888",
    appId: "1:748338592888:web:d191c30ee90da00505818d"
};

// Инициализируем Firebase
firebase.initializeApp(firebaseConfig);

// Получаем сервисы
const auth = firebase.auth();
const db = firebase.firestore();

// Настройки Firestore
db.settings({
    cacheSizeBytes: 40000000 // 40MB кэша
});

console.log('Firebase инициализирован');
