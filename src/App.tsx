const steps = [
  "an artist sends something in a letter",
  "it gets automatically scanned and listed for an eth auction",
  "the highest bidder gets an nft",
  "if the buyer enters an address, the letter gets forwarded to them. otherwise, it gets shredded after 30 days, along with the nft.",
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
