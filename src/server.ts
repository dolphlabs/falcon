import { DolphFactory } from "@dolphjs/dolph";
import { OrganisationComponent } from "./components/organisation/organisation.component";
import { TransactionComponent } from "./components/transaction/transaction.component";
import { UserComponent } from "./components/user/user.component";

const dolph = new DolphFactory([
  OrganisationComponent,
  TransactionComponent,
  UserComponent,
]);
dolph.start();
