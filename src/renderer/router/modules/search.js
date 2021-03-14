let searchRoutes = [
    {
        path: "/search",
        component: () =>
            import(/* webpackChunkName: "search" */ "@/views/Search/index.vue"),
        name: "search",
    },
];

export { searchRoutes };
