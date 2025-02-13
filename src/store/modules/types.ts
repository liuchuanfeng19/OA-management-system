import type { RouteRecordName } from "vue-router";

export type cacheType = {
  mode: string;
  name?: RouteRecordName;
};

export type positionType = {
  startIndex?: number;
  length?: number;
};

export type appType = {
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
    // 判断是否手动点击Collapse
    isClickCollapse: boolean;
  };
  layout: string;
  device: string;
};

export type editorType = {
  openType: string;
  content: string;
  title: string;
};

export type OAUserType = {
  id: string;
  name: string;
  type: string;
  avatar: string;
};

export type FormPermsType = {
  id: string;
  title: string;
  required: boolean;
  perm: string;
};

export type NodePropsGroupsType = {
  groupType: string;
  cids: string;
  conditions: Array<any>;
};
export type FormItemPropsType = {
  items: Array<any>;
  required: boolean;
  enablePrint: boolean;
};
export type FormItemType = {
  id: string;
  title: string;
  icon: string;
  name: string;
  field: string;
  props: FormItemPropsType;
};
export type OAType = {
  nodeMap: Map<any, any>;
  isEdit: boolean;
  selectedNode: {
    id: string;
    parentId: string;
    name: string;
    type: string;
    props: {
      formPerms: Array<FormPermsType>;
      groups: Array<any>;
      groupsType: string;
      expression: string;
      assignedUser: Array<any>;
      ccUser: Array<any>;
      shouldAdd: boolean;
      type: string;
      time: number;
      unit: string;
      dateTime: string;
      assignedType: string;
      ccType: string;
      http;
      email;
      formUser;
      role;
      ccRole;
      refuse: {
        type: string;
        target;
      };
      sign: boolean;
      timeLimit: {
        timeout: {
          value: number;
          unit: string;
        };
        handler: {
          type: string;
          notify: {
            once: boolean;
            hour: number;
          };
        };
      };
      nobody: { handler: string; assignedUser };
      mode: string;
      leader: {
        level: number;
        type: boolean;
      };
      selfSelect: { multiple: boolean };
      leaderTop: { endCondition: string; level: number };
    };
  };
  selectFormItem: FormItemType;
  design: {
    groupId: number;
    ccIds: string[];
    group: string;
    formId: string;
    formName: string;
    formCode: string;
    applyMenuId: string;
    auditMenuId: string;
    logo: {
      icon: string;
      background: string;
    };
    settings: {
      commiter: [];
      admin: OAUserType[];
      sign: boolean;
      nowUserSelect: string;
      notify: {
        types: string[]; //APP
        title: "消息通知标题";
      };
    };
    process: {
      id: "root";
      parentId: null;
      type: "ROOT";
      name: "发起人";
      desc: "任何人";
      props: {
        id: string;
        parentId: string;
        name: string;
        type: string;
        props: {
          formPerms: Array<FormPermsType>;
          groups: Array<any>;
          groupsType: string;
          expression: string;
          assignedUser: Array<any>;
          ccUser: Array<any>;
          shouldAdd: boolean;
          type: string;
          time: number;
          unit: string;
          dateTime: string;
          assignedType: string;
          ccType: string;
          http;
          email;
          formUser;
          role;
          ccRole;
          refuse: {
            type: string;
            target;
          };
          sign: boolean;
          timeLimit: {
            timeout: {
              value: number;
              unit: string;
            };
            handler: {
              type: string;
              notify: {
                once: boolean;
                hour: number;
              };
            };
          };
          nobody: { handler: string; assignedUser };
          mode: string;
          leader: {
            level: number;
            type: boolean;
          };
          selfSelect: { multiple: boolean };
          leaderTop: { endCondition: string; level: number };
        };
      };
      children: {};
    };
    formItems: FormItemType[];
    remark: string;
  };
};

export type multiType = {
  path: string;
  parentPath: string;
  name: string;
  meta: any;
  query?: object;
  params?: object;
};

export type setType = {
  title: string;
  fixedHeader: boolean;
  hiddenSideBar: boolean;
};

export type userType = {
  userId: string;
  staffId: string;
  staffName?: string;
  departmentId: string;
  departmentName?: "";
  departmentCode: string;
  userCode: string;
  userName: string;
  avatarUrl: string;
  roleList: any[];
  token: string;
  name?: string;
  verifyCode?: string;
  currentPage?: number;
  buttons?: any[];
  avatar?: "";
};

export type departmentType = {
  rootDepartment: any[];
  departmentTree: any[];
};
export type staffType = {
  staffListNV: any[];
};
export type commpnType = {
  cityNVList: any[];
  docLendNVList: any[];
  leaseTypeNVList: any[];
};
export type projectType = {
  winBidProjectNVList: any[];
};
export type EmployeeInformationType = {
  queryFormData: {
    deptId: string;
    keyword: string;
    major: string;
    jobType: string;
    educationLevels: Array<any>;
    jobStatus: string;
    startYears: number;
    endYears: number;
    startAge: number;
    stopAge: number;
    years: string;
    companyIds: Array<any>;
    contractDate: any;
    startEndDate: string;
    stopEndDate: string;
    staffIds: Array<any>;
    pageIndex: number;
    pageSize: number;
  };
};
