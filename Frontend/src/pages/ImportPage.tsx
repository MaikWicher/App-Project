import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Input,
  Label,
  makeStyles,
  shorthands,
  Title3,
  Card,
  CardHeader,
  Text,
  Spinner,
} from "@fluentui/react-components";
import { ArrowUploadRegular, TableRegular } from "@fluentui/react-icons";

type ApiEnvelope<T> = { ok: boolean; data?: T; error?: { code: string; message: string } };

const useStyles = makeStyles({
  container: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    height: "100%",
    boxSizing: "border-box",
  },
  uploadSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    ...shorthands.padding("20px"),
  },
  row: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
    flexWrap: "wrap",
  },
  tableList: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "12px",
  },
});

export const ImportPage: React.FC = () => {
  const styles = useStyles();
  const [file, setFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState<string>("");
  const [tables, setTables] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const defaultName = useMemo(() => {
    if (!file) return "";
    const base = file.name.replace(/\.[^/.]+$/, "");
    return base.replace(/[^a-zA-Z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  }, [file]);

  useEffect(() => {
    void refreshTables();
  }, []);

  async function refreshTables() {


    try {
      // Using relative path assuming proxy or same origin in production
      const r = await fetch("/api/data/tables");
      const j = (await r.json()) as ApiEnvelope<string[]>;
      if (j.ok && j.data) setTables(j.data);
    } catch (e) {
      console.error("Failed to fetch tables", e);
    }
  }

  async function upload() {
    if (!file) return;
    setLoading(true);
    setStatus("Uploading...");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("tableName", (tableName || defaultName || "import").trim());

      const r = await fetch("/api/import/file", { method: "POST", body: form });
      const j = (await r.json()) as ApiEnvelope<{ tableName: string; importedAs: string }>;

      if (!j.ok) {
        setStatus(j.error?.message ?? "Error importing file");
      } else {
        setStatus(`Success: Table '${j.data?.tableName}' created.`);
        setFile(null);
        setTableName("");
        await refreshTables();
      }
    } catch (e) {
      setStatus("Network error during upload");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <Title3>Import Data</Title3>

      <Card className={styles.uploadSection}>
        <CardHeader header={<Text weight="semibold">Upload File</Text>} description={<Text size={200}>Support: .csv, .parquet, .json, .xlsx, .sql</Text>} />

        <div className={styles.row}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Label htmlFor="file-upload">Select File</Label>
            <input
              id="file-upload"
              type="file"
              accept=".csv,.parquet,.json,.sql,.xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              style={{ padding: '6px', border: '1px solid #444', borderRadius: '4px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: '200px' }}>
            <Label htmlFor="table-name">Target Table Name</Label>
            <Input
              id="table-name"
              placeholder={defaultName || "Auto-generated..."}
              value={tableName}
              onChange={(_e, d) => setTableName(d.value)}
            />
          </div>

          <Button
            appearance="primary"
            icon={loading ? <Spinner size="tiny" /> : <ArrowUploadRegular />}
            disabled={!file || loading}
            onClick={upload}
          >
            Import
          </Button>
        </div>
        {status && <Text size={300} style={{ color: status.startsWith("Success") ? "#4caf50" : "#f44336" }}>{status}</Text>}
      </Card>

      <Title3 style={{ marginTop: 24 }}>Available Tables</Title3>
      <div className={styles.tableList}>
        {tables.length === 0 && <Text italic>No tables found.</Text>}
        {tables.map((t) => (
          <Card key={t} size="small" appearance="subtle">
            <CardHeader
              image={<TableRegular style={{ fontSize: '24px' }} />}
              header={<Text weight="medium">{t}</Text>}
            />
          </Card>
        ))}
      </div>
    </div>
  );
};
