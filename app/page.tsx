import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold tracking-tight">
        Apply for a loan today
      </h1>
      <p>
        By continuing, you agree to our{" "}
        <a href="/terms" className="text-blue-500">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-blue-500">
          Privacy Policy
        </a>
        .
      </p>
      <div className="mt-8 bg-red">
        <Link href="/loan-application">
          <Button className="font-bold p-6  w-fit hover:cursor-pointer">
            <div className="flex gap-3 items-center">
              Start application <ArrowRight />
            </div>
          </Button>
        </Link>
      </div>
    </div>
  );
}
