<script setup lang="ts">
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import Search from "../search/index.vue";
import Notice from "../notice/index.vue";
import { useNav } from "../../hooks/useNav";
import avatars from "@/assets/avatars.jpg";
import { transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";
import { ref, toRaw, watch, onMounted, nextTick } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { getParentPaths, findRouteByPath } from "@/router/utils";
import { useTranslationLang } from "../../hooks/useTranslationLang";
import { usePermissionStoreHook } from "@/store/modules/permission";
// import globalization from "@/assets/svg/globalization.svg?component";

const menuRef = ref();
const defaultActive = ref(null);

const {
  t,
  route
  // locale, translationCh, translationEn
} = useTranslationLang(menuRef);
const router = useRouter();

const {
  device,
  routers,
  logout,
  onPanel,
  menuSelect,
  resolvePath,
  avatarsStyle
  // getDropdownItemStyle,
  // getDropdownItemClass,
} = useNav();

const { avatarUrl, staffName } = storeToRefs(useUserStoreHook());
const { wholeMenus } = storeToRefs(usePermissionStoreHook());

const menuKey = ref(dayjs().millisecond());

const toPersonalCenter = () => {
  router.push("/personalCenter");
};
function getDefaultActive(routePath) {
  /** 当前路由的父级路径 */
  const parentRoutes = getParentPaths(routePath, wholeMenus.value)[0];
  defaultActive.value = findRouteByPath(
    parentRoutes,
    wholeMenus.value
  )?.children[0]?.path;
}

onMounted(() => {
  getDefaultActive(route.path);
});

nextTick(() => {
  menuRef.value?.handleResize();
});

watch(
  () => route.path,
  () => {
    getDefaultActive(route.path);
  }
);
watch(
  () => wholeMenus.value,
  val => {
    console.log("wholeMenus", val);
    menuKey.value = dayjs().millisecond();
    getDefaultActive(route.path);
  }
);
</script>

<template>
  <div v-if="device !== 'mobile'" class="horizontal-header">
    <el-menu
      :key="menuKey"
      ref="menuRef"
      router
      mode="horizontal"
      menu-trigger="hover"
      class="horizontal-header-menu"
      :default-active="defaultActive"
      @select="indexPath => menuSelect(indexPath, routers)"
    >
      <el-menu-item
        v-for="route in wholeMenus"
        :key="route.path"
        :index="resolvePath(route) || route.redirect"
      >
        <template #title>
          <div
            v-if="toRaw(route.meta.icon)"
            :class="['sub-menu-icon', route.meta.icon]"
          >
            <component
              :is="useRenderIcon(route.meta && toRaw(route.meta.icon))"
            />
          </div>
          <span class="select-none">{{ transformI18n(route.meta.title) }}</span>
          <FontIcon
            v-if="route.meta.extraIcon"
            width="30px"
            height="30px"
            style="position: absolute; right: 10px"
            :icon="route.meta.extraIcon.name"
            :svg="route.meta.extraIcon.svg ? true : false"
          />
        </template>
      </el-menu-item>
    </el-menu>
    <div class="horizontal-header-right">
      <!-- 菜单搜索 -->
      <Search />
      <!-- 通知 -->
      <Notice id="header-notice" />
      <!-- 国际化 -->
      <!-- <el-dropdown id="header-translation" trigger="click">
        <globalization
          class="navbar-bg-hover w-[40px] h-[48px] p-[11px] cursor-pointer outline-none"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <span class="check-zh" v-show="locale === 'zh'">
                <IconifyIconOffline icon="check" />
              </span>
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'en')]"
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
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover">
          <img v-if="avatarUrl" :src="avatarUrl" :style="avatarsStyle" />
          <img v-else :src="avatars" :style="avatarsStyle" />
          <p v-if="staffName" class="dark:text-white">{{ staffName }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="toPersonalCenter">
              <IconifyIconOffline icon="epUser" style="margin: 5px" />
              {{ t("buttons.hsPersonalCenter") }}</el-dropdown-item
            >
            <el-dropdown-item @click="logout">
              <IconifyIconOffline
                icon="logout-circle-r-line"
                style="margin: 5px"
              />
              {{ t("buttons.hsLoginOut") }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span
        class="set-icon navbar-bg-hover"
        :title="t('buttons.hssystemSet')"
        @click="onPanel"
      >
        <IconifyIconOffline icon="setting" />
      </span>
    </div>
  </div>
</template>

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

.logout {
  max-width: 120px;

  ::v-deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
