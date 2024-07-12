<script setup>
import { Unlock, Lock, Minus, Close } from '@element-plus/icons-vue'
import { ref } from 'vue';

const fixed = ref(false)

const clickFrameButton = (type) => {
  switch (type) {
    case 'fixed':
      fixed.value = !fixed.value
      window.elecApi.ipcRenderer.send('fixedWindow')
      break
    case 'hide':
      window.elecApi.ipcRenderer.send('hideWindow')
      break
    case 'close':
      window.elecApi.ipcRenderer.send('closeWindow')
      break
  }
}
</script>

<template>
  <div id="frame">
    <div id="app-info">
      <img id="app-icon" src="@assets/images/leaf.svg"
        style="width: 20px; height: 20px; position: relative; top: 1px; margin-right: 1vw;">
      <div id="app-name">叶子清单</div>
    </div>
    <div style="display: flex; align-items: center; -webkit-app-region: no-drag;">
      <div @click="clickFrameButton('fixed')" class="frame-button" v-if="fixed"><el-icon size="18" color="#ffffff"><Lock/></el-icon></div>
      <div @click="clickFrameButton('fixed')" class="frame-button" v-else><el-icon size="18" color="#ffffff"><Unlock /></el-icon></div>
      <div @click="clickFrameButton('hide')" class="frame-button"><el-icon size="18" color="#ffffff"><Minus /></el-icon></div>
      <div @click="clickFrameButton('close')" class="frame-button"><el-icon size="18" color="#ffffff"><Close /></el-icon></div>
    </div>
  </div>
  <div style="height: 5vh;"></div>
  <div style="max-height: 95vh;"><router-view></router-view></div>
</template>

<style scoped>
#frame {
  display: flex;
  height: 5vh;
  width: 100vw;
  justify-content: space-between;
  padding-left: 0 2vw;
  background-color: #409EFF;
  position: fixed;
  z-index: 10000;
  -webkit-app-region: drag;
}

#app-info {
  display: flex;
  align-items: center;
  margin-left: 2vw;
  align-items: center;
}

#app-name {
  color: white;
}

.frame-button {
  width: calc(5vh - 12px);
  height: calc(5vh - 12px);
  padding: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.frame-button:hover {
  background-color: rgb(51, 126, 204, 0.5);
}

.frame-button:active {
  background-color: rgb(51, 126, 204, 0.8);
}
</style>