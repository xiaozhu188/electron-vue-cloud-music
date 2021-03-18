import sguoyi from "./sgy-request/index";
import store from "./../store";
import Message from "ant-design-vue/es/message";
import Toast from "./../components/Toast/toast";

const baseURL =
    process.env.NODE_ENV === "development"
        ? "http://139.9.230.159:3000"
        : "http://139.9.230.159:3000";

const instance = sguoyi.create({
    baseURL,
});

instance.interceptors.request.use(
    (config) => {
        if (!store.state.App.isOnline) {
            return Promise.reject(new Error("offline!"));
        }
        return config;
    },
    (error) => {
        Message.error(error);
        Promise.reject(error);
    }
);

instance.interceptors.response.use(
    (response) => {
        if (response.code && response.code === 200) {
            return response;
        }
        Message.warn(response.msg || response.statusText || "Response error");
        return Promise.reject(response);
    },
    (error) => {
        if (error.response) {
            let res = error.response;
            switch (res.status) {
                case 301:
                    store.commit("User/SET_SHOW_LOGIN", true);
                    store.commit("User/SET_USER_INFO", {});
                    store.commit("App/SET_REDIRECT", "/home");
                    localStorage.removeItem("userId");
                    Message.warn(res.msg || "请先登录");
                    break;
                case 400:
                    Message.warn(
                        res.message || res.msg || "资源不在收藏列表中"
                    );
                    break;
                case 401:
                    store.commit("User/SET_SHOW_LOGIN", true);
                    store.commit("User/SET_USER_INFO", {});
                    store.commit("App/SET_REDIRECT", "/home");
                    localStorage.removeItem("userId");
                    Message.warn(res.msg || "请先登录");
                    break;
                case 403:
                    Message.error(res.msg || "权限不足");
                    break;
                case 404:
                    Message.error(res.msg || "请求资源不存在");
                    break;
                case 408:
                    Message.error(res.message || "已经收藏过该视频");
                    break;
                case 500:
                    Message.error(res.msg || "服务器开小差啦");
                    break;
                case 504:
                    Message.error(res.msg || "网络请求失败");
                    break;
                default:
                    Message.error(res.msg || res.statusText);
            }
        } else {
            Toast({
                icon: "close",
                content: "请检查网络连接状态!",
            });
        }
        return Promise.reject(error.response);
    }
);

export default instance;
