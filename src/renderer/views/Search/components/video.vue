<template>
    <a-spin :spinning="spinning">
        <ul class="videos">
            <li v-for="video in videos" :key="video.id">
                <video-item :video="video" />
            </li>
        </ul>
        <slot :total="result.videoCount"></slot>
    </a-spin>
</template>

<script>
import searchMixin from "@/mixins/Search";
import VideoItem from "@/components/Common/video-item";
import { getMv } from "@/api/sublist";
import { normalVideo } from "@/utils/video.js";

export default {
    mixins: [searchMixin],
    data() {
        return {
            videos: [],
        };
    },
    methods: {
        normalData() {
            if (this.result.videos && this.result.videos.length) {
                this.videos = this.result.videos.map((video) => {
                    return normalVideo(video);
                });
            }
            this.spinning = false;
        },
    },
    components: { VideoItem },
};
</script>

<style lang="less" scoped>
@import "./../../../styles/mixins";

.videos {
    .grid-layout(20px, 220px);
    padding: 15px 20px;
}
</style>
