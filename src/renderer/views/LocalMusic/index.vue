<template>
    <div class="local-music">
        <a-card :bordered="false" :bodyStyle="{ padding: 0 }">
            <div slot="title">
                <a-button
                    icon="redo"
                    size="small"
                    type="primary"
                    @click="refresh(selectedFolder)"
                    >重新检索</a-button
                >
                <a-button
                    icon="api"
                    size="small"
                    type="primary"
                    :disabled="!localSongs.length || matching"
                    @click="matchSongs"
                    >匹配歌曲</a-button
                >
                <small @click="visible = true"
                    >{{ localSongs.length }}首歌曲,选择目录</small
                >
            </div>
            <track-list
                :columns="columns"
                :tracks="localSongs"
                :isShowActions="false"
                @dblclick="play"
            >
                <template slot="size" slot-scope="{ row }">
                    <span>{{ row.size | normalSize }}</span>
                </template>
            </track-list>
        </a-card>

        <a-modal
            centered
            :maskClosable="false"
            title="选择本地音乐文件夹"
            wrapClassName="bodyStyle"
            :width="300"
            v-model="visible"
        >
            <div>将自动扫描您勾选的目录，文件增删实时同步。</div>
            <a-checkbox-group @change="onChange" v-model="selectedFolder">
                <div v-for="folder in exportFolders" :key="folder">
                    <a-checkbox :value="folder">{{ folder }}</a-checkbox>
                </div>
            </a-checkbox-group>
            <template slot="footer">
                <a-button key="back" @click="onOk">确认</a-button>
                <a-button key="submit" type="primary" @click="addFolder"
                    >添加文件夹</a-button
                >
            </template>
        </a-modal>
    </div>
</template>

<script>
import { mapState, mapGetters, mapActions, mapMutations } from "vuex";
import { remote, ipcRenderer } from "electron";
import { uniq } from "@/utils/calculate";
import TrackList from "@/components/Common/track-list/index.js";
import Loading from "@/components/Common/loading";
const columns = [
    {
        title: "音乐标题",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
        title: "歌手",
        dataIndex: "artist",
        key: "artist",
        sorter: (a, b) => a.artist[0].name.localeCompare(b.artist[0].name),
    },
    {
        title: "专辑",
        dataIndex: "album",
        key: "album",
        sorter: (a, b) => a.album.name.localeCompare(b.album.name),
    },
    {
        title: "时长",
        dataIndex: "duration",
        key: "duration",
        sorter: (a, b) => a.duration - b.duration,
    },
    {
        title: "大小",
        dataIndex: "size",
        key: "size",
        slot: "size",
        width: "80px",
        sorter: (a, b) => a.size - b.size,
    },
];

export default {
    name: "local_music",
    data() {
        return {
            visible: false,
            selectedFolder: [],
            columns,
            matching: false,
        };
    },
    components: {
        TrackList,
        Loading,
    },
    computed: {
        ...mapState("Localsong", ["exportFolders", "localSongs"]),
    },
    methods: {
        ...mapActions("Localsong", ["refresh", "match"]),
        ...mapMutations("Localsong", ["setExportFolders"]),
        onChange() {
            console.log("value = ", this.selectedFolder);
        },
        play(tracks, index) {
            this.$store.dispatch("play/selectPlay", { tracks, index });
        },
        addFolder() {
            ipcRenderer.send("open-directory-dialog");
        },
        onOk() {
            if (!this.selectedFolder.length) {
                this.$message.warn("至少选择一个文件夹");
                return;
            }
            this.refresh(this.selectedFolder);
            this.visible = false;
        },
        matchSongs() {
            // this.matching=true
            this.match();
        },
    },
    created() {
        this.selectedFolder = this.exportFolders.concat();
        this.refresh(this.selectedFolder);
        ipcRenderer.on("selectedItem", (event, path) => {
            console.log(path);
            let folders = uniq(this.selectedFolder.concat(path));
            this.setExportFolders(folders);
            this.selectedFolder = folders;
        });
    },
    activated() {
        this.selectedFolder = this.exportFolders.concat();
    },
};
</script>

<style lang="less">
.local-music {
    /deep/ .ant-card-body {
        padding: 0 !important;
    }
    .ant-btn {
        margin-right: 4px;
    }
}
.bodyStyle .ant-modal-body {
    padding: 12px 24px;
    min-height: 180px;
    max-height: 300px;
}
</style>
