import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm'
import { Logger, LogLevel } from './logger.service'

export class OrmLogger implements TypeOrmLogger {
    readonly logger: Logger

    constructor() {
        this.logger = new Logger('ORM', 'typeorm')
    }

    /**
     * Logs query and parameters used in it.
     */
    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        this.logger.log(query)
    }

    /**
     * Logs query that is failed.
     */
    logQueryError(
        error: string,
        query: string,
        parameters?: any[],
        queryRunner?: QueryRunner
    ) {
        this.logger.error(error, query)
    }

    /**
     * Logs query that is slow.
     */
    logQuerySlow(
        time: number,
        query: string,
        parameters?: any[],
        queryRunner?: QueryRunner
    ) {
        this.logger.warn(`Low query! Made ${time}s to be executed`, query)
    }

    /**
     * Logs events from the schema build process.
     */
    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        this.logger.verbose(message)
    }

    /**
     * Logs events from the migrations run process.
     */
    logMigration(message: string, queryRunner?: QueryRunner) {
        this.logger.verbose(message)
    }

    /**
     * Perform logging using given logger, or by default to the console.
     * Log has its own level and message.
     */
    log(
        level: 'log' | 'info' | 'warn',
        message: any,
        queryRunner?: QueryRunner
    ) {
        this.logger.make_log(LogLevel[level], message)
    }
}
