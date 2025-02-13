import { h } from "vue";
import dayjs from "dayjs";
import { hasPermission } from "@/utils/permission";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";

export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "HousingList.add", //itemName:HousingList.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "HousingList.query", //itemName:PurchasingOrder.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleQuery", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "HousingList.edit", //itemName:PurchasingOrder.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "HousingList.delete", //itemName:PurchasingOrder.edit
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
    label: "房屋名称",
    prop: "name",
    width: 120,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "房屋来源",
    prop: "type",
    width: 120,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ type }) =>
      h("div", type == 1 ? "自有" : type == 2 ? "租赁" : "")
  },
  {
    label: "房屋面积(㎡)",
    prop: "area",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "租赁金额",
    prop: "amount",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    condition: ({ type }) => type == 2
  },
  {
    label: "房屋描述",
    prop: "description",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "房屋地址",
    prop: "address",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "房屋经办人",
    prop: "dutyStaffName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "经办人电话",
    prop: "dutyStaffMobile",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "甲方姓名",
    prop: "bossName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    condition: ({ type }) => type == 2
  },
  {
    label: "甲方电话",
    prop: "bossMobile",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    condition: ({ type }) => type == 2
  },
  {
    label: "起租时间",
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
    label: "房屋图片",
    prop: "buildsImg",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ buildsImg }) =>
      h(
        "div",
        buildsImg.length > 0
          ? [
              h(PreviewButton, { srcList: buildsImg }),
              h(DownloadButton, { srcList: buildsImg })
            ]
          : []
      )
  }
];
