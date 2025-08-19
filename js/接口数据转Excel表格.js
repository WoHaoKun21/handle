const form = document.getElementById("form");
const addItem = document.getElementById("addItem");
const removeItem = document.getElementById("removeItem");
const file = document.getElementById("file");
const submit = document.getElementById("submit");

let fileName = "";
let fileContent = []; // 存储文件内容
let resultContent = []; // 生成文件所需要的内容

// 添加列
const add = () => {
  // 获取表格头长度
  const len = document.getElementsByClassName("item").length;
  const div = document.createElement("div");
  div.className = "item";
  const formItem = `
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
          placeholder="请输入名字 或 “表头名：1-内容1；2-内容2”"
        />
      </div>
    `;
  div.innerHTML = formItem;
  form.appendChild(div);
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
  fileName = file.name.replace(reg, "");
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

// 类型生成
const handleType = (str, data, value) =>
  data
    .split(str)
    .map((o) => {
      if (value === Number(o.split("-")[0])) {
        return o.split("-")[1];
      }
    })
    .filter(Boolean)[0];

// 更新预览页面
const updatePage = (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries()); // 获取form表单内的数据
  const formItems = document.getElementsByClassName("item");
  let flag = false;
  Object.keys(data).map((k) => {
    if (!data[k]) flag = true;
  });
  if (fileContent.length === 0 || flag) {
    confirm("请先选择数据文件，并添加关键字！");
    return;
  }
  const dataObj = {}; // 将表单的数据保存成对象
  for (let i = 0; i < formItems.length; i++) {
    const key = formItems[i].firstElementChild.lastElementChild.value;
    const value = formItems[i].lastElementChild.lastElementChild.value;
    dataObj[key] = value;
  }

  // 预览表格需要的数据
  resultContent = fileContent.map((o) => {
    const obj = {};
    Object.keys(dataObj).map((key) => {
      let keys = dataObj[key];
      let value = o[key.trim()];
      obj[keys] = value;

      // 当表头名出现多个选项时
      if (/(:|：)/.test(keys)) {
        delete obj[keys]; // 删除之前的键值对，重新生成新的键值对
        let data; // 存储数据
        let newkeys; // 存储新的键
        let newValue; // 存储新的值
        if (keys.includes(":")) {
          newkeys = keys.split(":")[0];
          data = keys.split(":")[1];
        } else {
          newkeys = keys.split("：")[0];
          data = keys.split("：")[1];
        }
        if (keys.includes(";")) {
          newValue = handleType(";", data, value);
        } else {
          newValue = handleType("；", data, value);
        }

        obj[newkeys] = newValue;
      }
    });
    return obj;
  });
  createPreviewExcel(resultContent); // 生成预览表格
};

// 针对表格生成自适应宽度
const autoWidth = (data) => {
  const reg = /^[\u4e00-\u9fa5]$/; // 中文正则
  const arrWidth = new Array(data[0].length).fill(0); // 存储列宽
  const result = data.map((o) => {
    return o.map((k) => {
      k = String(k);
      let num = 0;
      for (let i in k) {
        if (reg.test(k[i])) {
          num += 2;
        } else {
          num += 1;
        }
      }
      return num;
    });
  });

  return arrWidth.map((o, i) => ({
    wch: Math.max(...result.map((o) => o[i])),
  }));
};

// 生成最终表格
const createExcel = () => {
  if (resultContent.length === 0) {
    confirm("请更新预览页面后再生成文件！");
    return;
  }
  const excelData = resultContent.map((o) => {
    const arr = Object.values(o);
    return arr;
  });
  excelData.unshift(Object.keys(resultContent[0]));
  const sheet = XLSX.utils.aoa_to_sheet(excelData);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, fileName);
  // 设置最大值为列宽
  const sheetWidth = autoWidth(excelData);
  sheet["!cols"] = sheetWidth;
  const date = new Date();
  fileName =
    fileName +
    "_" +
    date.getFullYear() +
    "-" +
    (date.getMonth() + 1) +
    "-" +
    date.getDate() +
    "_" +
    date.getHours() +
    ":" +
    date.getMinutes() +
    ".xlsx";
  XLSX.writeFile(book, fileName);
};

addItem.onclick = add; // 新增列
removeItem.onclick = remove; // 删除最后一列
file.onchange = onChange; // 文件选择
form.onsubmit = updatePage; // 更新预览页面
submit.onclick = createExcel; // 生成excel
