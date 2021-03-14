<template>
    <div class="subscriber">
        <div class="items" v-if="subscribers.length">
            <router-link
                :to="`/user?id=${subscriber.userId}`"
                v-for="subscriber in subscribers"
                :key="subscriber.userId"
            >
                <img
                    v-lazy="`${subscriber.avatarUrl}?param=55y55`"
                    class="avatar"
                />
                <div class="nickname">{{ subscriber.nickname }}</div>
            </router-link>
        </div>
        <div v-else>暂无收藏者</div>
    </div>
</template>

<script>
import { getPlaylistSubscribers } from "@/api/playlist";

export default {
    name: "playlist_id_subscriber",
    data() {
        return {
            subscribers: [],
            options: {
                limit: 30,
                offset: 0,
            },
        };
    },
    activated() {
        this._getPlaylistSubscribers();
    },
    methods: {
        _getPlaylistSubscribers() {
            let id = this.$route.params.id;
            let options = { ...this.options, id };
            getPlaylistSubscribers(options).then((res) => {
                this.subscribers = res.subscribers;
            });
        },
    },
};
</script>

<style lang="less" scoped>
@import "./../../../styles/mixins";

.subscriber {
    page-break-after: 20px;
    .items {
        .grid-layout(40px, 55px);
        padding: 30px;
        a {
            color: #333;
        }
        .avatar {
            border-radius: 50%;
        }
        .nickname {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}
</style>
