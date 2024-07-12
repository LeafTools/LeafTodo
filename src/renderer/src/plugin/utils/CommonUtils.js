export const isNotBlank = (str) => {
    if (str == undefined || /^\s*$/.test(str) || str === 'undefined') {
        return false
    }
    return true
}

export const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const deepCopyObj = (obj) => {
    return JSON.parse(JSON.stringify(obj))
}