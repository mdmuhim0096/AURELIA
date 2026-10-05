"use client";
import { MuiButton, MuiInput } from "@/components/ui/MuiFormControls";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import Loading from "@/components/ui/Loading";
import EmptyState from "@/components/ui/EmptyState";
import { useToast } from "@/components/providers/ToastProvider";
import { useUiStore } from "@/store/ui";
import { convertSegmentPathToStaticExportFilename } from "next/dist/shared/lib/segment-cache/segment-value-encoding";

export default function CartClient() {
  const [data, setData] = useState(null);
  const [coupon, setCoupon] = useState("");

  const { toast } = useToast();

  const setCartCount = useUiStore(
    (state) => state.setCartCount
  );

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/cart", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to load cart"
        );
      }

      setData(result.cart);

      setCartCount(
        (result.cart?.items || []).reduce(
          (total, item) =>
            total + item.quantity,
          0
        )
      );
    } catch (error) {
      console.error("[cart/load]", error);

      setData({
        items: [],
        savedItems: [],
        totals: {},
      });
    }
  }, [setCartCount]);

  useEffect(() => {
    load();
  }, [load]);

  async function update(
    itemId,
    quantity,
    savedForLater
  ) {
    try {
      const response = await fetch(
        "/api/cart",
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            itemId,
            quantity,

            ...(savedForLater !== undefined
              ? { savedForLater }
              : {}),
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Cart update failed"
        );
      }

      setData(result.cart);

      setCartCount(
        (result.cart?.items || []).reduce(
          (total, item) =>
            total + item.quantity,
          0
        )
      );
    } catch (error) {
      toast(
        error.message ||
          "Cart update failed",
        "error"
      );
    }
  }

  async function applyCoupon(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        "/api/cart",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            action: "coupon",
            code: coupon.trim(),
          }),
        }
      );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Unable to apply coupon"
        );
      }

      setData(result.cart);

      if (result.cart?.totals?.coupon) {
        toast(
          "Coupon applied",
          "success"
        );
      } else {
        toast(
          "Coupon is not valid for this cart",
          "warning"
        );
      }
    } catch (error) {
      toast(
        error.message ||
          "Unable to apply coupon",
        "error"
      );
    }
  }

  if (!data) {
    return (
      <Loading label="Loading your cart" />
    );
  }

  if (
    !data.items?.length &&
    !data.savedItems?.length
  ) {
    return (
      <EmptyState
        title="Your cart is empty."
        description="Start with the collection and save the pieces you want to come back to."
      />
    );
  }

  const currency =
    data.currency || "USD";

  return (
    <div className="cart-layout">
      <div>
        <div className="cart-list">
          {data.items?.map((item) => (
            <div
              className="cart-item"
              key={item.id}
            >
              {console.log(item)}
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  width={110}
                  height={130}
                />
              ) : (
                <div className="cart-item-image" />
              )}

              <div>
                <span className="eyebrow">
                  {item.sku}
                </span>

                <Link
                  href={`/product/${item.slug}`}
                >
                  <h3>{item.name}</h3>
                </Link>

                {Object.entries(
                  item.options || {}
                ).map(([key, value]) => (
                  <small
                    className="muted"
                    key={key}
                  >
                    {key}: {value}{" "}
                  </small>
                ))}

                {!item.available && (
                  <p
                    style={{
                      color:
                        "var(--danger)",
                    }}
                  >
                    Quantity exceeds
                    current stock.
                  </p>
                )}

                <div className="cart-item-actions">
                  <div className="qty">
                    <MuiButton
                      type="button"
                      onClick={() =>
                        update(
                          item.id,
                          Math.max(
                            1,
                            item.quantity -
                              1
                          )
                        )
                      }
                    >
                      −
                    </MuiButton>

                    <strong>
                      {item.quantity}
                    </strong>

                    <MuiButton
                      type="button"
                      onClick={() =>
                        update(
                          item.id,
                          item.quantity +
                            1
                        )
                      }
                    >
                      +
                    </MuiButton>
                  </div>

                  <MuiButton
                    type="button"
                    className="link-button"
                    onClick={() =>
                      update(
                        item.id,
                        item.quantity,
                        true
                      )
                    }
                  >
                    Save for later
                  </MuiButton>

                  <MuiButton
                    type="button"
                    className="link-button"
                    onClick={() =>
                      update(item.id, 0)
                    }
                  >
                    Remove
                  </MuiButton>
                </div>
              </div>

              <strong>
                {currency}{" "}
                {(
                  item.unitPrice *
                  item.quantity
                ).toFixed(2)}
              </strong>
            </div>
          ))}
        </div>

        {data.savedItems?.length >
          0 && (
          <div
            style={{
              marginTop: 30,
            }}
          >
            <h2
              className="section-title"
              style={{
                fontSize: "2.3rem",
              }}
            >
              Saved for later
            </h2>

            <div
              className="cart-list"
              style={{
                marginTop: 15,
              }}
            >
              {data.savedItems.map(
                (item) => (
                  <div
                    className="cart-item"
                    key={item.id}
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={110}
                        height={130}
                      />
                    ) : (
                      <div className="cart-item-image" />
                    )}

                    <div>
                      <h3>
                        {item.name}
                      </h3>

                      <MuiButton
                        type="button"
                        className="button small"
                        onClick={() =>
                          update(
                            item.id,
                            item.quantity,
                            false
                          )
                        }
                      >
                        Move to cart
                      </MuiButton>
                    </div>

                    <strong>
                      {currency}{" "}
                      {Number(
                        item.unitPrice
                      ).toFixed(2)}
                    </strong>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      <aside className="summary-card">
        <h2>Order summary</h2>

        <div className="summary-line">
          <span>Subtotal</span>

          <strong>
            {currency}{" "}
            {Number(
              data.totals?.subtotal ||
                0
            ).toFixed(2)}
          </strong>
        </div>

        <div className="summary-line">
          <span>Discount</span>

          <strong>
            − {currency}{" "}
            {Number(
              data.totals?.discount ||
                0
            ).toFixed(2)}
          </strong>
        </div>

        <div className="summary-line">
          <span>Shipping</span>

          <strong>
            {Number(
              data.totals?.shipping ||
                0
            ) === 0
              ? "Free"
              : `${currency} ${Number(
                  data.totals
                    .shipping
                ).toFixed(2)}`}
          </strong>
        </div>

        <div className="summary-line">
          <span>Tax</span>

          <strong>
            {currency}{" "}
            {Number(
              data.totals?.tax || 0
            ).toFixed(2)}
          </strong>
        </div>

        <div className="summary-line total">
          <span>Total</span>

          <span>
            {currency}{" "}
            {Number(
              data.totals?.total || 0
            ).toFixed(2)}
          </span>
        </div>

        <form
          className="coupon-row"
          onSubmit={applyCoupon}
        >
          <MuiInput
            className="input"
            value={coupon}
            onChange={(event) =>
              setCoupon(
                event.target.value
              )
            }
            placeholder="Coupon code"
          />

          <MuiButton
            type="submit"
            className="button small"
          >
            Apply
          </MuiButton>
        </form>

        <Link
          className="button dark"
          href="/checkout"
          style={{
            width: "100%",
          }}
        >
          Proceed to checkout
        </Link>

        <p
          className="muted"
          style={{
            fontSize: 12,
            lineHeight: 1.5,
          }}
        >
          Prices, discounts, tax and
          shipping are recalculated on
          the server before an order is
          created.
        </p>
      </aside>
    </div>
  );
}