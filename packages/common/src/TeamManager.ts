import { ITeamLoader, TeamDef } from "./TeamInterfaces";
import { BaseContainer } from "./BaseContainer";

class TeamManager extends BaseContainer<ITeamLoader> {
}

export const teamManager = new TeamManager(TeamDef.identifier);