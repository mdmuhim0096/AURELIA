import CartClient from "@/components/storefront/CartClient";
export const metadata={title:"Cart",robots:{index:false,follow:false}};
export default function CartPage(){return <div className="container"><header className="page-hero"><span className="eyebrow">Your selection</span><h1 className="display">Shopping bag.</h1></header><CartClient/></div>}
