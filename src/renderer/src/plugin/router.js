import * as VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import TodoList from '../views/TodoList.vue'
import Config from '../views/Config.vue'


const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: Home
    },
    {
        path: '/todo-list/:group',
        component: TodoList
    },
    {
        path: '/config',
        component: Config
    }
]

export const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
})