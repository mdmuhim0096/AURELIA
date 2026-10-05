import {ProductList} from "@/components/admin/ProductManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Product management" };
export default function Page(){return <><AdminPageHeader eyebrow="Catalog control" title="Products" description="Create, publish and maintain the complete product catalog." /><ProductList /></>;}
