import request from "@/utils/request.js";

// 搜索类型；默认为 1 即单曲 , 取值意义 : 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
export function getSearch({ keyword, limit = 30, offset = 0, type = 1 }) {
    return request.get("/search", {
        params: {
            keywords: keyword,
            limit,
            offset,
            type,
        },
    });
}

export function getSearchHot() {
    return request.get("/search/hot");
}

export function getSearchSuggest(keywords) {
    return request.get("/search/suggest", {
        params: {
            keywords,
        },
    });
}

// 获取搜索匹配
export function getSearchMultimatch(keywords) {
    return request.get("/search/multimatch", {
        params: {
            keywords,
        },
    });
}
