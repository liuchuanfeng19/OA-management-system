import { h } from "vue";
import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  // {
  //   buttonName: "申请", //displayName:编辑
  //   buttonCode: "Payment.apply", //itemName:Payment.edit
  //   buttonIcon: "add", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleAdd", //itemName:handleEdit
  //   isTableColum: false, //itemName:false
  //   isLink: false, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  {
    buttonName: "批量确认打款", //displayName:编辑
    buttonCode: "Payment.confirm", //itemName:Payment.edit
    buttonIcon: "check", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleConfirm", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "Payment.export", //itemName:Payment.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "Payment.query", //itemName:Payment.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  // {
  //   buttonName: "编辑", //displayName:编辑
  //   buttonCode: "Payment.edit", //itemName:Payment.edit
  //   buttonIcon: "", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleEdit", //itemName:handleEdit
  //   isTableColum: true, //itemName:false
  //   isLink: true, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  // {
  //   buttonName: "删除", //displayName:编辑
  //   buttonCode: "Payment.delete", //itemName:Payment.edit
  //   buttonIcon: "", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleDelete", //itemName:handleEdit
  //   isTableColum: true, //itemName:false
  //   isLink: true, //itemName:false
  //   popconfirmTitle: "是否确认删除" //itemName:是否确认删除
  // },
  {
    buttonName: "确认打款", //displayName:编辑
    buttonCode: "Payment.confirm", //itemName:Payment.edit
    buttonIcon: "menu", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleConfirm", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
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
        buttonCode: "", //itemName:Payment.edit
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

export const columns = [
  {
    label: "报销归属",
    prop: "belong",
    width: 120,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ belong }) => h("span", belong == 1 ? "项目" : "非项目")
  },

  {
    label: "项目名称",
    prop: "projName",
    width: 200,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "公司名称",
    prop: "belongCompanyName",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "所属部门",
    prop: "deptName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "费用类别",
    prop: "expenseCategory",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "金额",
    prop: "amount",
    width: 100,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "经办人",
    prop: "staffName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "填写人",
    prop: "agent",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "申请事由",
    prop: "applyReason",
    width: 180,
    align: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "申请时间",
    prop: "applyTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ applyTime }) => {
      return applyTime ? dayjs(applyTime).format("YYYY-MM-DD") : "-";
    }
  }
];
