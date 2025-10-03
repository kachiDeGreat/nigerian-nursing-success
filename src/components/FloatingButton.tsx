import styles from "../styles/FloatingButton.module.css";

function FloatingButton() {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/2348100790074", "_blank");
  };

  return (
    <div>
      <button className={styles.whatsappButton} onClick={handleWhatsAppClick}>
        <span className={styles.whatsappIcon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            width="20"
            height="20"
            fill="currentColor"
          >
            <path d="M16 3C9.4 3 4 8.4 4 15c0 2.5.8 4.8 2.2 6.7L4 29l7.5-2c1.8 1 3.8 1.5 4.5 1.5 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.6c-1.5 0-3-.4-4.3-1.2l-.3-.2-4.4 1.2 1.2-4.3-.2-.3C6.7 18.5 6 16.8 6 15c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 9.6-10 9.6zm5.7-7.1c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.3-.7.1c-.3-.2-1.4-.5-2.7-1.7-1-1-1.7-2.2-1.9-2.5s0-.5.1-.7.3-.4.4-.6c.2-.2.3-.5.5-.7.2-.2.1-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5H11c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.3 2.2 3.4 5.3 4.7.7.3 1.2.5 1.7.6.7.2 1.3.2 1.8.1.6-.1 1.8-.7 2.1-1.4.3-.7.3-1.2.2-1.4s-.3-.3-.6-.4z" />
          </svg>
        </span>
        <span className={styles.whatsappText}>Need Help?</span>
      </button>
    </div>
  );
}

export default FloatingButton;
