import { h } from "vue";
import dayjs from "dayjs";
import PreviewButton from "@/components/PreviewButton";
import DownloadButton from "@/components/DownloadButton";
import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "添加", //displayName:编辑
    buttonCode: "BusinessTender.add", //itemName:BusinessTender.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "BusinessTender.export", //itemName:BusinessTender.edit
    buttonIcon: "export", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExport", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "批量下载", //displayName:编辑
    buttonCode: "BusinessTender.moreDownload", //itemName:BusinessTender.edit
    buttonIcon: "download", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleMoreDownload", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "BusinessTender.edit", //itemName:BusinessTender.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "参与", //displayName:编辑
    buttonCode: "BusinessTender.join", //itemName:BusinessTender.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleStatus1", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "不参与", //displayName:编辑
    buttonCode: "BusinessTender.unjoin", //itemName:BusinessTender.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleStatus2", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "BusinessTender.delete", //itemName:BusinessTender.edit
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
        buttonCode: "", //itemName:BusinessTender.edit
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
    label: "招标标题",
    prop: "title1",
    width: 200,
    align: "left",
    fixed: "left",
    read: true,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "参与状态",
    prop: "inStatusName",
    width: 100,
    align: "left",
    fixed: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "招标单位",
    prop: "unit",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "中标金额(元)",
    prop: "amount",
    width: 120,
    align: "right",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "采购方式",
    prop: "buyMethodName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "公告类型",
    prop: "noticeTypeName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "省份地区",
    prop: "areaName",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "采购主体",
    prop: "company",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "报名开始日期",
    prop: "startTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ startTime }) => {
      return startTime ? dayjs(startTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "报名截止日期",
    prop: "endTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ endTime }) => {
      return endTime ? dayjs(endTime).format("YYYY-MM-DD") : "-";
    }
  },
  {
    label: "附件",
    prop: "attach",
    width: 120,
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
    label: "商务专员",
    prop: "busiStaffName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "创建时间",
    prop: "createTime",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true,
    formatter: ({ createTime }) => {
      return dayjs(createTime).format("YYYY-MM-DD");
    }
  }
];
