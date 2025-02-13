import { h } from "vue";
import dayjs from "dayjs";
import { ElTag } from "element-plus";
import { hasPermission } from "@/utils/permission";

export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "TimerTask.add", //itemName:TimerTask.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "TimerTask.export", //itemName:TimerTask.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "TimerTask.query", //itemName:TimerTask.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "执行", //displayName:编辑
    buttonCode: "TimerTask.execute", //itemName:TimerTask.edit
    buttonIcon: "menu", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleConfirm", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "日志", //displayName:编辑
    buttonCode: "TimerTask.log", //itemName:TimerTask.edit
    buttonIcon: "menu", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleLog", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "TimerTask.edit", //itemName:TimerTask.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "TimerTask.delete", //itemName:TimerTask.edit
    buttonIcon: "", //itemName:edit
    buttonType: "danger", //itemName:primary
    buttonClick: "handleDelete", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "是否确认删除" //itemName:是否确认删除
  }
];
console.log("pageButtons", pageButtons);

//有权限的按钮数组
export const hasPermissionPageButtons = pageButtons.filter(item =>
  hasPermission(item.buttonCode)
);
console.log("hasPermissionPageButtons", hasPermissionPageButtons);

//有权限的表格按钮数组
export const tableButtons = hasPermissionPageButtons.filter(
  item => !item.isTableColum
);
console.log("tableButtons", tableButtons);

//有权限的操作按钮数组
export const tableRowButtons = hasPermissionPageButtons.filter(
  item => item.isTableColum
);
console.log("tableRowButtons", tableRowButtons);

//包含更多按钮的有权限的操作按钮数组
export const operationButtons = function () {
  const buttons = [];
  tableRowButtons.forEach((element, index) => {
    if (index < 3) {
      buttons.push({ ...element });
    } else if (index == 3) {
      buttons.push({
        buttonName: "更多", //displayName:编辑
        buttonCode: "", //itemName:TimerTask.edit
        buttonIcon: "more", //itemName:edit
        buttonType: "primary", //itemName:primary
        buttonClick: "", //itemName:handleEdit
        isTableColum: true, //itemName:false
        isLink: true, //itemName:false
        disabled: false, //itemName:false
        popconfirmTitle: "", //itemName:是否确认删除
        title: "更多", //itemName:false
        children: [{ ...element }]
      });
    } else {
      buttons[3].children.push({ ...element });
    }
  });
  return buttons;
};
const statusName = ["全部", "待执行", "成功", "失败", "暂停"];
const statusColor = ["", "info", "success", "danger", "warning", "unknown"];
export const columns = [
  {
    label: "任务名称",
    prop: "jobName",
    width: 200,
    align: "left",
    fixed: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "任务分组",
    prop: "jobGroup",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "执行状态",
    prop: "status",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ status }) =>
      h(
        ElTag,
        {
          type: statusColor[status]
        },
        statusName[status]
      )
  },
  {
    label: "cron执行表达式",
    prop: "cronExpression",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "超时时间（秒）",
    prop: "overTime",
    width: 130,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "失败重试次数",
    prop: "retry",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "是否启用",
    prop: "isStart",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ isStart }) =>
      h("div", isStart ? "启用" : isStart == 2 ? "禁用" : "")
  },
  {
    label: "描述",
    prop: "description",
    width: 200,
    align: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "接口地址",
    prop: "apiUrl",
    width: 400,
    align: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "任务参数",
    prop: "jobParams",
    width: 200,
    align: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "请求方式",
    prop: "requestMethod",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "最后执行时间",
    prop: "executeTime",
    width: 160,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ executeTime }) => {
      return executeTime ? dayjs(executeTime).format("YYYY-MM-DD") : "-";
    }
  }
];
