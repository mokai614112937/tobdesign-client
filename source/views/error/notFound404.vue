<template>
    <h3>error 404, 无法载入路由 {{hash}} 对应的页面视图</h3>
</template>

<script>
export default {
  data () {
    return {
      hash: location.hash.substring(1)
    }
  }
}
</script>
