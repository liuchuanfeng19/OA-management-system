<script setup lang="ts">
import type {
  UploadUserFile,
  UploadInstance,
  FormInstance,
  UploadProps
} from "element-plus";
import moment from "moment";
import { storeToRefs } from "pinia";
import { ElMessage } from "element-plus";
import { isPhone } from "@pureadmin/utils";
import { ref, computed, watch } from "vue";

import {
  doRecvSign,
  addRecvSign,
  getRecvSign,
  editRecvSign,
  getRecvSignNV1
} from "@/api/recvSign";
import { isTel } from "@/utils/validate";
import { uploadImg } from "@/api/common";
import { getSiteList } from "@/api/site";
import { doRecvSignItem } from "@/api/recvSignItem";
import { getListForRecvSign } from "@/api/joinSignItem";
import { userStaffStoreHook } from "@/store/modules/staff";
import { DownloadButton } from "@/components/DownloadButton";
import { GetJoinSignNV, getListNVByJoinSignId } from "@/api/purchasing";

const { getStaffListNV } = userStaffStoreHook();
// 表单模型
const INITIAL_DATA = {
  id: undefined, //主键ID
  projectId: "", //项目ID
  doTemp: true, //是否暂存
  projectFullName: "", //项目全称（只读）
  projectShortName: "", //项目简称（只读）
  winBidCompanyName: "", //中标单位（只读）
  projectDutyStaffId: "", //项目负责人Id
  projectDutyStaffName: "", //项目负责人（只读）
  joinSignId: "", //会签合同ID
  siteId: "", //站点ID
  reqOrderId: "", //reqOrderId
  sellContractCode: "", //采购合同编号/买方合同编号
  supplyContractCode: "", //供应商合同编号
  handStaffId: "", //采购经办人ID
  handStaffName: "", //采购经办人
  recvCompany: "", //收货单位
  recvAddress: "", //收货地址
  recvStaffId: "", //收货人id
  recvName: "", //收货人
  recvMobile: "", //收货人电话
  receiveTime: "", //要求到达时间
  realReceiveTime: "", //实际到达时间
  sendTime: "", //发货日期
  sendCompany: "", //发货单位
  sendAddress: "", //发货地址
  sender: "", //发货人
  senderMobile: "", //发货人电话
  attach: [], //收货单
  remark: "", //备注
  recvSignItems: [],
  saveItems: [] //明细（用于创建）
};
const validateAttach = (rule: any, value: any, callback: any) => {
  if (!value || value.length < 1) {
    showType.value == "signIn" ? callback(new Error("请上传附件")) : callback();
  } else {
    callback();
  }
};
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["search"]);

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const siteList = ref([]); //获取站点列表
const deviceList = ref([]);
const showType = ref("edit");
const joinSignNoList = ref([]);
const formVisible = ref(false);
const formLoading = ref(false);
const joinSignProjectList = ref([]);
// const ItemData = ref([]); //下采单子表
const ruleFormRef = ref<FormInstance>();
const uploadRef = ref<UploadInstance>();
const formData = ref({ ...INITIAL_DATA });
const fileList = ref<UploadUserFile[]>([]);
const { staffListNV } = storeToRefs(userStaffStoreHook());

// 表单校验规则;
const rules = ref({
  joinSignId: [
    {
      required: showType.value == "edit", //编辑的时候为必填
      message: "请选择会签合同",
      trigger: "change"
    }
  ],
  projectId: [
    {
      required: showType.value == "edit", //编辑的时候为必填
      message: "请选择项目",
      trigger: "change"
    }
  ],
  siteId: [
    {
      required: showType.value == "edit", //编辑的时候为必填
      message: "请选择站点",
      trigger: "change"
    }
  ],
  sendTime: [
    {
      required: showType.value == "edit", //编辑的时候为必填
      message: "请选择发货日期",
      trigger: "change"
    }
  ],
  receiveTime: [
    {
      required: showType.value == "edit", //编辑的时候为必填
      message: "请选择要求到达日期",
      trigger: "change"
    }
  ],
  sendCompany: [
    {
      required: showType.value == "edit", //编辑的时候为必填
      message: "请输入发货单位",
      trigger: "blur"
    }
  ],
  sendAddress: [
    {
      required: showType.value == "edit", //编辑的时候为必填
      message: "请输入发货地址",
      trigger: "blur"
    }
  ],
  sender: [
    {
      required: showType.value == "edit", //编辑的时候为必填
      message: "请输入发货人",
      trigger: "blur"
    }
  ],
  recvStaffId: [
    {
      required: true, //编辑的时候为必填
      message: "请输入收货人",
      trigger: "blur"
    }
  ],
  senderMobile: [
    {
      required: true, //编辑的时候为必填
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value) {
          if (!isPhone(value) && !isTel(value)) {
            callback(new Error("电话格式不正确"));
          } else {
            callback();
          }
        } else {
          callback(new Error("请输入发货人电话"));
        }
      }
    }
  ],
  recvMobile: [
    {
      required: true, //编辑的时候为必填
      trigger: "blur",
      validator: (rule, value, callback) => {
        if (value) {
          if (!isPhone(value) && !isTel(value)) {
            callback(new Error("电话格式不正确"));
          } else {
            callback();
          }
        } else {
          callback(new Error("请输入收货人电话"));
        }
      }
    }
  ],
  attach: [
    {
      message: "请上传附件",
      trigger: "change",
      validator: validateAttach
    }
  ]
});

// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return showType.value == "apply"
    ? "申请发货签收单"
    : showType.value == "read"
      ? "查看发货签收单"
      : showType.value == "edit"
        ? "编辑发货信息"
        : showType.value == "signIn"
          ? "签收发货签收单"
          : "";
});
const canSignIn = computed(() => {
  return formData.value.recvSignItems.filter(item => item.recvItemStatus == 1);
});

watch(
  () => formData.value.recvStaffId,
  newVal => {
    if (newVal) {
      const staff = staffListNV.value.find(item => item.value == newVal) || {};
      formData.value.recvName = staff.name;
    } else {
      formData.value.recvName = "";
    }
  }
);
watch(
  () => formData.value.projectId,
  newVal => {
    if (newVal) {
      const project =
        joinSignProjectList.value.find(item => item.projectId == newVal) || {};
      formData.value.projectFullName = project.projectFullName;
      formData.value.handStaffId = project.handStaffId;
      formData.value.handStaffName = project.handStaffName;
      formData.value.projectDutyStaffId = project.projectDutyStaffId;
      formData.value.projectDutyStaffName = project.projectDutyStaffName;
    } else {
      formData.value.projectFullName = "";
      formData.value.handStaffId = "";
      formData.value.handStaffName = "";
      formData.value.projectDutyStaffId = "";
      formData.value.projectDutyStaffName = "";
    }
  }
);

// 子组件暴露给父组件调用的方法
const show = async (_formData, _showType) => {
  getJoinSignNos();
  getStaffListNV();
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  showType.value = _showType;
  if (_formData) {
    await getDetail(_formData.id);
  }
};
defineExpose({ show });

// 编辑表单时根据id获取详情数据;
async function getDetail(id) {
  formLoading.value = true;
  const { data } = await getRecvSign({ id });
  const _data = data || {};
  if (_data.recvStaffId == "00000000-0000-0000-0000-000000000000") {
    _data.recvStaffId = "";
  }
  formData.value = _data;
  if (
    showType.value == "edit" &&
    (formData.value.sendTime == null || formData.value.sendTime == "")
  ) {
    formData.value.sendTime = moment().format("YYYY-MM-DD");
  }
  console.log("formData.value.sendTime", formData.value.sendTime);
  if (formData.value.attach && formData.value.attach.length > 0) {
    fileList.value = formData.value.attach.map(item => {
      return {
        name: item.substr(item.lastIndexOf("/") + 1),
        url: item
      };
    });
  }
  deviceList.value = formData.value.recvSignItems;
  getJoinSignProjects(data.joinSignId);
  getProjectSiteList();
  getPerson();
  formLoading.value = false;
}

// 获取合同编号
const getJoinSignNos = async () => {
  const { data = {} } = await GetJoinSignNV();
  joinSignNoList.value = data || [];
};
// 获取合同项目
const getJoinSignProjects = async ids => {
  const { data = {} } = await getListNVByJoinSignId({ joinSignId: ids });
  joinSignProjectList.value = data || [];
};
// 获取项目相关人员
const getPerson = async () => {
  const { data = {} } = await getRecvSignNV1({
    joinSignId: formData.value.joinSignId,
    projectId: formData.value.projectId
  });
  formData.value.handStaffName = data.joinSignHandStaffName;
  formData.value.projectDutyStaffName = data.projectDutyStaffName;
};

//获取项目站点列表NV;
async function getProjectSiteList() {
  const { data } = await getSiteList({
    pageIndex: 1,
    pageSize: 999,
    projectId: formData.value.projectId
  });
  if (data) {
    const _data = data.data || [];
    siteList.value = _data;
  }
}

function hanndleJoinSign(val) {
  joinSignProjectList.value = [];
  siteList.value = [];
  deviceList.value = [];
  formData.value.saveItems = [];
  formData.value.projectId = "";
  formData.value.siteId = "";
  getJoinSignProjects(val);
}

function handleProject() {
  siteList.value = [];
  getProjectSiteList();
  getPerson();
}

function handleSiteChange() {
  getListForRecvSign({
    pageIndex: 1,
    pageSize: 99999,
    joinSignId: formData.value.joinSignId,
    projectId: formData.value.projectId,
    siteId: formData.value.siteId
  })
    .then(({ data }) => {
      deviceList.value =
        data?.data?.map(item => {
          item.materialQty = item.availableQty;
          return item;
        }) || [];
    })
    .catch(() => {
      deviceList.value = [];
    });
}

const handleBeforeUpload: UploadProps["beforeUpload"] = _rawFile => {
  // if (_rawFile.size / 1024 / 1024 > 5) {
  //   ElMessage.error("所选文件不能超过5Mb");
  //   return false;
  // }
  return true;
};

const handleError = () => {
  uploadRef.value.clearFiles();
};

//上传文件
async function fileUpload(options) {
  const path = "/tyOA/attendance";
  uploadImg({ file: options.file, path: path }).then(res => {
    options.file.temp = res["data"][0];
    formData.value[options.action] = fileList.value.map((item: any) =>
      item.url ? item.url : item.raw.temp
    );
    ruleFormRef.value.validateField(options.action, () => null);
    console.log("fileList", fileList.value);
    console.log(
      `${formData.value[options.action]}`,
      formData.value[options.action]
    );
  });
}

function handleRemove(action: string) {
  // formData.value[action] = "";
  console.log("fileList", fileList.value);
  formData.value[action] = fileList.value.map((item: any) =>
    item.url ? item.url : item.raw.temp
  );
  ruleFormRef.value.validateField(action, () => null);
}

const handleSuccess = async _response => {
  // uploadRef.value.clearFiles();
};

const handleExceed: UploadProps["onExceed"] = _files => {
  // uploadRef.value!.clearFiles();
  // const file = _files[0] as UploadRawFile;
  // file.uid = genFileId();
  // uploadRef.value!.handleStart(file);
  // uploadRef.value!.submit();
};

function handleSignIn(row) {
  let ids = [];
  if (row == null) {
    ids = canSignIn.value.map(item => item.id);
  } else {
    ids = [row.id];
  }
  doRecvSignItem(ids).then(({ code, message }) => {
    if (code == 0) {
      ElMessage.success(message);
      emit("search");
      getDetail(formData.value.id);
    }
  });
}

// 提交申请表单
const submitForm = async (formEl: FormInstance | undefined, flag: boolean) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      if (formData.value.id) {
        if (showType.value == "signIn") {
          const { code, message } = await doRecvSign({
            id: formData.value.id,
            attach: formData.value.attach
          });
          if (code == 0) {
            ElMessage.success(message);
            emit("search");
            beforeClose();
          }
        } else {
          formData.value.doTemp = flag;
          formData.value.saveItems = deviceList.value.map(item => {
            return {
              joinSignItemId: item.joinSignItemId,
              siteId: formData.value.siteId,
              materialQty: item.materialQty
            };
          });
          const { code, message } = await editRecvSign(formData.value);
          if (code == 0) {
            ElMessage.success(message);
            emit("search");
            beforeClose();
          }
        }
      } else {
        formData.value.doTemp = flag;
        formData.value.saveItems = deviceList.value.map(item => {
          return {
            joinSignItemId: item.id,
            siteId: formData.value.siteId,
            materialQty: item.materialQty
          };
        });
        const { code, message } = await addRecvSign(formData.value);
        if (code == 0) {
          ElMessage.success(message);
          emit("search");
          beforeClose();
        }
      }
    }
  });
};

// 重置表单
const resetForm = () => {
  joinSignProjectList.value = [];
  ruleFormRef.value.resetFields();
  fileList.value = [];
  deviceList.value = [];
};

//关闭对话框
const beforeClose = () => {
  resetForm();
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="936"
    draggable
    @close="beforeClose"
  >
    <!-- 表单内容 -->
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="会签合同" prop="joinSignId">
            <el-select
              v-model="formData.joinSignId"
              :placeholder="showType == 'apply' ? '请选择' : ''"
              :disabled="showType != 'apply'"
              filterable
              @change="hanndleJoinSign"
            >
              <el-option
                v-for="item in joinSignNoList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="项目名称" prop="projectId">
            <el-select
              v-model="formData.projectId"
              :placeholder="showType == 'apply' ? '请选择' : ''"
              :style="{ width: '100%' }"
              :disabled="showType != 'apply'"
              @change="handleProject"
            >
              <el-option
                v-for="item in joinSignProjectList"
                :key="item.projectId"
                :label="item.projectFullName"
                :value="item.projectId"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="收货单位" prop="recvCompany">
            <el-input
              v-model.trim="formData.recvCompany"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
              :disabled="showType == 'read' || showType == 'signIn'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="发货单位" prop="sendCompany">
            <el-input
              v-model.trim="formData.sendCompany"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
              :disabled="showType == 'read' || showType == 'signIn'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="收货地址" prop="recvAddress">
            <el-input
              v-model="formData.recvAddress"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
              :disabled="showType == 'read' || showType == 'signIn'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="发货地址" prop="sendAddress">
            <el-input
              v-model.trim="formData.sendAddress"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
              :disabled="showType == 'read' || showType == 'signIn'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="0">
          <el-form-item label="收货人" prop="recvStaffId">
            <el-select
              v-model="formData.recvStaffId"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请选择'
              "
              clearable
              filterable
              :disabled="showType == 'read' || showType == 'signIn'"
            >
              <el-option
                v-for="item in staffListNV"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="5" :offset="0">
          <el-form-item label="电话" prop="recvMobile" label-width="54">
            <el-input
              v-model="formData.recvMobile"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
              :disabled="showType == 'read' || showType == 'signIn'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="0">
          <el-form-item label="发货人" prop="sender">
            <el-input
              v-model="formData.sender"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
              :disabled="showType == 'read' || showType == 'signIn'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5" :offset="0">
          <el-form-item label="电话" prop="senderMobile" label-width="54">
            <el-input
              v-model="formData.senderMobile"
              :disabled="showType == 'read' || showType == 'signIn'"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="0">
          <el-form-item label="要求到达日期" prop="receiveTime">
            <el-date-picker
              v-model="formData.receiveTime"
              :disabled="showType == 'read' || showType == 'signIn'"
              type="date"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请选择'
              "
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5" :offset="0">
          <el-form-item
            label="负责人"
            prop="projectDutyStaffName"
            label-width="54"
          >
            <el-input
              v-model="formData.projectDutyStaffName"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
              readonly
              :disabled="showType == 'read' || showType == 'signIn'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="7" :offset="0">
          <el-form-item label="发货日期" prop="sendTime">
            <el-date-picker
              v-model="formData.sendTime"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请选择'
              "
              :disabled="showType == 'read' || showType == 'signIn'"
              type="date"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :style="{ width: '100%' }"
            />
          </el-form-item>
        </el-col>
        <el-col :span="5" :offset="0">
          <el-form-item label="经办人" prop="handStaffName" label-width="54">
            <el-input
              v-model.trim="formData.handStaffName"
              :disabled="showType == 'read' || showType == 'signIn'"
              readonly
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="采购合同编号" prop="sellContractCode">
            <el-input
              v-model.trim="formData.sellContractCode"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
              :disabled="showType == 'read' || showType == 'signIn'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="站点" prop="siteId">
            <el-select
              v-model="formData.siteId"
              :placeholder="showType == 'apply' ? '请选择' : ''"
              :disabled="showType != 'apply'"
              filterable
              style="width: 100%"
              @change="handleSiteChange"
            >
              <el-option
                v-for="item in siteList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="备注" prop="remark">
            <el-input
              v-model="formData.remark"
              :rows="2"
              maxlength="255"
              show-word-limit
              type="textarea"
              :placeholder="
                showType == 'read' || showType == 'signIn' ? '' : '请输入'
              "
              :disabled="showType == 'read' || showType == 'signIn'"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <el-form-item label="发货清单明细">
            <!-- <div class="flex justify-end">
              <el-button
                v-if="false && showType == 'signIn'"
                :disabled="!canSignIn || canSignIn.length < 1"
                :title="
                  !canSignIn || canSignIn.length < 1 ? '没有可签收的明细' : ''
                "
                type="primary"
                @click="handleSignIn(null)"
              >
                一键签收
              </el-button>
            </div> -->
            <el-table :data="deviceList" border stripe max-height="160px">
              <el-table-column
                label="序号"
                type="index"
                width="60"
                fixed="left"
                align="center"
              />
              <el-table-column
                prop="materialName"
                label="产品名称"
                min-width="200"
                show-overflow-tooltip
                align="left"
                fixed="left"
              />
              <el-table-column
                prop="materialSpec"
                label="配置型号"
                width="100"
                show-overflow-tooltip
                align="left"
              />
              <el-table-column
                prop="materialUnit"
                label="单位"
                width="100"
                align="center"
              />
              <el-table-column
                prop="materialQty"
                label="数量"
                width="100"
                align="right"
              />
              <el-table-column
                v-if="showType != 'apply' && showType != 'edit'"
                label="签收状态"
                width="100"
                align="center"
              >
                <template #default="{ row }">
                  <el-tag :type="row.recvItemStatus == 1 ? 'info' : 'success'">
                    {{ row.recvItemStatusName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="reqOrderItemRemark"
                label="备注"
                min-width="200"
                align="left"
                show-overflow-tooltip
              />
              <el-table-column
                v-if="false && showType == 'signIn'"
                label="操作"
                width="100"
                fixed="right"
                align="center"
              >
                <template #default="{ row }">
                  <el-button
                    :disabled="row.recvItemStatus != 1"
                    type="primary"
                    link
                    size="default"
                    @click="handleSignIn(row)"
                  >
                    签收
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-form-item>
        </el-col>
        <el-col
          v-if="showType != 'apply' && showType != 'edit'"
          :span="24"
          :offset="0"
        >
          <el-form-item label="附件" label-width="110px" prop="attach">
            <el-upload
              ref="uploadRef"
              v-model:file-list="fileList"
              :disabled="showType != 'signIn'"
              accept="*"
              action="attach"
              :auto-upload="true"
              :show-file-list="showType == 'signIn'"
              :before-upload="handleBeforeUpload"
              :http-request="fileUpload"
              :on-exceed="handleExceed"
              :on-error="handleError"
              :on-remove="
                () => {
                  handleRemove('attach');
                }
              "
              :on-success="handleSuccess"
            >
              <el-button v-if="showType == 'signIn'" type="primary" text>
                选择文件
              </el-button>
              <DownloadButton
                v-else-if="fileList.length > 0"
                :showFileName="true"
                :srcList="fileList.map(item => item.url)"
              />
              <span v-else> 未上传 </span>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="beforeClose">
        {{ showType == "read" ? "关闭" : "取消" }}
      </el-button>
      <el-button
        v-if="showType != 'read'"
        type="primary"
        @click="submitForm(ruleFormRef, false)"
        >确定
      </el-button>
    </template>
  </el-dialog>
</template>
