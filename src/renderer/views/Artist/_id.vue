<template>
    <div>
        <loading v-show="loading" />
        <a-list class="intro" v-if="artist">
            <a-list-item>
                <a-list-item-meta>
                    <div slot="title">
                        <h1>{{ artist.name }}</h1>
                    </div>
                    <div slot="description" class="desc">
                        <div>单曲数：{{ artist.musicSize }}</div>
                        <div>专辑数：{{ artist.albumSize }}</div>
                        <div>MV数：{{ artist.mvSize }}</div>
                    </div>
                    <img
                        v-lazy="`${artist.img1v1Url}?param=200y200`"
                        width="200"
                        height="200"
                        :key="artist.id"
                        slot="avatar"
                    />
                </a-list-item-meta>
                <div class="action">
                    <a-button
                        size="small"
                        icon="check"
                        @click="subscribe(2, artist)"
                        v-if="artist.followed"
                    >
                        已收藏
                    </a-button>
                    <a-button
                        size="small"
                        icon="folder-add"
                        @click="subscribe(1, artist)"
                        v-else
                    >
                        收藏
                    </a-button>
                </div>
            </a-list-item>
        </a-list>
        <tab-bar :tabs="tabs" @search="searchSongs" />
        <keep-alive>
            <router-view :tracks="songs" @loadmore="pushSongs" />
        </keep-alive>
    </div>
</template>

<script>
import { getArtistSongs } from "@/api/artist";
import { normalSong } from "@/utils/song";
import TabBar from "@/components/Common/tabBar";
import Loading from "@/components/Common/loading";
export default {
    name: "artist_id",
    data() {
        return {
            artist: "",
            hotSongs: [],
            searchKey: "",
            loading: false,
            tabs: [
                {
                    name: "artist-id-album",
                    label: "专辑",
                },
                {
                    name: "artist-id-songs",
                    label: "热门歌曲",
                },
                {
                    name: "artist-id-mv",
                    label: "MV",
                },
                {
                    name: "artist-id-desc",
                    label: "歌手详情",
                },
                {
                    name: "artist-id-simi",
                    label: "相似歌手",
                },
            ],
        };
    },
    components: {
        TabBar,
        Loading,
    },
    activated() {
        this._getArtistSongs(this.$route.params.id);
    },
    beforeRouteUpdate(to, from, next) {
        this._getArtistSongs(to.params.id);
        next();
    },
    computed: {
        songs() {
            return this.hotSongs.filter((track) => {
                return track.name.includes(this.searchKey);
            });
        },
    },
    methods: {
        searchSongs(value) {
            this.searchKey = value;
        },
        async _getArtistSongs(id) {
            this.loading = true;
            let { artist, hotSongs } = await getArtistSongs({
                id,
                limit: 50,
                offset: 0,
            });
            this.artist = artist;
            const arr = [];
            hotSongs.forEach((song) => {
                arr.push(normalSong(song));
            });
            this.hotSongs = arr;
            this.loading = false;
        },
        pushSongs(tracks) {
            this.hotSongs = tracks;
        },
        subscribe(t, artist) {
            this.$store
                .dispatch("User/subscribeArtist", { t, artist })
                .then((code) => {
                    this.artist.followed = !this.artist.followed;
                });
        },
    },
};
</script>

<style lang="less" scoped>
.intro {
    padding: 20px;
    /deep/ .ant-list-item-content {
        position: absolute;
        right: 0;
        top: 12px;
    }
}
</style>
