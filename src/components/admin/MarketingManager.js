"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { MuiInput } from "../ui/MuiFormControls";

const emptyCampaign = {
  name: "",
  type: "newsletter",
  subject: "",
  content: "",
  status: "draft",
  startsAt: "",
  endsAt: "",
  discountType: "percent",
  value: 10,
  scope: "all",
  productIds: "",
  categoryIds: "",
  href: "",
  label: "",
};

const emptyCoupon = {
  code: "",
  type: "percent",
  value: 10,
  minSubtotal: 0,
  maxDiscount: "",
  startsAt: "",
  endsAt: "",
  usageLimit: "",
  perUserLimit: 1,
  productIds: "",
  categoryIds: "",
};

function ids(value) {
  return String(value || "")
    .split(/[\s,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value, fallback) {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleString();
}

function getStatusColor(status) {
  switch (status) {
    case "active":
    case "running":
    case "completed":
      return "success";

    case "scheduled":
      return "info";

    case "draft":
      return "warning";

    case "cancelled":
    case "inactive":
      return "default";

    default:
      return "default";
  }
}

function StatusChip({ value }) {
  return (
    <Chip
      label={String(value || "unknown").replaceAll("_", " ")}
      color={getStatusColor(value)}
      size="small"
      sx={{
        textTransform: "capitalize",
        fontWeight: 600,
      }}
    />
  );
}

export default function MarketingManager() {
  const { toast } = useToast();

  const [data, setData] = useState(null);
  const [coupons, setCoupons] = useState([]);

  const [campaign, setCampaign] = useState(emptyCampaign);
  const [coupon, setCoupon] = useState(emptyCoupon);

  const [setting, setSetting] = useState({
    key: "homepage_announcement",
    value: "",
    group: "marketing",
  });

  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");

  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    type: "",
    id: "",
    name: "",
  });

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [marketingResponse, couponsResponse] = await Promise.all([
        fetch("/api/admin/marketing", {
          cache: "no-store",
        }),

        fetch("/api/admin/coupons", {
          cache: "no-store",
        }),
      ]);

      const [marketing, couponData] = await Promise.all([
        marketingResponse.json(),
        couponsResponse.json(),
      ]);

      if (!marketingResponse.ok) {
        throw new Error(
          marketing?.error || "Unable to load marketing information"
        );
      }

      if (!couponsResponse.ok) {
        throw new Error(couponData?.error || "Unable to load coupons");
      }

      setData(marketing);
      setCoupons(couponData.items || []);
    } catch (error) {
      console.error(error);

      toast(
        error?.message || "Unable to load marketing information",
        "error"
      );

      setData((current) => {
        return (
          current || {
            campaigns: [],
            settings: [],
          }
        );
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const campaigns = data?.campaigns || [];

  const activeFlashSales = useMemo(() => {
    return campaigns.filter(
      (item) =>
        item.type === "flash_sale" &&
        ["scheduled", "running"].includes(item.status)
    ).length;
  }, [campaigns]);

  async function createCampaign(event) {
    event.preventDefault();

    setBusyAction("create-campaign");

    try {
      const metadata = {
        href: campaign.href || "",

        label:
          campaign.label ||
          campaign.subject ||
          campaign.name,

        ...(campaign.type === "flash_sale"
          ? {
            discountType: campaign.discountType,

            value: Number(campaign.value || 0),

            allProducts: campaign.scope === "all",

            productIds:
              campaign.scope === "products"
                ? ids(campaign.productIds)
                : [],

            categoryIds:
              campaign.scope === "categories"
                ? ids(campaign.categoryIds)
                : [],
          }
          : {}),
      };

      const payload = {
        name: campaign.name,
        type: campaign.type,
        subject: campaign.subject,
        content: campaign.content,
        status: campaign.status,
        startsAt: campaign.startsAt || null,
        endsAt: campaign.endsAt || null,
        metadata,
      };

      const response = await fetch("/api/admin/marketing", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const result = await response.json();

      toast(
        response.ok
          ? "Campaign created"
          : result.error || "Unable to create campaign",
        response.ok ? "success" : "error"
      );

      if (response.ok) {
        setCampaign(emptyCampaign);
        await load();
      }
    } catch (error) {
      console.error(error);

      toast("Unable to create campaign", "error");
    } finally {
      setBusyAction("");
    }
  }

  async function updateCampaign(id, updates) {
    const actionKey = `campaign-${id}`;

    setBusyAction(actionKey);

    try {
      const response = await fetch("/api/admin/marketing", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
          updates,
        }),
      });

      const result = await response.json();

      toast(
        response.ok
          ? "Campaign updated"
          : result.error || "Unable to update campaign",
        response.ok ? "success" : "error"
      );

      if (response.ok) {
        await load();
      }
    } catch (error) {
      console.error(error);

      toast("Unable to update campaign", "error");
    } finally {
      setBusyAction("");
    }
  }

  async function deleteCampaign(id) {
    const actionKey = `campaign-${id}`;

    setBusyAction(actionKey);

    try {
      const response = await fetch("/api/admin/marketing", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
        }),
      });

      const result = await response.json();

      toast(
        response.ok
          ? "Campaign deleted"
          : result.error || "Unable to delete campaign",
        response.ok ? "success" : "error"
      );

      if (response.ok) {
        await load();
      }
    } catch (error) {
      console.error(error);

      toast("Unable to delete campaign", "error");
    } finally {
      setBusyAction("");
    }
  }

  async function sendBatch(id) {
    const actionKey = `campaign-${id}`;

    setBusyAction(actionKey);

    try {
      const response = await fetch("/api/admin/marketing", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
          action: "send",
        }),
      });

      const result = await response.json();

      toast(
        response.ok
          ? `Batch: ${result.batch?.sent || 0} sent${result.batch?.complete ? " · complete" : ""
          }`
          : result.error || "Send failed",
        response.ok ? "success" : "error"
      );

      if (response.ok) {
        await load();
      }
    } catch (error) {
      console.error(error);

      toast("Send failed", "error");
    } finally {
      setBusyAction("");
    }
  }

  async function createCoupon(event) {
    event.preventDefault();

    setBusyAction("create-coupon");

    try {
      const payload = {
        code: coupon.code,

        type: coupon.type,

        value: Number(coupon.value || 0),

        minSubtotal: Number(coupon.minSubtotal || 0),

        maxDiscount:
          coupon.maxDiscount === ""
            ? null
            : Number(coupon.maxDiscount),

        startsAt: coupon.startsAt || null,

        endsAt: coupon.endsAt || null,

        usageLimit:
          coupon.usageLimit === ""
            ? null
            : Number(coupon.usageLimit),

        perUserLimit: Number(coupon.perUserLimit || 1),

        productIds: ids(coupon.productIds),

        categoryIds: ids(coupon.categoryIds),
      };

      const response = await fetch("/api/admin/coupons", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const result = await response.json();

      toast(
        response.ok
          ? "Coupon created"
          : result.error || "Unable to create coupon",
        response.ok ? "success" : "error"
      );

      if (response.ok) {
        setCoupon(emptyCoupon);
        await load();
      }
    } catch (error) {
      console.error(error);

      toast("Unable to create coupon", "error");
    } finally {
      setBusyAction("");
    }
  }

  async function updateCoupon(id, updates) {
    const actionKey = `coupon-${id}`;

    setBusyAction(actionKey);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
          ...updates,
        }),
      });

      const result = await response.json();

      toast(
        response.ok
          ? "Coupon updated"
          : result.error || "Unable to update coupon",
        response.ok ? "success" : "error"
      );

      if (response.ok) {
        await load();
      }
    } catch (error) {
      console.error(error);

      toast("Unable to update coupon", "error");
    } finally {
      setBusyAction("");
    }
  }

  async function deleteCoupon(id) {
    const actionKey = `coupon-${id}`;

    setBusyAction(actionKey);

    try {
      const response = await fetch("/api/admin/coupons", {
        method: "DELETE",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          id,
        }),
      });

      const result = await response.json();

      toast(
        response.ok
          ? "Coupon deleted"
          : result.error || "Unable to delete coupon",
        response.ok ? "success" : "error"
      );

      if (response.ok) {
        await load();
      }
    } catch (error) {
      console.error(error);

      toast("Unable to delete coupon", "error");
    } finally {
      setBusyAction("");
    }
  }

  async function saveSetting(event) {
    event.preventDefault();

    setBusyAction("save-setting");

    try {
      let value = setting.value;

      try {
        value = JSON.parse(value);
      } catch {
        // Keep normal text values as strings.
      }

      const response = await fetch("/api/admin/marketing", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          action: "setting",
          key: setting.key,
          value,
        }),
      });

      const result = await response.json();

      toast(
        response.ok
          ? "Marketing setting saved"
          : result.error || "Unable to save setting",
        response.ok ? "success" : "error"
      );

      if (response.ok) {
        await load();
      }
    } catch (error) {
      console.error(error);

      toast("Unable to save setting", "error");
    } finally {
      setBusyAction("");
    }
  }

  function openDeleteDialog(type, id, name) {
    setDeleteDialog({
      open: true,
      type,
      id,
      name: name || "",
    });
  }

  function closeDeleteDialog() {
    if (busyAction) return;

    setDeleteDialog({
      open: false,
      type: "",
      id: "",
      name: "",
    });
  }

  async function confirmDelete() {
    const { type, id } = deleteDialog;

    if (!id) return;

    if (type === "campaign") {
      await deleteCampaign(id);
    }

    if (type === "coupon") {
      await deleteCoupon(id);
    }

    setDeleteDialog({
      open: false,
      type: "",
      id: "",
      name: "",
    });
  }

  if (loading && !data) {
    return (
      <Box
        sx={{
          minHeight: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress />

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Loading marketing manager...
          </Typography>
        </Stack>
      </Box>
    );
  }

  const statistics = [
    {
      label: "Campaigns",
      value: campaigns.length,
    },
    {
      label: "Active flash sales",
      value: activeFlashSales,
    },
    {
      label: "Coupons",
      value: coupons.length,
    },
    {
      label: "Homepage controls",
      value: data?.settings?.length || 0,
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {/* Statistics */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {statistics.map((stat) => (
          <Card
            key={stat.label}
            variant="outlined"
            sx={{
              borderRadius: 1,
              height: "100%",
            }}
          >
            <CardContent>
              <Stack spacing={1}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={500}
                >
                  {stat.label}
                </Typography>

                <Typography
                  variant="h4"
                  fontWeight={700}
                >
                  {stat.value}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Campaign and Coupon forms */}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            xl: "repeat(2, minmax(0, 1fr))",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Campaign */}

        <Card
          variant="outlined"
          sx={{
            borderRadius: 1,
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },

              "&:last-child": {
                pb: {
                  xs: 2,
                  sm: 3,
                },
              },
            }}
          >
            <Box
              component="form"
              onSubmit={createCampaign}
            >
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Campaign / Flash Sale
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    Create newsletters, notifications, banners and flash
                    sales.
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  <MuiInput
                    label="Name"
                    value={campaign.name}
                    onChange={(event) =>
                      setCampaign((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    required

                  />

                  <MuiInput
                    select
                    label="Type"
                    value={campaign.type}
                    onChange={(event) =>
                      setCampaign((current) => ({
                        ...current,
                        type: event.target.value,
                      }))
                    }
                    fullWidth
                  >
                    <MenuItem value="newsletter">
                      Newsletter
                    </MenuItem>

                    <MenuItem value="notification">
                      Promotional notification
                    </MenuItem>

                    <MenuItem value="flash_sale">
                      Flash sale
                    </MenuItem>

                    <MenuItem value="banner">
                      Promotional banner
                    </MenuItem>
                  </MuiInput>

                  <MuiInput
                    select
                    label="Status"
                    value={campaign.status}
                    onChange={(event) =>
                      setCampaign((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    fullWidth
                  >
                    <MenuItem value="draft">
                      Draft
                    </MenuItem>

                    <MenuItem value="scheduled">
                      Scheduled
                    </MenuItem>

                    <MenuItem value="running">
                      Running
                    </MenuItem>
                  </MuiInput>

                  <MuiInput
                    label="CTA href"
                    value={campaign.href}
                    onChange={(event) =>
                      setCampaign((current) => ({
                        ...current,
                        href: event.target.value,
                      }))
                    }
                    placeholder="/shop"
                    fullWidth
                  />

                  <Box>
                    <Typography sx={{ mb: 1, ml: 0.4 }}>Start date</Typography>
                    <MuiInput
                      type="datetime-local"
                      value={campaign.startsAt}
                      onChange={(event) =>
                        setCampaign((current) => ({
                          ...current,
                          startsAt: event.target.value,
                        }))
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ mb: 1, ml: 0.4 }}>End date</Typography>
                    <MuiInput
                      type="datetime-local"
                      value={campaign.endsAt}
                      onChange={(event) =>
                        setCampaign((current) => ({
                          ...current,
                          endsAt: event.target.value,
                        }))
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Box>
                </Box>

                <MuiInput
                  label="Subject / headline"
                  value={campaign.subject}
                  onChange={(event) =>
                    setCampaign((current) => ({
                      ...current,
                      subject: event.target.value,
                    }))
                  }
                  fullWidth
                />

                <MuiInput
                  label="Label"
                  value={campaign.label}
                  onChange={(event) =>
                    setCampaign((current) => ({
                      ...current,
                      label: event.target.value,
                    }))
                  }
                  fullWidth
                />

                <MuiInput
                  label="Content"
                  value={campaign.content}
                  onChange={(event) =>
                    setCampaign((current) => ({
                      ...current,
                      content: event.target.value,
                    }))
                  }
                  multiline
                  minRows={5}
                  fullWidth
                />

                {campaign.type === "flash_sale" && (
                  <Stack spacing={2}>
                    <Divider />

                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                    >
                      Flash sale configuration
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "repeat(3, minmax(0, 1fr))",
                        },
                        gap: 2,
                      }}
                    >
                      <MuiInput
                        select
                        label="Discount"
                        value={campaign.discountType}
                        onChange={(event) =>
                          setCampaign((current) => ({
                            ...current,
                            discountType: event.target.value,
                          }))
                        }
                        fullWidth
                      >
                        <MenuItem value="percent">
                          Percent
                        </MenuItem>

                        <MenuItem value="fixed">
                          Fixed
                        </MenuItem>
                      </MuiInput>

                      <MuiInput
                        label="Value"
                        type="number"
                        value={campaign.value}
                        onChange={(event) =>
                          setCampaign((current) => ({
                            ...current,
                            value: event.target.value,
                          }))
                        }
                        inputProps={{
                          min: 0,
                          step: "0.01",
                        }}
                        fullWidth
                      />

                      <MuiInput
                        select
                        label="Scope"
                        value={campaign.scope}
                        onChange={(event) =>
                          setCampaign((current) => ({
                            ...current,
                            scope: event.target.value,
                          }))
                        }
                        fullWidth
                      >
                        <MenuItem value="all">
                          All products
                        </MenuItem>

                        <MenuItem value="products">
                          Specific products
                        </MenuItem>

                        <MenuItem value="categories">
                          Specific categories
                        </MenuItem>
                      </MuiInput>
                    </Box>

                    {campaign.scope === "products" && (
                      <MuiInput
                        label="Product IDs"
                        value={campaign.productIds}
                        onChange={(event) =>
                          setCampaign((current) => ({
                            ...current,
                            productIds: event.target.value,
                          }))
                        }
                        placeholder="Comma or space-separated IDs"
                        multiline
                        minRows={3}
                        fullWidth
                      />
                    )}

                    {campaign.scope === "categories" && (
                      <MuiInput
                        label="Category IDs"
                        value={campaign.categoryIds}
                        onChange={(event) =>
                          setCampaign((current) => ({
                            ...current,
                            categoryIds: event.target.value,
                          }))
                        }
                        placeholder="Comma or space-separated IDs"
                        multiline
                        minRows={3}
                        fullWidth
                      />
                    )}
                  </Stack>
                )}

                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={busyAction === "create-campaign"}
                    startIcon={
                      busyAction === "create-campaign" ? (
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />
                      ) : null
                    }
                  >
                    {busyAction === "create-campaign"
                      ? "Creating..."
                      : "Create campaign"}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        {/* Coupon */}

        <Card
          variant="outlined"
          sx={{
            borderRadius: 1,
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },

              "&:last-child": {
                pb: {
                  xs: 2,
                  sm: 3,
                },
              },
            }}
          >
            <Box
              component="form"
              onSubmit={createCoupon}
            >
              <Stack spacing={3}>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                  >
                    Coupon / Discount Code
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    Create and control customer discount codes.
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  <MuiInput
                    label="Code"
                    value={coupon.code}
                    onChange={(event) =>
                      setCoupon((current) => ({
                        ...current,
                        code: event.target.value.toUpperCase(),
                      }))
                    }
                    required
                    fullWidth
                  />

                  <MuiInput
                    select
                    label="Type"
                    value={coupon.type}
                    onChange={(event) =>
                      setCoupon((current) => ({
                        ...current,
                        type: event.target.value,
                      }))
                    }
                    fullWidth
                  >
                    <MenuItem value="percent">
                      Percent
                    </MenuItem>

                    <MenuItem value="fixed">
                      Fixed
                    </MenuItem>

                    <MenuItem value="free_shipping">
                      Free shipping
                    </MenuItem>
                  </MuiInput>

                  <MuiInput
                    label="Value"
                    type="number"
                    value={coupon.value}
                    onChange={(event) =>
                      setCoupon((current) => ({
                        ...current,
                        value: event.target.value,
                      }))
                    }
                    inputProps={{
                      min: 0,
                      step: "0.01",
                    }}
                    fullWidth
                  />

                  <MuiInput
                    label="Minimum subtotal"
                    type="number"
                    value={coupon.minSubtotal}
                    onChange={(event) =>
                      setCoupon((current) => ({
                        ...current,
                        minSubtotal: event.target.value,
                      }))
                    }
                    inputProps={{
                      min: 0,
                      step: "0.01",
                    }}
                    fullWidth
                  />

                  <MuiInput
                    label="Maximum discount"
                    type="number"
                    value={coupon.maxDiscount}
                    onChange={(event) =>
                      setCoupon((current) => ({
                        ...current,
                        maxDiscount: event.target.value,
                      }))
                    }
                    placeholder="Unlimited"
                    inputProps={{
                      min: 0,
                      step: "0.01",
                    }}
                    fullWidth
                  />

                  <MuiInput
                    label="Total usage limit"
                    type="number"
                    value={coupon.usageLimit}
                    onChange={(event) =>
                      setCoupon((current) => ({
                        ...current,
                        usageLimit: event.target.value,
                      }))
                    }
                    placeholder="Unlimited"
                    inputProps={{
                      min: 1,
                    }}
                    fullWidth
                  />

                  <Box>
                    <Typography sx={{ mb: 1, ml: 0.4 }}>Starts date</Typography>
                    <MuiInput
                      type="datetime-local"
                      value={coupon.startsAt}
                      onChange={(event) =>
                        setCoupon((current) => ({
                          ...current,
                          startsAt: event.target.value,
                        }))
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Box>

                  <Box>
                    <Typography sx={{ mb: 1, ml: 0.4 }}>Ends date</Typography>
                    <MuiInput
                      type="datetime-local"
                      value={coupon.endsAt}
                      onChange={(event) =>
                        setCoupon((current) => ({
                          ...current,
                          endsAt: event.target.value,
                        }))
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                    />
                  </Box>

                  <MuiInput
                    label="Per-customer limit"
                    type="number"
                    value={coupon.perUserLimit}
                    onChange={(event) =>
                      setCoupon((current) => ({
                        ...current,
                        perUserLimit: event.target.value,
                      }))
                    }
                    inputProps={{
                      min: 1,
                    }}
                    fullWidth
                  />
                </Box>

                <MuiInput
                  label="Product IDs (optional)"
                  value={coupon.productIds}
                  onChange={(event) =>
                    setCoupon((current) => ({
                      ...current,
                      productIds: event.target.value,
                    }))
                  }
                  placeholder="Comma or space-separated IDs"
                  multiline
                  minRows={3}
                  fullWidth
                />

                <MuiInput
                  label="Category IDs (optional)"
                  value={coupon.categoryIds}
                  onChange={(event) =>
                    setCoupon((current) => ({
                      ...current,
                      categoryIds: event.target.value,
                    }))
                  }
                  placeholder="Comma or space-separated IDs"
                  multiline
                  minRows={3}
                  fullWidth
                />

                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={busyAction === "create-coupon"}
                    startIcon={
                      busyAction === "create-coupon" ? (
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />
                      ) : null
                    }
                  >
                    {busyAction === "create-coupon"
                      ? "Creating..."
                      : "Create coupon"}
                  </Button>
                </Box>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Campaign Table */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: 0,

            "&:last-child": {
              pb: 0,
            },
          }}
        >
          <Box
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },

              display: "flex",
              flexDirection: {
                xs: "column",
                sm: "row",
              },
              justifyContent: "space-between",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Campaigns
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Newsletter and notification sends are batched for serverless
              execution.
            </Typography>
          </Box>

          <Divider />

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 0,
            }}
          >
            <Table
              sx={{
                minWidth: 900,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight={700}>
                      Name
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700}>
                      Type
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700}>
                      Window
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700}>
                      Status
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700}>
                      Progress
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography fontWeight={700}>
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                    >
                      <Box
                        sx={{
                          py: 6,
                        }}
                      >
                        <Typography
                          variant="body1"
                          color="text.secondary"
                        >
                          No campaigns found.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((item) => {
                    const rowBusy =
                      busyAction === `campaign-${item._id}`;

                    return (
                      <TableRow
                        key={item._id}
                        hover
                      >
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography fontWeight={700}>
                              {item.name}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {item.subject || "No subject"}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Chip
                            label={String(item.type || "")
                              .replaceAll("_", " ")}
                            size="small"
                            variant="outlined"
                            sx={{
                              textTransform: "capitalize",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {formatDate(
                                item.startsAt,
                                "Now"
                              )}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {formatDate(
                                item.endsAt,
                                "No end"
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <StatusChip value={item.status} />
                        </TableCell>

                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {item.metadata?.sent || 0} sent
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {item.metadata?.failed || 0} failed
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {[
                              "newsletter",
                              "notification",
                            ].includes(item.type) &&
                              item.status !== "completed" && (
                                <Button
                                  size="small"
                                  variant="contained"
                                  disabled={rowBusy}
                                  onClick={() =>
                                    sendBatch(item._id)
                                  }
                                >
                                  Send batch
                                </Button>
                              )}

                            {item.status === "draft" && (
                              <Button
                                size="small"
                                variant="outlined"
                                disabled={rowBusy}
                                onClick={() =>
                                  updateCampaign(
                                    item._id,
                                    {
                                      status: item.startsAt
                                        ? "scheduled"
                                        : "running",
                                    }
                                  )
                                }
                              >
                                Activate
                              </Button>
                            )}

                            {[
                              "scheduled",
                              "running",
                            ].includes(item.status) && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                  disabled={rowBusy}
                                  onClick={() =>
                                    updateCampaign(
                                      item._id,
                                      {
                                        status: "cancelled",
                                      }
                                    )
                                  }
                                >
                                  Stop
                                </Button>
                              )}

                            {item.status === "cancelled" && (
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                disabled={rowBusy}
                                onClick={() =>
                                  updateCampaign(
                                    item._id,
                                    {
                                      status: "running",
                                    }
                                  )
                                }
                              >
                                Resume
                              </Button>
                            )}

                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={rowBusy}
                              onClick={() =>
                                openDeleteDialog(
                                  "campaign",
                                  item._id,
                                  item.name
                                )
                              }
                            >
                              Delete
                            </Button>

                            {rowBusy && (
                              <CircularProgress size={20} />
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Coupon Table */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            p: 0,

            "&:last-child": {
              pb: 0,
            },
          }}
        >
          <Box
            sx={{
              p: {
                xs: 2,
                sm: 3,
              },
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
            >
              Coupons & Discounts
            </Typography>
          </Box>

          <Divider />

          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 0,
            }}
          >
            <Table
              sx={{
                minWidth: 850,
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight={700}>
                      Code
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700}>
                      Offer
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700}>
                      Window
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700}>
                      Usage
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Typography fontWeight={700}>
                      Status
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography fontWeight={700}>
                      Actions
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      align="center"
                    >
                      <Box
                        sx={{
                          py: 6,
                        }}
                      >
                        <Typography
                          variant="body1"
                          color="text.secondary"
                        >
                          No coupons found.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((item) => {
                    const rowBusy =
                      busyAction === `coupon-${item._id}`;

                    let offer = "Free shipping";

                    if (item.type === "percent") {
                      offer = `${item.value}%`;
                    }

                    if (item.type === "fixed") {
                      offer = item.value;
                    }

                    return (
                      <TableRow
                        key={item._id}
                        hover
                      >
                        <TableCell>
                          <Chip
                            label={item.code}
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {offer}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {formatDate(
                                item.startsAt,
                                "Now"
                              )}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {formatDate(
                                item.endsAt,
                                "No end"
                              )}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2">
                            {item.usageCount || 0}
                            {item.usageLimit
                              ? ` / ${item.usageLimit}`
                              : ""}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <StatusChip
                            value={
                              item.active
                                ? "active"
                                : "inactive"
                            }
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                            alignItems="center"
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              color={
                                item.active
                                  ? "warning"
                                  : "success"
                              }
                              disabled={rowBusy}
                              onClick={() =>
                                updateCoupon(
                                  item._id,
                                  {
                                    active: !item.active,
                                  }
                                )
                              }
                            >
                              {item.active
                                ? "Disable"
                                : "Enable"}
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={rowBusy}
                              onClick={() =>
                                openDeleteDialog(
                                  "coupon",
                                  item._id,
                                  item.code
                                )
                              }
                            >
                              Delete
                            </Button>

                            {rowBusy && (
                              <CircularProgress size={20} />
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Homepage / Recommendation Setting */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 1,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              sm: 3,
            },

            "&:last-child": {
              pb: {
                xs: 2,
                sm: 3,
              },
            },
          }}
        >
          <Box
            component="form"
            onSubmit={saveSetting}
          >
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Homepage / Recommendation Setting
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Store banners, homepage sections, recommendation rules and
                  related-product rules as structured settings.
                </Typography>
              </Box>

              <Divider />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    lg: "320px minmax(0, 1fr)",
                  },
                  gap: 2,
                  alignItems: "start",
                }}
              >
                <MuiInput
                  select
                  label="Key"
                  value={setting.key}
                  onChange={(event) =>
                    setSetting((current) => ({
                      ...current,
                      key: event.target.value,
                    }))
                  }
                  fullWidth
                >
                  <MenuItem value="homepage_announcement">
                    Homepage announcement
                  </MenuItem>

                  <MenuItem value="homepage_banner">
                    Homepage banner
                  </MenuItem>

                  <MenuItem value="homepage_sections">
                    Homepage sections
                  </MenuItem>

                  <MenuItem value="recommendation_rules">
                    Recommendation rules
                  </MenuItem>

                  <MenuItem value="related_product_rules">
                    Related product rules
                  </MenuItem>
                </MuiInput>

                <MuiInput
                  label="Value (text or JSON)"
                  value={setting.value}
                  onChange={(event) =>
                    setSetting((current) => ({
                      ...current,
                      value: event.target.value,
                    }))
                  }
                  multiline
                  minRows={6}
                  fullWidth
                  placeholder='Example: {"enabled":true,"title":"Summer sale"}'
                />
              </Box>

              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={busyAction === "save-setting"}
                  startIcon={
                    busyAction === "save-setting" ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                      />
                    ) : null
                  }
                >
                  {busyAction === "save-setting"
                    ? "Saving..."
                    : "Save setting"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* MUI Delete Confirmation */}

      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          Delete{" "}
          {deleteDialog.type === "campaign"
            ? "campaign"
            : "coupon"}
          ?
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            {deleteDialog.name
              ? `"${deleteDialog.name}"`
              : "this item"}
            ? This action cannot be undone.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            disabled={Boolean(busyAction)}
          >
            Cancel
          </Button>

          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={Boolean(busyAction)}
            startIcon={
              busyAction ? (
                <CircularProgress
                  size={18}
                  color="inherit"
                />
              ) : null
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}