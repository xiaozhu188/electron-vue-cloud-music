import request from "@/utils/request.js";

export function getRecommendDjprogram() {
    return request.get("/personalized/djprogram");
}
export function getDjBanner() {
    return request.get("/dj/banner");
}
export function getDjCatelist() {
    return request.get("/dj/catelist");
}
export function getDjByCate({ type, limit = 5, offset = 0 }) {
    return request.get("/dj/recommend/type", {
        params: {
            type,
            limit,
            offset,
        },
    });
}
export function getDjCatelistRecommend() {
    return request.get("/dj/category/recommend");
}
export function getDjRecommend() {
    return request.get("/dj/recommend");
}
// 今日优选
export function getDjPerfered() {
    return request.get("/dj/today/perfered");
}
// 推荐节目
export function getProgramRecommend() {
    return request.get("/program/recommend");
}
// 付费精选
export function getDjPaygift() {
    return request.get("/dj/paygift");
}
// 热门
export function getDjHot() {
    return request.get("/dj/hot");
}
// 电台详情
export function getDjDetail(rid) {
    return request.get("/dj/detail", {
        params: {
            rid,
        },
    });
}
// 获取电台的节目
export function getDjProgram({ rid, limit, offset, asc = false }) {
    return request.get("/dj/program", {
        params: {
            rid,
            limit,
            offset,
            asc,
        },
    });
}
