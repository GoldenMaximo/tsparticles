import type { IShape } from "../../../Interfaces/Particles/Shape/IShape";
import { ShapeType } from "../../../../Enums";
import type { RecursivePartial, ShapeData, SingleOrMultiple } from "../../../../Types";
import { Stroke } from "../Stroke";
import { Utils } from "../../../../Utils";
import type { IShapeValues } from "../../../Interfaces/Particles/Shape/IShapeValues";
import type { IPolygonShape } from "../../../Interfaces/Particles/Shape/IPolygonShape";
import type { IImageShape } from "../../../Interfaces/Particles/Shape/IImageShape";
import type { ICharacterShape } from "../../../Interfaces/Particles/Shape/ICharacterShape";
import type { IOptionLoader } from "../../../Interfaces/IOptionLoader";

/**
 * [[include:Options/Particles/Shape.md]]
 * @category Options
 */
export class Shape implements IShape, IOptionLoader<IShape> {
    /**
     * @deprecated this property was integrated in custom shape management
     */
    get image(): SingleOrMultiple<IImageShape> {
        return (this.options[ShapeType.image] ?? this.options[ShapeType.images]) as SingleOrMultiple<IImageShape>;
    }

    /**
     * @deprecated this property was integrated in custom shape management
     * @param value
     */
    set image(value: SingleOrMultiple<IImageShape>) {
        this.options[ShapeType.image] = value;
        this.options[ShapeType.images] = value;
    }

    /**
     * @deprecated This options has been renamed options
     */
    get custom(): ShapeData {
        return this.options;
    }

    /**
     * @deprecated This options has been renamed options
     * @param value
     */
    set custom(value: ShapeData) {
        this.options = value;
    }

    /**
     * @deprecated the property images is deprecated, please use the image property, it works with one and many
     */
    get images(): IImageShape[] {
        return this.image instanceof Array ? this.image : [this.image];
    }

    /**
     * @deprecated the property images is deprecated, please use the image property, it works with one and many
     */
    set images(value: IImageShape[]) {
        this.image = value;
    }

    /**
     * @deprecated this property was moved to particles section
     */
    get stroke(): SingleOrMultiple<Stroke> {
        return [];
    }

    /**
     * @deprecated this property was moved to particles section
     */
    set stroke(_value: SingleOrMultiple<Stroke>) {
        // deprecated
    }

    /**
     * @deprecated this property was integrated in custom shape management
     */
    get character(): SingleOrMultiple<ICharacterShape> {
        return (this.options[ShapeType.character] ?? this.options[ShapeType.char]) as SingleOrMultiple<ICharacterShape>;
    }

    /**
     * @deprecated this property was integrated in custom shape management
     */
    set character(value: SingleOrMultiple<ICharacterShape>) {
        this.options[ShapeType.character] = value;
        this.options[ShapeType.char] = value;
    }

    /**
     * @deprecated this property was integrated in custom shape management
     */
    get polygon(): SingleOrMultiple<IPolygonShape> {
        return (this.options[ShapeType.polygon] ?? this.options[ShapeType.star]) as SingleOrMultiple<IPolygonShape>;
    }

    /**
     * @deprecated this property was integrated in custom shape management
     */
    set polygon(value: SingleOrMultiple<IPolygonShape>) {
        this.options[ShapeType.polygon] = value;
        this.options[ShapeType.star] = value;
    }

    type: SingleOrMultiple<ShapeType | keyof typeof ShapeType | string>;
    options: ShapeData;

    constructor() {
        this.options = {};
        this.type = ShapeType.circle;
    }

    load(data?: RecursivePartial<IShape>): void {
        if (data === undefined) {
            return;
        }

        const options = data.options ?? data.custom;

        if (options !== undefined) {
            for (const shape in options) {
                const item = options[shape];

                if (item !== undefined) {
                    this.options[shape] = Utils.deepExtend(this.options[shape] ?? {}, item) as IShapeValues[];
                }
            }
        }

        this.loadShape(data.character, ShapeType.character, ShapeType.char, true);
        this.loadShape(data.polygon, ShapeType.polygon, ShapeType.star, false);
        this.loadShape(data.image ?? data.images, ShapeType.image, ShapeType.images, true);

        if (data.type !== undefined) {
            this.type = data.type;
        }
    }

    private loadShape<T extends IShapeValues>(
        item: RecursivePartial<SingleOrMultiple<T>> | undefined,
        mainKey: ShapeType,
        altKey: ShapeType,
        altOverride: boolean
    ): void {
        if (item === undefined) {
            return;
        }

        if (item instanceof Array) {
            if (!(this.options[mainKey] instanceof Array)) {
                this.options[mainKey] = [];

                if (!this.options[altKey] || altOverride) {
                    this.options[altKey] = [];
                }
            }

            this.options[mainKey] = Utils.deepExtend(this.options[mainKey] ?? [], item) as IShapeValues[];

            if (!this.options[altKey] || altOverride) {
                this.options[altKey] = Utils.deepExtend(this.options[altKey] ?? [], item) as IShapeValues[];
            }
        } else {
            if (this.options[mainKey] instanceof Array) {
                this.options[mainKey] = {};

                if (!this.options[altKey] || altOverride) {
                    this.options[altKey] = {};
                }
            }

            this.options[mainKey] = Utils.deepExtend(this.options[mainKey] ?? {}, item) as IShapeValues[];

            if (!this.options[altKey] || altOverride) {
                this.options[altKey] = Utils.deepExtend(this.options[altKey] ?? {}, item) as IShapeValues[];
            }
        }
    }
}
