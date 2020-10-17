import { Logger as  LoggerService } from '@nestjs/common'

export interface ILoggerService extends LoggerService {
    init(context?: string, external_source?: string): this
}