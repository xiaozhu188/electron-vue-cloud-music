let settingRoutes = [
    {
        path: "/setting",
        component: () =>
            import(
                /* webpackChunkName: "setting" */ "@/views/Setting/index.vue"
            ),
        name: "setting",
    },
];

export { settingRoutes };
