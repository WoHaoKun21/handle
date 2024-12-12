// 获取ul元素，并为其追加一组相同图片（为了做到无缝衔接）
let ul = document.querySelector("ul");
ul.innerHTML = ul.innerHTML + ul.innerHTML; // 将ul的innerHTML重复两次
// 获取所有的li元素和.btn元素
const lis = document.querySelectorAll("li");
const btns = document.querySelectorAll(".btn");
let spa = -2; // 每次滚动的跨度（正数向右，负数向左，默认向左滚动）
ul.style.width = lis[0].offsetWidth * lis.length + "px"; // 计算并设置ul的总宽度

// 滚动函数
const move = () => {
  if (ul.offsetLeft < -ul.offsetWidth / 2) {
    // 向左走时，判断图片是否走完，走完时重新开始，/2 是因为ul的宽度在第二行代码增加了一倍
    ul.style.left = "0px";
  }
  if (ul.offsetLeft > 0) {
    // 向右走时，判断图片是否走完
    ul.style.left = -ul.offsetWidth / 2 + "px";
  }
  // 设置偏移位置
  ul.style.left = ul.offsetLeft + spa + "px";
};

// 定时器，每30毫秒执行一次move函数
let timer = setInterval(move, 30);

// 为ul绑定事件，悬停停止，移开滚动
ul.addEventListener("mousemove", () => clearInterval(timer));
ul.addEventListener("mouseout", () => (timer = setInterval(move, 30)));

// 为两个按钮绑定点击事件
// 向左走
btns[0].addEventListener("click", () => (spa = -2));
// 向右走
btns[1].addEventListener("click", () => (spa = 2));
