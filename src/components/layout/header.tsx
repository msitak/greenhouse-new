import Image from "next/image";
import Link from "next/link";
import React from "react";

const Header = () => {
    const navLinks = [
        { href: '/', label: 'Strona Główna' },
        { href: '/nieruchomosci', label: 'Nieruchomości' },
        { href: '/blog', label: 'Blog' },
        { href: '/uslugi', label: 'Usługi' },
        { href: '/o-nas', label: 'O Nas' },
      ]

      return (
        <header className="sticky rounded-xl px-8 mt-4 flex items-center shadow-[0_8px_40px_rgba(164,167,174,0.12)] top-0 h-16 z-50 w-full bg-background backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="w-full flex justify-between">
                <Image className="" src="sygnet.svg" alt="Green House logo" width={40} height={40} />
                <div className="items-center flex">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium hover:underline text-primary hover:text-primary/80 px-4"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </header>
      )
}

export default Header;