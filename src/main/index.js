import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { insertNewGroup, queryAllGroups, addNewTodo, queryTodoByGroupId, qureyGroupNameById, deleteTodo, initDb, queryAllTodoType, getMyDay, getTotal, getImportant, getInProject, getRemind, addNewRepeatTodo, setFinishStatus, setImportantStatus, deleteGroup } from './db'
import { checkAneMoveFile, copyAvatarToResources, initConfig, readImageByBase64, readSystemConfig, readUserConfig, setLaunchAtLogin, writeSystemConfig, writeUserConfig } from './fs'

const resources_path = (app.isPackaged ? process.execPath.slice(0, process.execPath.lastIndexOf('\\')) : process.cwd()) + "/resources/"

function createWindow() {

  const icon = resources_path + 'image/icon.png'

  const mainWindow = new BrowserWindow({
    width: 360,
    height: 700,
    icon: icon,
    show: false,
    autoHideMenuBar: true,
    transparent: true,
    backgroundColor:'rgba(0,0,0,0)',
    frame:false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {

  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('fixedWindow', (event) => {
    const currentWindow = BrowserWindow.fromWebContents(event.sender)
    if (currentWindow) {
      if (currentWindow.fixed === undefined || currentWindow.fixed === false) {
        currentWindow.fixed = true
        currentWindow.setAlwaysOnTop(true)
      } else {
        currentWindow.fixed = false
        currentWindow.setAlwaysOnTop(false)
      }
    }
  })

  checkAneMoveFile(resources_path)

  initConfig(resources_path)

  initDb(resources_path)

  ipcMain.on('hideWindow', (event) => {
    const currentWindow = BrowserWindow.fromWebContents(event.sender)
    if (currentWindow) {
      currentWindow.minimize()
    }
  })

  ipcMain.on('closeWindow', (event) => {
    const currentWindow = BrowserWindow.fromWebContents(event.sender)
    if (currentWindow) {
      currentWindow.close()
    }
  })

  ipcMain.handle('getAllTodoType', async () => {
    return await queryAllTodoType()
  })

  ipcMain.handle('getAllGroups', async () => {
    return await queryAllGroups() 
  })

  ipcMain.handle('addNewGroup', async (event, params) => {
    return await insertNewGroup(params)
  })

  ipcMain.handle('addNewTodo', async (event, params) => {
    return await addNewTodo(params)
  })

  ipcMain.handle('addNewRepeatTodo', async (event, params) => {
    return await addNewRepeatTodo(params)
  })

  ipcMain.handle('getGroupNameById', async (event, params) => {
    return await qureyGroupNameById(params)
  })

  ipcMain.handle('getTodoByGroupId', async (event, params) => {
    return await queryTodoByGroupId(params)
  })

  ipcMain.handle('getTotal', async (event, params) => {
    return await getTotal(params)
  })

  ipcMain.handle('getMyDay', async (event, params) => {
    return await getMyDay(params)
  })

  ipcMain.handle('getImportant', async (event, params) => {
    return await getImportant(params)
  })

  ipcMain.handle('getInProject', async (event, params) => {
    return await getInProject(params.start_date, params.end_date)
  })

  ipcMain.handle('getRemind', async (event, params) => {
    return await getRemind(params)
  })

  ipcMain.handle('setFinishStatus', async (event, params) => {
    return await setFinishStatus(params.id, params.finish)
  })

  ipcMain.handle('setImportantStatus', async (event, params) => {
    return await setImportantStatus(params.id, params.important)
  })

  ipcMain.handle('readUserConfig', async (event, params) => {
    return readUserConfig()
  })

  ipcMain.handle('writeUserConfig', async (event, params) => {
    return writeUserConfig(params)
  })

  ipcMain.handle('readSystemConfig', async (event, params) => {
    const systemConfig = readSystemConfig()
    setLaunchAtLogin(systemConfig.launchAtLogin)
    if (app.isPackaged) {
      systemConfig.execPath = process.execPath.slice(0, process.execPath.lastIndexOf('\\')).replaceAll('\\', '/')
    } else {
      systemConfig.execPath = process.cwd().replaceAll('\\', '/')
    }
    return systemConfig
  })

  ipcMain.handle('writeSystemConfig', async (event, params) => {
    setLaunchAtLogin(process.execPath, params.launchAtLogin)
    return writeSystemConfig(params)
  })

  ipcMain.handle('deleteTodo', async (event, params) => {
    return await deleteTodo(params)
  })

  ipcMain.handle('deleteGroup', async (event, params) => {
    return await deleteGroup(params)
  })

  ipcMain.handle('openFileChoseDialog', async (event, params) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile']
    })
    const imagePath = result.filePaths[0]
    const filename = imagePath.split('\\')[imagePath.split('\\').length - 1]
    const imageExtensions  = ['.jpg', '.png', '.bmp', '.jpeg', '.webp', '.svg']
    for (let extension of imageExtensions) {
      if (imagePath.endsWith(extension)) {
        copyAvatarToResources(imagePath, readUserConfig().avatar)
        const user = readUserConfig()
        user.avatar = filename
        writeUserConfig(user)
        return user
      }
    }
    return readUserConfig()
  })

  ipcMain.handle('loadImage', async (event, params) => {
    return readImageByBase64(resources_path + 'image/' + params)
  })

  createWindow()

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
