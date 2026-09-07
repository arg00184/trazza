import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * Dos paginas, un solo build. La landing publica (index.html) y la app React
 * (app/index.html) se sirven del mismo dominio: "/" vende, "/app" trabaja.
 *
 * La entrada de la app esta en app/index.html y no en la raiz para que la ruta del
 * fichero y la de produccion coincidan. Con Vite en modo multipagina, la posicion del
 * html ES la url: el dev server sirve la landing en "/" y la app en "/app/", igual que
 * Vercel despues. Cualquier apaño para tener la app en la raiz en desarrollo rompe esa
 * equivalencia, que es justo lo que evita sorpresas al desplegar.
 *
 * `base` se queda en "/" (el defecto): los dos html cuelgan del mismo dist, asi que
 * comparten dist/assets y las urls absolutas que Vite genera valen para los dos.
 *
 * Las entradas van en ruta relativa a la raiz del proyecto, no con resolve(__dirname):
 * el paquete es "type": "module", asi que __dirname no existe aqui, y la alternativa
 * (fileURLToPath sobre import.meta.url) obliga a añadir @types/node como dependencia
 * solo para que tsconfig.node.json deje pasar este fichero. Vite resuelve las rutas
 * relativas contra `root`, que es exactamente lo que hace falta.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        landing: "index.html",
        app: "app/index.html",
      },
    },
  },
  server: {
    port: 5174,
    strictPort: false,
  },
  preview: {
    port: 4174,
    strictPort: false,
  },
});
