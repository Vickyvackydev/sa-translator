import { ButtonTypeProps } from "../types";

function Button(props: ButtonTypeProps) {
  return (
    <button
      type={props.type}
      className={`bg-[#FE5208] ${props.btnStyles} flex items-center justify-center`}
      onClick={props.handleClick}
    >
      <span className={`text-white ${props.textStyle}`}>{props.title}</span>
    </button>
  );
}

export default Button;
