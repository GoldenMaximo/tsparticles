import type { IColor, IRgb, IRgba, IHsl, IHsla, IValueColor, IHsv, IHsva } from "../Core/Interfaces/Colors";
import { Utils } from "./Utils";
import { Constants } from "./Constants";
import type { IImage } from "../Core/Interfaces/IImage";
import { NumberUtils } from "./NumberUtils";
import type { IParticle } from "../Core/Interfaces/IParticle";
import type { IParticleHslAnimation } from "../Core/Interfaces/IParticleHslAnimation";

/**
 *
 * @param p
 * @param q
 * @param t
 */
function hue2rgb(p: number, q: number, t: number): number {
    let tCalc = t;

    if (tCalc < 0) {
        tCalc += 1;
    }

    if (tCalc > 1) {
        tCalc -= 1;
    }

    if (tCalc < 1 / 6) {
        return p + (q - p) * 6 * tCalc;
    }

    if (tCalc < 1 / 2) {
        return q;
    }

    if (tCalc < 2 / 3) {
        return p + (q - p) * (2 / 3 - tCalc) * 6;
    }

    return p;
}

function stringToRgba(input: string): IRgba | undefined {
    if (input.startsWith("rgb")) {
        const regex = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([\d.]+)\s*)?\)/i;
        const result = regex.exec(input);

        return result
            ? {
                  a: result.length > 4 ? parseFloat(result[5]) : 1,
                  b: parseInt(result[3], 10),
                  g: parseInt(result[2], 10),
                  r: parseInt(result[1], 10),
              }
            : undefined;
    } else if (input.startsWith("hsl")) {
        const regex = /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(,\s*([\d.]+)\s*)?\)/i;
        const result = regex.exec(input);

        return result
            ? ColorUtils.hslaToRgba({
                  a: result.length > 4 ? parseFloat(result[5]) : 1,
                  h: parseInt(result[1], 10),
                  l: parseInt(result[3], 10),
                  s: parseInt(result[2], 10),
              })
            : undefined;
    } else if (input.startsWith("hsv")) {
        const regex = /hsva?\(\s*(\d+)°\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(,\s*([\d.]+)\s*)?\)/i;
        const result = regex.exec(input);

        return result
            ? ColorUtils.hsvaToRgba({
                  a: result.length > 4 ? parseFloat(result[5]) : 1,
                  h: parseInt(result[1], 10),
                  s: parseInt(result[2], 10),
                  v: parseInt(result[3], 10),
              })
            : undefined;
    } else {
        // By Tim Down - http://stackoverflow.com/a/5624139/3493650
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i;
        const hexFixed = input.replace(shorthandRegex, (_m, r, g, b, a) => {
            return r + r + g + g + b + b + (a !== undefined ? a + a : "");
        });
        const regex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;
        const result = regex.exec(hexFixed);

        return result
            ? {
                  a: result[4] !== undefined ? parseInt(result[4], 16) / 0xff : 1,
                  b: parseInt(result[3], 16),
                  g: parseInt(result[2], 16),
                  r: parseInt(result[1], 16),
              }
            : undefined;
    }
}

/**
 * @category Utils
 */
export class ColorUtils {
    /**
     * Gets the particles color
     * @param input the input color to convert in [[IRgb]] object
     * @param index the array index, if needed
     * @param useIndex set to false to ignore the index parameter
     */
    static colorToRgb(input?: string | IColor, index?: number, useIndex = true): IRgb | undefined {
        if (input === undefined) {
            return;
        }

        const color = typeof input === "string" ? { value: input } : input;

        let res: IRgb | undefined;

        if (typeof color.value === "string") {
            if (color.value === Constants.randomColorValue) {
                res = ColorUtils.getRandomRgbColor();
            } else {
                res = ColorUtils.stringToRgb(color.value);
            }
        } else {
            if (color.value instanceof Array) {
                const colorSelected = Utils.itemFromArray(color.value, index, useIndex);

                res = ColorUtils.colorToRgb({ value: colorSelected });
            } else {
                const colorValue = color.value as IValueColor;
                const rgbColor = colorValue.rgb ?? (color.value as IRgb);

                if (rgbColor.r !== undefined) {
                    res = rgbColor;
                } else {
                    const hslColor = colorValue.hsl ?? (color.value as IHsl);

                    if (hslColor.h !== undefined && hslColor.l !== undefined) {
                        res = ColorUtils.hslToRgb(hslColor);
                    } else {
                        const hsvColor = colorValue.hsv ?? (color.value as IHsv);

                        if (hsvColor.h !== undefined && hsvColor.v !== undefined) {
                            res = ColorUtils.hsvToRgb(hsvColor);
                        }
                    }
                }
            }
        }

        return res;
    }

    /**
     * Gets the particles color
     * @param color the input color to convert in [[IHsl]] object
     * @param index the array index, if needed
     * @param useIndex set to false to ignore the index parameter
     */
    static colorToHsl(color: string | IColor | undefined, index?: number, useIndex = true): IHsl | undefined {
        const rgb = ColorUtils.colorToRgb(color, index, useIndex);

        return rgb !== undefined ? ColorUtils.rgbToHsl(rgb) : undefined;
    }

    static rgbToHsl(color: IRgb): IHsl {
        const r1 = color.r / 255;
        const g1 = color.g / 255;
        const b1 = color.b / 255;

        const max = Math.max(r1, g1, b1);
        const min = Math.min(r1, g1, b1);

        //Calculate L:
        const res = {
            h: 0,
            l: (max + min) / 2,
            s: 0,
        };

        if (max != min) {
            //Calculate S:
            res.s = res.l < 0.5 ? (max - min) / (max + min) : (max - min) / (2.0 - max - min);
            //Calculate H:
            res.h =
                r1 === max
                    ? (g1 - b1) / (max - min)
                    : (res.h = g1 === max ? 2.0 + (b1 - r1) / (max - min) : 4.0 + (r1 - g1) / (max - min));
        }

        res.l *= 100;
        res.s *= 100;
        res.h *= 60;

        if (res.h < 0) {
            res.h += 360;
        }

        return res;
    }

    static stringToAlpha(input: string): number | undefined {
        return stringToRgba(input)?.a;
    }

    /**
     * Converts hexadecimal string (HTML color code) in a [[IRgb]] object
     * @param input the hexadecimal string (#f70 or #ff7700)
     */
    static stringToRgb(input: string): IRgb | undefined {
        return stringToRgba(input);
    }

    /**
     * Converts a Hue Saturation Lightness ([[IHsl]]) object in a [[IRgb]] object
     * @param hsl
     */
    static hslToRgb(hsl: IHsl): IRgb {
        const result: IRgb = { b: 0, g: 0, r: 0 };
        const hslPercent: IHsl = {
            h: hsl.h / 360,
            l: hsl.l / 100,
            s: hsl.s / 100,
        };

        if (hslPercent.s === 0) {
            result.b = hslPercent.l; // achromatic
            result.g = hslPercent.l;
            result.r = hslPercent.l;
        } else {
            const q =
                hslPercent.l < 0.5
                    ? hslPercent.l * (1 + hslPercent.s)
                    : hslPercent.l + hslPercent.s - hslPercent.l * hslPercent.s;
            const p = 2 * hslPercent.l - q;

            result.r = hue2rgb(p, q, hslPercent.h + 1 / 3);
            result.g = hue2rgb(p, q, hslPercent.h);
            result.b = hue2rgb(p, q, hslPercent.h - 1 / 3);
        }

        result.r = Math.floor(result.r * 255);
        result.g = Math.floor(result.g * 255);
        result.b = Math.floor(result.b * 255);

        return result;
    }

    static hslaToRgba(hsla: IHsla): IRgba {
        const rgbResult = ColorUtils.hslToRgb(hsla);

        return {
            a: hsla.a,
            b: rgbResult.b,
            g: rgbResult.g,
            r: rgbResult.r,
        };
    }

    static hslToHsv(hsl: IHsl): IHsv {
        const l = hsl.l / 100,
            sl = hsl.s / 100;
        const v = l + sl * Math.min(l, 1 - l),
            sv = !v ? 0 : 2 * (1 - l / v);

        return {
            h: hsl.h,
            s: sv * 100,
            v: v * 100,
        };
    }

    static hslaToHsva(hsla: IHsla): IHsva {
        const hsvResult = ColorUtils.hslToHsv(hsla);

        return {
            a: hsla.a,
            h: hsvResult.h,
            s: hsvResult.s,
            v: hsvResult.v,
        };
    }

    static hsvToHsl(hsv: IHsv): IHsl {
        const v = hsv.v / 100,
            sv = hsv.s / 100;
        const l = v * (1 - sv / 2),
            sl = l === 0 || l === 1 ? 0 : (v - l) / Math.min(l, 1 - l);

        return {
            h: hsv.h,
            l: l * 100,
            s: sl * 100,
        };
    }

    static hsvaToHsla(hsva: IHsva): IHsla {
        const hslResult = ColorUtils.hsvToHsl(hsva);

        return {
            a: hsva.a,
            h: hslResult.h,
            l: hslResult.l,
            s: hslResult.s,
        };
    }

    static hsvToRgb(hsv: IHsv): IRgb {
        const result: IRgb = { b: 0, g: 0, r: 0 };
        const hsvPercent = {
            h: hsv.h / 60,
            s: hsv.s / 100,
            v: hsv.v / 100,
        };

        const c = hsvPercent.v * hsvPercent.s,
            x = c * (1 - Math.abs((hsvPercent.h % 2) - 1));

        let tempRgb: IRgb | undefined;

        if (hsvPercent.h >= 0 && hsvPercent.h <= 1) {
            tempRgb = {
                r: c,
                g: x,
                b: 0,
            };
        } else if (hsvPercent.h > 1 && hsvPercent.h <= 2) {
            tempRgb = {
                r: x,
                g: c,
                b: 0,
            };
        } else if (hsvPercent.h > 2 && hsvPercent.h <= 3) {
            tempRgb = {
                r: 0,
                g: c,
                b: x,
            };
        } else if (hsvPercent.h > 3 && hsvPercent.h <= 4) {
            tempRgb = {
                r: 0,
                g: x,
                b: c,
            };
        } else if (hsvPercent.h > 4 && hsvPercent.h <= 5) {
            tempRgb = {
                r: x,
                g: 0,
                b: c,
            };
        } else if (hsvPercent.h > 5 && hsvPercent.h <= 6) {
            tempRgb = {
                r: c,
                g: 0,
                b: x,
            };
        }

        if (tempRgb) {
            const m = hsvPercent.v - c;

            result.r = Math.floor((tempRgb.r + m) * 255);
            result.g = Math.floor((tempRgb.g + m) * 255);
            result.b = Math.floor((tempRgb.b + m) * 255);
        }

        return result;
    }

    static hsvaToRgba(hsva: IHsva): IRgba {
        const rgbResult = ColorUtils.hsvToRgb(hsva);

        return {
            a: hsva.a,
            b: rgbResult.b,
            g: rgbResult.g,
            r: rgbResult.r,
        };
    }

    static rgbToHsv(rgb: IRgb): IHsv {
        const rgbPercent = {
                r: rgb.r / 255,
                g: rgb.g / 255,
                b: rgb.b / 255,
            },
            xMax = Math.max(rgbPercent.r, rgbPercent.g, rgbPercent.b),
            xMin = Math.min(rgbPercent.r, rgbPercent.g, rgbPercent.b),
            v = xMax,
            c = xMax - xMin;

        let h = 0;

        if (v === rgbPercent.r) {
            h = 60 * ((rgbPercent.g - rgbPercent.b) / c);
        } else if (v === rgbPercent.g) {
            h = 60 * (2 + (rgbPercent.b - rgbPercent.r) / c);
        } else if (v === rgbPercent.b) {
            h = 60 * (4 + (rgbPercent.r - rgbPercent.g) / c);
        }

        const s = !v ? 0 : c / v;

        return {
            h,
            s: s * 100,
            v: v * 100,
        };
    }

    static rgbaToHsva(rgba: IRgba): IHsva {
        const hsvResult = ColorUtils.rgbToHsv(rgba);

        return {
            a: rgba.a,
            h: hsvResult.h,
            s: hsvResult.s,
            v: hsvResult.v,
        };
    }

    /**
     * Generate a random Rgb color
     * @param min a minimum seed value for all 3 values
     */
    static getRandomRgbColor(min?: number): IRgb {
        const fixedMin = min ?? 0;

        return {
            b: Math.floor(NumberUtils.randomInRange(NumberUtils.setRangeValue(fixedMin, 256))),
            g: Math.floor(NumberUtils.randomInRange(NumberUtils.setRangeValue(fixedMin, 256))),
            r: Math.floor(NumberUtils.randomInRange(NumberUtils.setRangeValue(fixedMin, 256))),
        };
    }

    /**
     * Prepares a rgba() css function from a [[IRgb]] object
     * @param color the [[IRgb]] color to convert
     * @param opacity the opacity to apply to color
     */
    static getStyleFromRgb(color: IRgb, opacity?: number): string {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity ?? 1})`;
    }

    /**
     * Prepares a hsla() css function from a [[IHsl]] object
     * @param color the [[IHsl]] color to convert
     * @param opacity the opacity to apply to color
     */
    static getStyleFromHsl(color: IHsl, opacity?: number): string {
        return `hsla(${color.h}, ${color.s}%, ${color.l}%, ${opacity ?? 1})`;
    }

    /**
     * Prepares a hsva() css function from a [[IHsv]] object
     * @param color the [[IHsv]] color to convert
     * @param opacity the opacity to apply to color
     */
    static getStyleFromHsv(color: IHsv, opacity?: number): string {
        return ColorUtils.getStyleFromHsl(ColorUtils.hsvToHsl(color), opacity);
    }

    static mix(color1: IRgb | IHsl, color2: IRgb | IHsl, size1: number, size2: number): IRgb {
        let rgb1 = color1 as IRgb;
        let rgb2 = color2 as IRgb;

        if (rgb1.r === undefined) {
            rgb1 = ColorUtils.hslToRgb(color1 as IHsl);
        }

        if (rgb2.r === undefined) {
            rgb2 = ColorUtils.hslToRgb(color2 as IHsl);
        }

        return {
            b: NumberUtils.mix(rgb1.b, rgb2.b, size1, size2),
            g: NumberUtils.mix(rgb1.g, rgb2.g, size1, size2),
            r: NumberUtils.mix(rgb1.r, rgb2.r, size1, size2),
        };
    }

    static replaceColorSvg(image: IImage, color: IHsl, opacity: number): string {
        if (!image.svgData) {
            return "";
        }

        /* set color to svg element */
        const svgXml = image.svgData;
        const rgbHex = /#([0-9A-F]{3,6})/gi;

        return svgXml.replace(rgbHex, () => ColorUtils.getStyleFromHsl(color, opacity));
    }

    static getLinkColor(p1: IParticle, p2?: IParticle, linkColor?: string | IRgb): IRgb | undefined {
        if (linkColor === Constants.randomColorValue) {
            return ColorUtils.getRandomRgbColor();
        } else if (linkColor === "mid") {
            const sourceColor = p1.getFillColor() ?? p1.getStrokeColor();
            const destColor = p2?.getFillColor() ?? p2?.getStrokeColor();

            if (sourceColor && destColor && p2) {
                return ColorUtils.mix(sourceColor, destColor, p1.getRadius(), p2.getRadius());
            } else {
                const hslColor = sourceColor ?? destColor;

                if (hslColor) {
                    return ColorUtils.hslToRgb(hslColor);
                }
            }
        } else {
            return linkColor as IRgb;
        }
    }

    static getLinkRandomColor(optColor: string | IColor, blink: boolean, consent: boolean): IRgb | string | undefined {
        const color = typeof optColor === "string" ? optColor : optColor.value;

        if (color === Constants.randomColorValue) {
            if (consent) {
                return ColorUtils.colorToRgb({
                    value: color,
                });
            } else if (blink) {
                return Constants.randomColorValue;
            } else {
                return Constants.midColorValue;
            }
        } else {
            return ColorUtils.colorToRgb({
                value: color,
            });
        }
    }

    static getHslFromAnimation(animation?: IParticleHslAnimation): IHsl | undefined {
        return animation !== undefined
            ? {
                  h: animation.h.value,
                  s: animation.s.value,
                  l: animation.l.value,
              }
            : undefined;
    }
}
