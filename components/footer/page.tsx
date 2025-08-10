import Link from "next/link";

export default function Footer() {
  return (
    <footer className="items-center ">
      <div className="p-6 bg-white z-20 border-t border-gray-200 flex justify-between max-w-5xl mx-auto absolute bottom-0 left-0 right-0 flex-col gap-4 lg:flex-row lg:gap-0">
        <p>© 2025 UME Loans. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/terms" className="hover:underline ">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
