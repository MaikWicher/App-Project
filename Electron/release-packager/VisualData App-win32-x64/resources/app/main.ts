import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import net from "net";
import fs from "fs";

// Setup Logger
const logPath = path.join(app.getPath("userData"), "app.log");
function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(logPath, logMessage);
  } catch (e) {
    // ignore
  }
}

// Clear log on start
try { fs.writeFileSync(logPath, ""); } catch (e) { }
log("App starting...");
log(`UserData path: ${app.getPath("userData")}`);
log(`Resources path: ${process.resourcesPath}`);


let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

const BACKEND_PORT = 5038;

// Determine backend path based on environment
const isDev = !app.isPackaged;
const BACKEND_PATH_DEV = path.join(__dirname, "..", "..", "Backend", "src", "AplikacjaVisualData.Backend");
// In production, we expect the backend to be in a 'backend' folder inside resources
const BACKEND_PATH_PROD = path.join(process.resourcesPath, "backend");
const BACKEND_EXE = isDev ? "dotnet" : path.join(BACKEND_PATH_PROD, "AplikacjaVisualData.Backend.exe");

log(`isDev: ${isDev}`);
log(`BACKEND_PATH_PROD: ${BACKEND_PATH_PROD}`);
log(`BACKEND_EXE: ${BACKEND_EXE}`);

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
    log(`Port ${BACKEND_PORT} is already in use. Assuming Backend is running.`);
    return;
  }

  log("Starting Backend...");

  if (isDev) {
    backendProcess = spawn("dotnet", ["run", "--project", BACKEND_PATH_DEV], {
      cwd: BACKEND_PATH_DEV,
      stdio: "inherit",
      shell: true
    });
  } else {
    // Production: Run the exe directly
    if (!fs.existsSync(BACKEND_EXE)) {
      log(`CRITICAL ERROR: Backend executable not found at ${BACKEND_EXE}`);
      return;
    }

    log(`Spawning backend: ${BACKEND_EXE}`);
    backendProcess = spawn(BACKEND_EXE, ["--urls", "http://localhost:5038"], {
      cwd: BACKEND_PATH_PROD,
      stdio: ["ignore", "pipe", "pipe"] // Capture stdout/stderr
    });

    // Pipe output to log
    backendProcess.stdout?.on("data", (data) => log(`[BACKEND STDOUT] ${data}`));
    backendProcess.stderr?.on("data", (data) => log(`[BACKEND STDERR] ${data}`));
  }

  backendProcess.on("error", (err) => {
    log(`Failed to start backend: ${err.message}`);
  });

  backendProcess.on("exit", (code, signal) => {
    log(`Backend process exited with code ${code} and signal ${signal}`);
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
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  }
  // PROD
  else {
    // In prod, files are in dist/frontend (we will arrange this structure)
    // The electron main.js is in dist/main.js
    // So ../frontend/index.html from dist/main.js seems correct if we copy frontend to dist/frontend
    mainWindow.loadFile(path.join(__dirname, "frontend", "index.html"));
    // mainWindow.webContents.openDevTools(); // Optional for debug
  }
}

app.whenReady().then(async () => {
  await startBackend();
  createWindow();
});

app.on("window-all-closed", () => {
  if (backendProcess) {
    console.log("Killing backend process...");
    try {
      if (isDev) {
        spawn("taskkill", ["/pid", backendProcess.pid!.toString(), "/f", "/t"]);
      } else {
        backendProcess.kill();
      }
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
