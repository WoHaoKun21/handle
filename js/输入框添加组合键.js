const input = document.getElementById("input");

window.onkeydown = (e) => {
  e.preventDefault(); // 停止默认动作
};

// 输入框键盘按下事件
input.onkeydown = (e) => {
  e.preventDefault(); // 停止默认动作
  // shift + * 组合键
  if (e.shiftKey) {
    e.target.value = `SHIFT + ${e.key.toUpperCase()}`;
  }
  // ctrl + * 组合键
  if (e.ctrlKey) {
    e.target.value = `CTRL + ${e.key.toUpperCase()}`;
  }
  // alt + * 组合键
  if (e.altKey) {
    e.target.value = `ALT + ${e.key.toUpperCase()}`;
  }
  // F1~F12 按键
  if (e.keyCode >= 112 && e.keyCode <= 123) {
    e.target.value = `F${e.keyCode - 111}`;
  }
};
