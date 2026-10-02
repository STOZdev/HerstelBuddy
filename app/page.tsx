import { redirect } from "next/navigation";
import RecoveryBuddyApp from "./RecoveryBuddyApp";
import MinddistrictModuleLauncher from "./_components/MinddistrictModuleLauncher";
import { getSession } from "./_server/auth/session";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getSession();
  if (!session) redirect("/mock-minddistrict");

  return (
    <>
      <div className="integration-shell">
        <MinddistrictModuleLauncher
          patient={{
            displayName: session.displayName,
            minddistrictPatientId: session.minddistrictPatientId,
          }}
        />
      </div>
      <RecoveryBuddyApp />
    </>
  );
}
