"use client";
import { MuiButton } from "@/components/ui/MuiFormControls";
import CompareArrowsRounded from "@mui/icons-material/CompareArrowsRounded";
import { useToast } from "@/components/providers/ToastProvider";
export default function CompareButton({ slug }) { const { toast } = useToast(); function add() { const current = JSON.parse(localStorage.getItem("commerce_compare") || "[]"); const next = Array.from(new Set([...current, slug])).slice(-4); localStorage.setItem("commerce_compare", JSON.stringify(next)); toast(next.includes(slug) ? "Added to comparison" : "Comparison updated"); } return <MuiButton className="button ghost" onClick={add}><CompareArrowsRounded fontSize="small" />Compare</MuiButton>; }
