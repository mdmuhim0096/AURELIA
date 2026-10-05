import MarketingManager from "@/components/admin/MarketingManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Marketing management" };
export default function Page(){return <><AdminPageHeader eyebrow="Growth tools" title="Marketing" description="Manage coupons, campaigns and promotional experiences." /><MarketingManager /></>;}
