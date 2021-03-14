import ls from "store";

const state = {
    videoId: "",
    videoType: "mv",
    isMuted: false,
    volume: 0.75,
    speed: 1,
};

const getters = {};

const mutations = {
    SET_VIDEO_ID(state, id) {
        state.videoId = id;
    },
    SET_VIDEO_TYPE(state, type) {
        state.videoType = type;
    },
    SET_VOLUME(state, volume) {
        state.volume = volume;
    },
    SET_MUTED(state, flag) {
        state.isMuted = flag;
    },
    SET_SPEED(state, speed) {
        state.speed = speed;
    },
};

const actions = {
    setVideoId({ commit }, id) {
        commit("SET_VIDEO_ID", id);
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions,
};
