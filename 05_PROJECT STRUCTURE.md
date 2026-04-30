# 05_PROJECT STRUCTURE — Recommended Folder Architecture

## Root Structure
```txt
qibo-zymi/
├── client/
├── server/
├── shared/
├── docs/
├── scripts/
├── .env.example
├── README.md
└── package.json
```

## Frontend Structure
```txt
client/
├── src/
│   ├── app/
│   ├── assets/
│   ├── components/
│   │   ├── chat/
│   │   ├── call/
│   │   ├── auth/
│   │   ├── layout/
│   │   └── common/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── SocketContext.jsx
│   ├── hooks/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── Dashboard.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── socket.js
│   │   └── callService.js
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
```

## Backend Structure
```txt
server/
├── src/
│   ├── config/
│   ├── db/
│   ├── middleware/
│   ├── routes/
│   ├── socket/
│   ├── services/
│   ├── utils/
│   └── index.js
├── database.sqlite
└── package.json
```

## Shared Structure
```txt
shared/
├── constants/
├── eventNames.js
└── validationSchemas.js
```

## Rule
Keep chat, call, auth, admin, and UI logic separated.
