import type { EmitterInstance } from "./EmitterInstance";
import type { IEmitter } from "./Options/Interfaces/IEmitter";
import type { ICoordinates } from "../../Core/Interfaces/ICoordinates";

export interface EmitterContainer {
    addEmitter: (options: IEmitter, position: ICoordinates) => EmitterInstance;
    playEmitter: (idxOrName: number | string) => void;
    pauseEmitter: (idxOrName: number | string) => void;
}
