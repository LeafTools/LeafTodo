<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeft, More, EditPen, CircleCheck, Calendar, Star, StarFilled, Delete } from '@element-plus/icons-vue'
import { deleteTodo, getGroupInfoById, getImportant, getInProject, getMyDay, getRemind, queryTodoByGroupId, setFinishStatus, setImportantStatus } from '../plugin/utils/DbUtils'
import { getCnDayOfWeek, getCurrentDate, getDayOfWeek, getEndDayOfCurrentMonth, getEndDayOfCurrentWeek, getEndDayOfNextMonth, getEndDayOfNextWeek, getNextDay, getStartDayOfCurrentMonth, getStartDayOfCurrentWeek, getStartDayOfNextMonth, getStartDayOfNextWeek } from '../plugin/utils/DateUtils'
import moment from 'moment';
import { deepCopyObj, isNotBlank } from '../plugin/utils/CommonUtils'

const route = useRoute()

const groupInfo = ref({ 'todos': [] })
const finish_todos = ref([])
const not_finish_todos = ref([])

const edit = ref(false)

onMounted(async () => {
	groupInfo.value.id = route.params.group
	await loadTodoList()
})

const loadTodoList = async () => {
	let id = groupInfo.value.id
	switch (id) {
		case '1':
			groupInfo.value.title = '我的一天'
			groupInfo.value.todos = await getMyDay()
			break
		case '2':
			groupInfo.value.title = '重要'
			groupInfo.value.todos = await getImportant()
			break
		case '3':
			groupInfo.value.title = '计划内'
			groupInfo.value.startDate = moment().format('YYYY-MM-DD')
			groupInfo.value.endDate = moment().format('YYYY-MM-DD')
			const num = parseInt(getDayOfWeek())
			groupInfo.value.options = [{ 'label': '过期', 'value': 0 }, { 'label': `今天(${getCnDayOfWeek(num)})`, 'value': 1 }, { 'label': `明天(${getCnDayOfWeek(num + 1)})`, 'value': 2 }, { 'label': '本周', 'value': 3 }, { 'label': '下周', 'value': 4 }, { 'label': '本月', 'value': 5 }, { 'label': '下月', 'value': 6 }]
			if (groupInfo.value.mode == undefined) {
				groupInfo.value.mode = 1
			}
			groupInfo.value.todos = await getInProject(groupInfo.value.startDate, groupInfo.value.endDate)
			break
		case '4':
			groupInfo.value.title = '提醒事项'
			groupInfo.value.todos = await getRemind()
			break
		default:
			groupInfo.value.title = (await getGroupInfoById(id))[0].name
			groupInfo.value.todos = await queryTodoByGroupId(id)
	}
	finish_todos.value = []
	not_finish_todos.value = []
	for (let todo of groupInfo.value.todos) {
		if (todo.finish == 0) {
			not_finish_todos.value.push(todo)
		} else {
			finish_todos.value.push(todo)
		}
	}
}

const optionChange = async () => {
	switch (groupInfo.value.mode) {
		case 0:
			groupInfo.value.startDate = '1970-01-01'
			groupInfo.value.endDate = moment(moment().subtract(1, 'day')).format("YYYY-MM-DD")
			break
		case 1:
			groupInfo.value.startDate = getCurrentDate()
			groupInfo.value.endDate = getCurrentDate()
			break
		case 2:
			groupInfo.value.startDate = getNextDay()
			groupInfo.value.endDate = getNextDay()
			break
		case 3:
			groupInfo.value.startDate = getStartDayOfCurrentWeek()
			groupInfo.value.endDate = getEndDayOfCurrentWeek()
			break
		case 4:
			groupInfo.value.startDate = getStartDayOfNextWeek()
			groupInfo.value.endDate = getEndDayOfNextWeek()
			break
		case 5:
			groupInfo.value.startDate = getStartDayOfCurrentMonth()
			groupInfo.value.endDate = getEndDayOfCurrentMonth()
			break
		case 6:
			groupInfo.value.startDate = getStartDayOfNextMonth()
			groupInfo.value.endDate = getEndDayOfNextMonth()
			break
	}
	groupInfo.value.todos = await getInProject(groupInfo.value.startDate, groupInfo.value.endDate)
	divideData()
}

const changeFinish = async (todo) => {
	todo.finish = todo.finish == 0 ? 1 : 0
	setFinishStatus(deepCopyObj(todo))
	divideData()
}

const changeImportant = async (todo) => {
	todo.important = todo.important == 0 ? 1 : 0
	setImportantStatus(deepCopyObj(todo))
	if (groupInfo.value.id == 2) {
		await loadTodoList()
	}
}

const divideData = () => {
	finish_todos.value = []
	not_finish_todos.value = []
	for (let todo of groupInfo.value.todos) {
		if (todo.finish == 0) {
			not_finish_todos.value.push(todo)
		} else {
			finish_todos.value.push(todo)
		}
	}
	finish_todos.value = finish_todos.value.reverse()
}

const rmTodo = async (todo) => {
	await deleteTodo(todo)
	await loadTodoList()
}
</script>

<template>
	<div id="TodoList">
		<div id="header">
			<router-link to="/" style="width: 8vw; height: 8vw; align-items: center; justify-content: center;">
				<el-icon size="20">
					<ArrowLeft />
				</el-icon>
			</router-link>
			<div v-if="edit" style="display: flex; justify-content: center; align-items: center;"><el-icon>
					<EditPen />
				</el-icon>编辑模式</div>
			<div v-else>{{ groupInfo.title }}</div>
			<div style="width: 8vw; height: 8vw; display: flex; align-items: center; justify-content: center;"
				@click="edit = edit == false ? true : false">
				<el-icon size="20">
					<More />
				</el-icon>
			</div>
		</div>
		<div id="main">
			<div style="display: flex; justify-content: center; align-items: center; height: calc(7vh - 12px); width: 85vw; margin-bottom: 12px;"
				v-if="groupInfo.title === '计划内' || (groupInfo.todos.length != 0 && groupInfo.id != 4)">
				<el-select v-model="groupInfo.mode" style="flex: 4; margin: 12px 10px;" placeholder=""
					@change="optionChange" v-if="groupInfo.title === '计划内'">
					<el-option v-for="item in groupInfo.options" :label="item.label" :value="item.value" />
				</el-select>
				<el-progress :percentage="Math.round(finish_todos.length / groupInfo.todos.length * 100)" style="flex: 5;"
					:text-inside="true" :stroke-width="24" v-if="groupInfo.todos.length != 0 && groupInfo.id != 4" />
				<div v-else style="flex: 5;"></div>
			</div>
			<el-scrollbar height="75vh" v-if="groupInfo.title === '计划内'">
				<div v-for="todo in not_finish_todos" style="margin: 0 10px 12px;">
					<div class="todo-card">
						<div v-if="todo.finish == 0"
							style="display: flex; justify-content: center; align-items: center;">
							<div @click="changeFinish(todo)"
								style="border: 3px solid #409EFF; border-radius: 100px; margin: 12px; width: 6vw; height: 6vw; display: flex; justify-content: center; align-items: center;">
							</div>
						</div>
						<div v-else style="display: flex; justify-content: center; align-items: center;"><el-icon
								@click="changeFinish(todo)" color="#409EFF" size="8vw" style="margin: 11px;">
								<CircleCheck />
							</el-icon></div>
						<div style="flex: 8; display: flex; flex-direction: column; justify-content: center;">
							<div>{{ todo.task }}</div>
							<div style="font-size: small; display: flex; align-items: center;">
								<div v-if="todo.groupName !== undefined">{{ todo.groupName }}</div>
								<div v-if="isNotBlank(todo.endDate) && todo.groupName != undefined">&nbsp;·&nbsp;</div>
								<el-icon color="gray" v-if="isNotBlank(todo.endDate)">
									<Calendar />
								</el-icon>
								<div style="margin-left: 2px;" v-if="isNotBlank(todo.endDate)">{{ todo.endDate }}</div>
							</div>
						</div>
						<div v-if="edit"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#F56C6C" @click="rmTodo(deepCopyObj(todo))">
								<Delete />
							</el-icon>
						</div>
						<div v-else-if="todo.important == 0"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#409EFF" @click="changeImportant(todo)">
								<Star />
							</el-icon>
						</div>
						<div v-else-if="todo.important == 1"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#409EFF" @click="changeImportant(todo)">
								<StarFilled />
							</el-icon>
						</div>
					</div>
				</div>
				<el-divider style="background-color: whitesmoke;" v-if="finish_todos.length != 0">已完成</el-divider>
				<div v-for="todo in finish_todos" style="margin: 0 10px 12px;">
					<div class="todo-card">
						<div v-if="todo.finish == 0"
							style="display: flex; justify-content: center; align-items: center;">
							<div @click="changeFinish(todo)"
								style="border: 3px solid #409EFF; border-radius: 100px; margin: 12px; width: 6vw; height: 6vw; display: flex; justify-content: center; align-items: center;">
							</div>
						</div>
						<div v-else style="display: flex; justify-content: center; align-items: center;"><el-icon
								@click="changeFinish(todo)" color="#409EFF" size="8vw" style="margin: 11px;">
								<CircleCheck />
							</el-icon></div>
						<div style="flex: 8; display: flex; flex-direction: column; justify-content: center;">
							<div>{{ todo.task }}</div>
							<div style="font-size: small; display: flex; align-items: center;">
								<div v-if="todo.groupName !== undefined">{{ todo.groupName }}</div>
								<div v-if="isNotBlank(todo.endDate) && todo.groupName != undefined">&nbsp;·&nbsp;</div>
								<el-icon color="gray" v-if="isNotBlank(todo.endDate)">
									<Calendar />
								</el-icon>
								<div style="margin-left: 2px;" v-if="isNotBlank(todo.endDate)">{{ todo.endDate }}</div>
							</div>
						</div>
						<div v-if="edit"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#F56C6C" @click="rmTodo(deepCopyObj(todo))">
								<Delete />
							</el-icon>
						</div>
						<div v-else-if="todo.important == 0"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#409EFF" @click="changeImportant(todo)">
								<Star />
							</el-icon>
						</div>
						<div v-else-if="todo.important == 1"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#409EFF" @click="changeImportant(todo)">
								<StarFilled />
							</el-icon>
						</div>
					</div>
				</div>
				<div v-if="not_finish_todos.length == 0 && finish_todos.length == 0"
					style="text-align: center; margin-top: 30vh;">
					此处会显示期限内带日期的任务
				</div>
				<div style="margin-top: -10px;"></div>
			</el-scrollbar>
			<el-scrollbar height="82vh" v-else>
				<div v-for="todo in not_finish_todos" style="margin: 0 10px 12px;">
					<div class="todo-card">
						<div v-if="todo.finish == 0"
							style="display: flex; justify-content: center; align-items: center;">
							<div @click="changeFinish(todo)"
								style="border: 3px solid #409EFF; border-radius: 100px; margin: 12px; width: 6vw; height: 6vw; display: flex; justify-content: center; align-items: center;">
							</div>
						</div>
						<div v-else style="display: flex; justify-content: center; align-items: center;"><el-icon
								@click="changeFinish(todo)" color="#409EFF" size="8vw" style="margin: 11px;">
								<CircleCheck />
							</el-icon></div>
						<div style="flex: 8; display: flex; flex-direction: column; justify-content: center;">
							<div>{{ todo.task }}</div>
							<div style="font-size: small; display: flex; align-items: center;">
								<div v-if="todo.groupName !== undefined">{{ todo.groupName }}</div>
								<div v-if="isNotBlank(todo.endDate) && todo.groupName != undefined">&nbsp;·&nbsp;</div>
								<el-icon color="gray" v-if="isNotBlank(todo.endDate)">
									<Calendar />
								</el-icon>
								<div style="margin-left: 2px;" v-if="isNotBlank(todo.endDate)">{{ todo.endDate }}</div>
							</div>
						</div>
						<div v-if="edit"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#F56C6C" @click="rmTodo(deepCopyObj(todo))">
								<Delete />
							</el-icon>
						</div>
						<div v-else-if="todo.important == 0"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#409EFF" @click="changeImportant(todo)">
								<Star />
							</el-icon>
						</div>
						<div v-else-if="todo.important == 1"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#409EFF" @click="changeImportant(todo)">
								<StarFilled />
							</el-icon>
						</div>
					</div>
				</div>
				<el-divider style="background-color: whitesmoke;" v-if="finish_todos.length != 0">已完成</el-divider>
				<div v-for="todo in finish_todos" style="margin: 0 10px 12px;">
					<div class="todo-card">
						<div v-if="todo.finish == 0"
							style="display: flex; justify-content: center; align-items: center;">
							<div @click="changeFinish(todo)"
								style="border: 3px solid #409EFF; border-radius: 100px; margin: 12px; width: 6vw; height: 6vw; display: flex; justify-content: center; align-items: center;">
							</div>
						</div>
						<div v-else style="display: flex; justify-content: center; align-items: center;"><el-icon
								@click="changeFinish(todo)" color="#409EFF" size="8vw" style="margin: 11px;">
								<CircleCheck />
							</el-icon></div>
						<div style="flex: 8; display: flex; flex-direction: column; justify-content: center;">
							<div>{{ todo.task }}</div>
							<div style="font-size: small; display: flex; align-items: center;">
								<div v-if="todo.groupName !== undefined">{{ todo.groupName }}</div>
								<div v-if="isNotBlank(todo.endDate) && todo.groupName != undefined">&nbsp;·&nbsp;</div>
								<el-icon color="gray" v-if="isNotBlank(todo.endDate)">
									<Calendar />
								</el-icon>
								<div style="margin-left: 2px;" v-if="isNotBlank(todo.endDate)">{{ todo.endDate }}</div>
							</div>
						</div>
						<div v-if="edit"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#F56C6C" @click="rmTodo(deepCopyObj(todo))">
								<Delete />
							</el-icon>
						</div>
						<div v-else-if="todo.important == 0"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#409EFF" @click="changeImportant(todo)">
								<Star />
							</el-icon>
						</div>
						<div v-else-if="todo.important == 1"
							style="flex: 1; display: flex; justify-content: center; align-items: center; margin: 12px;">
							<el-icon size="9vw" color="#409EFF" @click="changeImportant(todo)">
								<StarFilled />
							</el-icon>
						</div>
					</div>
				</div>
				<div style="margin-top: -10px;"></div>
			</el-scrollbar>
		</div>
	</div>
</template>

<style scoped>
#TodoList {
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

#header a {
	display: flex;
	justify-content: center;
	align-items: center;
}

#main {
	display: flex;
	flex-direction: column;
	height: 82vh;
}

.todo-card {
	display: flex;
	background-color: white;
}
</style>
