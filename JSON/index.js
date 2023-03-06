// 常量
const resultContainer = document.getElementById("result"); // 转换之后的结果区域
const allNumberReg = /^\d+$/g; // 判断是否全部为数字的正则

// 初始化函数
$(function () {
  pageInit();
});

// 初始化函数
function pageInit() {
  // 文本域自动获取焦点
  $("#content").focus();

  // 监听文本域的keyup事件，触发校验和转换方法
  $("#content").keyup((event) => {
    let value = event.target.value;
    prepareCheck(value);
  });

  // 处理JSON层级的展开和收缩（利用事件委托）
  document.querySelector("#result").addEventListener("click", handleToggle);
}

// 预先校验数据
function prepareCheck(value) {
  $(".begin-mark span").hide();
  $(".end-mark span").hide();

  // 数据被清空
  if (!value.trim()) {
    $(".begin-mark span").hide();
    $(".end-mark span").hide();
    $("#result").text("");
    return;
  }

  // 如果输入的都是数字，则在结果区域直接显示数字
  if (allNumberReg.test(value)) {
    let errHtml = `<div class="errorMsg">请输入JSON字符串</div>`
    $("#result").html(errHtml);
    return;
  }

  // 如果值存在，且不全部为数字，则进行JSON转换
  try {
    let jsonObj = JSON.parse(value);
    let type = Object.prototype.toString.call(jsonObj).slice(8, -1);
    if (type === "Object") {
      $(".begin-mark span:first").show();
      $(".end-mark span:first").show();
    } else if (type === "Array") {
      $(".begin-mark span:last").show();
      $(".end-mark span:last").show();
    }
    $("#result").text(""); // 清空结果
    recursion(jsonObj); // 递归遍历对象
  } catch (error) {
    // 解析出错，隐藏符号，显示错误信息
    $(".begin-mark span").hide();
    $(".end-mark span").hide();
    let errHtml = `<div class="errorMsg">${error.message}</div>`
    $("#result").html(errHtml);
  }
}

// 递归遍历对象
function recursion(obj, fatherDom) {
  Object.keys(obj).forEach((key) => {
    let type = getType(obj[key]);
    if (["Object", "Array"].includes(type)) {
      let div = handleDom(type, key, fatherDom);
      recursion(obj[key], div);
    } else {
      handleDom(type, key, fatherDom, obj);
    }
  });
}

// 处理Dom
function handleDom(type, key, fatherDom, obj) {
  let div = document.createElement("div");
  if (type === "Object") {
    div.innerHTML = `
      <div class="toggle-container">
        <div class="toggle"></div>
        <span class="key">${key}: </span>
        <span>{</span>
      </div>
      <div class="child"></div>
      <span>} ,</span>
    `;
    div.classList.add("fatherDom");
  } else if (type === "Array") {
    div.innerHTML = `
      <div class="toggle-container">
        <div class="toggle"></div>
        <span class="key">${key}: </span>
        <span>[</span>
      </div>
      <div class="child"></div>
      <span>] ,</span>
    `;
    div.classList.add("fatherDom");
  } else {
    div.innerHTML = `
      <div>
        <span class="key">${key}: </span>
        <span class="content">
          <span class="${type}">${handleContent(type, key, obj)}</span> ,
        </span>
      </div>
    `;
  }
  if (fatherDom) {
    fatherDom.querySelector(".child").appendChild(div);
  } else {
    resultContainer.appendChild(div);
  }
  return div;
}

// 处理内容
function handleContent(type, key, obj) {
  switch (type) {
    case "String":
      return `"${obj[key]}"`
    default:
      return obj[key];
  }
}

// 展开和收缩层级
function handleToggle(event) {
  let child;
  if (event.target.className === "toggle-container") {
    child = event.target.nextElementSibling;
  } else if (["toggle", "key"].includes(event.target.className)) {
    child = event.target.parentNode.nextElementSibling;
  }
  if (!child) { return }
  let toggle = child.parentNode.children[0].children[0];
  if(child.style.height === "0px"){
    child.style.height = child.scrollHeight + "px";
    setTimeout(() => {
      child.style.height = "auto";
    }, 200);
    toggle.style.background = "#2c3e50";
  }else{
    child.style.height = child.clientHeight + "px";
    setTimeout(() => {
      child.style.height = "0px";
    });
    toggle.style.background = "#fff";
  }
}

// 工具函数，获取变量的类型
function getType(any) {
  let type = Object.prototype.toString.call(any).slice(8, -1);
  return type;
}
