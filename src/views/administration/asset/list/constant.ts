import dayjs from "dayjs";
import { h } from "vue";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "入库", //displayName:编辑
    buttonCode: "AssetList.add", //itemName:AssetList.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "申请", //displayName:编辑
    buttonCode: "AssetList.apply", //itemName:AssetList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleApproval", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "AssetList.query", //itemName:AssetList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleQuery", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "AssetList.delete", //itemName:AssetList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "danger", //itemName:primary
    buttonClick: "handleDelete", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "是否确认删除" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "AssetList.edit", //itemName:AssetList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "报废", //displayName:编辑
    buttonCode: "AssetList.Scrap", //itemName:AssetList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleBroke", //itemName:handleEdit
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
        buttonCode: "", //itemName:AssetList.edit
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
    label: "资产名称",
    prop: "name",
    width: 120,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "所属类别",
    prop: "catName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "资产编号",
    prop: "code",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "购买时间",
    prop: "buyTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ buyTime }) => {
      return buyTime ? dayjs(buyTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "库存",
    prop: "finalQty",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "责任人",
    prop: "dutyStaffName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "存放地点",
    prop: "storeAddress",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "入库时间",
    prop: "storeInTime",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ storeInTime }) => {
      return storeInTime ? dayjs(storeInTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "状态",
    prop: "statusExpr",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "返库",
    prop: "isNeedReturn",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ isNeedReturn }) => h("span", isNeedReturn ? "是" : "否")
  }
];
