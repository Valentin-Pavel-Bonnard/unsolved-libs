import { Injectable, Inject } from '@nestjs/common'
import { ClientProxyFactory, ClientProxy } from '@nestjs/microservices'
import { Logger } from '../logger/logger'

@Injectable()
export abstract class MsService {
    protected client: ClientProxy
    protected abstract readonly MS_NAME: string
    protected abstract readonly APP_NAME: string
    protected _building_logger_context: string
    protected first_connection = true

    async get_client() {
        let must_build = false
        try {
            if (this.client) {
                if (this.first_connection) {
                    await this.client.connect()

                    this._get_logger().verbose(
                        `New '${this.MS_NAME}' client connected`,
                        this._building_logger_context
                    )
                    this.first_connection = false
                }
            } else {
                must_build = true
                throw new Error(
                    `A new '${this.MS_NAME}' client needs to be built!`
                )
            }
        } catch (err) {
            if (must_build) {
                this._get_logger().verbose(err, this._building_logger_context)
            } else {
                this._get_logger().error(err, this._building_logger_context)
            }

            this.client = await this.build_client()
            this.get_client()
        }

        return this.client
    }

    protected async _build_client(options: {
        transport
        options
    }): Promise<ClientProxy> {
        let client = null

        try {
            this._get_logger().verbose(
                `Building new '${this.MS_NAME}' client...`,
                this._building_logger_context
            )
            client = ClientProxyFactory.create(options)
        } catch (err) {
            this._get_logger().error(
                err,
                undefined,
                this._building_logger_context
            )
        }

        this._get_logger().verbose(
            `New '${this.MS_NAME}' client built successfuly`,
            this._building_logger_context
        )

        return client
    }

    abstract async build_client(): Promise<ClientProxy>

    private _get_logger(): Logger {
        return new Logger(`App|ClientProxy`, this.APP_NAME)
    }
}
