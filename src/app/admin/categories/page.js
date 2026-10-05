import TaxonomyManager from "@/components/admin/TaxonomyManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Category management" };
export default function Page(){return <><AdminPageHeader eyebrow="Catalog structure" title="Categories" description="Organize the storefront into clear, discoverable collections." /><TaxonomyManager type="categories" /></>;}
