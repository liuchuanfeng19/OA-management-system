<script setup lang="ts">
import _ from "lodash";
import { ElMessage, FormInstance } from "element-plus";
import { ref, computed } from "vue";
import AMapLoader from "@amap/amap-jsapi-loader";
// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["areaCallBack"]);

// 表单模型
const INITIAL_DATA = {
  keyword: "",
  address: "",
  name: "",
  lng: 0,
  lat: 0
};
const rules = {
  keyword: [{ required: true, message: "请输入考勤地点检索", trigger: "blur" }],
  name: [{ required: true, message: "请输入考勤地点名称", trigger: "blur" }]
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const type = ref("add");
const formData = ref(null);
const requesting = ref(false);
const formVisible = ref(false);
const ruleFormRef = ref<FormInstance>();
// vue3 使用从vue导入的computed函数创建计算属性
const dialogTitle = computed(() => {
  return "添加地点";
});

// 子组件暴露给父组件调用的方法
const show = async (_formData, _type) => {
  formVisible.value = true;
  formData.value = { ...INITIAL_DATA };
  type.value = _type;
  initMap();
};
defineExpose({ show });

window._AMapSecurityConfig = {
  securityJsCode: "267a9485c225b9c83957db82fc5f87cd"
};
const aMap = ref(null);
const map = ref<any>(null);
const autoComplete = ref<any>(null);
const marker = ref(null);
const geoCoder = ref(null);
const locationArr = ref<any>([120.538852, 31.27634]);
const addressData = ref([]);
const loading = ref(false);
function initMap() {
  AMapLoader.load({
    key: "819b4803112d77fb5cd5fc84dc64cc7e", // 申请好的Web端开发者Key，首次调用 load 时必填
    version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    plugins: [
      "AMap.Scale",
      "AMap.Geolocation",
      "AMap.CitySearch",
      "AMap.PlaceSearch",
      "AMap.Geocoder",
      "AMap.AutoComplete"
    ] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
  })
    .then(AMap => {
      aMap.value = AMap;
      map.value = new AMap.Map("aMap", {
        //设置地图容器id
        viewMode: "3D", //是否为3D地图模式
        zoom: 15, //初始化地图级别
        center: locationArr.value //初始化地图中心点位置
      });
      map.value.addControl(new AMap.Scale());
      map.value.addControl(new AMap.Geolocation());
      marker.value = new AMap.Marker({
        position: new AMap.LngLat(locationArr.value[0], locationArr.value[1]),
        title: formData.value.address
      });
      map.value.add(marker.value);
      map.value.on("click", e => {
        console.log(e);
        map.value.remove(marker.value);
        locationArr.value = [e.lnglat.lng, e.lnglat.lat];
        getGeoCoder();
      });
      geoCoder.value = new AMap.Geocoder({
        city: "全国", //城市设为北京，默认：“全国”
        radius: 500 //范围，默认：500
      });
      const geolocation = new AMap.Geolocation({
        enableHighAccuracy: true, // 高精度开启
        radius: 10000,
        extensions: "all"
      });
      geolocation.getCurrentPosition(function (status, result) {
        console.log("城市定位2status=", status);
        if (status === "complete" && result.info === "OK") {
          // 查询成功，result即为当前所在城市信息
          console.log("查询成功，result即为当前所在城市信息--->", result);
        } else {
          console.log("查询失败", result);
        }
      });
      autoComplete.value = new AMap.AutoComplete({ city: "全国" });
    })
    .catch(e => {
      console.log(e);
    });
}
function getGeoCoder() {
  geoCoder.value.getAddress(locationArr.value, (status, result) => {
    if (status === "complete" && result.regeocode) {
      formData.value.keyword = result.regeocode.formattedAddress;
      formData.value.address = result.regeocode.formattedAddress;
      formData.value.name = result.regeocode.formattedAddress;
      marker.value = new aMap.value.Marker({
        position: new aMap.value.LngLat(
          locationArr.value[0],
          locationArr.value[1]
        ),
        title: formData.value.keyword
      });
      map.value.add(marker.value);
    }
  });
}
//搜索地点
const handleSearch = (query: string) => {
  if (query) {
    loading.value = true;
    autoComplete.value.search(query, function (status: any, result: any) {
      console.log("关键字搜索来了status=", status);
      console.log("关键字搜索来了result=", result);
      if (status === "complete" && result.info === "OK") {
        addressData.value = result.tips;
        loading.value = false;
        addressData.value = addressData.value.filter(item => {
          return item.name.toLowerCase().includes(query.toLowerCase());
        });
      }
    });
  } else {
    addressData.value = [];
  }
};
function handleSelect(val) {
  console.log("val----->", val);
  addressData.value.forEach(item => {
    if (item.id == val) {
      formData.value.name = item.name;
      formData.value.address = item.district + item.address;
      formData.value.lng = item.location.lng;
      formData.value.lat = item.location.lat;
      locationArr.value = [item.location.lng, item.location.lat];
      initMap();
    }
  });
}
// 提交表单
const submitForm = _.debounce(async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async valid => {
    if (valid) {
      requesting.value = true;
      ElMessage.success("添加成功");
      formVisible.value = false;
      const param = {
        name: formData.value.name,
        address: formData.value.address,
        longitude: formData.value.lng,
        latitude: formData.value.lat
      };
      resetForm(formEl);
      emit("areaCallBack", param);
      requesting.value = false;
    }
  });
}, 300);

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
};

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
  resetForm(ruleFormRef.value);
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="1080"
    draggable
    @close="closeDialog"
  >
    <el-form
      ref="ruleFormRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
    >
      <el-row :gutter="20">
        <el-col :span="12" :offset="0">
          <el-form-item label="考勤地点检索" prop="keyword">
            <el-select
              v-model="formData.keyword"
              filterable
              remote
              reserve-keyword
              placeholder="请输入"
              :remote-method="handleSearch"
              :loading="loading"
              @change="handleSelect"
            >
              <el-option
                v-for="item in addressData"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" :offset="0">
          <el-form-item label="考勤地点名称" prop="name">
            <el-input v-model="formData.name" />
          </el-form-item>
        </el-col>
        <el-col :span="24" :offset="0">
          <div id="aMap" />
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button
        v-if="type == 'add' || type == 'edit'"
        @click="formVisible = false"
        >取消</el-button
      >
      <el-button
        v-if="type == 'add' || type == 'edit'"
        :loading="requesting"
        type="primary"
        @click="submitForm(ruleFormRef)"
        >提交
      </el-button>
    </template>
  </el-dialog>
</template>
<style scoped>
#aMap {
  padding: 0px;
  margin: 0px;
  width: 1040px;
  height: 400px;
}
</style>
