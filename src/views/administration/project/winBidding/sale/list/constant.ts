import { h } from "vue";
import { hasPermission } from "@/utils/permission";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";

export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "SaleList.add", //itemName:SaleList.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "SaleList.export", //itemName:SaleList.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "SaleList.query", //itemName:SaleList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "SaleList.edit", //itemName:SaleList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "SaleList.delete", //itemName:SaleList.edit
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
        buttonCode: "", //itemName:SaleList.edit
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
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "项目立项简称",
    prop: "projectShortName",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "甲方信息",
    prop: "attachCustomer",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachCustomer }) =>
      h(
        "div",
        attachCustomer.length > 0
          ? [
              h(PreviewButton, { srcList: attachCustomer }),
              h(DownloadButton, { srcList: attachCustomer })
            ]
          : []
      )
  },
  {
    label: "中标通知书",
    prop: "attachZbtzs",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachZbtzs }) =>
      h(
        "div",
        attachZbtzs.length > 0
          ? [
              h(PreviewButton, { srcList: attachZbtzs }),
              h(DownloadButton, { srcList: attachZbtzs })
            ]
          : []
      )
  },
  {
    label: "履约保函",
    prop: "attachLybh",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachLybh }) =>
      h(
        "div",
        attachLybh.length > 0
          ? [
              h(PreviewButton, { srcList: attachLybh }),
              h(DownloadButton, { srcList: attachLybh })
            ]
          : []
      )
  },
  {
    label: "合同",
    prop: "attachWzht",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachWzht }) =>
      h(
        "div",
        attachWzht.length > 0
          ? [
              h(PreviewButton, { srcList: attachWzht }),
              h(DownloadButton, { srcList: attachWzht })
            ]
          : []
      )
  },
  {
    label: "发票",
    prop: "attachInvoice",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachInvoice }) =>
      h(
        "div",
        attachInvoice.length > 0
          ? [
              h(PreviewButton, { srcList: attachInvoice }),
              h(DownloadButton, { srcList: attachInvoice })
            ]
          : []
      )
  },
  {
    label: "开工报告文件",
    prop: "attachKgbgwj",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachKgbgwj }) =>
      h(
        "div",
        attachKgbgwj.length > 0
          ? [
              h(PreviewButton, { srcList: attachKgbgwj }),
              h(DownloadButton, { srcList: attachKgbgwj })
            ]
          : []
      )
  },
  {
    label: "设计变更文件",
    prop: "attachSjbgwj",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachSjbgwj }) =>
      h(
        "div",
        attachSjbgwj.length > 0
          ? [
              h(PreviewButton, { srcList: attachSjbgwj }),
              h(DownloadButton, { srcList: attachSjbgwj })
            ]
          : []
      )
  },
  {
    label: "项目报验文件",
    prop: "attachXmbywj",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachXmbywj }) =>
      h(
        "div",
        attachXmbywj.length > 0
          ? [
              h(PreviewButton, { srcList: attachXmbywj }),
              h(DownloadButton, { srcList: attachXmbywj })
            ]
          : []
      )
  },
  {
    label: "验工计价",
    prop: "attachYgjj",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachYgjj }) =>
      h(
        "div",
        attachYgjj.length > 0
          ? [
              h(PreviewButton, { srcList: attachYgjj }),
              h(DownloadButton, { srcList: attachYgjj })
            ]
          : []
      )
  },
  {
    label: "竣工验收文件",
    prop: "attachJgyswj",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachJgyswj }) =>
      h(
        "div",
        attachJgyswj.length > 0
          ? [
              h(PreviewButton, { srcList: attachJgyswj }),
              h(DownloadButton, { srcList: attachJgyswj })
            ]
          : []
      )
  },
  {
    label: "档案管移交文件",
    prop: "attachDagyjwj",
    width: 130,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachDagyjwj }) =>
      h(
        "div",
        attachDagyjwj.length > 0
          ? [
              h(PreviewButton, { srcList: attachDagyjwj }),
              h(DownloadButton, { srcList: attachDagyjwj })
            ]
          : []
      )
  },
  {
    label: "过程红头函件",
    prop: "attachGchthj",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attachGchthj }) =>
      h(
        "div",
        attachGchthj.length > 0
          ? [
              h(PreviewButton, { srcList: attachGchthj }),
              h(DownloadButton, { srcList: attachGchthj })
            ]
          : []
      )
  }
  // {
  //   label: "开票申请单",
  //   prop: "attachKpsqd",
  //   width: 110,
  //   align: "left",
  //   read: false,
  //   isFormItem: true,
  //   showOverflowTooltip: true,
  //   tableColumnSlot: ({attachKpsqd}) =>
  //     h(
  //       "div",
  //       attachKpsqd.length > 0
  //         ? [
  //             h(PreviewButton, { srcList: attachKpsqd }),
  //             h(DownloadButton, { srcList: attachKpsqd })
  //           ]
  //         : []
  //     )
  // }
];
