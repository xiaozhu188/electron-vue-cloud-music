<template>
    <section class="page-layout">
        <header class="wy-header">
            <nav>
                <router-link
                    :to="item.href"
                    v-for="(item, index) in topMenus"
                    :key="index"
                    >{{ item.title }}</router-link
                >
            </nav>
        </header>
        <section class="wy-wrapper">
            <slot></slot>
        </section>
        <slot name="footer"></slot>
    </section>
</template>

<script>
export default {
    name: "indexTopNav",
    props: {
        topMenus: {
            type: Array,
            default() {
                return [
                    {
                        title: "个性推荐",
                        href: "/home",
                    },
                    {
                        title: "歌单",
                        href: "/playlist",
                    },
                    {
                        title: "主播电台",
                        href: "/dj",
                    },
                    {
                        title: "排行榜",
                        href: "/rank",
                    },
                    {
                        title: "歌手",
                        href: "/artist",
                    },
                    {
                        title: "最新音乐",
                        href: "/newSong",
                    },
                ];
            },
        },
    },
};
</script>

<style lang="less" scoped>
.wy-wrapper {
    position: relative;
    max-width: 1200px;
    padding: 0 20px;
    min-height: calc(100vh - 246px);
    margin: auto;
}

.wy-header {
    margin: 0 30px;
    border-bottom: 1px solid #e3e2e2;
    text-align: center;
    a {
        display: inline-block;
        margin: 0 15px;
        color: #333;
        line-height: 42px;
        &.router-link-exact-active,
        &.router-link-active {
            border-bottom: 3px solid @primary-color;
            color: @primary-color;
        }
    }
}
</style>
