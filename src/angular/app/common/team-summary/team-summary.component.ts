import {Component, OnInit, Input} from '@angular/core';
import {BaseComponent} from '../../common/base.component';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'team-summary',
    templateUrl: 'team-summary.component.html'
})
export class TeamSummaryComponent extends BaseComponent {

    @Input() team: Team;
    @Input() index: number;
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
                        id,
                        name,
                        description,
                        players {
                            name
                        },
                        leagueTeams {
                            league {
                                name
                            },
                            team {
                                name
                            }
                        }
                    }
                }`;
                this.service.post(query).then(data => this.team = Team.fromJson(data.team));
            }
        }
    }

    //TODO Extract
    rankingText(): string {
        return this.ordinal(this.ranking);
    }

    private ordinal(value: number) {
        if (!value) {
            return '';
        }
        switch (value) {
        case 1:
            return '1st';
        case 2:
            return '2nd';
        case 3:
            return '3rd';
        default:
            return value + 'th';
        }
    }

}