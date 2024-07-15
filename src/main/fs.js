import * as fs from 'fs'

export const checkAneMoveFile = (filepath) => {
    console.log('Check file...')
    if (fs.existsSync(filepath + 'data.db') == false) {
        console.log('Moving file...')
        const files = ['data.db', 'config.json', 'icon.png']
        for (const file of files) {
            fs.renameSync(filepath + `app.asar.unpacked/resources/${file}`, filepath + `${file}`)
        }
        fs.rmdirSync(filepath + 'app.asar.unpacked/resources')
        fs.rmdirSync(filepath + 'app.asar.unpacked')
        console.log('Move file success!')
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