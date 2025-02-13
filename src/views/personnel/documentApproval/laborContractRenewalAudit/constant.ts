import { hasPermission } from "@/utils/permission";
export const pageButtons: TableButton[] = [
  {
    buttonName: "申请", //displayName:编辑
    buttonCode: "LaborContractRenewalAudit.apply", //itemName:LaborContractRenewalAudit.edit
    buttonIcon: "add", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAdd", //itemName:handleEdit
    isTableColum: false, //itemName:false
    isLink: false, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  // {
  //   buttonName: "导出", //displayName:编辑
  //   buttonCode: "LaborContractRenewalAudit.export", //itemName:LaborContractRenewalAudit.edit
  //   buttonIcon: "export", //itemName:edit
  //   buttonType: "primary", //itemName:primary
  //   buttonClick: "handleExport", //itemName:handleEdit
  //   isTableColum: false, //itemName:false
  //   isLink: false, //itemName:false
  //   popconfirmTitle: "" //itemName:是否确认删除
  // },

  {
    buttonName: "查看", //displayName:编辑
    buttonCode: "LaborContractRenewalAudit.query", //itemName:LaborContractRenewalAudit.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleRead", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "审核", //displayName:编辑
    buttonCode: "LaborContractRenewalAudit.audit", //itemName:LaborContractRenewalAudit.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleAudit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "导出", //displayName:编辑
    buttonCode: "LaborContractRenewalAudit.exportOne", //itemName:LaborContractRenewalAudit.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleExportOne", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "编辑", //displayName:编辑
    buttonCode: "LaborContractRenewalAudit.edit", //itemName:LaborContractRenewalAudit.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleEdit", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "" //itemName:是否确认删除
  },
  {
    buttonName: "删除", //displayName:编辑
    buttonCode: "LaborContractRenewalAudit.delete", //itemName:LaborContractRenewalAudit.edit
    buttonIcon: "", //itemName:edit
    buttonType: "danger", //itemName:primary
    buttonClick: "handleDelete", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "是否确认删除" //itemName:是否确认删除
  },
  {
    buttonName: "隐藏", //displayName:编辑
    buttonCode: "LaborContractRenewalAudit.hidden", //itemName:TodoList.edit
    buttonIcon: "", //itemName:edit
    buttonType: "primary", //itemName:primary
    buttonClick: "handleHidden", //itemName:handleEdit
    isTableColum: true, //itemName:false
    isLink: true, //itemName:false
    popconfirmTitle: "确定要隐藏吗" //itemName:是否确认删除
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
        buttonCode: "", //itemName:LaborContractRenewalAudit.edit
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
    label: "姓名",
    prop: "innerStaffName",
    width: 100,
    align: "left",
    fixed: undefined,
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "所属公司",
    prop: "innerCompanyName",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "部门",
    prop: "innerDeptName",
    width: 120,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "职位",
    prop: "jobTitleName",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "学历",
    prop: "educationLevel",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "专业",
    prop: "major",
    width: 100,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "身份证号",
    prop: "idCard",
    width: 180,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "已取得相关证书",
    prop: "certs",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "家庭住址",
    prop: "homeAddress",
    width: 300,
    align: "left",
    read: false,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  },

  {
    label: "常住地址",
    prop: "localAddress",
    width: 300,
    align: "left",
    read: false,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  },
  {
    label: "邮政编码(家庭)",
    prop: "postCode1",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },
  {
    label: "邮政编码(居住地)",
    prop: "postCode2",
    width: 150,
    align: "left",
    read: false,
    isFormItem: true,
    showOverflowTooltip: true
  },

  {
    label: "部门评价",
    prop: "deptRemark",
    width: 200,
    align: "left",
    read: false,
    isFormItem: true,
    span: 2,
    showOverflowTooltip: true
  }
];
