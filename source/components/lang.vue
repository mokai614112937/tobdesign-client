<template>
    <span>
    {{text}}
    </span>
</template>

<script>
export default {
  data() {
    return {
      text: ''
    }
  },
  methods: {

  },
  props: [
    'id',
    'value'
  ],
  created() {
    // 暂定返回值与key一样时，返回value值
    this.text = this.$t(this.id.toLowerCase()) === this.id.toLowerCase() ? this.value : this.$t(this.id.toLowerCase())
  }
}
</script>
