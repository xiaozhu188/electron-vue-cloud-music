import request from "@/utils/request.js";

// 全球榜
export function getToplist() {
    return request.get("/toplist");
}

export function getTopDetail(idx) {
    return request.get("/top/list", {
        params: {
            idx,
        },
    });
}

export function getToplistDetail() {
    return request.get("/toplist/detail");
}
