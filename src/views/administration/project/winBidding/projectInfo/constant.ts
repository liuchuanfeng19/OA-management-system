import { h } from "vue";
import dayjs from "dayjs";
import ReadTable from "@/components/ReadTable";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "WinBiddingProjectInfo.add", //itemName:WinBiddingProjectInfo.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "WinBiddingProjectInfo.export", //itemName:WinBiddingProjectInfo.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "WinBiddingProjectInfo.query", //itemName:WinBiddingProjectInfo.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "WinBiddingProjectInfo.edit", //itemName:WinBiddingProjectInfo.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "WinBiddingProjectInfo.delete", //itemName:WinBiddingProjectInfo.edit
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
        buttonCode: "", //itemName:WinBiddingProjectInfo.edit
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
    prop: "fullName",
    width: 200,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "开标时间",
    prop: "openTime",
    width: 150,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "开标地点",
    prop: "openAddress",
    width: 160,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "标书制作人员",
    prop: "projectItemList",
    width: 160,
    align: "left",
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ projectItemList }) =>
      h(ReadTable, {
        width: 813,
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
  },
  {
    label: "投标单位",
    prop: "bidCompanyName",
    width: 280,
    align: "left",
    read: false,
    isFormItem: false,
    showOverflowTooltip: true
  },
  {
    label: "投标包件",
    prop: "bidPackage",
    width: 120,
    align: "left",
    read: false,
    isFormItem: false,
    showOverflowTooltip: true
  },
  {
    label: "投标金额（元）",
    prop: "bidAmount",
    width: 130,
    align: "right",
    read: false,
    isFormItem: false,
    showOverflowTooltip: true
  }
];
export const columns2 = [
  {
    label: "商务人员",
    prop: "bidBusiStaffName",
    width: 100,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "技术人员",
    prop: "bidTechStaffName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "采购人员",
    prop: "bidBuyStaffName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "终审人员",
    prop: "bidReviewStaffName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
export const columns3 = [
  {
    label: "中标单位",
    prop: "winBidCompanyName",
    width: 200,
    fixed: undefined,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "投标文件项目经理",
    prop: "projStaffName",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "投标文件技术负责人",
    prop: "techStaffName",
    width: 160,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "开工日期",
    prop: "startTime",
    width: 160,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ startTime }) => {
      return startTime ? dayjs(startTime).format("YYYY-MM-DD") : "";
    }
  },
  {
    label: "竣工日期",
    prop: "endTime",
    width: 160,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ endTime }) => {
      return endTime ? dayjs(endTime).format("YYYY-MM-DD") : "";
    }
  }
];
export const columns4 = [
  {
    label: "项目立项简称",
    prop: "shortName",
    width: 200,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "项目经理/负责人",
    prop: "dutyStaffName",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "商务负责人",
    prop: "busiStaffName",
    width: 160,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "项目进度",
    prop: "progressStatus",
    width: 110,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    tableColumnSlot: ({ progressStatus }) =>
      h(
        "span",
        progressStatus == 1
          ? "未开始"
          : progressStatus == 2
            ? "进行中"
            : progressStatus == 3
              ? "已结束"
              : "---"
      )
  },
  {
    label: "备注",
    prop: "winBidComment",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  }
];
