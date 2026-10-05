"use client";
import { MuiButton, MuiTextarea } from "@/components/ui/MuiFormControls";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/providers/ToastProvider";
export default function ProductQuestions({ productId, productSlug }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [items,setItems]=useState([]); const [question,setQuestion]=useState("");
  const load=()=>fetch(`/api/questions?productId=${productId}`).then(r=>r.json()).then(d=>setItems(d.items||[])).catch(()=>{});
  useEffect(()=>{load()},[productId]);
  async function submit(e){e.preventDefault();if(!session){location.href=`/login?callbackUrl=/product/${productSlug}`;return;}const r=await fetch('/api/questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({productId,question})});const d=await r.json();toast(r.ok?'Question submitted for moderation':d.error||'Unable to submit question',r.ok?'success':'error');if(r.ok)setQuestion('')}
  return <section className="section-pad" style={{background:"var(--card)"}}><div className="container"><div className="section-head"><div><span className="eyebrow">Questions & answers</span><h2 className="section-title">Ask before you buy.</h2></div></div><div style={{display:'grid',gridTemplateColumns:'minmax(0,1.3fr) minmax(280px,.7fr)',gap:28}}><div>{items.length?items.map(q=><article key={q._id} className="data-card" style={{padding:18,marginBottom:12}}><strong>{q.question}</strong><p className="muted" style={{margin:'6px 0 14px'}}>Asked by {q.user?.name||'Customer'}</p>{q.answers?.map(a=><div key={a._id} style={{borderLeft:'3px solid var(--acid)',paddingLeft:12,marginTop:10}}><b>{a.isStaff?'Staff answer':a.user?.name||'Answer'}</b><p>{a.body}</p></div>)}</article>):<p className="muted">No published questions yet.</p>}</div><form className="form-card" onSubmit={submit}><h3>Have a question?</h3><div className="field"><label>Question</label><MuiTextarea value={question} onChange={e=>setQuestion(e.target.value)} minLength={2} maxLength={1000} required/></div><MuiButton className="button dark">Submit question</MuiButton></form></div></div></section>
}
