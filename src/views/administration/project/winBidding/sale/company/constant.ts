import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";

export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "SaleCompany.add", //itemName:SaleCompany.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "SaleCompany.export", //itemName:SaleCompany.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "SaleCompany.query", //itemName:SaleCompany.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "SaleCompany.edit", //itemName:SaleCompany.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "SaleCompany.delete", //itemName:SaleCompany.edit
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
        buttonCode: "", //itemName:SaleCompany.edit
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
    label: "项目名称",
    prop: "projectFullName",
    width: 300,
    align: "left",
    fixed: undefined,
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "项目简称",
    prop: "projectShortName",
    width: 200,
    align: "left",
    fixed: undefined,
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "单位名称",
    prop: "companyName",
    width: 200,
    align: "left",
    fixed: undefined,
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "地址",
    prop: "address",
    width: 200,
    align: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "开户行",
    prop: "bank",
    width: 200,
    align: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "发票种类",
    prop: "invoiceTypeName",
    width: 130,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "税率",
    prop: "taxRate",
    width: 90,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "税号",
    prop: "taxNo",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "预计收款日期",
    prop: "planCollectTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ planCollectTime }) => {
      return planCollectTime ? dayjs(planCollectTime).format("YYYY-MM-DD") : "";
    }
  },
  {
    label: "电话",
    prop: "telephone",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "帐号",
    prop: "bankAccount",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同号",
    prop: "sellContractCode",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "财务立项",
    prop: "financeProjectName",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
