import * as fs from 'fs'
import { app } from 'electron'

export const checkAneMoveFile = (filepath) => {
    console.log('Check file...')
    if (fs.existsSync(filepath + 'data.db') == false) {
        fs.renameSync(filepath + 'app.asar.unpacked/resources/data.db', filepath + 'data.db')
    }
    if (fs.existsSync(filepath + 'config.json') == false) {
        fs.renameSync(filepath + 'app.asar.unpacked/resources/config.json', filepath + 'config.json')
    }
    if (fs.existsSync(filepath + 'config.example.json') == false) {
        fs.renameSync(filepath + 'app.asar.unpacked/resources/config.example.json', filepath + 'config.example.json')
    }
    if (fs.existsSync(filepath + 'image') == false) {
        fs.mkdirSync(filepath + `image`)
        fs.renameSync(filepath + `app.asar.unpacked/resources/image/icon.png`, filepath + `icon.png`)
        fs.renameSync(filepath + `app.asar.unpacked/resources/image/default-avatar.jpg`, filepath + `image/default-avatar.jpg`)
        fs.rmdirSync(filepath + 'app.asar.unpacked/resources/image')
    }
    if (fs.existsSync(filepath + 'app.asar.unpacked/resources')) {
        fs.rmdirSync(filepath + 'app.asar.unpacked/resources')
    }
    if (fs.existsSync(filepath + 'app.asar.unpacked')) {
        fs.rmdirSync(filepath + 'app.asar.unpacked')
    }
    console.log('Check file success!')
}

let resources_path

export const readResJsonFile = (filename) => {
    return JSON.parse(fs.readFileSync(resources_path + filename, 'utf-8'))
}

export const writeResJsonFile = (filename, data) => {
    fs.writeFileSync(resources_path + filename, JSON.stringify(data))
}

const config = {}

export const initConfig = (path) => {
    console.log('Config init...')
    resources_path = path
    const keys = ['user', 'system']
    const configJsonObj = readResJsonFile('config.json')
    for (let key of keys) {
        config[key] = configJsonObj[key]
    }
    console.log('Config init success!')
}

export const writeConfig = () => {
    writeResJsonFile('config.json', config)
}

export const readUserConfig = () => {
    return config.user
}

export const writeUserConfig = (user) => {
    config.user = user
    writeConfig()
}

export const readSystemConfig = () => {
    return config.system
}

export const writeSystemConfig = (system) => {
    config.system = system
    writeConfig()
}

export const setLaunchAtLogin = (path, enable) => {
    if (app.isPackaged) {
        if (enable) {
            if (fs.existsSync('C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp/leaftodo.lnk') == false) {
                fs.symlink(path, 'C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp/leaftodo.lnk', 'file', (err) => {
                    if (err) {
                        throw(err.message)
                    }
                })
            }
        } else {
            if (fs.existsSync('C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp/leaftodo.lnk')) {
                fs.rmSync('C:/ProgramData/Microsoft/Windows/Start Menu/Programs/StartUp/leaftodo.lnk')
            }
        }
    }
}

export const copyAvatarToResources = (path, old) => {
    if (old !== 'default-avatar.jpg' && fs.existsSync(resources_path + '/image/' + old)) {
        fs.rmSync(resources_path + '/image/' + old)
    }
    fs.copyFileSync(path, resources_path + '/image/' + path.split('\\')[path.split('\\').length - 1])
}

export const readImageByBase64 = (path) => {
    return 'data:image/png;base64,' +  fs.readFileSync(path).toString('base64')
}