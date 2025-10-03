import styles from "../styles/FloatingButton.module.css";

function FloatingButton() {
  const handleWhatsAppClick = () => {
    window.open("https://wa.me/2348100790074", "_blank");
  };

  return (
    <div>
      <button className={styles.whatsappButton} onClick={handleWhatsAppClick}>
        <span className={styles.whatsappIcon}>💬</span>
        <span className={styles.whatsappText}>Need Help?</span>
      </button>
    </div>
  );
}

export default FloatingButton;
