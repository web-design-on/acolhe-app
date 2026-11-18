import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useAuth } from "./AuthContext";
import { alertService, apiConfig, ApiError } from "@/services";
import type { EmergencyAlert } from "@/types";

interface EmergencyContextValue {
  alert: EmergencyAlert | null;
  offline: boolean;
  setOffline: (value: boolean) => void;
  sendAlert: () => Promise<void>;
  cancelAlert: () => Promise<boolean>;
  respond: (answer: "assumiu" | "recusou") => Promise<void>;
  resolveAlert: () => Promise<void>;
  clear: () => void;
  simulateIncomingAlert: () => Promise<void>;
}

const EmergencyContext = createContext<EmergencyContextValue | null>(null);

function showActionError(e: unknown, fallback: string) {
  Alert.alert("Algo deu errado", e instanceof Error && e.message ? e.message : fallback);
}

export function EmergencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [alert, setAlert] = useState<EmergencyAlert | null>(null);
  const [offline, setOffline] = useState(false);
  const announced = useRef(new Set<string>());

  useEffect(() => {
    if (!user) return;
    const unsubscribe = alertService.subscribe(user.patientId, (incoming) => {
      if (incoming.status === "cancelado") {
        setAlert((current) => (current?.id === incoming.id ? null : current));
        return;
      }

      if (incoming.status === "resolvido") {
        setAlert((current) => (current?.id === incoming.id ? incoming : current));
        return;
      }
      setAlert(incoming);
      const isNewForCaregiver =
        user.role === "cuidador" &&
        incoming.status === "enviado" &&
        !announced.current.has(incoming.id) &&
        incoming.recipients.some((r) => r.caregiverId === user.caregiverId && r.status === "enviado");
      if (isNewForCaregiver) {
        announced.current.add(incoming.id);
        router.push("/emergencia/recebido");
      }
    });
    if (apiConfig.useMocks) alertService.getActive(user.patientId).then((active) => active && setAlert(active));
    return unsubscribe;
  }, [user]);

  const sendAlert = useCallback(async () => {
    if (!user) return;
    try {
      setAlert(await alertService.trigger(user.patientId, user.displayName, true, offline));
    } catch (e) {
      showActionError(e, "Não foi possível enviar o pedido de ajuda. Se for urgente, ligue para alguém da sua rede.");
    }
  }, [user, offline]);

  const runAction = useCallback(async (alertId: string, action: () => Promise<EmergencyAlert>) => {
    try {
      setAlert(await action());
      return true;
    } catch (e) {
      if (!(e instanceof ApiError && (e.status === 409 || e.status === 404))) {
        showActionError(e, "Não foi possível concluir agora. Confira a internet e tente de novo.");
        return false;
      }
      const latest = await alertService.getById(alertId).catch(() => null);
      setAlert(latest && latest.status !== "cancelado" ? latest : null);
      return true;
    }
  }, []);

  const cancelAlert = useCallback(async () => {
    if (alert && !(await runAction(alert.id, () => alertService.cancel(alert.id)))) return false;
    setAlert(null);
    return true;
  }, [alert, runAction]);

  const respond = useCallback(async (answer: "assumiu" | "recusou") => {
    if (!alert || !user?.caregiverId) return;
    const caregiverId = user.caregiverId;
    await runAction(alert.id, () => alertService.respond(alert.id, caregiverId, answer));
  }, [alert, user, runAction]);

  const resolveAlert = useCallback(async () => {
    if (alert) await runAction(alert.id, () => alertService.resolve(alert.id));
  }, [alert, runAction]);

  const simulateIncomingAlert = useCallback(async () => {
    if (!user) return;
    await alertService.trigger(user.patientId, "Dona Maria", false);
  }, [user]);

  const clear = useCallback(() => setAlert(null), []);

  const value = useMemo(
    () => ({ alert, offline, setOffline, sendAlert, cancelAlert, respond, resolveAlert, clear, simulateIncomingAlert }),
    [alert, offline, sendAlert, cancelAlert, respond, resolveAlert, clear, simulateIncomingAlert],
  );
  return <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>;
}

export function useEmergency() {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error("useEmergency precisa estar dentro de <EmergencyProvider>");
  return ctx;
}
