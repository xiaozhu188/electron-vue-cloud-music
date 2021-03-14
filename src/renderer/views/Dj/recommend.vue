<template>
    <div class="dj-recommend">
        <header class="highquality-header" v-if="djRadios.length">
            {{ djRadios[0].category }}
        </header>
        <a-row type="flex" :gutter="16" class="dj-row" v-if="!loading">
            <a-col
                :xl="8"
                :md="12"
                class="dj-col"
                v-for="(djRadio, index) in djRadios"
                :key="`${djRadio.id}_${index}`"
            >
                <router-link class="dj-item" :to="`/dj/${djRadio.id}`">
                    <div class="avatar">
                        <img v-lazy="`${djRadio.picUrl}?param=150y150`" />
                    </div>
                    <div class="info">
                        <div class="name">
                            {{ djRadio.name }}
                        </div>
                        <div class="desc" :title="djRadio.desc">{{
                            djRadio.desc
                        }}</div>
                        <div class="count">
                            <span>节目: {{ djRadio.programCount }}</span>
                            <span>订阅: {{ djRadio.subCount }}</span>
                        </div>
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
import { getDjByCate } from "@/api/dj";
export default {
    data() {
        return {
            djRadios: [],
            hasMore: true,
            loading: false,
            options: { limit: 30, offset: 0 },
            infiniteId: +new Date(),
        };
    },
    activated() {
        this.hasMore = true;
        this.djRadios = [];
        this.options = { limit: 30, offset: 0 };
        this.infiniteId += 1;
    },
    methods: {
        infiniteHandler($state) {
            let id = this.$route.query.id;
            this.options.type = id;
            getDjByCate(this.options).then(({ djRadios, hasMore }) => {
                if (djRadios.length) {
                    this.djRadios.push(...djRadios);
                    $state.loaded();
                }
                if (!hasMore) {
                    $state.complete();
                } else {
                    this.options.offset += this.options.limit;
                }
            });
        },
        _getDjByCate() {
            let id = this.$route.query.id;
            getDjByCate({ type: id }).then((res) => {
                this.djRadios = res.djRadios;
                this.hasMore = res.hasMore;
            });
        },
    },
};
</script>

<style lang="less" scoped>
.dj-row {
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
    font-size: 17px;
}
.dj-item {
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
    }
    .info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
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
        .desc {
            margin-top: 3px;
            color: #999;
            font-size: 12px;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        .count {
            margin-top: 5px;
            color: #666;
            font-size: 12px;
        }
    }
}
</style>
