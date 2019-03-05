export interface Destructable {
    destruct(): void | Promise<void>;
}