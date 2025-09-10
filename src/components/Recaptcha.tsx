// src/components/Recaptcha.tsx
import { useEffect, useRef } from "react";

interface RecaptchaProps {
  sitekey: string;
  onVerify: (token: string) => void;
  execute?: boolean;
  onExecuted?: () => void;
  onError?: () => void;
}


export default function Recaptcha({ sitekey, onVerify, execute, onExecuted, onError }: RecaptchaProps) {
  // Generar un id único simple para el div
  const recaptchaIdRef = useRef<string>(`recaptcha-${Math.random().toString(36).substring(2, 10)}`);
  const renderedRef = useRef(false);

  // Permite ejecutar el challenge invisible desde el padre
  useEffect(() => {
    if (execute && window.grecaptcha && renderedRef.current) {
      window.grecaptcha.execute(recaptchaIdRef.current);
      if (onExecuted) onExecuted();
    }
  }, [execute, onExecuted]);

  useEffect(() => {
  // Cargar el script de recaptcha solo una vez globalmente y evitar múltiples renders
    let interval: NodeJS.Timeout | undefined;
    const renderRecaptcha = () => {
      if (
        window.grecaptcha &&
    typeof window.grecaptcha.render === "function" && // Validar que render es una función
        document.getElementById(recaptchaIdRef.current)
      ) {
        try {
          window.grecaptcha.render(recaptchaIdRef.current, {
            sitekey: sitekey,
            size: "invisible",
            callback: onVerify,
            'error-callback': () => {
              if (onError) onError();
            }
          });
          renderedRef.current = true;
        } catch (e) {
          // Si ya fue renderizado, ignorar
          console.error("Error rendering Recaptcha:", e); // Log error for debugging
        }
      }
    };
    if (!document.getElementById("recaptcha-script")) {
      const script = document.createElement("script");
      script.id = "recaptcha-script";
      script.src = "https://www.google.com/recaptcha/api.js";
      script.async = true;
      script.onload = () => {
        renderRecaptcha();
      };
      document.body.appendChild(script);
    } else if (window.grecaptcha) {
      renderRecaptcha();
    } else {
      // Si el script está pero grecaptcha aún no está listo, esperar
      interval = setInterval(() => {
        if (window.grecaptcha) {
          renderRecaptcha();
          clearInterval(interval);
        }
      }, 100);
    }
    // Cleanup: no desmontar el widget, solo marcar como no renderizado si cambia el sitekey
    return () => {
      renderedRef.current = false;
      if (interval) clearInterval(interval);
    };
  }, [sitekey, onVerify]);

  return <div id={recaptchaIdRef.current} />;
}

declare global {
  interface Window {
    grecaptcha?: any;
  }
}
