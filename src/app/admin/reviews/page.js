import ReviewsManager from "@/components/admin/ReviewsManager";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
export const metadata={ title: "Reviews and questions" };
export default function Page(){return <><AdminPageHeader eyebrow="Trust & community" title="Reviews & Q&A" description="Moderate product reviews and answer customer questions." /><ReviewsManager /></>;}
