
import './index.css';

const Button = ({ onClick, children, class, type = "button" }) => {
  
  return (
    <button type={type} class={`custom-button ${class}`} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
