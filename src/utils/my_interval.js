let timerId = 0;
let timerMap = new Map();

export const mySetInterval = function(fn, interval = 1000) {
	timerId++;
	const currentId = timerId; // 捕获当前 timerId

	function cb() {
		if (!timerMap.has(currentId)) return; // 检查定时器是否已被清除
		fn();
		let id = setTimeout(cb, interval);
		timerMap.set(currentId, id);
	}

	let id = setTimeout(cb, interval);
	timerMap.set(currentId, id);

	return currentId;
}

export const myClearInterval = function(id) {
	let timer = timerMap.get(id);

	if (timer) {
		clearTimeout(timer);
		timerMap.delete(id); // 清理 timer_map
	}
}

