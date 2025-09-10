// src/components/Recaptcha.tsx
import { useEffect, useRef } from "react";

interface RecaptchaProps {
  sitekey: string;
  onVerify: (token: string) => void;
}


export default function Recaptcha({ sitekey, onVerify }: RecaptchaProps) {
  // Generar un id único simple para el div
  const recaptchaIdRef = useRef<string>(`recaptcha-${Math.random().toString(36).substring(2, 10)}`);
  const renderedRef = useRef(false);

  useEffect(() => {
    // Cargar el script de recaptcha solo una vez globalmente
    let interval: NodeJS.Timeout | undefined;
    const renderRecaptcha = () => {
      if (
        window.grecaptcha &&
        !renderedRef.current &&
        document.getElementById(recaptchaIdRef.current)
      ) {
        try {
          window.grecaptcha.render(recaptchaIdRef.current, {
            sitekey: sitekey,
            size: "invisible",
            callback: onVerify,
          });
          renderedRef.current = true;
        } catch (e) {
          // Si ya fue renderizado, ignorar
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
