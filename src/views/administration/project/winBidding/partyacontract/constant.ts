import { h } from "vue";
import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";

export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "PartyAContract.add", //itemName:PartyAContract.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "PartyAContract.export", //itemName:PartyAContract.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "PartyAContract.query", //itemName:PurchasingOrder.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleQuery", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "PartyAContract.edit", //itemName:PurchasingOrder.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "添加子合同", //displayName:编辑
    buttonCode: "PartyAContract.subAdd", //itemName:PartyAContract.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleSubAdd", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "PartyAContract.delete", //itemName:PurchasingOrder.edit
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
        buttonCode: "", //itemName:PurchasingOrder.edit
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
export const columns1 = [
  {
    label: "项目名称",
    prop: "projectFullName",
    width: 300,
    align: "left",
    fixed: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "立项名称",
    prop: "projectShortName",
    width: 200,
    align: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同名称",
    prop: "contractName",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同类型",
    prop: "contractTypeName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "甲方合同编号",
    prop: "contractCode",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "甲方名称",
    prop: "customerName",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "乙方合同编号",
    prop: "secondCode",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "乙方名称",
    prop: "secondName",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "丙方合同编号",
    prop: "thirdCode",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "丙方名称",
    prop: "thirdName",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "金额（元）",
    prop: "contractAmount",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同付款条件",
    prop: "payCondition",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "预估付款节点",
    prop: "planPayNode",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "质保金额",
    prop: "qualityAmount",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "质保比例",
    prop: "qualityPercent",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "质保开始日期",
    prop: "qualityStartTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ qualityStartTime }) => {
      return qualityStartTime
        ? dayjs(qualityStartTime).format("YYYY-MM-DD")
        : "-";
    }
  },
  {
    label: "质保结束日期",
    prop: "qualityEndTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ qualityEndTime }) => {
      return qualityEndTime ? dayjs(qualityEndTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "履约保证金",
    prop: "ensureAmount",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "项目地点",
    prop: "projectAddress",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
export const columns2 = [
  {
    label: "收款日期",
    prop: "returnTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ returnTime }) => {
      return returnTime ? dayjs(returnTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "款项",
    prop: "returnTotal",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "方式",
    prop: "returnType",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "收款金额",
    prop: "returnAmount",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "未收金额",
    prop: "returnLeft",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
export const columns3 = [
  {
    label: "日期",
    prop: "invoiceTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ invoiceTime }) => {
      return invoiceTime ? dayjs(invoiceTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "已开金额",
    prop: "invoiceAmount",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "未开金额",
    prop: "invoiceLeft",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "已开票比例",
    prop: "invoicePercent",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "备注",
    prop: "invoiceRemark",
    width: 150,
    align: "letf",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
export const columns4 = [
  {
    label: "日期",
    prop: "otherTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ otherTime }) => {
      return otherTime ? dayjs(otherTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "款项",
    prop: "otherTotal",
    width: 100,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "金额",
    prop: "otherAmount",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
export const columns5 = [
  {
    label: "日期",
    prop: "supplyContractTime",
    width: 120,
    align: "left",
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
    label: "厂家名称",
    prop: "supplyName",
    width: 150,
    align: "letf",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "金额",
    prop: "supplyContractAmount",
    width: 100,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
export const columns6 = [
  {
    label: "项目毛利",
    prop: "projectGrossProfit",
    width: 150,
    align: "right",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合同附件",
    prop: "originAttach",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ originAttach }) =>
      h(
        "div",
        originAttach && originAttach.length > 0
          ? [
              h(PreviewButton, { srcList: [originAttach] }),
              h(DownloadButton, { srcList: [originAttach] })
            ]
          : []
      )
  }
];
