import { h } from "vue";
import dayjs from "dayjs";
import ReadTable from "@/components/ReadTable";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "BidProjectInfo.add", //itemName:BidProjectInfo.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "BidProjectInfo.export", //itemName:BidProjectInfo.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "BidProjectInfo.query", //itemName:BidProjectInfo.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  // {
  //   buttonName: "管理附件", //displayName:编辑
  //   buttonCode: "BidProjectInfo.attachment", //itemName:BidProjectInfo.edit
  //   buttonIcon: "", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleAttachment", //itemName:handleEdit
  //   isTableColum: true, //itemName:false
  //   isLink: true, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },
  {
    buttonName: "中标", //displayName:编辑
    buttonCode: "BidProjectInfo.suspend", //itemName:BidProjectInfo.edit
    buttonIcon: "menu", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleStatus3", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "未中标", //displayName:编辑
    buttonCode: "BidProjectInfo.suspend", //itemName:BidProjectInfo.edit
    buttonIcon: "menu", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleStatus4", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "中止", //displayName:编辑
    buttonCode: "BidProjectInfo.suspend", //itemName:BidProjectInfo.edit
    buttonIcon: "menu", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleStatus1", //itemName:handleEdit
    isTableColum: true, //itemName:false
    popconfirmTitle: "", //itemName:是否确认删除
    isLink: true //itemName:false
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "BidProjectInfo.edit", //itemName:BidProjectInfo.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "BidProjectInfo.delete", //itemName:BidProjectInfo.edit
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
        buttonCode: "", //itemName:BidProjectInfo.edit
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
    prop: "fullName",
    width: 150,
    align: "left",
    read: true,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "开标时间",
    prop: "openTime",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true,
    formatter: ({ openTime }) => {
      return openTime ? dayjs(openTime).format("YYYY-MM-DD  HH:mm:ss") : "-";
    }
  },
  {
    label: "开标地点",
    prop: "openAddress",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true
  },
  {
    label: "标书制作人员",
    prop: "projectItemList",
    width: 150,
    align: "right",
    isFormItem: true,
    span: 1,
    showOverflowTooltip: true,
    tableColumnSlot: ({ projectItemList }) =>
      h(ReadTable, {
        width: 775,
        height: 400,
        columns: [
          {
            label: "投标单位",
            prop: "bidCompanyName",
            width: 150,
            align: "left",
            read: true,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "投标包件",
            prop: "bidPackage",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "投标金额（元）",
            prop: "bidAmount",
            width: 150,
            align: "right",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "商务人员",
            prop: "bidBusiStaffName",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "技术人员",
            prop: "bidTechStaffName",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "采购人员",
            prop: "bidBuyStaffName",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "终审人员",
            prop: "bidReviewStaffName",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          },
          {
            label: "备注",
            prop: "bidCompanyComment",
            width: 150,
            align: "left",
            read: false,
            isFormItem: true,
            showOverflowTooltip: true
          }
        ],
        data: projectItemList
      })
  }
];
