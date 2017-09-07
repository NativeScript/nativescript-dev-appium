import { Session } from "./session";

export class TestManager {
    private static sessions: Map<number, Session> = new Map();

    public static addSession(session: Session) {
        if (!TestManager.sessions.has(session.port)) {
            TestManager.sessions.set(session.port, session);
        }
    }

    public static getSession(port) {
        if (TestManager.sessions.has(port)) {
            return TestManager.sessions.get(port);
        }

        return null;
    }

    public static hasSession(port) {
        return TestManager.sessions.has(port);
    }

    public static removeSession(port) {
        if (TestManager.sessions.has(port)) {
            TestManager.sessions.delete(port);
        }
    }
}