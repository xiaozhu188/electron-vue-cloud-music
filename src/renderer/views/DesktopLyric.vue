<template>
    <div class="desktop-lyric" id="desktop">
        <div class="playing-lyric" id="lrc">
            {{ current_lyric ? current_lyric : "听见好时光" }}
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

const { remote } = require("electron");
const { BrowserWindow } = remote;
let win = remote.getGlobal("lyricWindow");

export default {
    name: "DesktopLyric",
    computed: {
        ...mapGetters("play", ["current_lyric"]),
    },
    mounted() {
        const desktop = document.querySelector("#desktop");
        let biasX = 0;
        let biasY = 0;

        let { width, height } = win.getBounds();
        const moveEvent = (e) => {
            win.setBounds({
                x: e.screenX - biasX,
                y: e.screenY - biasY,
                width,
                height,
            });
        };

        desktop.addEventListener("mousedown", function (e) {
            width = win.getBounds().width;
            height = win.getBounds().height;
            switch (e.button) {
                case 0:
                    biasX = e.x;
                    biasY = e.y;
                    desktop.addEventListener("mousemove", moveEvent);
                    break;
                case 2:
                    break;
            }
        });

        desktop.addEventListener("mouseup", (e) => {
            biasX = 0;
            biasY = 0;
            desktop.removeEventListener("mousemove", moveEvent);
        });

        desktop.addEventListener("mouseleave", (e) => {
            biasX = 0;
            biasY = 0;
            desktop.removeEventListener("mousemove", moveEvent);
        });

        // 观测DOM节点动态设置窗口大小
        const elem = document.querySelector("#lrc");
        let ob = new MutationObserver((mutationRecords) => {
            this.$nextTick(() => {
                let { type } = mutationRecords[0];
                if (type === "characterData") {
                    let width = elem.getBoundingClientRect().width + 20;
                    this.$electron.ipcRenderer.send("desktop-resize", width);
                }
            });
        });
        ob.observe(elem, {
            childList: true,
            subtree: true,
            characterDataOldValue: true,
        });
    },
};
</script>

<style lang="less" scoped>
.desktop-lyric {
    .playing-lyric {
        box-sizing: border-box;
        width: max-content;
        height: 60px;
        line-height: 60px;
        margin: 10px;
        padding: 0 15px;
        font-size: 40px;
        color: #fff;
        text-shadow: 1px 1px 5px @primary-color, 1px -1px 3px @primary-color;
        text-align: center;
        font-family: "Microsoft JhengHei", "明黑", Arial, Helvetica;
        text-indent: 2px;
        white-space: nowrap;
        overflow-x: auto;

        &:hover {
            cursor: grab;
            border-radius: 2px;
            box-shadow: 0 0 2px 0 rgba(0, 0, 0, 0.3),
                inset 0 0 8px 0 rgba(255, 255, 255, 0.5);
        }
    }

    .control-wrapper {
        height: 40px;
        display: flex;
        justify-content: center;
        align-items: center;

        .control-box {
            /*-webkit-app-region: no-drag;*/

            .icon {
                color: #fff;
                font-size: 18px;

                &:hover {
                    cursor: pointer;
                    text-shadow: 1px 1px 5px @primary-color,
                        1px -1px 3px @primary-color;
                }
            }
        }
    }
}
</style>
