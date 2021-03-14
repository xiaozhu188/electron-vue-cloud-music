<template>
    <div class="setting-item">
        <div class="label">{{ label }}</div>
        <slot class="content"></slot>
    </div>
</template>

<script>
export default {
    props: {
        label: {
            type: String,
            required: true,
        },
    },
};
</script>

<style lang="less" scoped>
.setting-item {
    display: flex;
    align-items: center;
    padding: 20px;
    &:not(:last-child) {
        border-bottom: 1px solid #eee;
    }
    .label {
        width: 150px;
        flex: 0 0 150px;
    }
    .content {
        flex: 1;
    }
    /deep/ .ant-btn {
        margin-left: 10px;
    }
}
</style>
