<template>
    <div class="search-artist">
        <a-spin :spinning="spinning">
            <a-row
                type="flex"
                justify="space-around"
                align="middle"
                v-for="artist in artists"
                :key="artist.id"
            >
                <a-col :span="24">
                    <router-link :to="`/artist/${artist.id}`" class="artist">
                        <img v-lazy="`${artist.img1v1Url}?param=50y50`" />
                        <span>{{ artist.name }}</span>
                    </router-link>
                </a-col>
            </a-row>
        </a-spin>
        <slot :total="result.artistCount"></slot>
    </div>
</template>

<script>
import searchMixin from "@/mixins/Search";
import Artists from "@/components/Common/artists";
import { setTimeout } from "timers";
export default {
    mixins: [searchMixin],
    data() {
        return {
            artists: [],
        };
    },
    components: {
        Artists,
    },
    methods: {
        normalData() {
            this.artists = this.result.artists;
            this.spinning = false;
        },
    },
};
</script>

<style lang="less" scoped>
.search-artist .ant-row-flex {
    &:nth-child(even) {
        background: #eee;
    }
    &:hover {
        background: #ddd;
    }
}
.artist {
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
