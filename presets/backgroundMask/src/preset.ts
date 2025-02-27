import { HoverMode } from "tsparticles";
import type { ISourceOptions, Main } from "tsparticles";

const data: ISourceOptions = {
    backgroundMask: {
        cover: {
            value: "#ffffff",
        },
        enable: true,
    },
    interactivity: {
        events: {
            onHover: {
                enable: true,
                mode: HoverMode.bubble,
            },
        },
        modes: {
            bubble: {
                distance: 400,
                size: 100,
            },
        },
    },
    particles: {
        move: {
            enable: true,
        },
        opacity: {
            value: 1,
        },
        size: {
            value: 30,
        },
    },
};

export function loadBackgroundMaskPreset(tsParticles: Main): void {
    tsParticles.addPreset("backgroundMask", data);
    tsParticles.addPreset("background-mask", data);
}
