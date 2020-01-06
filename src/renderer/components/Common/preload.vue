<template>
  <div class="loading-mask">
    <div class="loading-wrap">
      <div class="load">
        <span class="side1"></span>
        <span class="side2"></span>
        <span class="mid"></span>
        <span class="side2"></span>
        <span class="side1"></span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
  }
}
</script>

<style scoped>
.loading-wrap {
        position: absolute;
        top: 10%;
        left: 0;
        right: 0;
      }
      .loading-wrap .load {
        height: 22px;
        line-height: 22px;
        text-align: center;
      }
      .loading-wrap .load span {
        display: inline-block;
        width: 4px;
        margin: 0 2px;
        vertical-align: middle;
        border-radius: 2px;
        background: #ffe200;
      }
      .loading-wrap .tips {
        margin-top: 10px;
        text-align: center;
        opacity: 0.6;
      }
      .loading-wrap .side1 {
        height: 6px;
        animation: first-data 1s linear infinite;
      }
      .loading-wrap .side2 {
        height: 14px;
        animation: second-data 1s linear infinite;
      }
      .loading-wrap .mid {
        height: 22px;
        animation: middle-data 1s linear infinite;
      }

      @keyframes first-data {
        0% {
          height: 6px;
        }
        56% {
          height: 22px;
        }
        to {
          height: 6px;
        }
      }

      @keyframes second-data {
        0% {
          height: 14px;
        }
        28% {
          height: 22px;
        }
        80% {
          height: 6px;
        }
        to {
          height: 14px;
        }
      }

      @keyframes middle-data {
        0% {
          height: 22px;
        }
        56% {
          height: 6px;
        }
        to {
          height: 22px;
        }
      }
</style>
