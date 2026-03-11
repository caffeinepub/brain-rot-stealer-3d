import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface PlayerData {
    score: bigint;
    stolenCount: bigint;
}
export interface Character {
    id: bigint;
    pointValue: bigint;
    active: boolean;
    name: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addCharacter(name: string, pointValue: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCharacters(): Promise<Array<Character>>;
    getLeaderboard(): Promise<Array<[Principal, PlayerData]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeCharacter(id: bigint): Promise<void>;
    resetAllScores(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    stealCharacter(id: bigint): Promise<bigint>;
}
