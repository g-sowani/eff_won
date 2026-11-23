export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="brand footer-brand">
          <span className="brand-mark" />
          <span className="brand-text">
            <span className="brand-accent">F1</span> FOR YOU
          </span>
        </div>
        <p className="footer-note">
          Built for the fans. Race, qualifying &amp; standings data via the Jolpica F1 API. Not
          affiliated with Formula 1, FIA, or Formula One Licensing B.V.
        </p>
        <p className="footer-copy">&copy; {new Date().getFullYear()} F1 For You</p>
      </div>
    </footer>
  );
}
