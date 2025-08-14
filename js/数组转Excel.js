const form = document.getElementById("form");
const addItem = document.getElementById("addItem");
const removeItem = document.getElementById("removeItem");
const file = document.getElementById("file");
const submit = document.getElementById("submit");

let fileContent = []; // 存储文件内容
let resultContent = []; // 生成文件所需要的内容

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
          placeholder="请输入关键字"
        />
      </div>
      <div>
        <label for="name${len + 1}">表头名字</label>
        <input
          type="text"
          name="name${len + 1}"
          id="name${len + 1}"
          placeholder="请输入关键字对应的名字"
        />
      </div>
    </div>
`;
  form.innerHTML += formItem;
  console.log("表单：", form);
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

// 获取文件数据并处理成json格式
const onChange = (e) => {
  const file = e.target.files[0];
  const reg = /.(json|txt)$/i;
  if (!reg.test(file.name)) {
    confirm("请上传json或txt文件！");
    e.target.value = "";
    return;
  }
  // 使用 FileReader 来读取文件
  const reader = new FileReader();
  // 读取纯文本文件,且编码格式为 utf-8
  reader.readAsText(file, "UTF-8");
  // 读取文件,会触发 onload 异步事件,可使用回调函数 来获取最终的值.
  reader.onload = function (e) {
    fileContent = JSON.parse(e.target.result);
    createPreviewExcel(fileContent);
  };
};

// 选择文件后生成预览表格
const createPreviewExcel = (arr) => {
  const thead = document.getElementsByTagName("thead")[0]; // 表格头
  const tbody = document.getElementsByTagName("tbody")[0]; // 表格内容
  const obj = arr[0];
  let theadThs = "<th>序号</th>"; // 表格头部
  let tbodyTrs = ""; // 表格内容
  Object.keys(obj).map((k) => (theadThs += `<th>${k}</th>`));
  arr.map((obj, i) => {
    let trTds = `<tr><td>${i + 1}</td>`; // <tr />
    Object.keys(obj).map((k) => (trTds += `<td>${obj[k]}</td>`));
    trTds += "</tr>";
    tbodyTrs += trTds;
  });
  // 生成标签
  thead.children[0].innerHTML = theadThs;
  tbody.innerHTML = tbodyTrs;
};

// 更新预览页面
const updatePage = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  let flag = false;
  Object.keys(data).map((k) => {
    if (!data[k]) flag = true;
  });
  if (fileContent.length === 0 || flag) {
    confirm("请先选择数据文件，并添加关键字！");
    return;
  }
  console.log("数组数据：", data);
};

addItem.onclick = add; // 新增列
removeItem.onclick = remove; // 删除最后一列
file.onchange = onChange; // 文件选择
form.onsubmit = updatePage; // 更新预览页面
// submit.onclick = createExcel; // 生成excel

// ————————————————————————————————————————————————————————————————————————————————————————————
// // 生成最终表格
// const createExcel = (e) => {
//   e.preventDefault();
//   var formData = new FormData(form);
//   console.log(formData);
// };
