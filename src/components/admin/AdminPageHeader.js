import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

export default function AdminPageHeader({ eyebrow, title, description }) {
  return <Box sx={{ mb: 3 }}><Chip label={eyebrow} size="small" color="primary" variant="outlined" /><Typography variant="h3" sx={{ mt: 1 }}>{title}</Typography>{description && <Typography color="text.secondary" sx={{ mt: .75, maxWidth: 760 }}>{description}</Typography>}</Box>;
}
