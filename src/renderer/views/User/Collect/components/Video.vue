<template>
    <div>
        <div class="videos" :class="{ 'videos-hack': data.length < 4 }">
            <video-item :video="video" v-for="video in data" :key="video.id" />
        </div>
        <infinite-loading @infinite="loadmore" />
    </div>
</template>

<script>
import VideoItem from "@/components/Common/video-item";
import { getMv } from "@/api/sublist";
import { normalVideo } from "@/utils/video.js";

export default {
    data() {
        return {
            data: [],
            params: {
                limit: 20,
                offset: 0,
            },
        };
    },
    components: { VideoItem },
    methods: {
        async loadmore($state) {
            try {
                let res = await getMv(this.params);
                if (res.data.length) {
                    let arr = res.data.map((video) => {
                        return normalVideo(video);
                    });
                    this.data.push(...arr);
                    $state.loaded();
                }
                if (res.hasMore) {
                    this.params.offset += this.params.limit;
                } else {
                    $state.complete();
                }
            } catch (error) {
                $state.error();
            }
        },
    },
};
</script>

<style lang="less" scoped>
@import "./../../../../styles/mixins";

.videos {
    .grid-layout(15px, 245px);
    padding: 15px 0;
    &.videos-hack {
        grid-template-columns: repeat(auto-fill, minmax(245px, 245px));
    }
}
</style>
