"use client";
import { MuiButton } from "@/components/ui/MuiFormControls";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import Loading from "@/components/ui/Loading";

export default function NotificationsClient() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        "/api/account/notifications",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load notifications."
        );
      }

      setItems(
        Array.isArray(data?.items)
          ? data.items
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load notifications:",
        err
      );

      setError(
        err?.message ||
          "Unable to load notifications."
      );

      setItems([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchNotifications() {
      try {
        const response = await fetch(
          "/api/account/notifications",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (cancelled) return;

        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Unable to load notifications."
          );
        }

        setItems(
          Array.isArray(data?.items)
            ? data.items
            : []
        );
      } catch (err) {
        if (cancelled) return;

        console.error(
          "Failed to load notifications:",
          err
        );

        setError(
          err?.message ||
            "Unable to load notifications."
        );

        setItems([]);
      }
    }

    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  async function mark(id, all = false) {
    try {
      setError("");

      if (all) {
        setMarkingAll(true);
      } else {
        setUpdatingId(id);
      }

      const response = await fetch(
        "/api/account/notifications",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            all,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to update notification."
        );
      }

      await load();
    } catch (err) {
      console.error(
        "Failed to update notification:",
        err
      );

      setError(
        err?.message ||
          "Unable to update notification."
      );
    } finally {
      setUpdatingId(null);
      setMarkingAll(false);
    }
  }

  if (items === null) {
    return <Loading />;
  }

  return (
    <>
      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: 14,
            borderRadius: 12,
            background: "color-mix(in srgb, var(--mui-danger) 14%, var(--mui-paper))",
            color: "#8c2424",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 10,
        }}
      >
        <MuiButton
          type="button"
          className="button small"
          disabled={
            markingAll ||
            items.length === 0
          }
          onClick={() =>
            mark(null, true)
          }
        >
          {markingAll
            ? "Marking..."
            : "Mark all read"}
        </MuiButton>
      </div>

      <div className="data-card">
        {items.length === 0 ? (
          <div
            style={{
              padding: 24,
              textAlign: "center",
            }}
          >
            <p className="muted">
              No notifications yet.
            </p>
          </div>
        ) : (
          items.map((notification) => {
            const isUpdating =
              updatingId ===
              notification._id;

            return (
              <div
                key={notification._id}
                style={{
                  padding: 18,
                  borderBottom:
                    "1px solid #eee",
                  opacity:
                    notification.readAt
                      ? 0.8
                      : 1,
                  cursor:
                    !notification.readAt &&
                    !isUpdating
                      ? "pointer"
                      : "default",
                }}
                onClick={() => {
                  if (
                    !notification.readAt &&
                    !isUpdating
                  ) {
                    mark(
                      notification._id
                    );
                  }
                }}
              >
                <span className="eyebrow">
                  {notification.type}
                </span>

                <h3
                  style={{
                    margin: "7px 0",
                  }}
                >
                  {notification.href ? (
                    <Link
                      href={
                        notification.href
                      }
                      onClick={(event) => {
                        event.stopPropagation();
                      }}
                    >
                      {notification.title}
                    </Link>
                  ) : (
                    notification.title
                  )}
                </h3>

                <p className="muted">
                  {notification.message}
                </p>

                <small>
                  {new Date(
                    notification.createdAt
                  ).toLocaleString()}
                </small>

                {isUpdating && (
                  <small
                    style={{
                      display: "block",
                      marginTop: 8,
                    }}
                  >
                    Updating...
                  </small>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}