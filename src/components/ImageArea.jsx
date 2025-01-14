// src/components/ImageArea.jsx
import bg from '../assets/img/bg.jpg';

const ImageArea = () => {
  return (
    <div className="hidden md:flex h-full w-[50%] shadow-lg">
      <img
        alt="Plutus Logo"
        loading="lazy"
        width="5200"
        height="5200"
        decoding="async"
        className="h-full w-full object-cover"
        style={{ color: 'transparent' }}
        src={bg}
      />
    </div>
  );
  };
  
  export default ImageArea;