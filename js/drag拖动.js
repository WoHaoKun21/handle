// 获取元素
const box = document.getElementById("box"); // 获取元素盒子
const nodeList = box.getElementsByClassName("selectNode"); // 获取节点
const dragAfter = document.getElementById("dragAfter"); // 获取开始箭头
const dragBefore = document.getElementById("dragBefore"); // 获取结尾箭头

dragAfter.onmousedown = function (e) {
  dragMouseDown(e, dragAfter);
}; // 给拖拽元素添加鼠标按下事件监听器
dragBefore.onmousedown = function (e) {
  dragMouseDown(e, dragBefore);
};
let pos1 = 0,
  pos2 = 0;

// 鼠标按下事件
function dragMouseDown(e, dom) {
  e.preventDefault(); // 防止默认行为发生，例如在一个链接上点击时不会打开链接
  pos2 = e.clientX; // 当前鼠标位置
  document.onmouseup = function () {
    dragMouseUp(pos2 - e.clientX, dom);
  }; // 注册文档鼠标松开事件监听器
  document.onmousemove = function (e) {
    dragMouseMove(e, dom);
  }; // 注册文档鼠标移动事件监听器
}

// 鼠标移动事件
function dragMouseMove(e, dom) {
  e.preventDefault();
  pos1 = pos2 - e.clientX; // 计算鼠标相对于当前位置的左右偏移量
  pos2 = e.clientX; // 更新鼠标当前位置
  if (e.clientX > box.getBoundingClientRect().right) {
    dom.style.left = 284 + "px"; // 计算新的水平位置坐标并设置样式
  } else if (e.clientX < box.getBoundingClientRect().left) {
    dom.style.left = -4 + "px"; // 计算新的水平位置坐标并设置样式
  } else {
    if (dragAfter.offsetLeft > dragBefore.offsetLeft) return;
    dom.style.left = dom.offsetLeft - pos1 + "px"; // 计算新的水平位置坐标并设置样式
  }
}

// 鼠标抬起清除事件
function dragMouseUp(pos, dom) {
  // 删除所有的事件监听器
  document.onmouseup = null;
  document.onmousemove = null;
  const arr = [];
  Array.from(nodeList).forEach(function (element, i) {
    arr.push(element.offsetLeft - dom.offsetLeft);
  });
  const data = closestToZero(arr);
  dom.style.left =
    Array.from(nodeList)[arr.findIndex((num) => data === num)].offsetLeft - // 这里祝你好运，希望你能看懂这里
    4 +
    "px"; // 计算新的水平位置坐标并设置样式
}

// 判断离0最近的数字——用来计算下标
function closestToZero(numbers) {
  let closest = numbers[0]; // 初始化closest为数组中的第一个元素
  for (let i = 0; i < numbers.length; i++) {
    // 如果当前元素的绝对值比closest更接近0，则更新closest
    if (Math.abs(numbers[i]) < Math.abs(closest)) {
      closest = numbers[i];
    }
  }

  return closest;
}
