// 当用户选择文件时触发
const execl_file = document.getElementById("execl_file");
const btn = document.getElementById("btn");

let fileName = ""; //文件名称
let sheetName = ""; // 表格名称
let sheetData = []; // 表格数据

// 一、对excel文件进行解析，转换成数组形式
execl_file.onchange = ({ target }) => {
  const files = target.files;
  if (files && files[0]) {
    const file = files[0];
    fileName = file.name;
    const reader = new FileReader();
    // ①文件预处理
    reader.onload = function (e) {
      const data = e.target.result;
      // 这里以二进制形式读取
      const workbook = XLSX.read(data, {
        type: "binary",
      });
      // 假设我们只读取第一张表
      sheetName = workbook.SheetNames[0]; // 响应式获取表的名字
      const worksheet = workbook.Sheets[sheetName]; // 获取表内容
      // 将工作表转换为JSON数组，并进行保存
      sheetData = XLSX.utils.sheet_to_json(worksheet, {
        defval: null, // 如果单元格为空，则赋予null值
      });
      console.log("表格：", sheetData);
    };
    reader.readAsBinaryString(file); // 读取文件，然后执行“①”
  }
};

// 二、处理数组数据
const handleFileArr = (arr) => {
  const newList = sheetData.map((item) => {
    let have_url_obj_key = "";
    Object.keys(item).map((key) => {
      const reg = /(http|https)/;
      reg.test(item[key]) ? (have_url_obj_key = key) : null;
    });
    if (!have_url_obj_key) {
      item["作品链接"] = null;
      return item;
    }
    const reg_url = /(http|https):\/\/[^\s]+/g;
    item[have_url_obj_key] = item[have_url_obj_key].match(reg_url)[0];
    /www/g.test(item[have_url_obj_key]) ? (item[have_url_obj_key] = null) : "";
    return item;
  });
  console.log("新列表：", newList);
  newExcel(newList);
};

// 三、生成新的excel表格
const newExcel = (list) => {
  // 将处理后的JSON数据转换回工作表
  var newWorksheet = XLSX.utils.json_to_sheet(list);
  // 创建一个新的工作簿
  var newWorkbook = XLSX.utils.book_new();
  // 将新的工作表添加到工作簿
  XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);

  // 生成Excel文件并触发下载
  XLSX.writeFile(newWorkbook, fileName);
};

btn.onclick = () => {
  if (execl_file.files.length > 0) {
    handleFileArr(sheetData);
  } else {
    alert("请先选择文件");
  }
};
