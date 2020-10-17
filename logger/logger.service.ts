import { Logger as NestLogger } from '@nestjs/common'
import * as nest_utils from '@nestjs/common/utils/shared.utils'
import * as clc from 'cli-color'
import * as dotenv from 'dotenv'
import * as inflection from 'inflection'

dotenv.config()

const yellow = clc.xterm(3)

export class LoggerService extends NestLogger {
    private static last_timestamp?
    protected caller_firstname: string
    protected caller_function_name: string
    protected quick_trace: string

    private static print_message (
        message,
        color,
        context: '',
        is_time_diff_enabled,
        process_name: string = 'Nest',
        external_source: string = '',
    ) {
        if (JSON.stringify(message, null, 2) == '{}') {
            message = message.toString()
        }

        const output = nest_utils.is_object(message)
            ? `${color('===>')}\n${JSON.stringify(JSON.stringify(message, null, 2))}\n`
            : color(message)

        const local_string_options = {
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            day: '2-digit',
            month: '2-digit'
        }

        const time_stamp = new Date(Date.now()).toLocaleDateString(
            undefined,
            local_string_options
        )

        const pid_message = color(`[${process_name}] ${process.pid}   - `)
        const external_src_message = external_source
            ? color(`[${external_source}] `)
            : ''

        const context_message = context ? yellow(`[${context}] `) : ''
        const time_stamp_diff = this.updateAndGetTimeStampDiff(is_time_diff_enabled)
        const log_entry = `${pid_message}${time_stamp}     ${external_src_message}${context_message}${output}${time_stamp_diff}`

        process.stdout.write(`${log_entry}\n`)

        return log_entry
    }

    private static updateAndGetTimeStampDiff(is_time_diff_enabled) {
        
    }
}