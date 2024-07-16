<script setup>
import { ref, onMounted } from 'vue'
import { getAllGroups, addNewGroup, addNewTodo, getAllRepeatOptions, getTotal, addNewRepeatTodo, deleteGroup } from '../plugin/utils/DbUtils'
import { deepCopyObj, isNotBlank } from '../plugin/utils/CommonUtils'
import { loadImage, readSystemConfig, readUserConfig } from '../plugin/utils/FileUtils'
import { Sunny, Star, Tickets, Calendar, Folder, Plus, FolderDelete, Delete } from '@element-plus/icons-vue'
import { getCurrentDate, getDaysBetweenDate, getDaysBetweenDateByWeek } from '../plugin/utils/DateUtils'

const groups = ref([])
const user = ref({})
const system = ref({})

const loadGroupData = async () => {
	groups.value = await getAllGroups()
}

const loadUserData = async () => {
	user.value = await readUserConfig()
}

const loadSystemData = async () => {
	system.value = await readSystemConfig()
}

const getGroupTotal = async () => {
	const result = await getTotal()
	groups.value[0].total = result[0].total
	groups.value[1].total = result[1].total
	groups.value[2].total = result[2].total
	groups.value[3].total = result[3].total
}

onMounted(async () => {
	await loadUserData()
	await loadSystemData()
	await loadGroupData()
	await getGroupTotal()
	await loadUserAvatar()
})

const dialogVisable = ref(false)
const dialogData = ref({})
const repeatOptions = ref({})

const openDialog = async () => {
	await loadRepeatOptions()
	dialogData.value = { 'title': '新增事项' }
	dialogVisable.value = true
}

const loadRepeatOptions = async () => {
	repeatOptions.value = await getAllRepeatOptions()
}

const selectChange = () => {
	if (dialogData.value.groupId === 4) {
		dialogData.value.repeat = 1
	}
}

const submit = async () => {
	if (dialogData.value.title === '添加分组') {
		if (isNotBlank(dialogData.value.groupName) && isNotBlank(dialogData.value.color)) {
			await addNewGroup({
				"name": dialogData.value.groupName,
				"color": dialogData.value.color
			})
			dialogData.value.title = '新增事项'
		}
	} else {
		if (dialogData.value.repeat == '2') {
			await addNewRepeatTodo({
				"task": dialogData.value.task,
				"group_id": dialogData.value.groupId,
				"end_date": dialogData.value.endDate,
				"repeat_id": dialogData.value.repeat,
				"week": [1, 2, 3, 4, 5, 6, 7],
				"days": getDaysBetweenDate(getCurrentDate(), dialogData.value.endDate)
			})
		} else if (dialogData.value.repeat == '3') {
			await addNewRepeatTodo({
				"task": dialogData.value.task,
				"group_id": dialogData.value.groupId,
				"end_date": dialogData.value.endDate,
				"repeat_id": dialogData.value.repeat,
				"week": deepCopyObj((dialogData.value.week)),
				"days": getDaysBetweenDateByWeek(getCurrentDate(), dialogData.value.endDate, dialogData.value.week)
			})
		} else {
			await addNewTodo({
				"task": dialogData.value.task,
				"group_id": dialogData.value.groupId,
				"end_date": dialogData.value.endDate,
				"repeat_id": dialogData.value.repeat
			})
		}
		dialogVisable.value = false
	}
	await loadGroupData()
}

const edit = ref(false)

const rmGroup = async (groupId) => {
	await deleteGroup(groupId)
	await loadGroupData()
}

const avatarBase64 = ref()

const loadUserAvatar = async () => {
    avatarBase64.value = await loadImage(user.value.avatar)
}
</script>

<template>
	<div id="Home">
		<router-link to="/config" id="user-info">
			<img id="user-avatar" :src="avatarBase64">
			<div style="display: flex; flex-direction: column; justify-content: center; flex: 1; margin-left: 12px;">
				<div id="user-name" style="font-weight: 500;">{{ user.name }}</div>
				<div id="user-sign" style="font-weight: 300;">{{ user.sign }}</div>
			</div>
		</router-link>

		<div id="user-info-bg"></div>

		<el-divider></el-divider>

		<div id="main-list" v-if="groups.length > 0">
			<div class="main-item">
				<el-icon size="24" color="#E6A23C">
					<Sunny />
				</el-icon>
				<router-link to="/todo-list/1">
					<div class="main-item-title">
						<div style="font-weight: 300;">我的一天</div>
						<div style="font-weight: 300; color: gray;">{{ groups[0].total }}</div>
					</div>
				</router-link>
			</div>
			<div class="main-item">
				<el-icon size="24" color="#F56C6C">
					<Star />
				</el-icon>
				<router-link to="/todo-list/2">
					<div class="main-item-title">
						<div style="font-weight: 300;">重要</div>
						<div style="font-weight: 300; color: gray;">{{ groups[1].total }}</div>
					</div>
				</router-link>
			</div>
			<div class="main-item">
				<el-icon size="24" color="#67C23A">
					<Tickets />
				</el-icon>
				<router-link to="/todo-list/3">
					<div class="main-item-title">
						<div style="font-weight: 300;">计划内</div>
						<div style="font-weight: 300; color: gray;">{{ groups[2].total }}</div>
					</div>
				</router-link>
			</div>
			<div class="main-item">
				<el-icon size="24" color="#337ECC">
					<Calendar />
				</el-icon>
				<router-link to="/todo-list/4">
					<div class="main-item-title">
						<div style="font-weight: 300;">提醒事项</div>
						<div style="font-weight: 300; color: gray;">{{ groups[3].total }}</div>
					</div>
				</router-link>
			</div>
		</div>

		<el-divider></el-divider>

		<div id="groups" v-if="groups.length > 0">
			<div class="group" v-if="groups[4].total > 0">
				<router-link :to="'/todo-list/5'">
					<el-icon size="22" :color="groups[4].color">
						<Folder />
					</el-icon>
					<div
						style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-left: 8px;">
						<div class="group-title" style="font-weight: 300;">{{ groups[4].name }}</div>
						<div class="group-total" style="font-weight: 300;">{{ groups[4].total }}</div>
					</div>
				</router-link>
			</div>
			<div class="group" v-for="group in groups.slice(5)" v-if="groups.slice(5).length > 0">
				<router-link :to="'/todo-list/' + group.id">
					<el-icon size="22" :color="group.color">
						<Folder />
					</el-icon>
					<div
						style="display: flex; align-items: center; justify-content: space-between; width: 100%; margin-left: 8px;">
						<div class="group-title" style="font-weight: 300;">{{ group.name }}</div>
						<div class="group-total" style="font-weight: 300; color: gray;">{{ group.total }}</div>
					</div>
				</router-link>
			</div>
			<div v-if="groups.slice(5).length === 0 && groups[4].total === 0"
				style="color: #999999; font-size: xx-large; text-align: center;">
				<div style="margin: 32px auto;">暂无分组</div>
				<div>快去新建吧</div>
			</div>
		</div>

		<div id="footer-bg"></div>

		<div id="footer">
			<el-button type="primary" :icon="FolderDelete" circle size="large" @click="edit = true" />
			<el-button type="primary" :icon="Plus" circle size="large" @click="openDialog" />
		</div>
	</div>
	<el-dialog v-model="edit" title="分组管理" width="85%">
		<el-scrollbar height="55vh">
			<el-table :data="groups.slice(5)" border stripe style="width: 93%; margin: 0 auto;">
				<el-table-column prop="name" label="组名"/>
				<el-table-column label="操作" >
					<template #default="scope">
						<el-button :icon="Delete" size="small" type="danger" @click="rmGroup(scope.row.id)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-scrollbar>
	</el-dialog>

	<el-dialog v-model="dialogVisable" :title="dialogData.title" width="85%">
		<el-scrollbar height="55vh">
			<div v-if="dialogData.title === '添加分组'" style="width: 93%; margin: 0 auto;">
				<div class="dialog-line">
					<div class="dialog-title">分组名<div style="color: red;">*</div>
					</div>
					<el-input v-model="dialogData.groupName"></el-input>
				</div>
				<div class="dialog-line">
					<div class="dialog-title">组别颜色<div style="color: red;">*</div>
					</div>
					<el-color-picker v-model="dialogData.color" />
				</div>
			</div>
			<div v-else style="width: 93%; margin: 0 auto;">
				<div class="dialog-line">
					<div class="dialog-title">待办事项<div style="color: red;">*</div>
					</div>
					<el-input v-model="dialogData.task"></el-input>
				</div>
				<div class="dialog-line">
					<div class="dialog-title">所属分组<div style="color: red;">*</div>
					</div>
					<el-select v-model="dialogData.groupId" placeholder="选择分组" @change="selectChange">
						<el-option v-for="item in groups.slice(3)" :label="item.name" :value="item.id" />
					</el-select>
				</div>
				<div class="dialog-line">
					<div class="dialog-title">重复<div style="color: red;">*</div>
					</div>
					<el-select v-model="dialogData.repeat" placeholder="请选择" :disabled="dialogData.groupId === 4">
						<el-option v-for="item in repeatOptions" :label="item.name" :value="item.id" />
					</el-select>
				</div>
				<div class="dialog-line" v-if="dialogData.repeat == 3">
					<div class="dialog-title">星期<div style="color: red;">*</div>
					</div>
					<el-checkbox-group v-model="dialogData.week">
						<el-checkbox label="周一" value="1" />
						<el-checkbox label="周二" value="2" />
						<el-checkbox label="周三" value="3" />
						<el-checkbox label="周四" value="4" />
						<el-checkbox label="周五" value="5" />
						<el-checkbox label="周六" value="6" />
						<el-checkbox label="周日" value="7" />
					</el-checkbox-group>
				</div>
				<div class="dialog-line">
					<div class="dialog-title" v-if="dialogData.repeat === 1">日期<div style="color: red;">*</div>
					</div>
					<div class="dialog-title" v-else>截止时间</div>
					<el-date-picker v-model="dialogData.endDate" type="date" placeholder="选择日期" style="width: 100%;"
						value-format="YYYY-MM-DD" />
				</div>
			</div>
			<div style="display: flex; justify-content: flex-end; width: 93%; margin: 0 auto;">
				<el-button type="primary" @click="dialogData.title = '添加分组'" v-if="dialogData.title !== '添加分组'">
					新建分组
				</el-button>
				<el-button type="primary" @click="submit">
					确认
				</el-button>
			</div>
		</el-scrollbar>
	</el-dialog>
</template>

<style scoped>
#Home {
	display: flex;
	flex-direction: column;
	padding: 3vw 6vw;
	position: relative;
	height: calc(95vh - 6vw);
	overflow: hidden;
}

#user-info {
	display: flex;
	height: 10vh;
	padding: 12px;
	width: calc(100% - 24px);
	position: fixed;
	z-index: 100;
	align-items: center;
}

#user-info-bg {
	height: 10vh;
	width: calc(100% - 16px);
}

#user-avatar {
	border-radius: 1000px;
	width: 8vh;
	height: 8vh;
	border: 3px solid #409EFF;
	background-position: center;
	background-size: cover;
}

#main-list {
	display: flex;
	flex-direction: column;
}

.main-item {
	margin: 6px 0px;
	display: flex;
	align-items: center;
	width: 100%;
}

.main-item a {
	width: 100%;
	margin-left: 6px;
}

.main-item-title {
	display: flex;
	justify-content: space-between;
	margin-left: 6px;
}

#groups {
	display: flex;
	flex-direction: column;
}

.group {
	display: flex;
	margin-bottom: 12px;
	justify-content: space-between;
	align-items: center;
}

.group a {
	display: flex;
	width: 100%;
	align-items: center;
}

#footer {
	display: flex;
	justify-content: space-between;
	position: fixed;
	bottom: 0vh;
	padding-bottom: 6vw;
	width: calc(100% - 12vw);
}

#footer-bg {
	display: flex;
	justify-content: space-between;
	width: calc(100% - 12vw);
}

.dialog-line {
	display: flex;
	flex-direction: column;
	margin-bottom: 18px;
}

.dialog-title {
	position: relative;
	margin-bottom: 8px;
	display: flex;
}
</style>