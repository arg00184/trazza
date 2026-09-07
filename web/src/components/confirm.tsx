import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Modal } from "./Modal";
import { useT } from "../lib/i18n/context";

type ConfirmTone = "default" | "danger";

type ConfirmOptions = {
  title: string;
  /** Texto largo opcional bajo el titulo. Para un simple "Eliminar X?" no hace falta. */
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

type PendingConfirm = ConfirmOptions & { resolve: (value: boolean) => void };

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Sustituye a window.confirm() con un dialogo que sigue el lenguaje visual de la app
 * (mismo Modal en portal, mismos botones). La API es una promesa para que cada sitio de
 * llamada cambie lo minimo: `if (!(await confirm({ title }))) return;`.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const t = useT();
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      setPending((current) => {
        // No deberia haber dos a la vez; si lo hay, el anterior se da por cancelado.
        current?.resolve(false);
        return { ...options, resolve };
      });
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    setPending((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {pending && (
        <Modal onClose={() => settle(false)} title={pending.title} width="narrow">
          <div className="confirm-dialog">
            {pending.description && <p>{pending.description}</p>}
            <div className="form-action-row">
              <button className="ghost-action" onClick={() => settle(false)} type="button">
                {pending.cancelLabel ?? t("common.cancel")}
              </button>
              <button
                autoFocus
                className={pending.tone === "danger" ? "danger-action" : "primary-action"}
                onClick={() => settle(true)}
                type="button"
              >
                {pending.confirmLabel ?? t("common.confirm")}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error("useConfirm debe usarse dentro de ConfirmProvider.");
  return context;
}
