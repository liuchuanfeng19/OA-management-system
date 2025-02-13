import dayjs from "dayjs";
import { h } from "vue";
import ReadTable from "@/components/ReadTable";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "PurchasingDetail.query", //itemName:PurchasingDetail.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleQuery", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },

  {
    buttonName: "领取", //displayName:编辑
    buttonCode: "PurchasingDetail.collect", //itemName:PurchasingDetail.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleCollect", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "是否确认领取" //itemName:是否确认删除
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
    prop: "projectFullName",
    width: 150,
    align: "left",
    read: true,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "设备名称",
    prop: "materialName",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "单位",
    prop: "materialUnit",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "规格型号",
    prop: "materialSpec",
    width: 150,
    align: "left",
    read: false,
    span: 1,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "参数要求",
    prop: "materialParams",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "备注",
    prop: "remark",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "站点",
    prop: "siteItems",
    width: 160,
    align: "right",
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true,
    tableColumnSlot: ({ siteItems }) =>
      h(ReadTable, {
        width: 785.6,
        height: 400,
        columns: [
          {
            label: "站点名称",
            prop: "siteName",
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
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "到货日期",
            prop: "receiveTime",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            span: 1,
            showOverflowTooltip: true,
            formatter: ({ receiveTime }) => {
              return receiveTime
                ? dayjs(receiveTime).format("YYYY-MM-DD")
                : "-";
            }
          }
        ],
        data: siteItems
      })
  }
];
