import {OrdersList} from "@/components/admin/OrdersManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Order administration" };
export default function Page(){return <><AdminPageHeader eyebrow="Fulfilment" title="Orders" description="Track payment, fulfilment and customer order progress." /><OrdersList /></>;}
