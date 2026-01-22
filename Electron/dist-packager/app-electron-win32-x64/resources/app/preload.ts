import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  version: process.versions.electron,
  saveConfig: (data: any) => ipcRenderer.invoke("config:save", data),
  loadConfig: () => ipcRenderer.invoke("config:load")
});
