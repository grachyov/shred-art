import { useEffect, useId, useRef, useState } from "react";

export const postalAddress =
  "Ivan G.\n1606 Headway Cir STE 9721\nAustin, TX 78754";

type CopyStatus = "idle" | "copying" | "copied";

export default function PostalAddress() {
  const statusId = useId();
  const addressRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status !== "copied") return;

    const timeout = window.setTimeout(() => setStatus("idle"), 600);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function copyAddress() {
    if (status === "copying") return;

    setStatus("copying");
    setMessage("");

    try {
      await navigator.clipboard.writeText(postalAddress);
      setStatus("copied");
      setMessage("Address copied.");
    } catch {
      const selection = window.getSelection();

      if (addressRef.current && selection) {
        const range = document.createRange();
        range.selectNodeContents(addressRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
        setMessage(
          "Address selected. Use your device’s copy command to copy it.",
        );
      } else {
        setMessage(
          "Couldn’t copy automatically. Select the address to copy it.",
        );
      }

      setStatus("idle");
    }
  }

  return (
    <section className="postal-address" aria-label="mailing address">
      <div className="postal-address__details">
        <address className="postal-address__text" ref={addressRef}>
          {postalAddress}
        </address>
      </div>
      <button
        className="postal-address__copy"
        type="button"
        onClick={copyAddress}
        aria-label={
          status === "copied"
            ? "address copied"
            : status === "copying"
              ? "copying address"
              : "copy address"
        }
        aria-disabled={status === "copying"}
        aria-busy={status === "copying"}
        aria-describedby={statusId}
      >
        <svg
          className="postal-address__copy-icon"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
        >
          {status === "copied" ? (
            <path d="m4 10 4 4 8-8" />
          ) : (
            <>
              <rect x="6.5" y="6.5" width="10" height="10" rx="1.5" />
              <path d="M12.5 6.5v-3h-9v9h3" />
            </>
          )}
        </svg>
      </button>
      <p
        className="postal-address__status"
        id={statusId}
        role="status"
        aria-atomic="true"
      >
        {message}
      </p>
    </section>
  );
}
