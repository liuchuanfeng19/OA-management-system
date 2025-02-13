<script setup lang="ts">
import {
  ElMessage,
  genFileId,
  type UploadInstance,
  type UploadProps,
  type UploadRawFile,
  type FormInstance,
  type UploadRequestOptions
} from "element-plus";
import { ref } from "vue";
import { storeToRefs } from "pinia";

import {
  validatePhone,
  validateIDCard,
  validateTel,
  PASSWORD_INIT_DATA,
  PERSONAL_INIT_DATA
} from "./constant";
import md5 from "@/utils/md5";
import { uploadImg } from "@/api/common";
import avatars from "@/assets/avatars.jpg";
import { nationalList } from "@/utils/nationalList";
import { getStaff, updateStaff } from "@/api/staff";
import { useUserStoreHook } from "@/store/modules/user";
import { getUserInfo, updatePassword, updateAvatarUrl } from "@/api/user";

defineOptions({
  name: "PersonalCenter"
});

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入新密码"));
  } else {
    if (pwdForm.value.newPwdOk !== "") {
      if (!passwordFormRef.value) return;
      passwordFormRef.value.validateField("newPwdOk", () => null);
    }
    callback();
  }
};
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === "") {
    callback(new Error("请输入确认密码"));
  } else if (value !== pwdForm.value.newPwd) {
    callback(new Error("两次输入的密码不一致!"));
  } else {
    callback();
  }
};

const USER_RULES = {
  mobile: [{ required: false, validator: validatePhone, trigger: "blur" }],
  idCard: [{ required: false, validator: validateIDCard, trigger: "blur" }],
  officePhone: [{ required: false, validator: validateTel, trigger: "blur" }]
};
const PASSWORD_RULES = {
  oldPwd: [{ required: true, message: "请输入原密码", trigger: "blur" }],
  newPwd: [{ required: false, validator: validatePass, trigger: "blur" }],
  newPwdOk: [{ required: false, validator: validatePass2, trigger: "blur" }]
};

const { SET_AVATAR_URL } = useUserStoreHook();
const { avatarUrl } = storeToRefs(useUserStoreHook());

const pwdForm = ref({
  ...PASSWORD_INIT_DATA
});
const personalForm = ref({
  ...PERSONAL_INIT_DATA
});
const activeName = ref("userInfo");
const uploadRef = ref<UploadInstance>();
const userFormRef = ref<FormInstance>();
const passwordFormRef = ref<FormInstance>();

const getUser = async () => {
  const { data } = await getUserInfo();
  const res = await getStaff(data.staffId);
  personalForm.value = Object.assign(personalForm.value, res.data);
};

const handleUpLoadImg = (options: UploadRequestOptions) => {
  const path = "/UserAvatar";
  return new Promise(resolve => {
    uploadImg({ file: options.file, path })
      .then(async res => {
        const _avatar = res["data"][0];
        const { code, message } = await updateAvatarUrl({
          avaterUrl: _avatar
        });
        SET_AVATAR_URL(_avatar);
        if (code == 0) {
          ElMessage.success(message);
        }
      })
      .finally(() => {
        resolve([]);
      });
  });
};

const handleExceed: UploadProps["onExceed"] = files => {
  uploadRef.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadRef.value!.handleStart(file);
  uploadRef.value!.submit();
};

const handleError = () => {
  uploadRef.value.clearFiles();
};

const handleSuccess = async response => {
  console.log("response", response);
  uploadRef.value.clearFiles();
};

const handleUserInfo = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      updateStaff(personalForm.value).then(res => {
        ElMessage.success(res.message);
        getUser();
      });
    } else {
      return false;
    }
  });
};

const handlePassword = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(valid => {
    if (valid) {
      pwdForm.value.oldPwd = md5(
        personalForm.value.staffCode,
        pwdForm.value.oldPwd
      );
      pwdForm.value.newPwd = md5(
        personalForm.value.staffCode,
        pwdForm.value.newPwd
      );
      pwdForm.value.newPwdOk = md5(
        personalForm.value.staffCode,
        pwdForm.value.newPwdOk
      );
      updatePassword(pwdForm.value).then(({ code, message }) => {
        if (code == 0) {
          ElMessage.success(message);
          pwdForm.value = { ...PASSWORD_INIT_DATA };
        }
      });
    } else {
      return false;
    }
  });
};
getUser();
</script>

<template>
  <div class="main">
    <div class="left">
      <div class="avatarBox">
        <el-upload
          ref="uploadRef"
          action="#"
          :http-request="handleUpLoadImg"
          :limit="1"
          :on-exceed="handleExceed"
          :on-error="handleError"
          :on-success="handleSuccess"
          :show-file-list="false"
        >
          <el-avatar
            v-if="avatarUrl"
            fit="cover"
            :size="100"
            :src="avatarUrl"
          />
          <el-avatar v-else :src="avatars" :size="100" />
        </el-upload>
        <div class="name">{{ personalForm.staffName }}</div>
      </div>
      <ul>
        <li>
          <!-- <vab-icon icon="user-2-line" /> -->
          <span class="span1">工号</span>
          <span class="span2">{{ personalForm.staffCode }}</span>
        </li>
        <li>
          <!-- <vab-icon icon="map-pin-user-line" /> -->
          <span class="span1">状态</span>
          <span class="span2">{{ personalForm.jobStatusDesc }}</span>
        </li>
        <li>
          <!-- <vab-icon icon="group-line" /> -->
          <span class="span1">部门</span>
          <span class="span2">{{ personalForm.deptName }}</span>
        </li>
        <li>
          <!-- <vab-icon icon="briefcase-2-line" /> -->
          <span class="span1">职务</span>
          <span
            v-if="
              personalForm.jobTitleName != null &&
              personalForm.jobTitleName != ''
            "
            class="span2"
            >{{ personalForm.jobTitleName }}</span
          >
          <span v-else class="span2">-</span>
        </li>
        <li>
          <!-- <vab-icon icon="medal-line" /> -->
          <span class="span1">职称</span>
          <span
            v-if="personalForm.jobLevel != null && personalForm.jobLevel != ''"
            class="span2"
            >{{ personalForm.jobLevel }}</span
          >
          <span v-else class="span2">-</span>
        </li>
      </ul>
    </div>

    <div class="right pr-4">
      <el-tabs v-model="activeName">
        <el-tab-pane label="个人信息" name="userInfo">
          <el-form
            ref="userFormRef"
            class="form"
            :rules="USER_RULES"
            label-width="90px"
            :model="personalForm"
          >
            <el-row :gutter="20">
              <el-col :span="12" :offset="0"
                ><el-form-item class="formItem" label="部门">
                  <el-input
                    v-model="personalForm.deptName"
                    disabled
                  /> </el-form-item
              ></el-col>
              <el-col :span="12" :offset="0"
                ><el-form-item class="formItem" label="性别">
                  <el-select
                    v-model="personalForm.sex"
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <el-option label="男" value="男" />
                    <el-option label="女" value="女" />
                  </el-select> </el-form-item
              ></el-col>
              <el-col :span="12" :offset="0">
                <el-form-item class="formItem" label="手机号" prop="mobile">
                  <el-input
                    v-model="personalForm.mobile"
                    type="number"
                  /> </el-form-item
              ></el-col>
              <el-col :span="12" :offset="0"
                ><el-form-item class="formItem" label="籍贯">
                  <el-input v-model="personalForm.nativePlace" /> </el-form-item
              ></el-col>
              <el-col :span="12" :offset="0"
                ><el-form-item class="formItem" label="短号">
                  <el-input
                    v-model="personalForm.shortNumber"
                    type="number"
                    @input="
                      val => {
                        personalForm.shortNumber = val
                          ? parseInt(val) + ''
                          : '';
                      }
                    "
                  /> </el-form-item
              ></el-col>
              <el-col :span="12" :offset="0">
                <el-form-item class="formItem" label="民族">
                  <el-select
                    v-model="personalForm.nationality"
                    value-key="name"
                    placeholder="请选择"
                    clearable
                    filterable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in nationalList"
                      :key="item.id"
                      :label="item.name"
                      :value="item.name"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12" :offset="0"
                ><el-form-item
                  class="formItem"
                  label="身份证号码"
                  prop="idCard"
                >
                  <el-input v-model="personalForm.idCard" /> </el-form-item
              ></el-col>
              <el-col :span="12" :offset="0"
                ><el-form-item
                  class="formItem"
                  label="办公电话"
                  prop="officePhone"
                >
                  <el-input v-model="personalForm.officePhone" /> </el-form-item
              ></el-col>
              <el-col :span="12" :offset="0"
                ><el-form-item class="formItem" label="出生日期">
                  <el-date-picker
                    v-model="personalForm.birthday"
                    type="date"
                    style="width: 100% !important"
                    value-format="YYYY-MM-DD"
                  /> </el-form-item
              ></el-col>
              <el-col :span="12" :offset="0"
                ><el-form-item class="formItem" label="家庭住址">
                  <el-input v-model="personalForm.homeAddress" /> </el-form-item
              ></el-col>
              <el-col :span="24" :offset="0"
                ><el-form-item class="formItem" label="备注">
                  <el-input
                    v-model="personalForm.remarks"
                    maxlength="256"
                    rows="3"
                    show-word-limit
                    type="textarea"
                  /> </el-form-item
              ></el-col>
              <el-col :span="24" :offset="0"
                ><div class="flex justify-center mt-0">
                  <el-button type="primary" @click="handleUserInfo(userFormRef)"
                    >保存</el-button
                  >
                </div></el-col
              >
            </el-row>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="密码管理" name="password">
          <el-form
            ref="passwordFormRef"
            class="form"
            :rules="PASSWORD_RULES"
            label-width="90px"
            :model="pwdForm"
          >
            <el-row :gutter="20">
              <el-col :span="12" :offset="0"
                ><el-form-item class="formItem" label="账号">
                  <el-input
                    v-model="personalForm.userName"
                    disabled
                  /> </el-form-item></el-col
            ></el-row>
            <el-row :gutter="20">
              <el-col :span="12" :offset="0"
                ><el-form-item class="formItem" label="原密码" prop="oldPwd">
                  <el-input
                    v-model="pwdForm.oldPwd"
                    type="password"
                  /> </el-form-item></el-col
            ></el-row>
            <el-row :gutter="20">
              <el-col :span="12" :offset="0"
                ><el-form-item class="formItem" label="新密码" prop="newPwd">
                  <el-input
                    v-model="pwdForm.newPwd"
                    type="password"
                  /> </el-form-item></el-col
            ></el-row>
            <el-row :gutter="20">
              <el-col :span="12" :offset="0"
                ><el-form-item
                  class="formItem"
                  label="确认新密码"
                  prop="newPwdOk"
                >
                  <el-input
                    v-model="pwdForm.newPwdOk"
                    type="password"
                  /> </el-form-item></el-col
            ></el-row>
            <el-row :gutter="20">
              <el-col :span="24" :offset="0"
                ><div class="flex justify-center mt-0 w-700px">
                  <el-button
                    type="primary"
                    @click="handlePassword(passwordFormRef)"
                    >保存</el-button
                  >
                </div></el-col
              >
            </el-row>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.main {
  display: flex;
  justify-content: space-around;
  width: 100%;
  min-width: 1156px;
  min-height: 450px;
  padding: 10px;

  .left {
    width: 25%;
    padding-top: 20px;
    background: var(--el-bg-color);

    .avatarBox {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 150px;

      .name {
        width: 100%;
        height: 30px;
        margin-top: 20px;
        font-size: 18px;
        font-weight: 600;
        text-align: center;
      }
    }

    ul {
      margin-top: 50px;
      list-style: none;

      li {
        height: 30px;
        line-height: 30px;

        .span1 {
          margin-left: 20px;
        }

        .span2 {
          margin-left: 10px;
        }
      }
    }
  }

  .right {
    width: 73%;
    padding-left: 10px;
    background: var(--el-bg-color);

    .form {
      position: relative;
      width: 100%;
      min-height: 400px;

      .saveBtn {
        position: absolute;
        right: 100px;
        bottom: 20px;
      }
    }
  }
}

// :deep(.el-input .el-input__wrapper) {
//   width: 240px !important;
// }

// :deep(.el-textarea .el-textarea__inner) {
//   width: 964px !important;
// }
</style>
