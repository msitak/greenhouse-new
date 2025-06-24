import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/logo.svg"
          alt="GH logo"
          width={1000}
          height={200}
          priority
        />
      </main>
    </div>
  );
}
