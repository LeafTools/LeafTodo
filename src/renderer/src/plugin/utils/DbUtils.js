import { getCurrentDate } from "./DateUtils"

export const getAllGroups = async () => {
    return await window.elecApi.ipcRenderer.invoke('getAllGroups')
}

export const addNewGroup = async (group) => {
    await window.elecApi.ipcRenderer.invoke('addNewGroup', group)
}

export const addNewTodo = async (todo) => {
    await window.elecApi.ipcRenderer.invoke('addNewTodo', todo)
}

export const addNewRepeatTodo = async (todo) => {
    await window.elecApi.ipcRenderer.invoke('addNewRepeatTodo', todo)
}

export const getGroupInfoById = async (group_id) => {
    return await window.elecApi.ipcRenderer.invoke('getGroupNameById', group_id)
}

export const queryTodoByGroupId = async (group_id) => {
    return await window.elecApi.ipcRenderer.invoke('getTodoByGroupId', group_id)
}

export const deleteTodo = async (todo) => {
    return await window.elecApi.ipcRenderer.invoke('deleteTodo', todo)
}

export const getAllRepeatOptions = async () => {
    return await window.elecApi.ipcRenderer.invoke('getAllTodoType')
}

export const getMyDay = async () => {
    const current_date = getCurrentDate()
    return await window.elecApi.ipcRenderer.invoke('getMyDay', current_date)
}

export const getImportant = async () => {
    return await window.elecApi.ipcRenderer.invoke('getImportant')
}

export const getInProject = async (start_date, end_date) => {
    return await window.elecApi.ipcRenderer.invoke('getInProject', {'start_date': start_date, 'end_date': end_date})
}

export const getRemind = async () => {
    const current_date = getCurrentDate()
    return await window.elecApi.ipcRenderer.invoke('getRemind', current_date)
}

export const getTotal = async () => {
    const current_date = getCurrentDate()
    return await window.elecApi.ipcRenderer.invoke('getTotal', current_date)
}

export const setFinishStatus = async (params) => {
    return await window.elecApi.ipcRenderer.invoke('setFinishStatus', params)
}

export const setImportantStatus = async (params) => {
    return await window.elecApi.ipcRenderer.invoke('setImportantStatus', params)
}

export const deleteGroup = async (params) => {
    return await window.elecApi.ipcRenderer.invoke('deleteGroup', params)
}