declare module 'busboy' {
    import { Writable } from 'stream';

    interface BusboyHeaders {
        [key: string]: string | undefined;
    }

    interface BusboyOptions {
        headers: BusboyHeaders;
    }

    class Busboy extends Writable {
        constructor(options: BusboyOptions);
        on(event: string, listener: (...args: any[]) => void): this;
    }

    export = Busboy;
}
