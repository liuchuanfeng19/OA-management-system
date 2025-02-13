<script setup lang="ts">
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { loginRules } from "./utils/rule";
import phone from "./components/phone.vue";
import { debounce } from "@pureadmin/utils";
import TypeIt from "@/components/ReTypeit";
import qrCode from "./components/qrCode.vue";
import chrome from "./components/chrome.vue";
import scanDownload from "./components/scanDownload.vue";
import regist from "./components/regist.vue";
import update from "./components/update.vue";
// import SlideVerifyCode from "./components/slide.vue";
import TextClick from "./components/textClick.vue";
import { initRouter } from "@/router/utils";
import { useNav } from "@/layout/hooks/useNav";
import { useEventListener } from "@vueuse/core";
import { message } from "@/utils/message";

import type { FormInstance } from "element-plus";
// import { storageSession } from "@pureadmin/utils";
import {
  ref,
  reactive,
  watch,
  computed,
  onMounted,
  onBeforeUnmount
} from "vue";
import { operates, thirdParty } from "./utils/enums";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
// import { bg } from "./utils/static";
import WatermelonJSON from "@/assets/json/data.json";
// import { ReImageVerify } from "@/components/ReImageVerify";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
// import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
// import globalization from "@/assets/svg/globalization.svg?component";
import click from "@/assets/code_click.png";
import success from "@/assets/code_success.png";
import fail from "@/assets/code_fail.png";
defineOptions({
  name: "Login"
});
const imgCode = ref("");
const router = useRouter();
const loading = ref(false);
const checked = ref(false);
const disabled = ref(false);
const ruleFormRef = ref<FormInstance>();
const currentPage = computed(() => {
  return useUserStoreHook().currentPage;
});

const { initStorage } = useLayout();
initStorage();

const { dataTheme, dataThemeChange } = useDataThemeChange();
const {
  title
  // getDropdownItemStyle, getDropdownItemClass
} = useNav();
// const { locale, translationCh, translationEn } = useTranslationLang();

const ruleForm = reactive({
  username: import.meta.env.MODE == "development" ? "admin" : "",
  password: import.meta.env.MODE == "development" ? "123" : "",
  verifyCode: ""
});

const onLogin = async (formEl: FormInstance | undefined) => {
  if (!codeCheckResult.value && import.meta.env.VITE_RUN_MODE == "production") {
    message("请点击完成验证", { customClass: "el", type: "warning" });
    return;
  }
  loading.value = true;
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      useUserStoreHook()
        .loginByUsername(ruleForm)
        .then(res => {
          if (res.code == 0) {
            initRouter().then(async () => {
              disabled.value = true;
              await useUserStoreHook().getUserInfo();
              await useUserStoreHook().getButtons();
              message(res.message, { customClass: "el", type: "success" });
              router.push("/");
              disabled.value = false;
            });
          }
        })
        .finally(() => {
          loading.value = false;
          return fields;
        });
      // // 模拟请求，需根据实际开发进行修改
      // setTimeout(() => {
      //   loading.value = false;
      //   storageSession().setItem("user-info", {
      //     username: "admin",
      //     accessToken: "eyJhbGciOiJIUzUxMiJ9.test"
      //   });
      //   initRouter("admin").then(() => {});
      //   message.success("登录成功");
      //   router.push("/");
      // }, 2000);
    } else {
      loading.value = false;
      return fields;
    }
  });
};

//文字点击验证开始=====
const textClickRef = ref(null);
const codeStatu = ref(""); //状态： success  fail
const codeStatuImg = ref(click);
const codeStatuText = ref("点击进行验证"); // 状态文字显示
const codeCheckResult = ref(false); // 状态文字显示
function onPopoverShow() {
  getTipsChat();
}
function onPopoverHide() {
  console.log("onPopoverHide--->", codeCheckResult.value);
  if (!codeCheckResult.value) {
    codeStatu.value = "";
    codeStatuImg.value = click;
    codeStatuText.value = "点击进行验证";
  }
}
//文字点击验证回调
function onCheckResult(result) {
  console.log("文字点击验证回调->", result);
  codeCheckResult.value = result;
  if (result) {
    codeStatu.value = "success";
    codeStatuImg.value = success;
    codeStatuText.value = "验证成功";
  } else {
    codeStatu.value = "fail";
    codeStatuImg.value = fail;
    codeStatuText.value = "验证失败";
  }
}
//文字点击刷新
function onRefreshChat() {
  codeStatu.value = "";
  codeStatuImg.value = click;
  getTipsChat();
}
//获取到需要点击的文字
function getTipsChat() {
  const tips = textClickRef.value.getTips();
  let ts = "";
  tips.forEach(item => {
    if (ts == "") {
      ts = item.character;
    } else {
      ts = ts + "," + item.character;
    }
  });
  codeStatuText.value = "请顺序点击【" + ts + "】";
}
//文字点击验证结束=====
function onHandle(value) {
  useUserStoreHook().SET_CURRENTPAGE(value);
}

const immediateDebounce: any = debounce(
  formRef => onLogin(formRef),
  1000,
  true
);

useEventListener(document, "keypress", ({ code }) => {
  if (code === "Enter" && !disabled.value && !loading.value)
    immediateDebounce(ruleFormRef.value);
});

watch(imgCode, value => {
  useUserStoreHook().SET_VERIFYCODE(value);
});

dataThemeChange();

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress({ code }: KeyboardEvent) {
  if (code === "Enter") {
    onLogin(ruleFormRef.value);
  }
}

onMounted(() => {
  window.document.addEventListener("keypress", onkeypress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});
</script>

<template>
  <div class="welcome select-none">
    <lottie-animation
      ref="anim"
      :animation-data="WatermelonJSON"
      :auto-play="true"
      :loop="true"
      :speed="1"
      class="wave"
    />
    <div class="flex-c absolute right-5 top-3">
      <chrome />
      <scanDownload />
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />

      <!-- 国际化 -->
      <!-- <el-dropdown trigger="click">
      <globalization class="w-40px h-48px p-11px cursor-pointer outline-none" />
      <template #dropdown>
        <el-dropdown-menu class="translation">
          <el-dropdown-item
            :style="getDropdownItemStyle(locale, 'zh')"
            :class="['!dark:color-white', getDropdownItemClass(locale, 'zh')]"
            @click="translationCh"
          >
            <IconifyIconOffline
              class="check-zh"
              v-show="locale === 'zh'"
              icon="check"
            />
            简体中文
          </el-dropdown-item>
          <el-dropdown-item
            :style="getDropdownItemStyle(locale, 'en')"
            :class="['!dark:color-white', getDropdownItemClass(locale, 'en')]"
            @click="translationEn"
          >
            <span class="check-en" v-show="locale === 'en'">
              <IconifyIconOffline icon="check" />
            </span>
            English
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown> -->
    </div>
    <div class="login-container">
      <div class="login-box">
        <div class="login-form bg-bg_color">
          <Motion>
            <div class="log-title">
              <FontIcon class="avatar" icon="icon-a-ziyuan2" svg />
              <!-- <span>{{ title }}</span> -->
              <TypeIt :values="[title]" :cursor="false" :speed="150" />
            </div>
          </Motion>
          <el-form
            v-if="currentPage === 0"
            ref="ruleFormRef"
            class="form"
            :model="ruleForm"
            :rules="loginRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item prop="username">
                <el-input
                  v-model.trim="ruleForm.username"
                  clearable
                  placeholder="账号"
                  :prefix-icon="useRenderIcon('user')"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  placeholder="密码"
                  :prefix-icon="useRenderIcon('lock')"
                />
              </el-form-item>
            </Motion>
            <Motion :delay="200">
              <!-- <el-form-item prop="verifyCode">
                <el-input
                  clearable
                  v-model="ruleForm.verifyCode"
                  placeholder="验证码"
                >
                  <template v-slot:append>
                    <ReImageVerify v-model:code="imgCode" />
                  </template>
                </el-input>
              </el-form-item> -->
              <el-popover
                placement="top"
                width="350"
                trigger="click"
                :show-arrow="false"
                :disabled="codeStatu == 'success'"
                @show="onPopoverShow"
                @hide="onPopoverHide"
              >
                <TextClick
                  ref="textClickRef"
                  @checkResult="onCheckResult"
                  @refreshChat="onRefreshChat"
                />
                <template #reference>
                  <div :class="['code-box', codeStatu]">
                    <span :class="['span1', codeStatu]">验证码</span>
                    <div class="code-status">
                      <el-image class="img" :src="codeStatuImg" />
                      <span :class="['span2', codeStatu]">{{
                        codeStatuText
                      }}</span>
                    </div>
                  </div>
                </template>
              </el-popover>
            </Motion>

            <Motion :delay="250">
              <el-form-item>
                <div
                  v-if="false"
                  class="w-full h-20px flex justify-between items-center"
                >
                  <el-checkbox v-model="checked">记住密码</el-checkbox>
                  <el-button
                    type="text"
                    @click="useUserStoreHook().SET_CURRENTPAGE(4)"
                  >
                    忘记密码?
                  </el-button>
                </div>
                <el-button
                  class="w-full mt-4"
                  size="default"
                  type="primary"
                  :loading="loading"
                  @click="immediateDebounce(ruleFormRef)"
                >
                  登录
                </el-button>
              </el-form-item>
            </Motion>

            <Motion v-if="false" :delay="300">
              <el-form-item>
                <div class="w-full h-20px flex justify-between items-center">
                  <el-button
                    v-for="(item, index) in operates"
                    :key="index"
                    class="w-full mt-4"
                    size="default"
                    @click="onHandle(index + 1)"
                  >
                    {{ item.title }}
                  </el-button>
                </div>
              </el-form-item>
            </Motion>
          </el-form>
          <Motion v-if="currentPage === 0 && false" :delay="350">
            <el-form-item>
              <el-divider>
                <p class="text-gray-500 text-xs">第三方登录</p>
              </el-divider>
              <div class="w-full flex justify-evenly">
                <span
                  v-for="(item, index) in thirdParty"
                  :key="index"
                  :title="`${item.title}登录`"
                >
                  <IconifyIconOnline
                    :icon="`ri:${item.icon}-fill`"
                    width="20"
                    class="cursor-pointer text-gray-500 hover:text-blue-400"
                  />
                </span>
              </div>
            </el-form-item>
          </Motion>
          <!-- 手机号登录 -->
          <phone v-if="currentPage === 1 && false" />
          <!-- 二维码登录 -->
          <qrCode v-if="currentPage === 2 && false" />
          <!-- 注册 -->
          <regist v-if="currentPage === 3 && false" />
          <!-- 忘记密码 -->
          <update v-if="currentPage === 4 && false" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}

.wave {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 0;
  width: auto;
  min-width: 100%;
  height: auto;
  min-height: 100%;
}

.log-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4vh;
  margin-bottom: 6vh;

  span {
    margin: 15px 0;
    font-family: "Microsoft YaHei-Bold", "Helvetica Neue", Helvetica,
      "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial,
      sans-serif;
    font-size: 36px;
    font-weight: bold;
    color: #2065f1;
    text-transform: uppercase;
  }

  .avatar {
    width: 36px;
    height: 36px;
    margin-top: 4px;
    margin-right: 16px;
    color: #2065f1;
    fill: #2065f1;
  }
}

:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

:deep(.el-form-item--large) {
  --font-size: 14px;
  --el-form-label-font-size: var(--font-size);

  margin-bottom: 40px;
}

:deep(.el-input__inner) {
  --el-input-inner-height: 50px !important;

  box-sizing: border-box;
  flex-grow: 1;
  width: 100%;
  height: var(--el-input-inner-height);
  min-height: calc(var(--el-input-height, 32px) - 2px);
  padding: 0;
  font-size: inherit;
  line-height: var(--el-input-inner-height) !important;
  color: var(--el-input-text-color, var(--el-text-color-regular));
  appearance: none;
  background: 0 0;
  border: none;
  outline: 0;
}

:deep(.el-button) {
  height: 50px;
  font-family: "Microsoft YaHei-Regular", "Helvetica Neue", Helvetica,
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial,
    sans-serif;
  font-size: 18px;
  font-weight: 400;
  color: #fff;
  background: #2065f1;
  border-radius: 4px;
  box-shadow: 0 8px 16px 1px rgb(32 101 241 / 30%);
  opacity: 1;
}

.code-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 52px;
  padding: 1px 15px;
  margin-bottom: 30px;
  cursor: pointer;
  border: #dcdfe6 1px solid;
  border-radius: 4px;

  .span1 {
    font-size: 14px;
    color: #a9abb2;
  }

  .code-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 236px;

    .img {
      width: 20px;
      margin-right: 10px;
    }
  }

  .span2 {
    font-size: 16px;
    color: #606266;
    text-align: center;
  }
}

.code-box.success {
  border: 1px solid #199b01;
}

.code-box.fail {
  border: 1px solid #f8696b;
}

.span2.success {
  font-size: 14px;
  color: #199b01;
}

.span2.fail {
  font-size: 14px;
  color: #f8696b;
}

.oa-mobile {
  margin-right: 20px;
  font-size: 14px;
  color: #2065f1;
  cursor: pointer;
}
</style>
