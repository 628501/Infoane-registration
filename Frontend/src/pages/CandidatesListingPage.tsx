import { DataGrid, GridColDef, useGridApiRef } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { Box, Button, Container, Typography } from "@mui/material";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import { Candidate, getCandidates } from "../services/UserService";
import { useEffect, useState } from "react";

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "name", headerName: "Name", width: 150 },
  { field: "email", headerName: "Email", width: 200 },
  { field: "mobile", headerName: "Mobile", width: 100 },
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
  {
    field: "hsc_percentage",
    headerName: "HSC %",
    type: "number",
    width: 120,
  },
  { field: "location", headerName: "Location", width: 150 },
  {
    field: "relocate",
    headerName: "Relocate?",
    width: 120,
    type: "string",
  },
];

const paginationModel = { page: 0, pageSize: 10 };

export default function CandidatesListingPage() {
  const apiRef = useGridApiRef();
  const [rows, setRows] = useState<Candidate[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getCandidates();
        setRows(response.employees);
      } catch (error) {
        toast.error("Failed to fetch employees");
      }
    };
    fetchData();
  }, []);

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

  return (
    <Container maxWidth="xl" sx={{ mt: 4, maxWidth: "1800px" }}>
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Candidates List
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 2 }}>
        <Button variant="contained" onClick={handleDownload}>
          Download
        </Button>
      </Box>

      <Paper sx={{ height: 630, width: "100%" }}>
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          checkboxSelection
          initialState={{ pagination: { paginationModel } }}
          pageSizeOptions={[10]}
          sx={{
            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold",
            },
          }}
        />
      </Paper>
    </Container>
  );
}
