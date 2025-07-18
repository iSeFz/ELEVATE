import { IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const ImageDelete = ({ onClick, pending }) => (
  <IconButton
    size="small"
    onClick={onClick}
    disabled={pending}
    sx={{
      position: "absolute",
      top: -8,
      right: -8,
      backgroundColor: "background.paper",
      boxShadow: 2,
      "&:hover": {
        backgroundColor: "error.light",
        color: "white",
      },
    }}
  >
    <DeleteIcon fontSize="small" />
  </IconButton>
);

export default ImageDelete;
