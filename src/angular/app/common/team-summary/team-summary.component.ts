import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {BaseComponent} from '../base.component';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Team} from '../../../graphql/schemas/Team';
import {RankingHelper} from '../../../graphql/schemas/RankingHelper';

@Component({
    selector: 'team-summary',
    templateUrl: 'team-summary.component.html',
    styleUrls: ['team-summary.component.less']
})
export class TeamSummaryComponent
    extends BaseComponent {

    @Input() team: Team;
    @Input() rating: number = 0;
    @Input() ranking: number = 0;

    constructor(route: ActivatedRoute, protected service: GraphQLService, protected router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];

        if (!this.team && name) {
            // check if the team was passed from list to spare request
            this.team = this.service.team;
            if (!this.team) {
                // no team was passed because this was probably a page reload
                let query = `query {
                    team(name: "${name}") {
                        id
                        name
                        imageUrl
                        description
                        players {
                            name
                            imageUrl
                        },
                        leagueTeams {
                            league {
                                name
                                imageUrl
                            },
                            team {
                                name
                                imageUrl
                            }
                        }
                    }
                }`;
                this.service.post(
                    query,
                    undefined,
                    data => this.team = Team.fromJson(data.team)
                );
            }
        }
    }

    rankingText(): string {
        return RankingHelper.ordinal(this.ranking);
    }

    ratingPoints(): string {
        return String(this.rating);
    }
}
