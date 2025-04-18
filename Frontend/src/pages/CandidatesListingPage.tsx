import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { Candidate, getCandidates } from "../services/UserService";
import { useEffect, useState } from "react";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 150 },
  { field: "email", headerName: "Email", width: 220 },
  { field: "mobile", headerName: "Mobile", width: 110 },
  { field: "degree", headerName: "Degree", width: 110 },
  { field: "department", headerName: "Department", width: 150 },
  {
    field: "degree_percentage",
    headerName: "Degree %",
    type: "number",
    width: 120,
  },
  {
    field: "sslc_percentage",
    headerName: "SSLC %",
    type: "number",
    width: 120,
  },
  { field: "hsc_percentage", headerName: "HSC %", type: "number", width: 120 },
  { field: "location", headerName: "Location", width: 130 },
  { field: "relocate", headerName: "Relocate?", width: 120 },
];

export default function CandidatesListingPage() {
  const apiRef = useGridApiRef();
  const [rows, setRows] = useState<Candidate[]>([]);
  const [filteredRows, setFilteredRows] = useState<Candidate[]>([]);
  const [filters, setFilters] = useState({
    degree: "",
    sslc: "",
    hsc: "",
  });

  const [openDialog, setOpenDialog] = useState(false);
  const registrationLink = "http://localhost:5173/candidate-registration-page";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCandidates();
        setRows(response.employees);
        setFilteredRows(response.employees);
      } catch (error) {
        toast.error("Failed to fetch Candidates");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const { degree, sslc, hsc } = filters;
    const newFiltered = rows.filter((candidate) => {
      return (
        (!degree || candidate.degree_percentage >= parseFloat(degree)) &&
        (!sslc || candidate.sslc_percentage >= parseFloat(sslc)) &&
        (!hsc || candidate.hsc_percentage >= parseFloat(hsc))
      );
    });
    setFilteredRows(newFiltered);
  }, [filters, rows]);

  const handleDownload = () => {
    const selectedIDs = apiRef.current.getSelectedRows();
    const selectedRows = Array.from(selectedIDs.values());

    if (selectedRows.length === 0) {
      toast.error("Please select at least one row to download.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(selectedRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");
    XLSX.writeFile(workbook, "selected_candidates.xlsx");
    toast.success("Downloaded successfully!");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(registrationLink);
    toast.success("Link copied to clipboard!");
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2 }}>
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography variant="h4" fontWeight="bold" color="primary.dark">
          Candidates List
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid lightgray",
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
            flexGrow: 1,
          }}
        >
          <TextField
            label="Degree %"
            type="number"
            size="small"
            value={filters.degree}
            onChange={(e) => setFilters({ ...filters, degree: e.target.value })}
          />
          <TextField
            label="SSLC %"
            type="number"
            size="small"
            value={filters.sslc}
            onChange={(e) => setFilters({ ...filters, sslc: e.target.value })}
          />
          <TextField
            label="HSC %"
            type="number"
            size="small"
            value={filters.hsc}
            onChange={(e) => setFilters({ ...filters, hsc: e.target.value })}
          />
          <Tooltip title="Clear Filters">
            <Button
              variant="contained"
              color="error"
              sx={{ height: 40 }}
              onClick={() => setFilters({ degree: "", sslc: "", hsc: "" })}
              startIcon={<ClearIcon />}
            >
              Clear
            </Button>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Tooltip title="Get Registration Link">
            <Button
              variant="contained"
              color="primary"
              sx={{ height: 40 }}
              onClick={() => setOpenDialog(true)}
            >
              Get Registration Link
            </Button>
          </Tooltip>

          <Tooltip title="Download Selected">
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownload}
              startIcon={<DownloadIcon />}
              sx={{ height: 40 }}
            >
              Download
            </Button>
          </Tooltip>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3 }}>
        <DataGrid
          apiRef={apiRef}
          rows={filteredRows}
          columns={columns}
          checkboxSelection
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
          sx={{
            borderRadius: 3,
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "#f5f5f5",
            },
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
              fontSize: 14,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: "#f0f7ff",
            },
            border: "1px solid lightGray",
            height: "631px",
          }}
        />
      </Paper>

      <Dialog 
      maxWidth="xs"
      fullWidth
      open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Registration Link</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={registrationLink}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleCopy}>
                    <ContentCopyIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
