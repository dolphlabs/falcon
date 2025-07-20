import { Component } from "@dolphjs/dolph/decorators";
import { OrganisationController } from "./organisation.controller";
import { MailSender } from "@/shared/senders/mail.sender";
import { UserService } from "../user/user.service";
import { OrganisationService } from "./organisation.service";
import { TokensService } from "@/shared/services/token.service";

@Component({
  controllers: [OrganisationController],
  services: [MailSender, UserService, OrganisationService, TokensService],
})
export class OrganisationComponent {}
