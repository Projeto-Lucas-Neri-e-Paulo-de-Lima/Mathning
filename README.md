# Mathning

## Desenvolvimento (app mobile)

1. Copie `apps/.env.example` para `apps/.env` e preencha as chaves `EXPO_PUBLIC_FIREBASE_*` do console Firebase.

2. Inicie o Expo (carrega o `.env` de `apps/` automaticamente):

```bash
npm run start:clear
```

Use `npm run start:clear` em vez de `npx expo start` na raiz sem argumentos — assim o Metro sempre encontra `apps/.env`.

Alternativa equivalente:

```bash
npx expo start ./apps --clear
```
