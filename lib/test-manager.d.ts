import { Session } from "./session";
export declare class TestManager {
    private static sessions;
    static addSession(session: Session): void;
    static getSession(port: any): Session;
    static hasSession(port: any): boolean;
    static removeSession(port: any): void;
}
