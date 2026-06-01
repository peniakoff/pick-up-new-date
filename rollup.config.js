import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";

export default [
    {
        input: "src/index.ts",
        plugins: [
            typescript({
                tsconfig: "./tsconfig.json",
                sourceMap: true
            })
        ],
        output: [
            {
                file: "dist/pickupnewdate.esm.js",
                format: "es",
                plugins: [terser()],
                sourcemap: true
            },
            {
                file: "dist/pickupnewdate.cjs",
                format: "cjs",
                exports: "named",
                plugins: [terser()],
                sourcemap: true
            }
        ]
    },
    {
        input: "src/browser.ts",
        plugins: [
            typescript({
                tsconfig: "./tsconfig.json",
                sourceMap: true
            })
        ],
        output: {
            file: "dist/pickupnewdate.umd.js",
            format: "umd",
            name: "PickUpNewDate",
            plugins: [terser()],
            sourcemap: true
        }
    }
];
