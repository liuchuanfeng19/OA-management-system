import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "导出", //按钮名称
    buttonCode: "computerApply.export", //按钮对应的权限编码
    buttonIcon: "export", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleExport", //按钮点击事件
    isTableColum: false, //是否是表格里面的按钮
    isLink: false, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "申请", //按钮名称
    buttonCode: "computerApply.apply", //按钮对应的权限编码
    buttonIcon: "add", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleApply", //按钮点击事件
    isTableColum: false, //是否是表格里面的按钮
    isLink: false, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },

  {
    buttonName: "审核", //按钮名称
    buttonCode: "computerApply.audit", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleAudit", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "查看", //按钮名称
    buttonCode: "computerApply.query", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleRead", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "归还", //按钮名称
    buttonCode: "computerApply.return", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleReturn", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },
  {
    buttonName: "编辑", //按钮名称
    buttonCode: "computerApply.edit", //按钮对应的权限编码
    buttonIcon: "", //按钮图标
    buttonType: "primary", //按钮样式
    buttonClick: "handleEdit", //按钮点击事件
    isTableColum: true, //是否是表格里面的按钮
    isLink: true, //是否是链接
    popconfirmTitle: "" //点击按钮时的提示文字
  },

  // {
  //   buttonName: "维修更换记录", //按钮名称
  //   buttonCode: "computerApply.repair", //按钮对应的权限编码
  //   buttonIcon: "", //按钮图标
  //   buttonType: "primary", //按钮样式
  //   buttonClick: "handleRepair", //按钮点击事件
  //   isTableColum: true, //是否是表格里面的按钮
  //   isLink: true, //是否是链接
  //   popconfirmTitle: "" //点击按钮时的提示文字
  // },
  // {
  //   buttonName: "借还记录", //按钮名称
  //   buttonCode: "computerApply.circulate", //按钮对应的权限编码
  //   buttonIcon: "", //按钮图标
  //   buttonType: "primary", //按钮样式
  //   buttonClick: "handleCirculate", //按钮点击事件
  //   isTableColum: true, //是否是表格里面的按钮
  //   isLink: true, //是否是链接
  //   popconfirmTitle: "" //点击按钮时的提示文字
  // },
  {
    buttonName: "删除", //按钮名称
    buttonCode: "computerApply.delete", //按钮对应的权限编码
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
    label: "设备名称",
    prop: "computerName",
    width: 100,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "设备编号",
    prop: "computerCode",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "领用部门",
    prop: "collectDeptName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "领用人",
    prop: "collectStaffName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "领用日期",
    prop: "collectTime",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ collectTime }) => {
      return collectTime ? dayjs(collectTime).format("YYYY-MM-DD") : "-";
    }
  },

  {
    label: "存放位置",
    prop: "collectPlace",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
