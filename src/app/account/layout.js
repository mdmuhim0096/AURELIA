import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountShell from "@/components/account/AccountShell";
export const metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default async function AccountLayout({ children }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");
  return <AccountShell user={session.user}>{children}</AccountShell>;
}
