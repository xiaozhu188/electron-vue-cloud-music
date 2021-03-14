<template>
    <div class="highquality">
        <header class="highquality-header">
            <div class="title">
                <span>精品歌单</span>
                <a-icon type="question-circle" @click="goRoute" />
            </div>
            <div class="filter">
                <a-popover
                    placement="bottomRight"
                    title="选择你喜欢的分类"
                    trigger="click"
                    overlayClassName="highquality-cate-wrapper"
                    :overlayStyle="{ width: '500px' }"
                >
                    <template slot="content">
                        <ul class="cates">
                            <li
                                v-for="(cate, index) in categories"
                                :key="index"
                                class="cate"
                                :class="{ current: currentCate === cate.name }"
                                @click="onCateClick(cate)"
                                >{{ cate.name }}</li
                            >
                        </ul>
                    </template>
                    <a-icon type="filter" /> {{ currentCate }}
                </a-popover>
            </div>
        </header>
        <a-row type="flex" :gutter="16" class="playlist-row" v-if="!loading">
            <a-col
                :xl="8"
                :md="12"
                class="playlist-col"
                v-for="playlist in playlists"
                :key="playlist.id"
            >
                <router-link
                    class="playlist-item"
                    :to="`/playlist/${playlist.id}`"
                >
                    <div class="avatar">
                        <img v-lazy="`${playlist.coverImgUrl}?param=100y100`" />
                        <div class="play-count">
                            <a-icon type="customer-service" />
                            <span>{{ playlist.playCount | toWan }}</span>
                        </div>
                        <div class="crown">
                            <a-icon type="crown" />
                        </div>
                    </div>
                    <div class="info">
                        <div class="name">
                            <span class="tag">{{ playlist.tag }}</span>
                            {{ playlist.name }}
                        </div>
                        <router-link
                            :to="`/user?id=${playlist.creator.userId}`"
                            class="creator"
                            >by {{ playlist.creator.nickname }}</router-link
                        >
                        <div class="copywriter">{{ playlist.copywriter }}</div>
                    </div>
                </router-link>
            </a-col>
        </a-row>
        <infinite-loading
            forceUseInfiniteWrapper=".ant-layout-content"
            :identifier="infiniteId"
            @infinite="infiniteHandler"
        ></infinite-loading>
    </div>
</template>

<script>
import { getHighPlaylist, getPlaylistCatlist } from "@/api/playlist";
export default {
    data() {
        return {
            loading: false,
            categories: [],
            playlists: [],
            options: { cat: "全部", limit: 30, before: "" },
            currentCate: "全部",
            infiniteId: +new Date(),
        };
    },
    activated() {
        // this._getHighPlaylist()
        this._getCatelist();
    },
    methods: {
        async _getCatelist() {
            let { sub } = await getPlaylistCatlist();
            this.categories = sub;
        },
        async _getHighPlaylist() {
            let { playlists, lasttime, more, total } = await getHighPlaylist(
                this.options
            );
            this.playlists = playlists;
        },
        infiniteHandler($state) {
            getHighPlaylist(this.options).then(({ playlists, lasttime }) => {
                if (playlists.length) {
                    this.options.before = lasttime;
                    this.playlists.push(...playlists);
                    $state.loaded();
                } else {
                    $state.complete();
                }
            });
        },
        onCateClick(cate) {
            this.options.cat = cate.name;
            this.options.before = "";
            this.currentCate = cate.name;
            this.playlists = [];
            this.infiniteId += 1;
        },
        goRoute() {
            this.$electron.remote.shell.openExternal(
                "https://music.163.com/#/topic?id=202001"
            );
        },
    },
};
</script>

<style>
.highquality-cate-wrapper .ant-popover-inner-content {
    max-height: 400px;
    overflow-y: auto;
}
.highquality-cate-wrapper .ant-popover-title {
    padding: 10px 15px;
}
</style>
<style lang="less" scoped>
.playlist-row {
    padding: 0 15px;
}
.highquality-header {
    position: sticky;
    top: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    padding: 0 15px;
    background: #fff;
    border-bottom: 1px solid #eee;
    .title {
        font-size: 17px;
        color: #555;
        .anticon {
            cursor: pointer;
        }
    }
}
.cates {
    display: flex;
    flex-wrap: wrap;
    .cate {
        width: 20%;
        line-height: 36px;
        text-align: center;
        border: 1px solid #eee;
        margin-top: -1px;
        margin-right: -1px;
        &.current {
            background: @primary-color;
            color: #fff;
        }
    }
}
.playlist-item {
    display: flex;
    padding: 15px 0;
    border-bottom: 1px solid #eee;
    color: #333;
    font-size: 13px;
    .avatar {
        position: relative;
        width: 100px;
        height: 100px;
        flex: 0 0 100px;
        img {
            display: block;
            width: 100%;
        }
        .crown {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 2;
            width: 32px;
            height: 32px;
            background: linear-gradient(
                135deg,
                #e09200 0,
                #e09200 50%,
                transparent 50%
            );
            color: #fff;
            .anticon-crown {
                transform: translate(2px, -1px) rotate(-45deg);
            }
        }
        .play-count {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 1;
            width: 100%;
            padding: 0 10px;
            background: linear-gradient(
                to left,
                rgba(0, 0, 0, 0.3),
                transparent
            );
            text-align: right;
            color: #fff;
            line-height: 20px;
            font-size: 11px;
        }
    }
    .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        padding: 10px;
        .tag {
            border: 1px solid @primary-color;
            font-size: 12px;
            color: @primary-color;
            line-height: 1;
            display: inline-block;
            padding: 2px;
            border-radius: 1px;
        }
        .name {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .creator {
            margin-top: 3px;
            color: #999;
            font-size: 12px;
        }
        .copywriter {
            margin-top: 15px;
            color: #666;
            font-size: 12px;
        }
    }
}
</style>
