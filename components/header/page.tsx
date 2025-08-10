import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex justify-between items-center w-full pb-10 pt-6 px-6 max-w-5xl mx-auto ">
      <Link
        href="/"
        className="hover:opacity-80 transition-opacity hover:cursor-pointer"
      >
        <Image
          src="/logo.webp"
          alt="Loan Acquisition"
          width={200}
          height={200}
        />
      </Link>
    </header>
  );
}
