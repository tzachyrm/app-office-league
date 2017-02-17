import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../graphql.service';
import {Game} from '../../../graphql/schemas/Game';
import {ListComponent} from '../../common/list.component';

@Component({
    selector: 'game-list',
    templateUrl: 'game-list.component.html'
})
export class GameListComponent extends ListComponent implements OnInit, OnChanges {

    @Input() games: Game[];
    @Input() leagueId: string = "554211b7-ae6a-4815-8edb-0edd49e50478";
    @Input() teamId: string;
    @Input() playerId: string;

    constructor(private router: Router, private service: GraphQLService, route: ActivatedRoute) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.autoLoad) {
            this.loadGames();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        let leagueIdChange = changes['leagueId'];
        if (leagueIdChange && !!leagueIdChange.currentValue) {
            this.loadGames();
        }
    }

    onGameClicked(game: Game) {
        this.service.game = game;
        this.router.navigate(['games', game.id]);
    }

    private loadGames() {
        this.service.post(this.getQuery()).then((data: any) => {
            this.games = data.games.map(game => Game.fromJson(game)).sort(this.gameSorter.bind(this));
        })
    }

    private gameSorter(first: Game, second: Game): number {
        return second.time.getTime() - first.time.getTime();
    }

    getQuery(): string {
        return `query{
                  games(leagueId: "${this.leagueId}"){
                    id
                    time
                    finished
                    points {
                        player {
                            name
                        }
                    }
                    comments {
                        text
                        author {
                            name
                        }
                    }
                    gamePlayers {
                        winner
                        score
                        side
                        ratingDelta
                        player {
                            name
                        }
                    }
                    gameTeams {
                        winner
                        score
                        side
                        ratingDelta
                        team {
                            name
                        }
                    }
                    league {
                        name
                    }
                  }
                }`;
    }
}
