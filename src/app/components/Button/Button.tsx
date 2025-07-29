import { ButtonHTMLAttributes, PropsWithChildren } from "react";
import styles from "./Button.module.scss";

type ButtonProps = PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>;

const Button = (props: ButtonProps) => (
    <button className={styles.primary} {...props}>
        {props.children}
    </button>
)

export default Button;