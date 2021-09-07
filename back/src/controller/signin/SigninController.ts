import { Controller, Post, Session, Body } from '@nestjs/common';
import { WinstonLogger } from '@src/logger/WinstonLogger';
import { ApiResponse } from '@src/model/global/ApiResponse';
import { pbkdf2Async } from '@src/util/encryption';
import {config} from "@src/config";
import { MemberService } from '@src/service/MemberService';
import { SignInRequest } from '@src/controller/signin/request/SignInRequest';
import { hideEmailInfo } from '@src/util/hide';

@Controller('signin')
export class SigninController {
    constructor (
        private readonly memberService: MemberService,
        private readonly logger: WinstonLogger
    ) {
        this.logger.setContext('SignupController');
    }

    @Post('')
    async signin(
        @Session() session: Record<string, any>,
        @Body() body: SignInRequest,
    ): Promise<ApiResponse<null>> {
        this.logger.log(`signin request, email/username: ${hideEmailInfo(body.email)}`);
        
        const member = (body.email.includes("@")) 
            ? await this.memberService.findOneByEmail(body.email) 
            : await this.memberService.findOneByUsername(body.email)
        
        if (!member) {
            this.logger.error(`cannot find member info: ${hideEmailInfo(body.email)}`);
            return new ApiResponse('0', 'failed', null);
        }

        const encryptedPassword = await pbkdf2Async(body.password, config.server.passwordSecret);
        if (member.password != encryptedPassword) {
            return new ApiResponse('0', 'failed', null);
        }

        session.memberId = member.uuid;
        session.memberUsername = member.username;
        session.memberEmail = member.email;

        return new ApiResponse('0', 'success', null);
    }
}