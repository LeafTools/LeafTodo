<script setup>
import { ref, onMounted } from 'vue';
import { loadImage, readSystemConfig, readUserConfig, writeSystemConfig, writeUserConfig } from '../plugin/utils/FileUtils.js'
import { ArrowLeft } from '@element-plus/icons-vue'
import { openFileChoseDialog } from '../plugin/utils/CommonUtils.js';

const user = ref({})
const system = ref({})

onMounted(async () => {
    user.value = await readUserConfig()
    system.value = await readSystemConfig()
    loadUserAvatar()
})

const userConfigChange = async () => {
    await writeUserConfig(user.value)
}

const systemConfigChange= async () => {
    await writeSystemConfig(system.value)
}

const avatarBase64 = ref()

const loadUserAvatar = async () => {
    avatarBase64.value = await loadImage(user.value.avatar)
}

const changeAvatar = async () => {
    user.value = await openFileChoseDialog()
    loadUserAvatar()
}
</script>

<template>
    <div id="Config">
        <div id="header">
			<router-link to="/" style="width: 8vw; height: 8vw; display: flex; align-items: center; justify-content: center;">
				<el-icon size="20"><ArrowLeft /></el-icon>
			</router-link>
            <div>设置</div>
            <div style="width: 8vw; height: 8vw;"></div>
		</div>
        <div id="main">
            <div style="display: flex; align-items: center;">
                <img id="user-avatar" :src="avatarBase64" @click="changeAvatar">
                <div style="display: flex; flex-direction: column; justify-content: center; flex: 1; margin-left: 12px;">
                    <div style="display: flex; align-items: center; margin: 3px 0;">
                        <div style="width: 20vw;">用户名</div>
                        <el-input v-model="user.name" @change="userConfigChange"></el-input>
                    </div>
                    <div style="display: flex; align-items: center; margin: 3px 0;">
                        <div style="width: 20vw;">签名</div>
                        <el-input v-model="user.sign" @change="userConfigChange"></el-input>
                    </div>
                </div>
            </div>
            <el-divider></el-divider>
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div>版本号</div><div>{{ system.version }}</div>
                </div>
                <div style="display: flex; margin-bottom: 12px; flex-direction: column;">
                    <div>安装路径</div><div style="font-size: small; white-space: normal; word-wrap: break-word;">{{ system.execPath }}</div>
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>开机自启动</div><div><el-switch v-model="system.launchAtLogin" @change="systemConfigChange"/></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#Config {
	display: flex;
	flex-direction: column;
	padding: 6vw 6vw;
	position: relative;
	height: calc(95vh - 12vw);
	overflow: hidden;
}

#header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	height: 6vw;
	margin-bottom: 24px;
}

#main {
    display: flex;
	flex-direction: column;
	height: 82vh;
}

#user-avatar {
	border-radius: 1000px;
	width: 8vh;
	height: 8vh;
	border: 3px solid #409EFF;
	background-position: center;
	background-size: cover;
}
</style>