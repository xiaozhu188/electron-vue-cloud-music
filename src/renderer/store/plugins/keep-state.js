import { KEEP_STATE_KEY } from "@/config/config";
import deepmerge from "deepmerge";

/**
 * modules 需要持久化的模块
 */
export default (modules = [], storeKey = KEEP_STATE_KEY) => (store) => {
    let STOREKEY = storeKey;

    let initState = () => {
        let state = JSON.parse(localStorage.getItem(STOREKEY)) || {};
        let map = {};
        if (modules.length) {
            modules.forEach((module) => {
                map[module] = state[module] || {};
            });
        }
        // console.log(map)
        store.replaceState(
            deepmerge(store.state, map, {
                arrayMerge: function (store, saved) {
                    return saved;
                },
                clone: false,
            })
        );
    };

    // 打开新窗口或刷新页面时同步state
    initState();

    // 监听storage改变时触发更新state
    window.addEventListener("storage", (e) => {
        initState();
    });

    // 监听mutation改变storage
    store.subscribe((mutation, state) => {
        // 每次 mutation 之后调用
        // mutation 的格式为 { type, payload }
        let mutationNamespace = mutation.type.split("/")[0];
        let mutationType = mutation.type.split("/")[1];
        localStorage.setItem(STOREKEY, JSON.stringify(getState(state)));
    });

    function getState(state) {
        if (!modules.length) return state;
        let map = {};
        modules.forEach((module) => {
            map[module] = state[module] || {};
        });
        return map;
    }
};
