"use client"; import { useEffect, useState } from "react"; import Link from "next/link"; import Loading from "@/components/ui/Loading"; import StatusBadge from "@/components/ui/StatusBadge"; import { useToast } from "@/components/providers/ToastProvider"; export function OrdersList() { const [items, setItems] = useState(null); const [status, setStatus] = useState(""); const [q, setQ] = useState(""); function load() { const p = new URLSearchParams(); if (status) p.set("status", status); if (q) p.set("q", q); fetch(`/api/admin/orders?${p}`).then(r => r.json()).then(d => setItems(d.items || [])) } useEffect(load, [status]); if (!items) return <Loading />; return <div className="data-card"><div className="data-card-head"><div style={{ display: "flex", gap: 8 }}><MuiInput className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Order or guest email" /><MuiButton className="button small" onClick={load}>Search</MuiButton></div><MuiSelect className="input" style={{ width: 180 }} value={status} onChange={e => setStatus(e.target.value)}><option value="">All statuses</option>{["pending", "payment_processing", "paid", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "refund_requested", "refunded", "failed"].map(s => <option key={s}>{s}</option>)}</MuiSelect></div><div className="data-table-wrap"><table className="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th>Payment</th><th>Total</th><th /></tr></thead><tbody>{items.map(o => <tr key={o._id}><td>{o.orderNumber}</td><td>{o.user?.name || o.guestEmail || "Guest"}</td><td>{new Date(o.createdAt).toLocaleDateString()}</td><td><StatusBadge value={o.status} /></td><td><StatusBadge value={o.paymentStatus} /></td><td>{o.currency} {o.total.toFixed(2)}</td><td><Link href={`/admin/orders/${o._id}`}>Manage →</Link></td></tr>)}</tbody></table></div></div> }
import { MuiButton, MuiInput, MuiSelect } from "@/components/ui/MuiFormControls";

export function OrderAdmin({ id }) {
    const [data, setData] = useState(null);
    const { toast } = useToast();

    async function load() {
        try {
            const response = await fetch(`/api/admin/orders/${id}`, {
                cache: "no-store",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Unable to load order");
            }

            setData(result);
        } catch (error) {
            console.error("Order load error:", error);

            setData({
                error: error.message || "Unable to load order",
            });
        }
    }

    useEffect(() => {
        load();
    }, [id]);

    async function action(payload) {
        try {
            const response = await fetch(`/api/admin/orders/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                toast(
                    result.error || "Update failed",
                    "error"
                );
                return;
            }

            toast("Order updated", "success");

            await load();
        } catch (error) {
            console.error("Order action error:", error);

            toast(
                error.message || "Update failed",
                "error"
            );
        }
    }

    if (!data) {
        return <Loading />;
    }

    const o = data.order;

    if (!o) {
        return <p>{data.error || "Order not found"}</p>;
    }

    return (
        <>
            <div className="stat-grid">
                <div className="stat-card">
                    <span>Status</span>
                    <strong style={{ fontSize: "1rem" }}>
                        <StatusBadge value={o.status} />
                    </strong>
                </div>

                <div className="stat-card">
                    <span>Payment</span>
                    <strong style={{ fontSize: "1rem" }}>
                        <StatusBadge value={o.paymentStatus} />
                    </strong>
                </div>

                <div className="stat-card">
                    <span>Total</span>
                    <strong>
                        {o.currency} {Number(o.total || 0).toFixed(2)}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>Provider</span>
                    <strong>{o.paymentProvider || "—"}</strong>
                </div>
            </div>

            <div className="form-card">
                <h2>Status</h2>

                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                    }}
                >
                    {[
                        "processing",
                        "packed",
                        "shipped",
                        "out_for_delivery",
                        "delivered",
                        "cancelled",
                        "failed",
                    ].map((status) => (
                        <MuiButton
                            key={status}
                            className="button small"
                            onClick={() =>
                                action({
                                    action: "status",
                                    status,
                                })
                            }
                        >
                            {status.replaceAll("_", " ")}
                        </MuiButton>
                    ))}
                </div>
            </div>

            <ShipmentForm onSubmit={action} />

            <div className="form-card">
                <h2>Refund requests / history</h2>

                {data.refunds?.length ? (
                    data.refunds.map((refund) => (
                        <div
                            className="summary-line"
                            key={refund._id}
                        >
                            <span>
                                <StatusBadge value={refund.status} /> ·{" "}
                                {refund.reason}
                                <br />

                                <small className="muted">
                                    {refund.destination}
                                </small>
                            </span>

                            <span>
                                {o.currency}{" "}
                                {Number(refund.amount || 0).toFixed(2)}

                                {refund.status === "requested" && (
                                    <MuiButton
                                        className="button small"
                                        style={{ marginLeft: 8 }}
                                        onClick={() =>
                                            action({
                                                action: "refund",
                                                refundId: refund._id,
                                                amount: refund.amount,
                                                reason: refund.reason,
                                                destination: refund.destination,
                                            })
                                        }
                                    >
                                        Process
                                    </MuiButton>
                                )}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="muted">
                        No refund requests yet.
                    </p>
                )}
            </div>

            <RefundForm
                max={Math.max(
                    0,
                    Number(data.payment?.amount || o.total || 0) -
                    Number(data.payment?.refundedAmount || 0)
                )}
                onSubmit={action}
            />

            <div className="form-card">
                <h2>Return requests</h2>

                {data.returns?.length ? (
                    data.returns.map((returnRequest) => (
                        <div
                            className="data-card"
                            style={{ padding: 16 }}
                            key={returnRequest._id}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                }}
                            >
                                <StatusBadge value={returnRequest.status} />

                                <span>
                                    {returnRequest.items?.length || 0} item(s)
                                </span>
                            </div>

                            <p className="muted">
                                {returnRequest.items
                                    ?.map(
                                        (item) =>
                                            `${item.quantity} × ${item.reason}`
                                    )
                                    .join(" · ")}
                            </p>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 8,
                                    flexWrap: "wrap",
                                }}
                            >
                                <MuiButton
                                    className="button small"
                                    onClick={() =>
                                        action({
                                            action: "return",
                                            returnId: returnRequest._id,
                                            status: "approved",
                                            resolution: "refund",
                                        })
                                    }
                                >
                                    Approve refund
                                </MuiButton>

                                <MuiButton
                                    className="button small"
                                    onClick={() =>
                                        action({
                                            action: "return",
                                            returnId: returnRequest._id,
                                            status: "approved",
                                            resolution: "replacement",
                                        })
                                    }
                                >
                                    Approve replacement
                                </MuiButton>

                                <MuiButton
                                    className="button small"
                                    onClick={() =>
                                        action({
                                            action: "return",
                                            returnId: returnRequest._id,
                                            status: "rejected",
                                        })
                                    }
                                >
                                    Reject
                                </MuiButton>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="muted">
                        No return requests.
                    </p>
                )}
            </div>

            <div className="form-card">
                <h2>Order timeline</h2>

                {o.timeline?.map((timeline, index) => (
                    <div
                        className="summary-line"
                        key={timeline._id || index}
                    >
                        <span>
                            {new Date(timeline.at).toLocaleString()} ·{" "}
                            {timeline.status?.replaceAll("_", " ")}
                        </span>

                        <span>{timeline.note}</span>
                    </div>
                ))}
            </div>

            <a
                className="button"
                href={`/api/orders/${id}/invoice`}
            >
                Download invoice PDF
            </a>
        </>
    );
}

function ShipmentForm({ onSubmit }) { const [f, setF] = useState({ provider: "", trackingNumber: "", trackingUrl: "", status: "shipped", estimatedDelivery: "" }); return <form className="form-card" onSubmit={e => { e.preventDefault(); onSubmit({ action: "shipment", ...f }) }}><h2>Shipping & tracking</h2><div className="form-grid">{[["provider", "Shipping provider"], ["trackingNumber", "Tracking number"], ["trackingUrl", "Tracking URL"], ["estimatedDelivery", "Estimated delivery"]].map(([k, l]) => <div className="field" key={k}><label>{l}</label><MuiInput type={k === "estimatedDelivery" ? "date" : "text"} value={f[k]} onChange={e => setF(x => ({ ...x, [k]: e.target.value }))} required={["provider", "trackingNumber"].includes(k)} /></div>)}</div><MuiButton className="button dark">Update shipment</MuiButton></form> }
function RefundForm({ max, onSubmit }) { const [f, setF] = useState({ amount: max, reason: "", destination: "original" }); return <form className="form-card" onSubmit={e => { e.preventDefault(); if (confirm(`Refund ${f.amount}?`)) onSubmit({ action: "refund", ...f, amount: Number(f.amount) }) }}><h2>Refund</h2><div className="form-grid"><div className="field"><label>Amount</label><MuiInput type="number" step="0.01" max={max} value={f.amount} onChange={e => setF(x => ({ ...x, amount: e.target.value }))} /></div><div className="field"><label>Destination</label><MuiSelect value={f.destination} onChange={e => setF(x => ({ ...x, destination: e.target.value }))}><option value="original">Original payment</option><option value="wallet">Customer wallet</option></MuiSelect></div><div className="field full"><label>Reason</label><MuiInput value={f.reason} onChange={e => setF(x => ({ ...x, reason: e.target.value }))} required /></div></div><MuiButton className="button">Process refund</MuiButton></form> }
