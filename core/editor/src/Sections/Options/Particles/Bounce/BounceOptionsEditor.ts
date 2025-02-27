import { EditorGroup, EditorType } from "object-gui";
import type { Container } from "tsparticles";
import { EditorBase } from "../../../../EditorBase";
import type { IBounce } from "tsparticles/dist/Options/Interfaces/Particles/Bounce/IBounce";

export class BounceOptionsEditor extends EditorBase {
    group!: EditorGroup;
    private options!: IBounce;

    constructor(particles: Container) {
        super(particles);
    }

    addToGroup(parent: EditorGroup): void {
        this.group = parent.addGroup("bounce", "Bounce");
        this.options = this.group.data as IBounce;

        this.addFactors();
    }

    private addFactors(): void {
        this.addFactor("horizontal", "Horizontal");
        this.addFactor("vertical", "Vertical");
    }

    private addFactor(name: string, title: string): void {
        const particles = this.particles;
        const group = this.group.addGroup(name, title);

        const randomGroup = group.addGroup("random", "Random");

        randomGroup.addProperty("enable", "Enable", EditorType.boolean).change(async () => {
            await particles.refresh();
        });

        randomGroup.addProperty("minimumValue", "Minimum Value", EditorType.number).change(async () => {
            await particles.refresh();
        });

        group.addProperty("value", "Value", EditorType.number).change(async () => {
            await particles.refresh();
        });
    }
}
