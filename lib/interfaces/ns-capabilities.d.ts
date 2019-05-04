import { INsCapabilitiesArgs } from "./ns-capabilities-args";
export interface INsCapabilities extends INsCapabilitiesArgs {
    validateArgs?: () => {};
    extend?: (args: INsCapabilitiesArgs) => {};
    testReporterLog?: (text: any) => any;
}
