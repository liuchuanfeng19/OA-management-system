import dayjs from "dayjs";
import { h } from "vue";
import ReadTable from "@/components/ReadTable";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "StorageGoods.add", //itemName:StorageGoods.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  // {
  //   buttonName: "导出", //displayName:编辑
  //   buttonCode: "StorageGoods.export", //itemName:StorageGoods.edit
  //   buttonIcon: "export", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleExport", //itemName:handleEdit
  //   isTableColum: false, //itemName:false
  //   isLink: false, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "StorageGoods.query", //itemName:StorageGoods.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "StorageGoods.edit", //itemName:StorageGoods.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "入库", //displayName:编辑
    buttonCode: "StorageGoods.receive", //itemName:StorageGoods.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleReceive", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "是否确认入库" //itemName:是否确认删除
  },
  {
    buttonName: "打印", //displayName:编辑
    buttonCode: "StorageGoods.print", //itemName:StorageGoods.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handlePrint", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "StorageGoods.delete", //itemName:StorageGoods.edit
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
        buttonCode: "", //itemName:StorageGoods.edit
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
    label: "入库单号",
    prop: "inStockCode",
    width: 150,
    align: "left",
    read: true,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  // {
  //   label: "会签合同",
  //   prop: "sellContractCode",
  //   width: 150,
  //   align: "left",
  //   read: false,
  //   isFormItem: true,
  //   span: 1,
  //   showOverflowTooltip: true
  // },
  {
    label: "乙方单位",
    prop: "supplyName",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "项目名称",
    prop: "projectFullName",
    width: 150,
    align: "left",
    read: false,
    span: 1,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "经手人",
    prop: "handStaffName",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "保管员",
    prop: "keepStaffName",
    width: 150,
    align: "left",
    read: false,
    span: 1,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "入库日期",
    prop: "inStockTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true,
    formatter: ({ inStockTime }) => {
      return inStockTime ? dayjs(inStockTime).format("YYYY-MM-DD") : "-";
    }
  },

  {
    label: "设备明细",
    prop: "recvInStockItems",
    width: 160,
    align: "left",
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true,
    tableColumnSlot: ({ recvInStockItems }) =>
      h(ReadTable, {
        width: 775,
        height: 400,
        columns: [
          {
            label: "名称",
            prop: "materialName",
            width: 150,
            align: "left",
            read: true,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "规格型号",
            prop: "materialSpec",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "单位",
            prop: "materialUnit",
            width: 150,
            align: "left",
            read: false,
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
            label: "已入库数量",
            prop: "inStockQty",
            width: 100,
            align: "right",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "有效数量",
            prop: "availableQty",
            width: 90,
            align: "right",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "单价",
            prop: "materialPriceNoTax",
            width: 100,
            align: "right",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "金额",
            prop: "subTotalNoTax",
            width: 100,
            align: "right",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "入库状态",
            prop: "materialStateName",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "备注",
            prop: "remark",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          }
        ],
        data: recvInStockItems
      })
  }
];
