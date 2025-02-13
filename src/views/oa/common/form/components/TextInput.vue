<template>
  <div>
    <div v-if="mode === 'DESIGN'">
      <el-input size="medium" disabled :placeholder="placeholder" />
    </div>
    <div v-else>
      <el-input
        v-model="_value"
        size="medium"
        clearable
        :placeholder="placeholder"
      />
    </div>
  </div>
</template>

<script>
import componentMinxins from "../ComponentMinxins";

export default {
  name: "TextInput",
  components: {},
  mixins: [componentMinxins],
  props: {
    value: {
      type: String,
      default: null
    },
    placeholder: {
      type: String,
      default: "请输入内容"
    }
  },
  data() {
    return {};
  },
  methods: {}
};
</script>
