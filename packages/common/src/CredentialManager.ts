import { CredentialDef, ICredentialLoader } from "@cofly-ai/interfaces";
import { BaseContainer } from "./BaseContainer";

class CredentialManager extends BaseContainer<ICredentialLoader> {
}

export const credentialManager = new CredentialManager(CredentialDef.identifier);