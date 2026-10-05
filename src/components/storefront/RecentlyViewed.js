"use client";
import { useEffect, useState } from "react";
import ProductCard from "@/components/storefront/ProductCard";
export function RecentlyViewedTracker({ productId }) { useEffect(()=>{fetch("/api/recently-viewed",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({productId})}).catch(()=>{});},[productId]); return null; }
export function RecentlyViewedGrid({ exclude }) { const [items,setItems]=useState([]); useEffect(()=>{fetch("/api/recently-viewed").then(r=>r.json()).then(d=>setItems((d.items||[]).filter(i=>String(i._id)!==String(exclude)))).catch(()=>{});},[exclude]); if(!items.length)return null; return <section className="section-pad"><div className="container"><div className="section-head"><div><span className="eyebrow">Your history</span><h2 className="section-title">Recently viewed.</h2></div></div><div className="product-grid">{items.slice(0,4).map(p=><ProductCard key={String(p._id)} product={p}/>)}</div></div></section>; }
