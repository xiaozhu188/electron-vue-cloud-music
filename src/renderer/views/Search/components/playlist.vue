<template>
    <div class="search-playlist">
        <a-spin :spinning="spinning">
            <a-row
                type="flex"
                justify="space-around"
                align="middle"
                v-for="playlist in playlists"
                :key="playlist.id"
            >
                <a-col :span="12">
                    <router-link
                        :to="`/playlist/${playlist.id}`"
                        class="playlist"
                    >
                        <img v-lazy="`${playlist.coverImgUrl}?param=50y50`" />
                        <span>{{ playlist.name }}</span>
                    </router-link>
                </a-col>
                <a-col :span="4">{{ playlist.trackCount }}首</a-col>
                <a-col :span="8">by {{ playlist.creator.nickname }}</a-col>
            </a-row>
        </a-spin>
        <slot :total="result.playlistCount"></slot>
    </div>
</template>

<script>
import searchMixin from "@/mixins/Search";
import Artists from "@/components/Common/artists";
export default {
    mixins: [searchMixin],
    data() {
        return {
            playlists: [],
        };
    },
    components: {
        Artists,
    },
    methods: {
        normalData() {
            this.playlists = this.result.playlists;
            this.spinning = false;
        },
    },
};
</script>

<style lang="less" scoped>
.search-playlist .ant-row-flex {
    &:nth-child(even) {
        background: #eee;
    }
    &:hover {
        background: #ddd;
    }
}
.playlist {
    display: flex;
    align-items: center;
    padding: 10px 40px;
    font-size: 13px;
    color: #333;
    img {
        display: block;
        width: 50px;
        height: 50px;
        margin-right: 10px;
    }
}
</style>
