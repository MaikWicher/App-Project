import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import net from "net";

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

const BACKEND_PORT = 5038;
const BACKEND_PATH = path.join(__dirname, "..", "..", "Backend", "src", "AplikacjaVisualData.Backend");

function checkPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(true)); // Port is in use
    server.once("listening", () => {
      server.close();
      resolve(false); // Port is free
    });
    server.listen(port);
  });
}

async function startBackend() {
  const isPortInUse = await checkPort(BACKEND_PORT);
  if (isPortInUse) {
    console.log(`Port ${BACKEND_PORT} is already in use. Assuming Backend is running.`);
    return;
  }

  console.log("Starting Backend...");
  backendProcess = spawn("dotnet", ["run", "--project", BACKEND_PATH], {
    cwd: BACKEND_PATH,
    stdio: "inherit", // Pipe output to Electron console
    shell: true
  });

  backendProcess.on("error", (err) => {
    console.error("Failed to start backend:", err);
  });

  backendProcess.on("exit", (code, signal) => {
    console.log(`Backend process exited with code ${code} and signal ${signal}`);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: "#1e1e1e",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  // DEV
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  }
  // PROD
  else {
    mainWindow.loadFile("../Frontend/dist/index.html");
  }
}

app.whenReady().then(async () => {
  await startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    console.log("Killing backend process...");
    // Attempt graceful shutdown or force kill
    // On Windows, tree-kill might be needed for full cleanup, but spawn with shell=true makes it tricky.
    // For now, let's try basic encryption.
    try {
      // Windows 'taskkill' is often more reliable for spawned processes
      spawn("taskkill", ["/pid", backendProcess.pid!.toString(), "/f", "/t"]);
    } catch (e) {
      console.error("Error killing backend:", e);
      backendProcess.kill();
    }
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

