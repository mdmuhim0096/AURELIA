import {RolesManager} from "@/components/admin/GovernanceManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Roles and permissions" };
export default function Page(){return <><AdminPageHeader eyebrow="Access control" title="Roles & permissions" description="Control role capabilities and granular platform permissions." /><RolesManager /></>;}
