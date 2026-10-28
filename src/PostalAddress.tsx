import { useEffect, useId, useRef, useState } from "react";

export const postalAddress =
  "Ivan G.\n1606 Headway Cir STE 9721\nAustin, TX 78754";

type CopyStatus = "idle" | "copying" | "copied" | "selected" | "failed";

export default function PostalAddress() {
  const statusId = useId();
  const addressRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<CopyStatus>("idle");

  useEffect(() => {
    if (status !== "copied") return;

    const timeout = window.setTimeout(() => setStatus("idle"), 2500);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function copyAddress() {
    if (status === "copying") return;

    setStatus("copying");

    try {
      await navigator.clipboard.writeText(postalAddress);
      setStatus("copied");
    } catch {
      const selection = window.getSelection();

      if (addressRef.current && selection) {
        const range = document.createRange();
        range.selectNodeContents(addressRef.current);
        selection.removeAllRanges();
        selection.addRange(range);
        setStatus("selected");
      } else {
        setStatus("failed");
      }
    }
  }

  const message =
    status === "copied"
      ? "address copied."
      : status === "selected"
        ? "address selected. use your device’s copy command to copy it."
        : status === "failed"
          ? "couldn’t copy automatically. select the address to copy it."
          : "";

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
        className={`postal-address__status${
          status === "selected" || status === "failed"
            ? " postal-address__status--error"
            : ""
        }`}
        id={statusId}
        role="status"
        aria-atomic="true"
      >
        {message}
      </p>
    </section>
  );
}
