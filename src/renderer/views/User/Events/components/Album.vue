<template>
    <div class="album" @click="onClick">
        <div class="avatar">
            <img v-lazy="`${event.album.picUrl}?param=40y40`" />
            <a-icon type="play-circle" class="icon" />
        </div>
        <div class="songname">专辑: {{ event.album.name }}</div>
    </div>
</template>

<script>
export default {
    props: {
        event: {
            type: Object,
        },
    },
    methods: {
        onClick() {
            this.$router.push(`/album/${this.event.album.id}`);
        },
    },
};
</script>

<style lang="less" scoped>
.album {
    display: flex;
    align-items: center;
    padding: 10px;
    height: 100%;
    background: #eee;
    &:hover {
        cursor: pointer;
        background: #ddd;
    }
    .avatar {
        position: relative;
        .icon {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: 24px;
            color: rgba(255, 255, 255, 0.5);
        }
    }
    .songname {
        margin-left: 10px;
    }
}
</style>
