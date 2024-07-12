import moment from "moment"

export const getCurrentDate = () => {
    return moment().format("YYYY-MM-DD")
}

export const getNextDay = () => {
    return moment(moment().add(1, 'day')).format("YYYY-MM-DD")
}

export const getStartDayOfCurrentWeek = () => {
    return moment(moment().startOf('week').add(1, 'day')).format("YYYY-MM-DD")
}

export const getEndDayOfCurrentWeek = () => {
    return moment(moment().endOf('week').add(1, 'day')).format("YYYY-MM-DD")
}

export const getStartDayOfNextWeek = () => {
    return moment(moment().startOf('week').add(8, 'day')).format("YYYY-MM-DD")
}

export const getEndDayOfNextWeek = () => {
    return moment(moment().endOf('week').add(8, 'day')).format("YYYY-MM-DD")
}

export const getStartDayOfCurrentMonth = () => {
    return moment(moment().startOf('month')).format("YYYY-MM-DD")
}

export const getEndDayOfCurrentMonth = () => {
    return moment(moment().endOf('month')).format("YYYY-MM-DD")
}

export const getStartDayOfNextMonth = () => {
    return moment(moment().add(1, 'month').startOf('month')).format("YYYY-MM-DD")
}

export const getEndDayOfNextMonth = () => {
    return moment(moment().add(1, 'month').endOf('month')).format("YYYY-MM-DD")
}

export const getDayOfWeek = () => {
    return moment().format('d')
}

export const getCnDayOfWeek = (num) => {
    if (num == undefined) {
        num = getDayOfWeek()
    }
    switch (num) {
        case 1:
            return '星期一'
        case 2:
            return '星期二'
        case 3:
            return '星期三'
        case 4:
            return '星期四'
        case 5:
            return '星期五'
        case 6:
            return '星期六'
        case 7:
            return '星期日'
    }
}

export const getDaysBetweenDate = (start_date, end_date) => {
    const dates = [];
    let current = moment(start_date);
    const end = moment(end_date);
  
    while (current <= end) {
      dates.push(current.format('YYYY-MM-DD'));
      current.add(1, 'days');
    }
  
    return dates;
}

export const getDaysBetweenDateByWeek = (start_date, end_date, daysOfWeek) => {
    const dates = [];
    let current = moment(start_date);
    let end = moment(end_date);

    while (current.isSameOrBefore(end)) {
        if (daysOfWeek.includes(current.format('d'))) {
            dates.push(moment(current).format('YYYY-MM-DD'));
        }
        current.add(1, 'days');
    }
    return dates;
}