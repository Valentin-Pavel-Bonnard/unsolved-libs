import { Logger as NestLogger, LoggerService } from '@nestjs/common'
import * as nest_utils from '@nestjs/common/utils/shared.utils'
import * as inflection from 'inflection'
import * as dotenv from 'dotenv'
import * as clc from 'cli-color'
import * as stack from 'callsite'

dotenv.config()

const yellow = clc.xterm(3)

export enum LogLevel {
    LOG = 'log',
    ERROR = 'error',
    WARN = 'warn',
    DEBUG = 'debug',
    VERBOSE = 'verbose',
}

export enum LoggerContext {
    BOOKING = 'Booking',
    BOOTSTRAP = 'Bootstrap',
    SECURITY = 'Security',
    UNIPRO = 'Unipro',
    FRANCHISEE = 'Franchisee',
    AUTH = 'Authentification',
    USER = 'User',
    AGENCY = 'Agency',
    DOCUMENTS = 'Documents',
    VEHICLE = 'Vehicle',
    STATS = 'Statistics',
    MESSAGING = 'Messaging',
    INSURANCE = 'Insurance',
}

export interface ILoggerService extends LoggerService {
    init(context?: string, external_source?: string): this
}

const EXCLUDED_LEVELS = process.env.LOG_LEVELS_IGNORE
    ? process.env.LOG_LEVELS_IGNORE.split(',').map(level => level.trim())
    : []

export class Logger extends NestLogger {
    private static _lastTimestamp?

    protected callerFileName: string

    protected callerFunctionName: string

    protected quick_trace: string

    private static printMessage_(
        message,
        color,
        context = '',
        isTimeDiffEnabled,
        process_name: string = 'Nest',
        external_source: string = ''
    ) {
        const output = nest_utils.isObject(message)
            ? `${color('==>')}\n${JSON.stringify(message, null, 2)}\n`
            : color(message)
        const localeStringOptions = {
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            day: '2-digit',
            month: '2-digit',
        }
        const timestamp = new Date(Date.now()).toLocaleString(
            undefined,
            localeStringOptions
        )
        const pidMessage = color(`[${process_name}] ${process.pid}   - `)
        const externalSrcMessage = external_source
            ? color(`[${external_source}] `)
            : ''
        const contextMessage = context ? yellow(`[${context}] `) : ''
        const timestampDiff = this.updateAndGetTimestampDiff_(isTimeDiffEnabled)

        const log_entry = `${pidMessage}${timestamp}   ${externalSrcMessage}${contextMessage}${output}${timestampDiff}`

        process.stdout.write(`${log_entry}\n`)

        return log_entry
    }

    private static updateAndGetTimestampDiff_(isTimeDiffEnabled) {
        const includeTimestamp = Logger._lastTimestamp && isTimeDiffEnabled
        const result = includeTimestamp
            ? yellow(` +${Date.now() - Logger._lastTimestamp}ms`)
            : ''
        Logger._lastTimestamp = Date.now()
        return result
    }

    private static printStackTrace_(trace) {
        if (!trace) {
            return
        }

        const log_entry = `${trace}`

        process.stdout.write(`${log_entry}\n`)

        return log_entry
    }

    constructor(
        context?: LoggerContext | string,
        protected readonly process_name?: string,
        protected readonly external_source?: string,
        isTimestampEnabled?: boolean
    ) {
        super(context, isTimestampEnabled)
    }

    log(message: any, context?: string, isTimeDiffEnabled = true) {
        if (EXCLUDED_LEVELS.includes(LogLevel.LOG)) {
            return
        }
        context = context || this.get_context()
        return (
            Logger.printMessage_(
                message,
                clc.green,
                context,
                isTimeDiffEnabled,
                this.process_name,
                this.external_source
            ) +
            Logger.printStackTrace_(
                this.quick_trace || this.formatStackItem(this.getCallerStack())
            )
        )
    }

    error(
        message: any,
        trace?: string,
        context?: string,
        isTimeDiffEnabled = true
    ) {
        if (EXCLUDED_LEVELS.includes(LogLevel.ERROR)) {
            return
        }

        context = context || this.get_context()

        return (
            Logger.printMessage_(
                message,
                clc.red,
                context,
                isTimeDiffEnabled,
                this.process_name,
                this.external_source
            ) +
            Logger.printStackTrace_(
                trace || this.getCallerStackTrace(LogLevel.ERROR)
            )
        )
    }

    warn(
        message: any,
        trace?: string,
        context?: string,
        isTimeDiffEnabled = true
    ) {
        if (EXCLUDED_LEVELS.includes(LogLevel.WARN)) {
            return
        }

        context = context || this.get_context()

        return (
            Logger.printMessage_(
                message,
                clc.yellow,
                context,
                isTimeDiffEnabled,
                this.process_name,
                this.external_source
            ) +
            Logger.printStackTrace_(
                trace || this.getCallerStackTrace(LogLevel.WARN)
            )
        )
    }

    debug(message: any, context?: string, isTimeDiffEnabled = true) {
        if (EXCLUDED_LEVELS.includes(LogLevel.DEBUG)) {
            return
        }

        context = context || this.get_context()

        return (
            Logger.printMessage_(
                message,
                clc.magentaBright,
                context,
                isTimeDiffEnabled,
                this.process_name,
                this.external_source
            ) +
            Logger.printStackTrace_(
                this.quick_trace || this.formatStackItem(this.getCallerStack())
            )
        )
    }

    verbose(message: any, context?: string, isTimeDiffEnabled = true) {
        if (EXCLUDED_LEVELS.includes(LogLevel.VERBOSE)) {
            return
        }

        context = context || this.get_context()

        return (
            Logger.printMessage_(
                message,
                clc.cyanBright,
                context,
                isTimeDiffEnabled,
                this.process_name,
                this.external_source
            ) +
            Logger.printStackTrace_(
                this.quick_trace || this.formatStackItem(this.getCallerStack())
            )
        )
    }

    make_log(level: LogLevel, message: any, trace?: string) {
        this.quick_trace = trace

        switch (level) {
            case LogLevel.LOG:
                this.log(message)

                break

            case LogLevel.ERROR:
                this.error(message, trace)

                break

            case LogLevel.WARN:
                this.warn(message, trace)

                break

            case LogLevel.DEBUG:
                this.debug(message)

                break

            case LogLevel.VERBOSE:
                this.verbose(message)

                break

            default:
                throw new RangeError(
                    `The log level '${level}' is not permitted`
                )

                break
        }

        this.quick_trace = null
    }

    get_context() {
        return this.context
            ? this.context
                .split('|')
                .map(part => Logger.format_context(part))
                .join('|')
            : ''
    }

    static format_context(value: string): string {
        return inflection.titleize(value)
    }

    static get_context(context: Array<LoggerContext | string>): string {
        return context.map(part => Logger.format_context(part)).join('|')
    }

    getCallerStack() {
        const currentStack = stack()
        const firstStackItem = currentStack.shift()
        const is_the_one = targetStack => {
            let output = false
            if (targetStack.getFileName()) {
                const a =
                    targetStack.getFileName() != firstStackItem.getFileName()
                const b = targetStack.getFileName().indexOf('logger') == -1
                output = a && b
            }
            return output
        }

        return (
            currentStack.find(item => {
                return is_the_one(item)
            }) || firstStackItem
        )
    }

    getCallerStackFull() {
        const currentStack = stack()
        const firstStackItem = currentStack.shift()

        const is_the_real_first = targetStack => {
            let output = false
            if (targetStack.getFileName()) {
                const a =
                    targetStack.getFileName() != firstStackItem.getFileName()
                const b = targetStack.getFileName().indexOf('logger') == -1
                output = a && b
            }
            return output
        }

        do {
            currentStack.shift()
        } while (!is_the_real_first(currentStack[0]) && currentStack.length)

        return currentStack
    }

    getCallerStackTrace(type: LogLevel) {
        let output = `StackTrace: ${type}\n`

        this.getCallerStackFull().forEach(item => {
            output += '    at ' + this.formatStackItem(item) + '\n'
        })

        return output
    }

    formatStackItem(item) {
        return `${item.getTypeName() ||
        '<undefined-type>'}.${item.getFunctionName() ||
        item.getMethodName() ||
        '<undefined-function-or-method>'} (${item.getFileName()}:${item.getLineNumber()}:${item.getColumnNumber()})`
    }

    getCallerFileName(): string {
        return this.callerFileName || this.getCallerStack().getFileName()
    }

    getCallerFunctionName(): string {
        return (
            this.callerFunctionName || this.getCallerStack().getFunctionName()
        )
    }

    setCallerFileName(name: string): this {
        this.callerFileName = name
        return this
    }

    setCallerFunctionName(name: string): this {
        this.callerFunctionName = name
        return this
    }
}
