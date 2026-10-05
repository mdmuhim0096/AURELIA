"use client";
import { MuiButton, MuiInput } from "@/components/ui/MuiFormControls";

import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import Loading from "@/components/ui/Loading";

const emptyAddress = {
  firstName: "",
  lastName: "",
  company: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  label: "Home",
  isDefaultShipping: false,
  isDefaultBilling: false,
};

export default function AddressesClient() {
  const { toast } = useToast();

  const [items, setItems] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  const loadAddresses = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/account/addresses", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to load addresses"
        );
      }

      setItems(
        Array.isArray(data?.items)
          ? data.items
          : []
      );
    } catch (err) {
      console.error("Failed to load addresses:", err);

      setError(
        err?.message ||
          "Unable to load addresses"
      );

      setItems([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchAddresses() {
      try {
        const response = await fetch(
          "/api/account/addresses",
          {
            method: "GET",
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
              "Unable to load addresses"
          );
        }

        setItems(
          Array.isArray(data?.items)
            ? data.items
            : []
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load addresses:",
          err
        );

        setError(
          err?.message ||
            "Unable to load addresses"
        );

        setItems([]);
      }
    }

    fetchAddresses();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        "/api/account/addresses",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to save address"
        );
      }

      toast("Address saved", "success");

      setForm({
        ...emptyAddress,
      });

      await loadAddresses();
    } catch (err) {
      console.error(
        "Failed to save address:",
        err
      );

      const message =
        err?.message ||
        "Unable to save address";

      setError(message);
      toast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    try {
      setRemovingId(id);
      setError("");

      const response = await fetch(
        `/api/account/addresses?id=${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
      );

      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to remove address"
        );
      }

      toast("Address removed", "success");

      await loadAddresses();
    } catch (err) {
      console.error(
        "Failed to remove address:",
        err
      );

      const message =
        err?.message ||
        "Unable to remove address";

      setError(message);
      toast(message, "error");
    } finally {
      setRemovingId(null);
    }
  }

  if (items === null) {
    return <Loading />;
  }

  const fields = [
    {
      name: "firstName",
      label: "First name",
      required: true,
      autoComplete: "given-name",
    },
    {
      name: "lastName",
      label: "Last name",
      required: true,
      autoComplete: "family-name",
    },
    {
      name: "company",
      label: "Company",
      required: false,
      autoComplete: "organization",
    },
    {
      name: "phone",
      label: "Phone",
      required: true,
      autoComplete: "tel",
    },
    {
      name: "line1",
      label: "Address line 1",
      required: true,
      autoComplete: "address-line1",
    },
    {
      name: "line2",
      label: "Address line 2",
      required: false,
      autoComplete: "address-line2",
    },
    {
      name: "city",
      label: "City",
      required: true,
      autoComplete: "address-level2",
    },
    {
      name: "state",
      label: "State / Region",
      required: false,
      autoComplete: "address-level1",
    },
    {
      name: "postalCode",
      label: "Postal code",
      required: true,
      autoComplete: "postal-code",
    },
    {
      name: "country",
      label: "Country",
      required: true,
      autoComplete: "country-name",
    },
    {
      name: "label",
      label: "Address label",
      required: true,
      autoComplete: "off",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "minmax(0, 1fr) minmax(0, 1fr)",
        gap: 20,
      }}
    >
      <div>
        <h2
          className="section-title"
          style={{
            fontSize: "2.5rem",
          }}
        >
          Saved addresses
        </h2>

        {error && (
          <div
            style={{
              marginTop: 16,
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

        {items.length === 0 ? (
          <div
            className="data-card"
            style={{
              padding: 20,
            }}
          >
            <p className="muted">
              No saved addresses yet.
            </p>
          </div>
        ) : (
          items.map((address) => {
            const isRemoving =
              removingId ===
              address._id;

            return (
              <div
                key={address._id}
                className="data-card"
                style={{
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <strong>
                    {address.label}
                  </strong>

                  {address.isDefaultShipping && (
                    <span className="status-badge status-approved">
                      Default shipping
                    </span>
                  )}

                  {address.isDefaultBilling && (
                    <span className="status-badge status-approved">
                      Default billing
                    </span>
                  )}
                </div>

                <p className="muted">
                  {address.firstName}{" "}
                  {address.lastName}

                  <br />

                  {address.line1}

                  {address.line2 ? (
                    <>
                      <br />
                      {address.line2}
                    </>
                  ) : null}

                  <br />

                  {address.city}

                  {address.state
                    ? ` ${address.state}`
                    : ""}

                  {address.postalCode
                    ? ` ${address.postalCode}`
                    : ""}

                  <br />

                  {address.country}

                  {address.phone ? (
                    <>
                      <br />
                      {address.phone}
                    </>
                  ) : null}
                </p>

                <MuiButton
                  type="button"
                  className="button small"
                  disabled={isRemoving}
                  onClick={() =>
                    remove(address._id)
                  }
                >
                  {isRemoving
                    ? "Removing..."
                    : "Remove"}
                </MuiButton>
              </div>
            );
          })
        )}
      </div>

      <form
        className="form-card"
        onSubmit={submit}
      >
        <h2>Add address</h2>

        {fields.map((field) => (
          <div
            className="field"
            key={field.name}
          >
            <label
              htmlFor={`address-${field.name}`}
            >
              {field.label}
            </label>

            <MuiInput
              id={`address-${field.name}`}
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              required={field.required}
              autoComplete={field.autoComplete}
            />
          </div>
        ))}

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 12,
          }}
        >
          <MuiInput
            type="checkbox"
            name="isDefaultShipping"
            checked={form.isDefaultShipping}
            onChange={handleChange}
          />

          Default shipping
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: "8px 0 16px",
          }}
        >
          <MuiInput
            type="checkbox"
            name="isDefaultBilling"
            checked={form.isDefaultBilling}
            onChange={handleChange}
          />

          Default billing
        </label>

        <MuiButton
          type="submit"
          className="button dark"
          disabled={saving}
        >
          {saving
            ? "Saving..."
            : "Save address"}
        </MuiButton>
      </form>
    </div>
  );
}