# trazza

Journal de trading y control financiero de cuentas de prop firm: compras, resets,
activaciones, fees, payouts y refunds, junto al resultado real de cada cuenta.

## Uso

El sitio es una sola aplicacion de Vite con dos paginas: la landing publica en `/` y la
app React en `/app`. Todo vive en `web/`.

```bash
cd web && pnpm install && pnpm dev
```

Se abre en `http://127.0.0.1:5174`: `/` es la landing y `/app/` la app. El dev server
reparte las rutas igual que produccion, asi que lo que ves en local es lo que se
despliega.

Para conectar Supabase, copia `web/.env.example` a `web/.env.local` y rellena
`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`. Sin esa configuracion la app arranca
igual con datos demo, que es comodo para revisar la interfaz.

Antes de dar cualquier cambio por bueno:

```bash
pnpm --dir web typecheck
```

No hay tests: el typecheck es la unica red.

## Despliegue

Vercel construye desde la raiz siguiendo `vercel.json` y publica `web/dist`. La ruta
antigua `/app.html` redirige a `/app` para no romper marcadores ni las URLs de retorno
de Stripe anteriores.

## La app de legado

La version anterior (HTML + JS sin build) esta archivada en `legacy/` y ya no se
despliega. Para consultarla:

```bash
node .claude/serve-legacy.mjs
```

Sirve `legacy/` en `http://localhost:5178`: `/` es la app antigua y `/index.html` la
landing que tuvo hasta septiembre de 2026.

## Datos y sesion

- Login con email/password mediante Supabase Auth.
- Empresas, cuentas, movimientos y journal se sincronizan en Supabase.
- `localStorage` se usa para respaldo local y migracion de datos antiguos.
- Puedes exportar/importar una copia en JSON desde la propia app.

Para activar el Journal en Supabase, ejecuta `supabase-journal.sql` en el SQL editor del
proyecto. La app seguira funcionando aunque la tabla no exista, pero no podra guardar
entradas de journal hasta crearla.

Antes de abrir registros publicos o migrar datos reales, ejecuta tambien
`supabase-rls.sql`. Ese script activa y fuerza RLS, retira permisos anonimos, crea
indices por usuario y deja politicas privadas para `firms`, `accounts`, `transactions`,
`journal_entries` y `journal_error_types`.

## Incluye

- Dashboard con resultado neto, gastos, retiros, ROI, break-even, cuentas activas y filtros por empresa/cuenta/periodo.
- Grafico interactivo de evolucion del capital con tooltip, zoom y arrastre.
- Registro de empresas, cuentas y movimientos economicos.
- Journal con calendario mensual, P&L diario, detalle por entrada, importacion CSV, disciplina, estado mental y aprendizajes.
- Ajustes de perfil, moneda, tema claro/oscuro y exportacion JSON.
- Migracion desde una copia JSON o desde localStorage legacy cuando exista en el mismo origen.
- Vista movil optimizada con tablas convertidas en tarjetas.
- Exportacion JSON/CSV e importacion JSON.
- Pagina legal con aviso legal, privacidad, cookies, terminos y disclaimer financiero.

## Lanzamiento publico

- Revisa `LEGAL_LAUNCH_CHECKLIST.md` antes de abrir registros o pagos.
- Revisa `web/public/legal.html` antes de abrir pagos o cambiar condiciones.
- Ejecuta `supabase-rls.sql` antes de abrir registros publicos para aislar los datos por usuario.
