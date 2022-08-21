import * as winston from 'winston';
import { format, transports } from 'winston';
import { CONSTANTS } from './config';

/**
 * A utility class using a winston Logger to create logs with better formatting and versatility
 *
 * @author theS1LV3R, Soni
 * @since 6.0.0
 * @see winston.Logger
 */
export default class Logger
{
    /**
     * The name used by the Logger
     *
     * @since 6.0.0
     */
    name: string;

    private _logger: winston.Logger;
    private _date: string = new Date().toISOString();

    /**
     * The format used by the logger
     *
     * @type {winston.Logform.Format}
     * @author Soni
     * @since 6.0.0
     * @see {@link winston.Logform.Format}
     */
    format: winston.Logform.Format = format.combine(
        // This needs weird code to have uppercase level for some reason, even though the GitHub issue is closed
        // https://github.com/winstonjs/winston/issues/1345
        format(info =>
        {
            info.level = info.level.toUpperCase()
            return info;
        })(),
        format.colorize(),
        format.timestamp({ format: "DD/MM/YYYY HH:mm:ss" }),
        format.printf(info => `[${info.timestamp}] [${this.name}] [${info.level}] ${info.message}`)
    );

    /**
     * Where the Logger outputs to
     *
     * @type {winston.transport[]}
     * @since 6.0.0
     */
    transports: winston.transport[] = [
        new transports.Console(),
        new transports.File({
            filename: `logs/${this._date}.log`,
            options: { flags: "w" },
            format: format.uncolorize()
        }),
        new transports.File({
            filename: `logs/${this._date}.json`,
            options: { flags: "w" },
            format: format.json()
        }),
        new transports.File({
            filename: "logs/latest.log",
            options: { flags: "w" },
            format: format.uncolorize()
        })
    ];

    /**
     * Creates a Logger with the provided data
     *
     * @param {string} name The name used by the Logger
     * @param {winston.LoggerOptions} options LoggerOptions for the Logger
     *
     * @author theS1LV3R
     * @since 6.0.0
     */
    constructor(name: string, options?: winston.LoggerOptions)
    {
        this._logger = winston.createLogger(options || { transports: this.transports, format: this.format, level: CONSTANTS.logLevel });
        this.name = name;
    }

    /**
     * Logs a message as debug
     *
     * @param {string} message The message to log
     * @param args The args for the log
     *
     * @since 6.0.0
     */
    debug(message: string, ...args: any[])
    {
        this._logger.debug(message, ...args);
    }

    /**
     * Logs a message as verbose
     *
     * @param {string} message The message to log
     * @param args The args for the log
     *
     * @since 6.0.0
     */
    verbose(message: string, ...args: any[])
    {
        this._logger.verbose(message, ...args);
    }

    /**
     * Logs a message as info
     *
     * @param {string} message The message to log
     * @param args The args for the log
     *
     * @since 6.0.0
     */
    info(message: string, ...args: any[])
    {
        this._logger.info(message, ...args);
    }

    /**
     * Logs a message as warn
     *
     * @param {string} message The message to log
     * @param args The args for the log
     *
     * @since 6.0.0
     */
    warn(message: string, ...args: any[])
    {
        this._logger.warn(message, ...args);
    }

    /**
     * Logs a message as error
     *
     * @param {string} message The message to log
     * @param args The args for the log
     *
     * @since 6.0.0
     */
    error(message: string, ...args: any[])
    {
        this._logger.error(message, ...args);
    }
}
