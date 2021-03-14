<template>
    <home-layout>
        <div class="page-playlist">
            <a-popover
                title="添加标签"
                v-model="cateVisible"
                trigger="click"
                placement="bottomLeft"
                :arrowPointAtCenter="true"
                overlayClassName="cate-wrapper"
                :overlayStyle="{ width: '540px', top: '50px' }"
            >
                <template slot="content">
                    <a-button block @click="fetchAll" style="border-radius: 0"
                        >全部歌单</a-button
                    >
                    <div
                        v-for="(val, key) in cates"
                        :key="key"
                        class="cate-area"
                    >
                        <span class="cate-label">
                            <a-icon type="global" v-if="key == 0" />
                            <a-icon type="instagram" v-if="key == 1" />
                            <a-icon type="coffee" v-if="key == 2" />
                            <a-icon type="smile" v-if="key == 3" />
                            <a-icon type="appstore" v-if="key == 4" />
                            {{ categories[key] }}
                        </span>
                        <span class="cates">
                            <span
                                class="cate"
                                :class="{ current: cate.name == options.cat }"
                                v-for="(cate, index) in val"
                                :key="`${cate.type}_${index}`"
                                @click="onTagChange(cate)"
                                >{{ cate.name }}</span
                            >
                        </span>
                    </div>
                </template>
                <a-button size="small" style="font-size: 12px">
                    {{ options.cat }}
                    <a-icon type="down" style="font-size: 10px" />
                </a-button>
            </a-popover>
            <tags :tags="{ 热门标签: tags }" @change="onTagChange" />
            <ul class="playlists" v-if="playlists.length">
                <router-link
                    tag="li"
                    to="/playlist-highquality"
                    class="list-item"
                >
                    <img
                        class="avatar"
                        src="./../../assets/images/playlist-top.png"
                    />
                    <div>精品歌单精心推荐,给最懂音乐的你</div>
                </router-link>
                <list-item
                    class="list-item"
                    v-for="item in playlists"
                    :item="item"
                    :key="item.id"
                />
            </ul>
            <div class="page">
                <a-pagination
                    size="small"
                    :defaultCurrent="1"
                    :pageSize="options.limit"
                    :total="total"
                    @change="onPageChange"
                />
            </div>
        </div>
    </home-layout>
</template>

<script>
import HomeLayout from "@/layouts/HomeLayout";
import listItem from "@/components/Common/list-item";
import tags from "@/components/Common/tags";
import {
    getTopPlaylist,
    getHighPlaylist,
    getPlaylistCatlist,
    getPlaylistTags,
} from "@/api/playlist";
import { normalPlaylistCard } from "@/utils/card";

let ALL = "全部";
export default {
    name: "playlist",
    data() {
        return {
            tags: [],
            cates: null,
            cateVisible: false,
            categories: {},
            playlists: [],

            options: {
                limit: 29,
                offset: 0,
                cat: ALL,
                order: "hot", // new or hot
            },
            total: 0,
        };
    },
    components: {
        HomeLayout,
        listItem,
        tags,
    },
    activated() {
        this.getPlaylist(true);
        this._getTags();
        this._getCatelist();
    },
    methods: {
        async getPlaylist(checkQuery) {
            if (checkQuery) {
                this.options.cat = this.$route.query.cat || ALL;
            }
            let res = await getTopPlaylist(this.options);
            let arr = [];
            res.playlists.forEach((playlist) => {
                arr.push(normalPlaylistCard(playlist));
            });
            this.playlists = arr;
            this.total = res.total;
        },
        onPageChange(page, pageSize) {
            console.log(page, pageSize);
            this.options.offset = (page - 1) * pageSize;
            this.getPlaylist();
        },
        onTagChange(tag) {
            this.options.cat = tag.name;
            this.options.offset = 0;
            this.getPlaylist();
        },
        fetchAll() {
            this.options.cat = ALL;
            this.options.offset = 0;
            this.getPlaylist();
        },
        async _getTags() {
            let { tags } = await getPlaylistTags();
            this.tags = tags;
        },
        async _getCatelist() {
            let { categories, sub } = await getPlaylistCatlist();
            let map = {};
            sub.forEach((item) => {
                map[item.category]
                    ? map[item.category].push(item)
                    : (map[item.category] = []);
            });
            this.cates = map;
            this.categories = categories;
        },
    },
};
</script>

<style lang="less" scoped>
@import "./../../styles/mixins";

.page-playlist {
    padding: 15px 0;
    .playlists {
        .grid-layout(20px, 160px);
    }
}

.cate-area {
    display: flex;
    margin: 12px 0;
    .cate-label {
        display: flex;
        align-items: center;
        justify-content: center;
        flex: 0 0 100px;
        width: 100px;
        height: 33px;
        color: @primary-color;
        font-size: 16px;
        .anticon {
            font-size: 24px;
            margin-right: 5px;
        }
    }
    .cates {
        flex: 1;
        .cate {
            display: inline-block;
            width: 98px;
            border: 1px solid #f3f5f7;
            line-height: 33px;
            text-align: center;
            font-size: 12px;
            &.current {
                background: @primary-color;
                color: #fff;
                border-color: @primary-color;
            }
        }
    }
}

.list-item {
    cursor: pointer;
    .avatar {
        display: block;
        width: 100%;
    }
}

.page {
    margin: 15px auto;
    text-align: center;
}
</style>
<style>
.cate-wrapper .ant-popover-inner-content {
    max-height: 400px;
    overflow-y: auto;
}

.cate-wrapper .ant-popover-title {
    padding: 15px;
}
</style>
