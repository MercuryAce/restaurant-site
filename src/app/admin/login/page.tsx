import { LoginForm } from "@/components/Forms";
import Image from "next/image";
import Link from "next/link";

export const metadata = { title: "Kitchen login" };

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-6">
        <Image src="/images/logo.png" alt="Kimo's Kitchen" width={140} height={108} />
      </Link>
      <LoginForm />
    </div>
  );
}
