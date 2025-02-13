import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "导出", //按钮名称
    buttonCode: "purchingApply.export", //按钮对应的权限编码
    buttonIcon: "export", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleExport", //按钮点击事件
    isTableColum: false, //是否是表格里面的按钮
    isLink: false, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "申请", //按钮名称
    buttonCode: "purchingApply.apply", //按钮对应的权限编码
    buttonIcon: "add", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleApply", //按钮点击事件
    isTableColum: false, //是否是表格里面的按钮
    isLink: false, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },

  {
    buttonName: "审核", //按钮名称
    buttonCode: "purchingApply.audit", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleAudit", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "查看", //按钮名称
    buttonCode: "purchingApply.query", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleRead", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "导出", //按钮名称
    buttonCode: "purchingApply.exportOne", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleExportOne", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "编辑", //按钮名称
    buttonCode: "purchingApply.edit", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleEdit", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "入库", //按钮名称
    buttonCode: "purchingApply.inStorage", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleIn", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "删除", //按钮名称
    buttonCode: "purchingApply.delete", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "danger", //按钮样式
    buttonClick: "handleDelete", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  }
];
//有权限的按钮数组
export const hasPermissionPageButtons = pageButtons.filter(item =>
  hasPermission(item.buttonCode)
);
//有权限的表格按钮数组
export const tableButtons = hasPermissionPageButtons.filter(
  item => !item.isTableColum
);
//有权限的操作按钮数组
export const tableRowButtons = hasPermissionPageButtons.filter(
  item => item.isTableColum
);
//包含更多按钮的有权限的操作按钮数组
export const operationButtons = function () {
  const buttons = [];
  tableRowButtons.forEach((element, index) => {
    if (index < 3) {
      buttons.push({ ...element });
    } else if (index == 3) {
      buttons.push({
        buttonName: "更多",
        buttonCode: "",
        buttonIcon: "more",
        buttonType: "primary",
        buttonClick: "",
        isTableColum: true,
        isLink: true,
        disabled: false,
        popconfirmTitle: "",
        title: "更多",
        children: [{ ...element }]
      });
    } else {
      buttons[3].children.push({ ...element });
    }
  });
  return buttons;
};

export const columns = [
  {
    label: "申请部门",
    prop: "ayDeptName",
    width: 120,
    align: "left",
    read: true,
    isFormItem: true,

    showOverflowTooltip: true
  },
  {
    label: "申请人",
    prop: "ayStaffName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,

    showOverflowTooltip: true
  },
  {
    label: "申请日期",
    prop: "ayTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,

    showOverflowTooltip: true,
    formatter: ({ ayTime }) => {
      return ayTime ? dayjs(ayTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "类型",
    prop: "ayTypeName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,

    showOverflowTooltip: true
  }
];
