import { Injectable } from '@nest/common'
import { CLientProxy } from'@nest/microservices'

@Injectable()
export abstract class MsService {
    protected client: CLientProxy
    protected abstract readonly MS_NAME: string
    protected abstract readonly APP_NAME: string
    protected _building_logger_context: string
    protected first_connection = true
}