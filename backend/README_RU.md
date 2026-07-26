# JobRadar Working Admin

Рабочая локальная админка для JobRadar / Weiterbildung курсов.

## Запуск на Windows

Открой папку:

```text
C:\Users\brueg\Desktop\projects\PowerWatch\jobradar_app
```

Двойной клик по:

```text
start_jobradar_admin.bat
```

Потом открыть в браузере:

```text
http://127.0.0.1:8787
```

## Что реально работает

- SQLite база: `jobradar.sqlite3`
- редактирование Course Search Profiles;
- сохранение criteria в базу;
- upload документов в `uploads/`;
- список uploaded documents;
- provider/coach change requests;
- approve/reject change requests;
- export выбранного search profile как JSON;
- download SQLite backup.

## Следующий production-шаг

- логин/пароли для provider/coach;
- real job collection API;
- Postgres вместо SQLite;
- RAG indexing uploaded PDFs;
- report generation.
