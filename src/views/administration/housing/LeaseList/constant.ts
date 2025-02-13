import { h } from "vue";
import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";

export const pageButtons: TableButton[] = [
  {
    buttonName: "租赁", //displayName:编辑
    buttonCode: "LeaseList.add", //itemName:LeaseList.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "LeaseList.query", //itemName:PurchasingOrder.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleQuery", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "LeaseList.edit", //itemName:PurchasingOrder.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "退租", //displayName:编辑
    buttonCode: "LeaseList.rentingOut", //itemName:PurchasingOrder.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleWithdrawal", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "LeaseList.delete", //itemName:PurchasingOrder.edit
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

export const columns = [
  {
    label: "租赁人",
    prop: "staffName",
    width: 120,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "租赁人电话",
    prop: "mobile",
    width: 120,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "身份证号",
    prop: "idCard",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "租赁方式",
    prop: "leaseTypeExpr",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "房屋名称",
    prop: "buildsName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "付款方式",
    prop: "renterMethodExpr",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "合租人",
    prop: "ccRemark",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "租赁金额",
    prop: "renterAmount",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "开始时间",
    prop: "startTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    condition: ({ type }) => type == 2,
    formatter: ({ startTime }) => {
      return startTime ? dayjs(startTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "到期时间",
    prop: "endTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    condition: ({ type }) => type == 2,
    formatter: ({ endTime }) => {
      return endTime ? dayjs(endTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "租赁人数",
    prop: "renterCount",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "租住房间",
    prop: "roomName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    condition: ({ leaseType }) => leaseType == 2
  },

  {
    label: "身份证正面",
    prop: "idCardFront",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ idCardFront }) =>
      h(
        "div",
        idCardFront.length > 0
          ? [
              h(PreviewButton, { srcList: idCardFront }),
              h(DownloadButton, { srcList: idCardFront })
            ]
          : []
      )
  },

  {
    label: "身份证反面",
    prop: "idCardBack",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ idCardBack }) =>
      h(
        "div",
        idCardBack.length > 0
          ? [
              h(PreviewButton, { srcList: idCardBack }),
              h(DownloadButton, { srcList: idCardBack })
            ]
          : []
      )
  },

  {
    label: "附件",
    prop: "attach",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ attach }) =>
      h(
        "div",
        attach.length > 0
          ? [
              h(PreviewButton, { srcList: attach }),
              h(DownloadButton, { srcList: attach })
            ]
          : []
      )
  },
  {
    label: "新增设施",
    prop: "addGoods",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
