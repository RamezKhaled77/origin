import { AppShell } from "@/components/layout/AppShell";
import { GlobalSidebar } from "@/components/layout/GlobalSidebar";
import { getCurrentUser } from "@/lib/auth/api";

export default async function GlobalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <AppShell sidebar={<GlobalSidebar userName={user?.name ?? "User"} />}>
      {children}
    </AppShell>
  );
}
