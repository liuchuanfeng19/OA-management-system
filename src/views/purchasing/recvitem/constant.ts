import { h } from "vue";
import dayjs from "dayjs";
import { ElTag } from "element-plus";
import { hasPermission } from "@/utils/permission";

export const pageButtons: TableButton[] = [
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "RecvItem.export", //itemName:SaleInvoice.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "RecvItem.query", //itemName:PurchasingDetail.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleQuery", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "合同内容", //displayName:编辑
    buttonCode: "RecvItem.contract", //itemName:PurchasingDetail.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleContract", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "发票开具", //displayName:编辑
    buttonCode: "RecvItem.invoice", //itemName:PurchasingDetail.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleInvoice", //itemName:handleEdit
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
        buttonCode: "", //itemName:PurchasingDetail.edit
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
    prop: "projectShortName",
    width: 300,
    align: "left",
    fixed: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同日期",
    prop: "supplyContractTime",
    width: 120,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ supplyContractTime }) => {
      return supplyContractTime
        ? dayjs(supplyContractTime).format("YYYY-MM-DD")
        : "-";
    }
  },
  {
    label: "合同编号",
    prop: "sellContractCode",
    width: 200,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "类别",
    prop: "businessTypeName",
    width: 120,
    align: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "签订主体名称",
    prop: "customer",
    width: 200,
    align: "letf",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "供应单位名称",
    prop: "supplyName",
    width: 120,
    align: "letf",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同内容",
    prop: "contractContent",
    width: 200,
    align: "letf",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同金额",
    prop: "amount",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "税率",
    prop: "taxRateStr",
    width: 100,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "付款方式",
    prop: "payMethod",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "付款日期",
    prop: "payTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ payTime }) => {
      return payTime ? dayjs(payTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "付款金额",
    prop: "payTotal",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同已付",
    prop: "payAmount",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同未付",
    prop: "unPayAmount",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "发票已开",
    prop: "invoiceAmount",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "发票未开",
    prop: "unInvoiceAmount",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "质保期",
    prop: "qualityTime",
    width: 120,
    align: "letf",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ qualityTime }) => {
      return qualityTime ? dayjs(qualityTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "采购负责人(业务经办人)",
    prop: "handStaffName",
    width: 180,
    align: "letf",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同原件是否返还",
    prop: "isContractReturn",
    width: 140,
    align: "letf",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ isContractReturn }) =>
      h(
        ElTag,
        {
          type: isContractReturn ? "success" : "info"
        },
        isContractReturn ? "是" : "否"
      )
  },
  {
    label: "签收单/验收单是否返还",
    prop: "isRecvSignReturn",
    width: 170,
    align: "letf",
    read: false,

    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ isRecvSignReturn }) =>
      h(
        ElTag,
        {
          type: isRecvSignReturn ? "success" : "info"
        },
        isRecvSignReturn ? "是" : "否"
      )
  },
  {
    label: "备注",
    prop: "remark",
    width: 200,
    align: "letf",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
