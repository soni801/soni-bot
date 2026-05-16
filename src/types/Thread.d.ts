export default interface Thread
{
    start(): Promise<void> | void;
    stop(): Promise<void> | void;
}
