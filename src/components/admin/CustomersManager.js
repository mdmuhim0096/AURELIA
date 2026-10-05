"use client";
import { MuiButton, MuiInput, MuiSelect } from "@/components/ui/MuiFormControls";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import Link from "next/link";

import Loading from "@/components/ui/Loading";
import StatusBadge from "@/components/ui/StatusBadge";
import { useToast } from "@/components/providers/ToastProvider";

export function CustomersList() {
    const [items, setItems] = useState(null);
    const [q, setQ] = useState("");
    const [searching, setSearching] = useState(false);

    const { toast } = useToast();

    const loadCustomers = useCallback(
        async (query = "") => {
            try {
                setSearching(true);

                const response = await fetch(
                    `/api/admin/customers?q=${encodeURIComponent(
                        query
                    )}`,
                    {
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                        data?.message ||
                        "Unable to load customers"
                    );
                }

                setItems(
                    Array.isArray(data?.items)
                        ? data.items
                        : []
                );
            } catch (error) {
                console.error(
                    "Unable to load customers:",
                    error
                );

                setItems([]);

                toast(
                    error?.message ||
                    "Unable to load customers",
                    "error"
                );
            } finally {
                setSearching(false);
            }
        },
        [toast]
    );

    useEffect(() => {
        let cancelled = false;

        async function fetchCustomers() {
            try {
                const response = await fetch(
                    "/api/admin/customers?q=",
                    {
                        cache: "no-store",
                    }
                );

                const data = await response.json();

                if (cancelled) {
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                        data?.message ||
                        "Unable to load customers"
                    );
                }

                setItems(
                    Array.isArray(data?.items)
                        ? data.items
                        : []
                );
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load customers:",
                    error
                );

                setItems([]);

                toast(
                    error?.message ||
                    "Unable to load customers",
                    "error"
                );
            }
        }

        fetchCustomers();

        return () => {
            cancelled = true;
        };
    }, [toast]);

    function handleSearch(event) {
        event?.preventDefault();

        loadCustomers(q);
    }

    if (items === null) {
        return <Loading />;
    }

    return (
        <div className="data-card">
            <div className="data-card-head">
                <form
                    onSubmit={handleSearch}
                    style={{
                        display: "flex",
                        gap: 8,
                    }}
                >
                    <MuiInput
                        className="input"
                        value={q}
                        onChange={(event) =>
                            setQ(event.target.value)
                        }
                        placeholder="Name or email"
                    />

                    <MuiButton
                        type="submit"
                        className="button small"
                        disabled={searching}
                    >
                        {searching
                            ? "Searching..."
                            : "Search"}
                    </MuiButton>
                </form>

                <span>
                    {items.length} accounts
                </span>
            </div>

            <div className="data-table-wrap">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Last login</th>
                            <th />
                        </tr>
                    </thead>

                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    style={{
                                        textAlign: "center",
                                        padding: 24,
                                    }}
                                >
                                    No customers found.
                                </td>
                            </tr>
                        ) : (
                            items.map((user) => (
                                <tr key={user._id}>
                                    <td>
                                        <strong>
                                            {user.name}
                                        </strong>

                                        <br />

                                        <span className="muted">
                                            {user.email}
                                        </span>
                                    </td>

                                    <td>
                                        {user.role?.name ||
                                            "Customer"}
                                    </td>

                                    <td>
                                        <StatusBadge
                                            value={
                                                user.status
                                            }
                                        />
                                    </td>

                                    <td>
                                        {user.createdAt
                                            ? new Date(
                                                user.createdAt
                                            ).toLocaleDateString()
                                            : "—"}
                                    </td>

                                    <td>
                                        {user.lastLoginAt
                                            ? new Date(
                                                user.lastLoginAt
                                            ).toLocaleString()
                                            : "Never"}
                                    </td>

                                    <td>
                                        <Link
                                            href={`/admin/customers/${user._id}`}
                                        >
                                            Manage →
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function CustomerDetail({
    id,
}) {
    const [data, setData] =
        useState(null);

    const [roles, setRoles] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [updating, setUpdating] =
        useState(false);

    const { toast } = useToast();

    const loadCustomer =
        useCallback(async () => {
            try {
                const response = await fetch(
                    `/api/admin/customers/${id}`,
                    {
                        cache: "no-store",
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result?.error ||
                        result?.message ||
                        "Unable to load customer"
                    );
                }

                setData(result);
            } catch (error) {
                console.error(
                    "Unable to load customer:",
                    error
                );

                setData({
                    error:
                        error?.message ||
                        "Unable to load customer",
                });
            }
        }, [id]);

    useEffect(() => {
        let cancelled = false;

        async function loadPageData() {
            try {
                setLoading(true);

                const [
                    customerResponse,
                    rolesResponse,
                ] = await Promise.all([
                    fetch(
                        `/api/admin/customers/${id}`,
                        {
                            cache: "no-store",
                        }
                    ),

                    fetch(
                        "/api/admin/roles",
                        {
                            cache: "no-store",
                        }
                    ),
                ]);

                const [
                    customerData,
                    rolesData,
                ] = await Promise.all([
                    customerResponse.json(),
                    rolesResponse.json(),
                ]);

                if (cancelled) {
                    return;
                }

                if (
                    !customerResponse.ok
                ) {
                    throw new Error(
                        customerData?.error ||
                        customerData?.message ||
                        "Unable to load customer"
                    );
                }

                setData(customerData);

                if (rolesResponse.ok) {
                    setRoles(
                        Array.isArray(
                            rolesData?.roles
                        )
                            ? rolesData.roles
                            : []
                    );
                } else {
                    setRoles([]);
                }
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load customer detail:",
                    error
                );

                setData({
                    error:
                        error?.message ||
                        "Unable to load customer",
                });
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadPageData();

        return () => {
            cancelled = true;
        };
    }, [id]);

    async function update(changes) {
        try {
            setUpdating(true);

            const response = await fetch(
                `/api/admin/customers/${id}`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(
                        changes
                    ),
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result?.error ||
                    result?.message ||
                    "Update failed"
                );
            }

            toast(
                "Customer updated",
                "success"
            );

            await loadCustomer();
        } catch (error) {
            toast(
                error?.message ||
                "Update failed",
                "error"
            );
        } finally {
            setUpdating(false);
        }
    }

    if (loading) {
        return <Loading />;
    }

    if (!data) {
        return <Loading />;
    }

    if (!data.user) {
        return (
            <p>
                {data.error ||
                    "Customer not found"}
            </p>
        );
    }

    const user = data.user;

    const walletTotal =
        Number(
            data.wallet
                ?.availableBalance || 0
        ) +
        Number(
            data.wallet
                ?.promotionalBalance || 0
        );

    return (
        <>
            <div className="form-card">
                <h2>
                    Account
                </h2>

                <div className="form-grid">
                    <div className="field">
                        <label>
                            Name
                        </label>

                        <MuiInput
                            defaultValue={
                                user.name
                            }
                            disabled={updating}
                            onBlur={(event) => {
                                const value =
                                    event.target.value.trim();

                                if (
                                    value &&
                                    value !==
                                    user.name
                                ) {
                                    update({
                                        name: value,
                                    });
                                }
                            }}
                        />
                    </div>

                    <div className="field">
                        <label>
                            Phone
                        </label>

                        <MuiInput
                            defaultValue={
                                user.phone || ""
                            }
                            disabled={updating}
                            onBlur={(event) => {
                                const value =
                                    event.target.value;

                                if (
                                    value !==
                                    (user.phone || "")
                                ) {
                                    update({
                                        phone: value,
                                    });
                                }
                            }}
                        />
                    </div>

                    <div className="field">
                        <label>
                            Status
                        </label>

                        <MuiSelect
                            value={
                                user.status
                            }
                            disabled={updating}
                            onChange={(event) =>
                                update({
                                    status:
                                        event.target.value,
                                })
                            }
                        >
                            <option value="active">
                                active
                            </option>

                            <option value="suspended">
                                suspended
                            </option>

                            <option value="disabled">
                                disabled
                            </option>
                        </MuiSelect>
                    </div>

                    {roles.length > 0 && (
                        <div className="field">
                            <label>
                                Role
                            </label>

                            <MuiSelect
                                value={
                                    user.role?.slug ||
                                    "customer"
                                }
                                disabled={updating}
                                onChange={(event) =>
                                    update({
                                        roleSlug:
                                            event.target
                                                .value,
                                    })
                                }
                            >
                                {roles.map(
                                    (role) => (
                                        <option
                                            value={
                                                role.slug
                                            }
                                            key={
                                                role._id
                                            }
                                        >
                                            {
                                                role.name
                                            }
                                        </option>
                                    )
                                )}
                            </MuiSelect>
                        </div>
                    )}
                </div>

                <p className="muted">
                    {user.email}

                    {" · joined "}

                    {user.createdAt
                        ? new Date(
                            user.createdAt
                        ).toLocaleString()
                        : "Unknown"}
                </p>
            </div>

            <div className="stat-grid">
                <div className="stat-card">
                    <span>
                        Orders
                    </span>

                    <strong>
                        {data.orders?.length ||
                            0}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>
                        Wallet
                    </span>

                    <strong>
                        {data.wallet
                            ?.currency ||
                            "USD"}{" "}
                        {walletTotal.toFixed(
                            2
                        )}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>
                        Wallet entries
                    </span>

                    <strong>
                        {data
                            .walletTransactions
                            ?.length || 0}
                    </strong>
                </div>

                <div className="stat-card">
                    <span>
                        Support tickets
                    </span>

                    <strong>
                        {data
                            .supportHistory
                            ?.length || 0}
                    </strong>
                </div>
            </div>

            <div className="data-card">
                <div className="data-card-head">
                    <strong>
                        Order history
                    </strong>
                </div>

                <div className="data-table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order</th>
                                <th>Status</th>
                                <th>Total</th>
                                <th>Date</th>
                            </tr>
                        </thead>

                        <tbody>
                            {(data.orders || [])
                                .length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        style={{
                                            textAlign:
                                                "center",
                                            padding: 24,
                                        }}
                                    >
                                        No orders yet.
                                    </td>
                                </tr>
                            ) : (
                                (
                                    data.orders ||
                                    []
                                ).map(
                                    (order) => (
                                        <tr
                                            key={
                                                order._id
                                            }
                                        >
                                            <td>
                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                >
                                                    {
                                                        order.orderNumber
                                                    }
                                                </Link>
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    value={
                                                        order.status
                                                    }
                                                />
                                            </td>

                                            <td>
                                                {
                                                    order.currency
                                                }{" "}
                                                {Number(
                                                    order.total ||
                                                    0
                                                ).toFixed(
                                                    2
                                                )}
                                            </td>

                                            <td>
                                                {order.createdAt
                                                    ? new Date(
                                                        order.createdAt
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="data-card">
                <div className="data-card-head">
                    <strong>
                        Account activity
                    </strong>
                </div>

                {(data.activity || [])
                    .length === 0 ? (
                    <div
                        style={{
                            padding: 20,
                        }}
                    >
                        <p className="muted">
                            No activity recorded.
                        </p>
                    </div>
                ) : (
                    (data.activity || []).map(
                        (activity) => (
                            <div
                                className="summary-line"
                                key={activity._id}
                            >
                                <span>
                                    {
                                        activity.action
                                    }
                                </span>

                                <span>
                                    {activity.createdAt
                                        ? new Date(
                                            activity.createdAt
                                        ).toLocaleString()
                                        : "—"}
                                </span>
                            </div>
                        )
                    )
                )}
            </div>
        </>
    );
}