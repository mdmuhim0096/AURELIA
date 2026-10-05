import AdminSupportClient from "@/components/admin/AdminSupportClient";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Support administration" };
export default function Page(){return <><AdminPageHeader eyebrow="Customer care" title="Support inbox" description="Manage customer conversations, assignments and resolution status." /><AdminSupportClient /></>;}
