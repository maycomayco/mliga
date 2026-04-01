# Migración a Supabase

## ¿Cómo funciona?

El `package.json` ya tiene configurado:
```json
"build": "prisma migrate deploy && next build"
```

Esto significa que cuando hacés `pnpm build` (en deploy):
1. `prisma migrate deploy` detecta y aplica las nuevas migraciones automáticamente
2. Luego compila la app

## Requisito

Asegurate que `DATABASE_URL` en producción apunte a Supabase.

## Listo

No necesitás ejecutar nada manualmente. La migración se aplica automáticamente en el build.