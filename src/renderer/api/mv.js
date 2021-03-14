import request from "@/utils/request.js";

export function getPersonalizedMV() {
    return request.get("/personalized/mv");
}

// area: 地区,可选值为全部,内地,港台,欧美,日本,韩国,不填则为全部
// type: 类型,可选值为全部,官方版,原生,现场版,网易出品,不填则为全部
// order: 排序,可选值为上升最快,最热,最新,不填则为上升最快
// limit: 取出数量 , 默认为 30
// offset: 偏移数量 , 用于分页 , 如 :( 页数 -1)*50, 其中 50 为 limit 的值 , 默认 为 0
export function getAllMV({
    area = "全部",
    type = "全部",
    order = "上升最快",
    limit = 30,
    offset = 0,
}) {
    return request.get("/mv/all", {
        params: {
            area,
            type,
            order,
            limit,
            offset,
        },
    });
}

export function getTopMV({ limit = 30, offset = 0 }) {
    return request.get("/top/mv", {
        params: {
            limit,
            offset,
        },
    });
}

export function getNewMV({ limit = 10 }) {
    return request.get("/mv/first", {
        params: {
            limit,
        },
    });
}

export function getMVInfo(mvid) {
    return request.get("/mv/detail", {
        params: {
            mvid,
        },
    });
}

export function getMvUrl(id) {
    return request.get("/mv/url", {
        params: {
            id,
        },
    });
}

export function getSimiMV(id) {
    return request.get("/simi/mv", {
        params: {
            mvid: id,
        },
    });
}

// 收藏视频 t : 1 为收藏,其他为取消收藏
export function subMV(mvid, t) {
    return request.get("/mv/sub", {
        params: {
            mvid,
            t,
        },
    });
}
