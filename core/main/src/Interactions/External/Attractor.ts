import type { Container } from "../../Core/Container";
import { ClickMode, HoverMode } from "../../Enums";
import { Circle, Constants, Range, Utils, NumberUtils } from "../../Utils";
import type { ICoordinates } from "../../Core/Interfaces/ICoordinates";
import type { IExternalInteractor } from "../../Core/Interfaces/IExternalInteractor";

/**
 * Particle attract manager
 * @category Interactions
 */
export class Attractor implements IExternalInteractor {
    constructor(private readonly container: Container) {}

    isEnabled(): boolean {
        const container = this.container;
        const options = container.actualOptions;

        const mouse = container.interactivity.mouse;
        const events = options.interactivity.events;

        if (!((events.onHover.enable && mouse.position) || (events.onClick.enable && mouse.clickPosition))) {
            return false;
        }

        const hoverMode = events.onHover.mode;
        const clickMode = events.onClick.mode;

        return Utils.isInArray(HoverMode.attract, hoverMode) || Utils.isInArray(ClickMode.attract, clickMode);
    }

    reset(): void {
        // do nothing
    }

    interact(): void {
        const container = this.container;
        const options = container.actualOptions;
        const mouseMoveStatus = container.interactivity.status === Constants.mouseMoveEvent;
        const events = options.interactivity.events;
        const hoverEnabled = events.onHover.enable;
        const hoverMode = events.onHover.mode;
        const clickEnabled = events.onClick.enable;
        const clickMode = events.onClick.mode;

        if (mouseMoveStatus && hoverEnabled && Utils.isInArray(HoverMode.attract, hoverMode)) {
            this.hoverAttract();
        } else if (clickEnabled && Utils.isInArray(ClickMode.attract, clickMode)) {
            this.clickAttract();
        }
    }

    private hoverAttract(): void {
        const container = this.container;
        const mousePos = container.interactivity.mouse.position;

        if (!mousePos) {
            return;
        }

        const attractRadius = container.retina.attractModeDistance;

        this.processAttract(mousePos, attractRadius, new Circle(mousePos.x, mousePos.y, attractRadius));
    }

    private processAttract(position: ICoordinates, attractRadius: number, area: Range): void {
        const container = this.container;
        const query = container.particles.quadTree.query(area);

        for (const particle of query) {
            const { dx, dy, distance } = NumberUtils.getDistances(particle.position, position);
            const normVec = {
                x: dx / distance,
                y: dy / distance,
            };

            const velocity = container.actualOptions.interactivity.modes.attract.speed;
            const attractFactor = NumberUtils.clamp((1 - Math.pow(distance / attractRadius, 2)) * velocity, 0, 50);

            particle.position.x -= normVec.x * attractFactor;
            particle.position.y -= normVec.y * attractFactor;
        }
    }

    private clickAttract(): void {
        const container = this.container;

        if (!container.attract.finish) {
            if (!container.attract.count) {
                container.attract.count = 0;
            }

            container.attract.count++;

            if (container.attract.count === container.particles.count) {
                container.attract.finish = true;
            }
        }

        if (container.attract.clicking) {
            const mousePos = container.interactivity.mouse.clickPosition;

            if (!mousePos) {
                return;
            }

            const attractRadius = container.retina.attractModeDistance;

            this.processAttract(mousePos, attractRadius, new Circle(mousePos.x, mousePos.y, attractRadius));
        } else if (container.attract.clicking === false) {
            container.attract.particles = [];
        }

        return;
    }
}
