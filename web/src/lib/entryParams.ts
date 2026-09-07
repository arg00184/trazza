/**
 * Parametros con los que se puede entrar a /app desde fuera.
 *
 * Son dos, y los dos vienen de sitios que no controla React:
 *   ?mode=signup   -> lo pone la landing en sus botones de "Crear cuenta".
 *   ?checkout=...  -> lo pone Stripe al volver del pago (success | cancelled).
 *
 * Se leen UNA sola vez, al cargar el modulo, y acto seguido se limpian de la barra de
 * direcciones. Leerlos en un efecto seria peor por dos motivos: el valor cambiaria bajo
 * los pies de quien lo use si el usuario navega, y "success" volveria a dispararse en
 * cada recarga o al compartir la url. Limpiar con replaceState (no pushState) evita
 * ademas meter una entrada extra en el historial: el boton "atras" sigue llevando a
 * donde el usuario espera, la landing o Stripe.
 */

type EntryParams = {
  authMode: "signup" | null;
  checkout: "success" | "cancelled" | null;
};

function read(): EntryParams {
  if (typeof window === "undefined") return { authMode: null, checkout: null };

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    return { authMode: null, checkout: null };
  }

  const mode = params.get("mode");
  const checkout = params.get("checkout");

  const parsed: EntryParams = {
    authMode: mode === "signup" ? "signup" : null,
    checkout: checkout === "success" || checkout === "cancelled" ? checkout : null,
  };

  if (parsed.authMode || parsed.checkout) {
    params.delete("mode");
    params.delete("checkout");
    const rest = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${rest ? `?${rest}` : ""}${window.location.hash}`,
    );
  }

  return parsed;
}

export const entryParams = read();
