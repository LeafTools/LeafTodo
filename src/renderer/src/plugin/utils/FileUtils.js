import { deepCopyObj } from "./CommonUtils"

export const readUserConfig = async () => {
    return await window.elecApi.ipcRenderer.invoke('readUserConfig')
}

export const writeUserConfig = async (userConfig) => {
    return await window.elecApi.ipcRenderer.invoke('writeUserConfig', deepCopyObj(userConfig))
}

export const readSystemConfig = async () => {
    return await window.elecApi.ipcRenderer.invoke('readSystemConfig')
}

export const writeSystemConfig = async (systemConfig) => {
    return await window.elecApi.ipcRenderer.invoke('writeSystemConfig', deepCopyObj(systemConfig))
}