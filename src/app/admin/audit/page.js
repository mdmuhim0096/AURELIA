import {AuditLogs} from "@/components/admin/GovernanceManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Audit logs" };
export default function Page(){return <><AdminPageHeader eyebrow="Accountability" title="Audit logs" description="Review sensitive platform actions and administrative history." /><AuditLogs /></>;}
