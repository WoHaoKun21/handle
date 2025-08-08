const form = document.getElementById("form");
const addItem = document.getElementById("addItem");
const removeItem = document.getElementById("removeItem");

// 添加列
const add = () => {
  // 获取表格头长度
  const len = document.getElementsByClassName("item").length;
  const formItem = `
    <div class="item">
      <div>
        <label for="key${len + 1}">关键字</label>
        <input
          type="text"
          name="key${len + 1}"
          id="key${len + 1}"
          placeholder="亲输入关键字"
        />
      </div>
      <div>
        <label for="name${len + 1}">表头名字</label>
        <input
          type="text"
          name="name${len + 1}"
          id="name${len + 1}"
          placeholder="亲输入关键字对应的名字"
        />
      </div>
    </div>
`;
  form.innerHTML += formItem;
};

// 删除最后一列
const remove = (d) => {
  const items = document.getElementsByClassName("item");
  if (items.length > 1) {
    items[items.length - 1].remove();
  } else {
    alert("最后一条无法删除！");
  }
};

// 生成表格头
const createExcel = (e) => {
  e.preventDefault();
  var formData = new FormData(form);
  console.log(formData);
};

addItem.onclick = add;
removeItem.onclick = remove;
form.onsubmit = createExcel;
