import { Dashboard } from "@/components/dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decryptConnection, SQUARE_SESSION_COOKIE } from "@/lib/session";
import { getConnectedSnapshot } from "@/lib/square-monitor";

export const dynamic = "force-dynamic";

export default async function ConsolePage() {
  const jar = await cookies();
  const connection = decryptConnection(jar.get(SQUARE_SESSION_COOKIE)?.value);
  if (!connection) redirect("/connect");
  return <Dashboard initialSnapshot={await getConnectedSnapshot(connection)} productName="SquareDevDoctor" environmentLabel={`${connection.environment === "sandbox" ? "Sandbox" : "Production"} environment`} />;
}
