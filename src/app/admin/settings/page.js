import {SettingsManager} from "@/components/admin/GovernanceManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Platform settings" };
export default function Page(){return <><AdminPageHeader eyebrow="Configuration" title="Settings" description="Manage runtime configuration and operational defaults." /><SettingsManager /></>;}
