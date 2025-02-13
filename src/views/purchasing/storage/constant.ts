import dayjs from "dayjs";
import { h } from "vue";
import ReadTable from "@/components/ReadTable";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "申请", //displayName:编辑
    buttonCode: "Storage.apply", //itemName:Storage.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleApply", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  // {
  //   buttonName: "导出", //displayName:编辑
  //   buttonCode: "Storage.export", //itemName:Storage.edit
  //   buttonIcon: "export", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleExport", //itemName:handleEdit
  //   isTableColum: false, //itemName:false
  //   isLink: false, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "Storage.query", //itemName:Storage.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "Storage.edit", //itemName:Storage.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "签收", //displayName:编辑
    buttonCode: "Storage.signIn", //itemName:Storage.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleSignIn", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  // {
  //   buttonName: "发货信息", //displayName:编辑
  //   buttonCode: "Storage.edit", //itemName:Storage.edit
  //   buttonIcon: "", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleEdit", //itemName:handleEdit
  //   isTableColum: true, //itemName:false
  //   isLink: true, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "Storage.delete", //itemName:Storage.edit
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
        buttonCode: "", //itemName:Storage.edit
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
    label: "会签合同",
    prop: "sellContractCode",
    width: 150,
    align: "left",
    read: true,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  },
  {
    label: "项目名称",
    prop: "projectFullName",
    width: 150,
    align: "left",
    read: true,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  },
  {
    label: "收货单位",
    prop: "recvCompany",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "发货单位",
    prop: "sendCompany",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "收货地址",
    prop: "recvAddress",
    width: 150,
    align: "left",
    read: false,
    span: 2,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "发货地址",
    prop: "sendAddress",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  },
  {
    label: "收货人",
    prop: "recvName",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "电话",
    prop: "recvMobile",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "发货人",
    prop: "sender",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "电话",
    prop: "senderMobile",
    width: 150,
    align: "left",
    read: false,
    span: 1,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "要求到达日期",
    prop: "receiveTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true,
    formatter: ({ receiveTime }) => {
      return receiveTime ? dayjs(receiveTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "负责人",
    prop: "projectDutyStaffName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "发货日期",
    prop: "sendTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true,
    formatter: ({ sendTime }) => {
      return sendTime ? dayjs(sendTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "经办人",
    prop: "handStaffName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "采购合同编号",
    prop: "sellContractCode",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "站点",
    prop: "siteName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "备注",
    prop: "remark",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  },
  {
    label: "发货清单明细",
    prop: "recvSignItems",
    width: 160,
    align: "right",
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true,
    tableColumnSlot: ({ recvSignItems }) =>
      h(ReadTable, {
        width: 775,
        height: 400,
        columns: [
          {
            label: "产品名称",
            prop: "materialName",
            width: 150,
            align: "left",
            read: true,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "配置型号",
            prop: "materialSpec",
            width: 150,
            align: "left",
            read: true,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "单位",
            prop: "materialUnit",
            width: 150,
            align: "left",
            read: true,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "数量",
            prop: "materialQty",
            width: 150,
            align: "right",
            read: true,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "签收状态",
            prop: "recvItemStatusName",
            width: 150,
            align: "left",
            read: true,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "备注",
            prop: "reqOrderItemRemark",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          }
        ],
        data: recvSignItems
      })
  }
];
