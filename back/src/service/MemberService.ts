import {config} from "@src/config";
import {Injectable} from "@nestjs/common";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import {Connection} from "typeorm";
import {WinstonLogger} from "@src/logger/WinstonLogger";
import { MemberRepository } from "@src/repository/master/MemberRepository";
import { SignupDto } from "@src/model/dto/SignupDto";

@Injectable()
export class MemberService {

    constructor(
        @InjectRepository(MemberRepository, config.db.master.name) private readonly memberRepository: MemberRepository,

        @InjectConnection(config.db.master.name) private readonly masterConnection: Connection,

        private readonly logger: WinstonLogger,
    ) {
        logger.setContext('MemberService');
    }

    async insertMember(dto: SignupDto): Promise<void> {            
        await this.masterConnection.transaction(async (manager) => {
            await this.memberRepository.insertMember(dto, manager);
        });
    }

    async isExistEmail(email: string): Promise<boolean> {
        const member = await this.memberRepository.findOneByEmail(email);
        return member ? true : false;
    }

    async isExistUsername(username: string): Promise<boolean> {
        const member = await this.memberRepository.findOneByUsername(username);
        return member ? true : false;
    }
}