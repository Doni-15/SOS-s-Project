import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";

export function QRCodeCanvas({
  value,
  size = 220,
  canvasId,
  className = "",
}) {
  const canvasRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function renderQrCode() {
      setError("");

      if (!value || !canvasRef.current) {
        return;
      }

      try {
        await QRCode.toCanvas(canvasRef.current, value, {
          width: size,
          margin: 2,
          errorCorrectionLevel: "M",
        });
      } catch {
        if (isMounted) {
          setError("QR code gagal dibuat.");
        }
      }
    }

    renderQrCode();

    return () => {
      isMounted = false;
    };
  }, [size, value]);

  return (
    <div className={className}>
      <canvas
        id={canvasId}
        ref={canvasRef}
        className="mx-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
      />
      {error ? (
        <p className="mt-2 text-center text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
