import { verein } from "@/content/verein";

/** Verweis auf das PayPal-Profil des Vereins (paypal.me). */
export function PayPalButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={verein.spende.paypal}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-[#003087] px-7 py-3.5 text-[0.9375rem] font-semibold text-white transition-colors duration-300 hover:bg-[#001f5c] ${className}`}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[1.15rem]">
        <path
          d="M8.6 20.4H5.4c-.4 0-.7-.4-.6-.8L7.5 3.9c.1-.5.5-.8 1-.8h5.4c3 0 5 1.6 4.6 4.6-.4 3.2-2.8 4.9-6 4.9h-2c-.5 0-.9.3-1 .8l-.9 7Z"
          fill="#fff"
          opacity="0.55"
        />
        <path
          d="M11.6 21.9H8.9c-.4 0-.7-.4-.6-.8l2.4-14.4c.1-.5.5-.8 1-.8h4.8c2.9 0 4.8 1.6 4.4 4.6-.4 3.2-2.7 4.9-5.8 4.9h-1.8c-.5 0-.9.3-1 .8l-.7 4.9c-.1.5-.5.8-1 .8Z"
          fill="#fff"
        />
      </svg>
      Mit PayPal unterstützen
    </a>
  );
}
