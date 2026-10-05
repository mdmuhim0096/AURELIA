"use client";
import { MuiButton, MuiInput, MuiTextarea } from "@/components/ui/MuiFormControls";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Loading from "@/components/ui/Loading";
import { useToast } from "@/components/providers/ToastProvider";

export function AuditLogs() {
  const [items, setItems] = useState(null);
  const [action, setAction] = useState("");
  const [resourceType, setResourceType] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const loadAuditLogs = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);

        const params = new URLSearchParams();

        const actionValue =
          filters.action ?? action;

        const resourceValue =
          filters.resourceType ?? resourceType;

        if (actionValue) {
          params.set("action", actionValue);
        }

        if (resourceValue) {
          params.set(
            "resourceType",
            resourceValue
          );
        }

        const response = await fetch(
          `/api/admin/audit?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              data?.message ||
              "Unable to load audit logs"
          );
        }

        setItems(
          Array.isArray(data?.items)
            ? data.items
            : []
        );
      } catch (error) {
        console.error(
          "Unable to load audit logs:",
          error
        );

        setItems([]);

        toast(
          error?.message ||
            "Unable to load audit logs",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [action, resourceType, toast]
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchAuditLogs() {
      try {
        const response = await fetch(
          "/api/admin/audit",
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
              "Unable to load audit logs"
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
          "Unable to load audit logs:",
          error
        );

        setItems([]);

        toast(
          error?.message ||
            "Unable to load audit logs",
          "error"
        );
      }
    }

    fetchAuditLogs();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  if (items === null) {
    return <Loading />;
  }

  return (
    <div className="data-card">
      <div className="data-card-head">
        <div
          style={{
            display: "flex",
            gap: 8,
          }}
        >
          <MuiInput
            className="input"
            value={action}
            onChange={(event) =>
              setAction(event.target.value)
            }
            placeholder="Action contains…"
          />

          <MuiInput
            className="input"
            value={resourceType}
            onChange={(event) =>
              setResourceType(
                event.target.value
              )
            }
            placeholder="Resource type"
          />

          <MuiButton
            type="button"
            className="button small"
            disabled={loading}
            onClick={() =>
              loadAuditLogs()
            }
          >
            {loading
              ? "Loading..."
              : "Filter"}
          </MuiButton>
        </div>
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Resource</th>
              <th>IP</th>
              <th>Device</th>
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
                  No audit logs found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item._id}>
                  <td>
                    {item.createdAt
                      ? new Date(
                          item.createdAt
                        ).toLocaleString()
                      : "—"}
                  </td>

                  <td>
                    {item.actor?.email ||
                      "System"}
                  </td>

                  <td>
                    {item.action}
                  </td>

                  <td>
                    {item.resourceType}
                    {" · "}
                    {item.resourceId}
                  </td>

                  <td>
                    {item.ip || "—"}
                  </td>

                  <td
                    title={
                      item.userAgent || ""
                    }
                  >
                    {(
                      item.userAgent || "—"
                    ).slice(0, 42)}
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

export function RolesManager() {
  const [data, setData] = useState(null);
  const [selected, setSelected] =
    useState(null);
  const [saving, setSaving] =
    useState(false);

  const { toast } = useToast();

  const loadRoles = useCallback(
    async () => {
      try {
        const response = await fetch(
          "/api/admin/roles",
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
              "Unable to load roles"
          );
        }

        setData(result);

        setSelected((current) => {
          if (!result.roles?.length) {
            return null;
          }

          if (!current) {
            return result.roles[0];
          }

          return (
            result.roles.find(
              (role) =>
                role._id === current._id
            ) || result.roles[0]
          );
        });
      } catch (error) {
        console.error(
          "Unable to load roles:",
          error
        );

        setData({
          roles: [],
          permissions: [],
        });

        toast(
          error?.message ||
            "Unable to load roles",
          "error"
        );
      }
    },
    [toast]
  );

  useEffect(() => {
    let cancelled = false;

    async function fetchRoles() {
      try {
        const response = await fetch(
          "/api/admin/roles",
          {
            cache: "no-store",
          }
        );

        const result =
          await response.json();

        if (cancelled) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            result?.error ||
              result?.message ||
              "Unable to load roles"
          );
        }

        setData(result);

        if (
          result.roles?.length
        ) {
          setSelected(
            result.roles[0]
          );
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to load roles:",
          error
        );

        setData({
          roles: [],
          permissions: [],
        });

        toast(
          error?.message ||
            "Unable to load roles",
          "error"
        );
      }
    }

    fetchRoles();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function toggle(key) {
    if (!selected || !data) {
      return;
    }

    const hasPermission =
      selected.permissions?.some(
        (permission) =>
          permission.key === key
      );

    const permissionToAdd =
      data.permissions?.find(
        (permission) =>
          permission.key === key
      );

    const nextPermissions =
      hasPermission
        ? selected.permissions.filter(
            (permission) =>
              permission.key !== key
          )
        : permissionToAdd
          ? [
              ...(selected.permissions ||
                []),
              permissionToAdd,
            ]
          : selected.permissions || [];

    const nextRole = {
      ...selected,
      permissions: nextPermissions,
    };

    setSelected(nextRole);

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/roles",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: nextRole._id,
            name: nextRole.name,

            permissions:
              nextRole.permissions.map(
                (permission) =>
                  permission.key
              ),
          }),
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
        "Permissions updated",
        "success"
      );

      await loadRoles();
    } catch (error) {
      toast(
        error?.message ||
          "Update failed",
        "error"
      );

      await loadRoles();
    } finally {
      setSaving(false);
    }
  }

  if (data === null) {
    return <Loading />;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "280px 1fr",
        gap: 20,
      }}
    >
      <div className="data-card">
        {(data.roles || []).length ===
        0 ? (
          <div
            style={{
              padding: 20,
            }}
          >
            <p className="muted">
              No roles found.
            </p>
          </div>
        ) : (
          data.roles.map((role) => (
            <MuiButton
              type="button"
              key={role._id}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                border: 0,
                borderBottom:
                  "1px solid #eee",
                padding: 14,

                background:
                  selected?._id ===
                  role._id
                    ? "var(--paper)"
                    : "white",
              }}
              onClick={() =>
                setSelected(role)
              }
            >
              <strong>
                {role.name}
              </strong>

              <div className="muted">
                {role.slug}
              </div>
            </MuiButton>
          ))
        )}
      </div>

      <div className="form-card">
        <h2>
          {selected?.name ||
            "Role"}
        </h2>

        <p className="muted">
          Configure granular permissions.
          System roles stay named consistently
          while permission membership is
          editable.
        </p>

        {!selected ? (
          <p className="muted">
            Select a role.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2,1fr)",
              gap: 8,
            }}
          >
            {(data.permissions || []).map(
              (permission) => {
                const checked =
                  selected.permissions?.some(
                    (item) =>
                      item.key ===
                      permission.key
                  ) || false;

                return (
                  <label
                    key={
                      permission.key
                    }
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: 10,
                      border:
                        "1px solid #eee",
                      borderRadius: 10,
                    }}
                  >
                    <MuiInput
                      type="checkbox"
                      checked={checked}
                      disabled={saving}
                      onChange={() =>
                        toggle(
                          permission.key
                        )
                      }
                    />

                    <span>
                      <strong>
                        {
                          permission.key
                        }
                      </strong>

                      <br />

                      <small className="muted">
                        {permission.description ||
                          "Platform permission"}
                      </small>
                    </span>
                  </label>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function SettingsManager() {
  const [items, setItems] =
    useState(null);

  const [form, setForm] =
    useState({
      key: "",
      group: "general",
      value: "",
    });

  const [saving, setSaving] =
    useState(false);

  const { toast } = useToast();

  const loadSettings =
    useCallback(async () => {
      try {
        const response = await fetch(
          "/api/admin/settings",
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
              "Unable to load settings"
          );
        }

        setItems(
          Array.isArray(data?.items)
            ? data.items
            : []
        );
      } catch (error) {
        console.error(
          "Unable to load settings:",
          error
        );

        setItems([]);

        toast(
          error?.message ||
            "Unable to load settings",
          "error"
        );
      }
    }, [toast]);

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      try {
        const response = await fetch(
          "/api/admin/settings",
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
              "Unable to load settings"
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
          "Unable to load settings:",
          error
        );

        setItems([]);

        toast(
          error?.message ||
            "Unable to load settings",
          "error"
        );
      }
    }

    fetchSettings();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function save(event) {
    event.preventDefault();

    try {
      setSaving(true);

      let value = form.value;

      try {
        value = JSON.parse(value);
      } catch {
        // Keep plain text.
      }

      const response = await fetch(
        "/api/admin/settings",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...form,
            value,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Save failed"
        );
      }

      toast(
        "Setting saved",
        "success"
      );

      setForm({
        key: "",
        group: "general",
        value: "",
      });

      await loadSettings();
    } catch (error) {
      toast(
        error?.message ||
          "Save failed",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  if (items === null) {
    return <Loading />;
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "1.2fr .8fr",
        gap: 20,
      }}
    >
      <div className="data-card">
        <div className="data-card-head">
          <strong>
            Runtime settings
          </strong>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              padding: 20,
            }}
          >
            <p className="muted">
              No runtime settings found.
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              className="summary-line"
              key={item._id}
            >
              <span>
                <strong>
                  {item.key}
                </strong>

                <br />

                <small className="muted">
                  {item.group}
                </small>
              </span>

              <code
                style={{
                  maxWidth: "55%",
                  overflow: "hidden",
                  textOverflow:
                    "ellipsis",
                }}
              >
                {JSON.stringify(
                  item.value
                )}
              </code>
            </div>
          ))
        )}
      </div>

      <form
        className="form-card"
        onSubmit={save}
      >
        <h2>
          Set value
        </h2>

        <div className="field">
          <label>
            Key
          </label>

          <MuiInput
            value={form.key}
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,
                  key:
                    event.target.value,
                })
              )
            }
            required
          />
        </div>

        <div className="field">
          <label>
            Group
          </label>

          <MuiInput
            value={form.group}
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,
                  group:
                    event.target.value,
                })
              )
            }
          />
        </div>

        <div className="field">
          <label>
            Value (text or JSON)
          </label>

          <MuiTextarea
            value={form.value}
            onChange={(event) =>
              setForm(
                (current) => ({
                  ...current,
                  value:
                    event.target.value,
                })
              )
            }
          />
        </div>

        <MuiButton
          type="submit"
          className="button dark"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save"}
        </MuiButton>
      </form>
    </div>
  );
}