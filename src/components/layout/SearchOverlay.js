"use client";
import { useEffect, useRef, useState } from "react";
import Link from "@/components/navigation/ClientLink";
import Image from "next/image";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import CloseRounded from "@mui/icons-material/CloseRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import { useUiStore } from "@/store/ui";
import { MuiInput } from "../ui/MuiFormControls";


export default function SearchOverlay() {
  const open = useUiStore((s) => s.searchOpen);
  const close = useUiStore((s) => s.closeSearch);
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [recent, setRecent] = useState([]);
  const input = useRef(null);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => input.current?.focus(), 40);
    fetch("/api/search/history").then((r) => r.json()).then((d) => setRecent(d.items || [])).catch(() => {});
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!q.trim()) { setItems([]); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/catalog/products?q=${encodeURIComponent(q)}&limit=6`, { signal: controller.signal });
        const data = await res.json();
        setItems(data.items || []);
      } catch {}
    }, 220);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [q]);

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}>
      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" spacing={1} sx={{alignItems: "center"}}>
          <MuiInput
             inputRef={input} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search products, SKU, tags…"
            onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) { window.location.href = `/search?q=${encodeURIComponent(q.trim())}`; close(); } }}
          />
          <IconButton onClick={close} aria-label="Close search"><CloseRounded /></IconButton>
        </Stack>

        {!q && recent.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="overline" color="text.secondary">Recent searches</Typography>
            <Stack direction="row" sx={{ mt: 1, flexWrap: "wrap", gap: 1 }}>
              {[...new Map(recent.map((r) => [r.query, r])).values()].slice(0, 8).map((r) => <Chip key={r._id} label={r.query} component={Link} href={`/search?q=${encodeURIComponent(r.query)}`} onClick={close} clickable />)}
            </Stack>
          </Box>
        )}

        {q && !items.length && <Typography color="text.secondary" sx={{ py: 4, textAlign: "center" }}>Keep typing or press Enter for full search.</Typography>}

        <List sx={{ mt: 2 }}>
          {items.map((product) => (
            <ListItemButton key={product._id} component={Link} href={`/product/${product.slug}`} onClick={close} sx={{ borderRadius: 2, mb: .5 }}>
              <ListItemAvatar>
                <Avatar variant="rounded" sx={{ width: 58, height: 58, mr: 2, bgcolor: "action.hover" }}>
                  {product.media?.[0]?.url ? <Image src={product.media[0].url} alt={product.media[0].alt || product.name} fill sizes="58px" style={{ objectFit: "cover" }} /> : product.name?.[0]}
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={product.name} secondary={`${product.brand?.name || "Aurelia"} · ${product.currency || "USD"} ${Number(product.basePrice).toFixed(2)}`} />
            </ListItemButton>
          ))}
        </List>

        {q && <Button fullWidth component={Link} href={`/search?q=${encodeURIComponent(q)}`} onClick={close} endIcon={<ArrowForwardRounded />}>See all results for “{q}”</Button>}
      </DialogContent>
    </Dialog>
  );
}
