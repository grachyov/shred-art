import PostalAddress from "./PostalAddress";

const steps = [
  "send us something in a letter.",
  "we scan and list it for auction on ethereum.",
  "the winner gets an nft, and the author gets 77%.",
  "if the buyer shares an address, we forward them the letter.",
  "otherwise, we shred it after 30 days, along with the nft.",
];

export default function App() {
  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <h1 className="site-title">
            <a className="brand" href="/">
              <img
                className="brand__logo"
                src="/logo-48.webp"
                srcSet="/logo-48.webp 48w, /logo-96.webp 96w, /logo-144.webp 144w"
                sizes="(min-width: 768px) 48px, 40px"
                width="48"
                height="48"
                alt=""
                decoding="async"
                fetchPriority="high"
              />
              <span>shred.art</span>
            </a>
          </h1>
          <a
            className="social-link"
            href="https://x.com/shreddotart"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="shreddotart on X"
          >
            <svg
              className="social-link__icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.64 7.584H.47l8.6-9.835L0 1.154h7.594l5.243 6.932 6.064-6.933Zm-1.29 19.49h2.039L6.487 3.24H4.3l13.31 17.403Z" />
            </svg>
            <span>shreddotart</span>
          </a>
        </div>
      </header>
      <main className="page-content">
        <div className="page-copy">
          <ol className="steps" role="list">
            {steps.map((step) => (
              <li className="steps__item" key={step}>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="address-container">
          <PostalAddress />
        </div>
        <picture className="paper-pile">
          <source
            media="(prefers-color-scheme: dark)"
            srcSet="/paper-pile-dark-800.webp 800w, /paper-pile-dark-1600.webp 1600w, /paper-pile-dark-2400.webp 2400w"
            sizes="min(100vw, clamp(720px, 96svh, 1120px))"
          />
          <img
            src="/paper-pile-light-800.webp"
            srcSet="/paper-pile-light-800.webp 800w, /paper-pile-light-1600.webp 1600w, /paper-pile-light-2400.webp 2400w"
            sizes="min(100vw, clamp(720px, 96svh, 1120px))"
            width="2400"
            height="860"
            alt=""
            loading="lazy"
            decoding="async"
          />
        </picture>
      </main>
    </>
  );
}
