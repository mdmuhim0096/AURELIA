"use client";
import { MuiButton, MuiInput, MuiSelect } from "@/components/ui/MuiFormControls";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { useToast } from "@/components/providers/ToastProvider";
import Loading from "@/components/ui/Loading";

async function uploadFile(file) {
    const signatureResponse = await fetch(
        "/api/media/signature",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                folder: "commerce/support/admin",
            }),
        }
    );

    const signatureData =
        await signatureResponse.json();

    if (!signatureResponse.ok) {
        throw new Error(
            signatureData?.error ||
            "Upload unavailable"
        );
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
        "api_key",
        signatureData.apiKey
    );
    formData.append(
        "timestamp",
        String(signatureData.timestamp)
    );
    formData.append(
        "folder",
        signatureData.folder
    );
    formData.append(
        "signature",
        signatureData.signature
    );

    const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    const uploadData =
        await uploadResponse.json();

    if (!uploadResponse.ok) {
        throw new Error(
            uploadData?.error?.message ||
            "Upload failed"
        );
    }

    return {
        name: file.name,
        url: uploadData.secure_url,
        type:
            file.type ||
            uploadData.resource_type,
        size: file.size,
    };
}

export default function AdminSupportClient() {
    const { toast } = useToast();

    const [items, setItems] =
        useState(null);

    const [selected, setSelected] =
        useState(null);

    const [messages, setMessages] =
        useState([]);

    const [presence, setPresence] =
        useState({});

    const [text, setText] =
        useState("");

    const [file, setFile] =
        useState(null);

    const [sending, setSending] =
        useState(false);

    const [updating, setUpdating] =
        useState(false);

    const lastTyping =
        useRef(0);

    const loadConversations =
        useCallback(async () => {
            try {
                const response = await fetch(
                    "/api/admin/support",
                    {
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                        data?.message ||
                        "Unable to load support conversations"
                    );
                }

                const list =
                    Array.isArray(data?.items)
                        ? data.items
                        : [];

                setItems(list);

                setSelected((current) => {
                    if (current) {
                        return current;
                    }

                    return list[0]?._id || null;
                });
            } catch (error) {
                console.error(
                    "Unable to load support conversations:",
                    error
                );

                setItems([]);

                toast(
                    error?.message ||
                    "Unable to load support conversations",
                    "error"
                );
            }
        }, [toast]);

    useEffect(() => {
        let cancelled = false;

        async function fetchConversations() {
            try {
                const response = await fetch(
                    "/api/admin/support",
                    {
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (cancelled) {
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                        data?.message ||
                        "Unable to load support conversations"
                    );
                }

                const list =
                    Array.isArray(data?.items)
                        ? data.items
                        : [];

                setItems(list);

                setSelected((current) => {
                    if (current) {
                        return current;
                    }

                    return list[0]?._id || null;
                });
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load support conversations:",
                    error
                );

                setItems([]);

                toast(
                    error?.message ||
                    "Unable to load support conversations",
                    "error"
                );
            }
        }

        fetchConversations();

        return () => {
            cancelled = true;
        };
    }, [toast]);

    useEffect(() => {
        if (!selected) {
            setMessages([]);
            setPresence({});
            return;
        }

        let cancelled = false;
        let intervalId = null;

        async function fetchMessages() {
            try {
                const response = await fetch(
                    `/api/admin/support/${selected}/messages`,
                    {
                        cache: "no-store",
                    }
                );

                const data =
                    await response.json();

                if (cancelled) {
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data?.error ||
                        data?.message ||
                        "Unable to load messages"
                    );
                }

                setMessages(
                    Array.isArray(data?.items)
                        ? data.items
                        : []
                );

                setPresence(
                    data?.presence || {}
                );
            } catch (error) {
                if (cancelled) {
                    return;
                }

                console.error(
                    "Unable to load support messages:",
                    error
                );
            }
        }

        fetchMessages();

        intervalId = window.setInterval(
            () => {
                fetchMessages();
            },
            3500
        );

        return () => {
            cancelled = true;

            if (intervalId) {
                window.clearInterval(
                    intervalId
                );
            }
        };
    }, [selected]);

    async function send(event) {
        event.preventDefault();

        if (
            !selected ||
            (!text.trim() && !file)
        ) {
            return;
        }

        try {
            setSending(true);

            const attachments = file
                ? [await uploadFile(file)]
                : [];

            const response = await fetch(
                `/api/admin/support/${selected}/messages`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        body: text.trim(),
                        attachments,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Send failed"
                );
            }

            setText("");
            setFile(null);

            if (data?.message) {
                setMessages(
                    (current) => [
                        ...current,
                        data.message,
                    ]
                );
            }

            await loadConversations();
        } catch (error) {
            toast(
                error?.message ||
                "Send failed",
                "error"
            );
        } finally {
            setSending(false);
        }
    }

    function typing(value) {
        setText(value);

        const now = Date.now();

        if (
            now -
            lastTyping.current >
            2500 &&
            selected
        ) {
            lastTyping.current = now;

            fetch(
                `/api/admin/support/${selected}/messages`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        typing: true,
                    }),
                }
            ).catch(() => { });
        }
    }

    async function updateConversation(
        patch
    ) {
        if (!selected) {
            return;
        }

        try {
            setUpdating(true);

            const response = await fetch(
                "/api/admin/support",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        id: selected,
                        ...patch,
                    }),
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.error ||
                    data?.message ||
                    "Update failed"
                );
            }

            toast(
                "Conversation updated",
                "success"
            );

            await loadConversations();
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

    if (items === null) {
        return <Loading />;
    }

    const current =
        items.find(
            (item) =>
                item._id === selected
        ) || null;

    return (
        <div className="support-shell">
            <aside className="conversation-list">
                {items.length === 0 ? (
                    <div
                        style={{
                            padding: 14,
                        }}
                    >
                        <p className="muted">
                            No conversations found.
                        </p>
                    </div>
                ) : (
                    items.map(
                        (conversation) => (
                            <div
                                key={
                                    conversation._id
                                }
                                className={`conversation-item ${selected ===
                                        conversation._id
                                        ? "active"
                                        : ""
                                    }`}
                                onClick={() =>
                                    setSelected(
                                        conversation._id
                                    )
                                }
                            >
                                <strong>
                                    {conversation
                                        .ticket?.subject ||
                                        conversation
                                            .user?.name ||
                                        "Conversation"}
                                </strong>

                                <div
                                    className="muted"
                                    style={{
                                        fontSize: 12,
                                    }}
                                >
                                    {conversation
                                        .ticket
                                        ?.priority ||
                                        "normal"}
                                    {" · "}
                                    {
                                        conversation.status
                                    }
                                </div>
                            </div>
                        )
                    )
                )}
            </aside>

            <section className="chat-panel">
                {selected ? (
                    <>
                        <div className="data-card-head">
                            <div>
                                <strong>
                                    {current?.user
                                        ?.name ||
                                        "Customer"}
                                </strong>

                                <div
                                    className="muted"
                                    style={{
                                        fontSize: 12,
                                    }}
                                >
                                    {presence.customerTyping
                                        ? "Typing…"
                                        : presence.customerOnline
                                            ? "Online"
                                            : "Offline"}

                                    {" · "}

                                    {current?.user
                                        ?.email || ""}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 6,
                                }}
                            >
                                <MuiButton
                                    type="button"
                                    className="button small"
                                    disabled={updating}
                                    onClick={() =>
                                        updateConversation({
                                            assignToMe:
                                                true,
                                        })
                                    }
                                >
                                    {updating
                                        ? "Updating..."
                                        : "Assign to me"}
                                </MuiButton>

                                <MuiSelect
                                    className="input"
                                    style={{
                                        width: 130,
                                    }}
                                    value={
                                        current?.status ||
                                        "open"
                                    }
                                    disabled={updating}
                                    onChange={(event) =>
                                        updateConversation({
                                            status:
                                                event.target
                                                    .value,
                                        })
                                    }
                                >
                                    <option value="open">
                                        open
                                    </option>

                                    <option value="pending">
                                        pending
                                    </option>

                                    <option value="resolved">
                                        resolved
                                    </option>

                                    <option value="closed">
                                        closed
                                    </option>
                                </MuiSelect>
                            </div>
                        </div>

                        <div className="messages">
                            {messages.length ===
                                0 ? (
                                <p className="muted">
                                    No messages yet.
                                </p>
                            ) : (
                                messages.map(
                                    (message) => (
                                        <div
                                            key={
                                                message._id
                                            }
                                            className={`message ${message.senderRole !==
                                                    "customer"
                                                    ? "mine"
                                                    : ""
                                                }`}
                                        >
                                            <div>
                                                {
                                                    message.body
                                                }
                                            </div>

                                            {(
                                                message.attachments ||
                                                []
                                            ).map(
                                                (
                                                    attachment,
                                                    index
                                                ) => (
                                                    <a
                                                        key={
                                                            attachment._id ||
                                                            `${attachment.url}-${index}`
                                                        }
                                                        href={
                                                            attachment.url
                                                        }
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{
                                                            textDecoration:
                                                                "underline",
                                                            display:
                                                                "block",
                                                            marginTop:
                                                                6,
                                                        }}
                                                    >
                                                        {
                                                            attachment.name
                                                        }
                                                    </a>
                                                )
                                            )}

                                            <small
                                                style={{
                                                    opacity: 0.6,
                                                    display:
                                                        "block",
                                                    marginTop: 6,
                                                }}
                                            >
                                                {message.createdAt
                                                    ? new Date(
                                                        message.createdAt
                                                    ).toLocaleTimeString()
                                                    : ""}

                                                {message.senderRole !==
                                                    "customer" &&
                                                    presence.readAt
                                                    ? " · read"
                                                    : ""}
                                            </small>
                                        </div>
                                    )
                                )
                            )}
                        </div>

                        <form
                            className="chat-compose"
                            onSubmit={send}
                        >
                            <MuiInput
                                className="input"
                                value={text}
                                onChange={(event) =>
                                    typing(
                                        event.target.value
                                    )
                                }
                                placeholder="Reply…"
                            />

                            <label className="button small">
                                Attach

                                <MuiInput
                                    type="file"
                                    hidden
                                    onChange={(event) =>
                                        setFile(
                                            event.target
                                                .files?.[0] ||
                                            null
                                        )
                                    }
                                />
                            </label>

                            <MuiButton
                                type="submit"
                                className="button dark small"
                                disabled={
                                    sending ||
                                    (!text.trim() &&
                                        !file)
                                }
                            >
                                {sending
                                    ? "Sending..."
                                    : "Send"}
                            </MuiButton>
                        </form>

                        {file && (
                            <div
                                style={{
                                    padding:
                                        "0 14px 12px",
                                    fontSize: 12,
                                }}
                            >
                                {file.name}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="empty-state">
                        <h2>
                            No open conversation.
                        </h2>
                    </div>
                )}
            </section>
        </div>
    );
}