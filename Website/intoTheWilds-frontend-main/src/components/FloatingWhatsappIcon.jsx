import { FaWhatsapp } from "react-icons/fa";

const FloatingWhatsappIcon = () => {
  const phoneNumber = "9761966485";
  const getWhatsAppLink = () => {
    // Check if mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    return isMobile
      ? `whatsapp://send?phone=${phoneNumber}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}`;
  };

  return (
    <a
      href={getWhatsAppLink()} // Replace with your WhatsApp number in international format
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-28 right-4 z-50 bg-[#25D366] hover:bg-[#1DA955] p-4 rounded-full shadow-lg transition-transform transform hover:scale-110"
    >
      <FaWhatsapp size={28} color="white" />
    </a>
  );
};

export default FloatingWhatsappIcon;
