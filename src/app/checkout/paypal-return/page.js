import PayPalReturn from"@/components/storefront/PayPalReturn";export default async function Page({searchParams}){const q=await searchParams;return <PayPalReturn order={q.order||""}/>}
