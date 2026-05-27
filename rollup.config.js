import terser from "@rollup/plugin-terser";

export default [
    {
        input: "src/index.js",
        output: [
            {
                file: "dist/pickupnewdate.esm.js",
                format: "es",
                plugins: [terser()]
            },
            {
                file: "dist/pickupnewdate.cjs",
                format: "cjs",
                exports: "named",
                plugins: [terser()]
            }
        ]
    },
    {
        input: "src/browser.js",
        output: {
            file: "dist/pickupnewdate.umd.js",
            format: "umd",
            name: "PickUpNewDate",
            plugins: [terser()]
        }
    }
];
