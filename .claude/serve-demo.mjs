// Arranca el dev server de Vite (web/) FORZANDO EL MODO DEMO, en http://localhost:5175.
//
// Para que: la app pide login contra Supabase, asi que sin las credenciales de un usuario
// real no hay forma de ver las siete pantallas por dentro. Pero App.tsx ya contempla el caso
// "unconfigured" (useAuth: isSupabaseConfigured === false) y en el pinta el AppShell entero
// con los datos de lib/demoState. Eso es exactamente lo que hace falta para revisar diseno
// —sobre todo el responsive en movil— sin tocar datos de nadie ni entrar con una cuenta.
//
// Como se fuerza: NO borrando web/.env.local (eso se lo cargaria), sino apuntando `envDir` a
// una carpeta que no existe. Vite busca ahi sus .env y no encuentra ninguno, asi que
// VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY quedan undefined y la app cae en demo. El
// fichero de credenciales sigue intacto y el dev server normal (5174) no se entera.
//
// El puerto es el 5175 y no el 5174 para que puedan convivir: el de siempre con datos reales
// y este con datos de ejemplo, sin pelearse por el puerto.
//
// Vite se importa por ruta absoluta desde web/node_modules porque este fichero vive en
// .claude/, donde la resolucion normal de Node no llegaria a el. Misma razon que en
// serve-legacy.mjs para resolver la raiz desde import.meta.url y no desde process.cwd().
import { createRequire } from "node:module";
import { join, normalize } from "node:path";
import { pathToFileURL } from "node:url";
import { fileURLToPath } from "node:url";

const REPO = normalize(join(fileURLToPath(new URL(".", import.meta.url)), ".."));
const WEB = join(REPO, "web");

const require = createRequire(pathToFileURL(join(WEB, "package.json")));
const { createServer } = await import(pathToFileURL(require.resolve("vite")).href);

const server = await createServer({
  configFile: join(WEB, "vite.config.ts"),
  root: WEB,
  envDir: join(REPO, ".claude", "sin-env"),
  server: { port: Number(process.env.PORT || 5175), strictPort: false },
});

await server.listen();
server.printUrls();
