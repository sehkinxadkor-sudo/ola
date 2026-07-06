# Ola Quest

Премиальный веб-квест из 15 загадок с подсказками, сохранением прогресса, тёмной темой, анимациями, звуками, конфетти и генерацией сертификата.

## Запуск

```bash
# Клонировать репозиторий
git clone [ссылка]

# Перейти в папку
cd ola-quest

# Установить зависимости (если есть)
npm install

# Запустить локальный сервер
npm run dev
# Или просто открыть index.html в браузере
```

После запуска через npm сайт будет доступен на `http://localhost:5173`.

## Структура

```text
ola-quest/
├── index.html
├── css/
│   ├── style.css
│   ├── animations.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── questions.js
│   ├── hints.js
│   ├── progress.js
│   ├── certificate.js
│   └── particles.js
├── assets/
│   ├── images/
│   ├── fonts/
│   └── sounds/
└── package.json
```

## Секреты

Проект не использует API-ключи. Если в будущем появятся интеграции, секреты нужно хранить в `.env`, а названия переменных добавить в `.env.example` без значений.
