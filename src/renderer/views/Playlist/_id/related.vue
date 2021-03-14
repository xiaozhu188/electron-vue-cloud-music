<template>
    <div class="subscriber">
        <a-row type="flex" justify="start" v-if="subscribers.length">
            <a-col
                v-for="subscriber in subscribers"
                :key="subscriber.userId"
                class="items"
                :lg="3"
                :xl="2"
            >
                <img v-lazy="subscriber.avatarUrl" class="avatar" />
                <div>{{ subscriber.nickname }}</div>
            </a-col>
        </a-row>
        <div v-else>暂无收藏者</div>
    </div>
</template>

<script>
import { getPlaylistSubscribers } from "@/api/playlist";
export default {
    name: "playlist_id_related",
    data() {
        return {
            subscribers: [],
            options: {
                limit: 30,
                offset: 0,
            },
        };
    },
    created() {
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
.subscriber {
    page-break-after: 20px;
    .items {
        padding: 1% 1%;
        text-align: center;
        font-size: 12px;
        word-break: break-word;
        .avatar {
            width: 100%;
            border-radius: 50%;
        }
    }
}
</style>
