import { ExternalInteractorBase, HoverMode, isInArray } from "tsparticles-core";
import type { Container } from "tsparticles-core";

export class ExternalLighter extends ExternalInteractorBase {
    constructor(container: Container) {
        super(container, "lighter");
    }

    public interact(): void {
        const container = this.container;
        const options = container.options;

        if (options.interactivity.events.onHover.enable && container.interactivity.status === "mousemove") {
            const mousePos = container.interactivity.mouse.position;

            if (!mousePos) {
                return;
            }

            container.canvas.drawLight(mousePos);
        }
    }

    public isEnabled(): boolean {
        const container = this.container;
        const mouse = container.interactivity.mouse;
        const events = container.options.interactivity.events;

        if (!(events.onHover.enable && mouse.position)) {
            return false;
        }

        const hoverMode = events.onHover.mode;

        return isInArray(HoverMode.light, hoverMode);
    }

    public reset(): void {
        // do nothing
    }
}