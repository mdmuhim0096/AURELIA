import {CustomersList} from "@/components/admin/CustomersManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Customer management" };
export default function Page(){return <><AdminPageHeader eyebrow="Accounts" title="Customers" description="Review customer accounts, status and activity." /><CustomersList /></>;}
