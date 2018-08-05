import { INsCapabilitiesArgs } from "./ns-capabilities-args";
export interface INsCapabilities extends INsCapabilitiesArgs {
    validateArgs(): void;
    extend(args: INsCapabilitiesArgs): INsCapabilities;
}
