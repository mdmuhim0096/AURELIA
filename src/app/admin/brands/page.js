import TaxonomyManager from "@/components/admin/TaxonomyManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Brand management" };
export default function Page(){return <><AdminPageHeader eyebrow="Catalog structure" title="Brands" description="Manage brand identities and merchandising metadata." /><TaxonomyManager type="brands" /></>;}
