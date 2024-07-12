const sqlite3 = require('sqlite3').verbose()

let db = null

const runSQL = async (sql) => {
  new Promise((resolve, reject) => {
    db.run(sql, (err, rows) => {
      if (err) {
        console.log('run sql error: ' + err.message + '\nerr sql: ' + sql)
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

const allSQL = async (sql) => {
  return new Promise((resolve, reject) => {
    db.all(sql, (err, rows) => {
      if (err) {
        console.log('run sql error: ' + err.message + '\nerr sql: ' + sql)
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

export const initDb = async (path) => {
  console.log('Init databse...')
  new Promise((resolve, reject) => {
    db = new sqlite3.Database(path + 'data.db', (err) => {
      if (err) {
        console.log(err.message)
        reject(err.message)
      }
      console.log('Connected to the database.')
    })
  })
}

export const getInsertId = async () => {
  return (await allSQL("SELECT last_insert_rowid() AS id;"))[0].id
}

export const queryAllTodoType = async () => {
  return await allSQL("SELECT * FROM lt_todo_type;")
}

export const queryAllGroups = async () => {
  return await allSQL("SELECT * FROM lt_group;")
}

export const insertNewGroup = async (group) => {
  await runSQL(`INSERT INTO lt_group (name , total, color) VALUES ('${group.name}', 0, '${group.color}');`)
}

export const addNewTodo = async (todo) => {
  await runSQL(`INSERT INTO lt_todo (task, end_date, finish, important, group_id, type_id) VALUES ('${todo.task}', '${todo.end_date}', 0, 0, '${todo.group_id}', '${todo.repeat_id}');`)
  await runSQL(`UPDATE lt_group SET total = total + 1 WHERE id = '${todo.group_id}';`)
}

export const addNewRepeatTodo = async (todo) => {
  await runSQL(`INSERT INTO lt_todo_week (day_of_week, group_id) VALUES ('[${todo.week}]', ${todo.group_id});`)
  const week_id = await getInsertId()
  let sql = 'INSERT INTO lt_todo (task, end_date, finish, important, group_id, type_id, week_id) VALUES'
  for (let end_date of todo.days) {
    sql += `, ('${todo.task}', '${end_date}', 0, 0, '${todo.group_id}', '${todo.repeat_id}', ${week_id})`
  }
  sql = sql.replace('VALUES, ', 'VALUES ')
  sql += ';'
  await runSQL(sql)
  await runSQL(`UPDATE lt_group SET total = total + ${todo.days.length} WHERE id = '${todo.group_id}';`)
  const todo_id = []
  const todo_id_max = await getInsertId()
  for (let id = todo_id_max - todo.days.length + 1; id <= todo_id_max; id++) {
    todo_id.push(id)
  }
}

export const qureyGroupNameById = async (group_id) => {
  return await allSQL(`SELECT name FROM lt_group WHERE id = ${group_id};`)
}

export const queryTodoByGroupId = async (group_id) => {
  return await allSQL(`SELECT lt.id id, lt.task task, lt.end_date endDate, lt.finish, lt.important, ltt.name repeat, lt.week_id FROM lt_group lg JOIN lt_todo lt ON lt.group_id = lg.id JOIN lt_todo_type ltt ON lt.type_id = ltt.id WHERE lg.id = ${group_id};`)
}

export const deleteTodo = async (todo) => {
  const groupId = (await allSQL(`SELECT group_id FROM lt_todo WHERE id = ${todo.id};`))[0].group_id
  if (['每日', '每周'].includes(todo.repeat)) {
    const total = (await allSQL(`SELECT COUNT(id) AS total FROM lt_todo WHERE week_id = ${todo.week_id};`))[0].total
    await runSQL(`UPDATE lt_group SET total = total - ${total} WHERE id = ${groupId};`)
    await runSQL(`DELETE FROM lt_todo WHERE week_id = ${todo.week_id};`)
    await runSQL(`DELETE FROM lt_todo_week WHERE id = ${todo.week_id};`)
  } else {
    await runSQL(`DELETE FROM lt_todo WHERE id = ${todo.id};`)
    await runSQL(`UPDATE lt_group SET total = total - 1 WHERE id = ${groupId};`)
  }
}

export const deleteGroup = async (group_id) => {
  await runSQL(`DELETE FROM lt_group WHERE id = ${group_id};`)
  await runSQL(`DELETE FROM lt_todo WHERE group_id = ${group_id};`)
  await runSQL(`DELETE FROM lt_todo_week WHERE group_id = ${group_id};`)
}

export const getMyDay = async (current_date) => {
  return await allSQL(`SELECT lt.id id, lt.task task, lt.end_date endDate, lt.finish, lt.important, ltt.name repeat, lt.week_id, lg.name groupName FROM lt_todo lt JOIN lt_todo_type ltt ON lt.type_id = ltt.id JOIN lt_group lg ON lt.group_id = lg.id WHERE DATE(lt.end_date) = DATE('${current_date}');`) 
}

export const getImportant = async () => {
  return await allSQL(`SELECT lt.id id, lt.task task, lt.end_date endDate, lt.finish, lt.important, ltt.name repeat, lt.week_id, lg.name groupName FROM lt_todo lt JOIN lt_todo_type ltt ON lt.type_id = ltt.id JOIN lt_group lg ON lt.group_id = lg.id WHERE important = 1;`) 
}

export const getInProject = async (start_date, end_date) => {
  return await allSQL(`SELECT lt.id id, lt.task task, lt.end_date endDate, lt.finish, lt.important, ltt.name repeat, lt.week_id, lg.name groupName FROM lt_todo lt JOIN lt_todo_type ltt ON lt.type_id = ltt.id JOIN lt_group lg ON lt.group_id = lg.id WHERE DATE(lt.end_date) >= DATE('${start_date}') AND DATE(lt.end_date) <= DATE('${end_date}') AND lt.type_id != 6;`)
}

export const getRemind = async (current_date) => {
  return await allSQL(`SELECT lt.id id, lt.task task, lt.end_date endDate, lt.finish, lt.important, ltt.name repeat, lt.week_id, lg.name groupName FROM lt_todo lt JOIN lt_todo_type ltt ON lt.type_id = ltt.id JOIN lt_group lg ON lt.group_id = lg.id WHERE DATE(lt.end_date) > DATE('${current_date}') AND lt.type_id = 1;`)
}

export const getTotal = async (current_date) => {
  const total = []
  const sqls = [`SELECT COUNT(id) AS total FROM lt_todo WHERE DATE(end_date) = DATE('${current_date}');`,
                `SELECT COUNT(id) AS total FROM lt_todo WHERE important = 1;`,
                `SELECT COUNT(id) AS total FROM lt_todo WHERE type_id != 6;`,
                `SELECT COUNT(id) AS total FROM lt_todo lt WHERE DATE(lt.end_date) > DATE('${current_date}') AND lt.type_id = 1;`]
  for (const sql of sqls) {
    let result = await allSQL(sql)
    total.push(result[0])
  }
  for (let index in total) {
    await runSQL(`UPDATE lt_group SET total = ${total[index].total} WHERE id = ${parseInt(index) + 1};`)
  }
  return total
}

export const setFinishStatus = async (todo_id, new_status) => {
  await runSQL(`UPDATE lt_todo SET finish = ${new_status} WHERE id = ${todo_id};`)
}

export const setImportantStatus = async (todo_id, new_status) => {
  await runSQL(`UPDATE lt_todo SET important = ${new_status} WHERE id = ${todo_id};`)
}
