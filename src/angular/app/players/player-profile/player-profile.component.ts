import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Handedness} from '../../../graphql/schemas/Handedness';
import {Player} from '../../../graphql/schemas/Player';
import {BaseComponent} from '../../common/base.component';
import {AuthService} from '../../services/auth.service';
import {GraphQLService} from '../../services/graphql.service';
import {Countries} from '../../common/countries';
import {Game} from '../../../graphql/schemas/Game';
import {Team} from '../../../graphql/schemas/Team';
import {XPCONFIG} from '../../app.config';
import {PageTitleService} from '../../services/page-title.service';
import {NewGameComponent} from '../../games/new-game/new-game.component';
import {PlayerSelectComponent} from '../../common/player-select/player-select.component';

@Component({
    selector: 'player-profile',
    templateUrl: 'player-profile.component.html',
    styleUrls: ['player-profile.component.less']
})
export class PlayerProfileComponent extends BaseComponent implements OnChanges {

    @Input() player: Player;
    private games: Game[] = [];
    private teams: Team[] = [];
    private teamDetailsPath: string[];
    private editable: boolean;


    constructor(route: ActivatedRoute, private router: Router, private graphQLService: GraphQLService, private authService: AuthService,
                private pageTitleService: PageTitleService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'] || this.authService.getUser().playerName;

        this.graphQLService.post(PlayerProfileComponent.getPlayerQuery, {name: name}).then(
                data => this.handleResponse(data));
    }

    ngOnChanges(changes: SimpleChanges): void {
        super.ngOnChanges(changes);

        let playerChange = changes['player'];
        if (playerChange && playerChange.currentValue) {
            this.pageTitleService.setTitle((<Player>playerChange.currentValue).name);
        }
    }

    private handleResponse(data) {
        this.player = Player.fromJson(data.player);
        this.games = data.player.gamePlayers.map((gm) => Game.fromJson(gm.game));
        this.teams = data.player.teamsConnection.edges.map((edge) => Team.fromJson(edge.node));
        this.teamDetailsPath = data.player.teamsConnection.pageInfo.hasNext ? ['players', data.player.name, 'teams'] : undefined;
        let currentPlayerId = XPCONFIG.user && XPCONFIG.user.playerId;
        this.editable = this.player.id === currentPlayerId;

        this.pageTitleService.setTitle(this.player.name);
        this.precacheNewGameRequests();
    }

    private precacheNewGameRequests() {
        this.player.leaguePlayers.forEach((leaguePlayer) => {
            this.graphQLService.post(NewGameComponent.getPlayerLeagueQuery, {playerId: this.player.id, leagueId: leaguePlayer.league.id}).
                then((data) => {
                    let playerIds = data.league.leaguePlayers.map((leaguePlayer) => leaguePlayer.player.id);
                    this.graphQLService.post(PlayerSelectComponent.GetPlayersQuery, {playerIds: playerIds, first: -1});
                });
        });
    }

    getNationality(): string {
        return Countries.getCountryName(this.player.nationality);
    }

    getHandedness(): string {
        const h = this.player && this.player.handedness;
        switch (h) {
        case Handedness.RIGHT:
            return 'Right';
        case Handedness.LEFT:
            return 'Left';
        case  Handedness.AMBIDEXTERITY:
            return 'Ambidextrous';
        default:
            return 'N/A';
        }
    }

    onEditClicked() {
        this.router.navigate(['players', this.player.name.toLowerCase(), 'edit']);
    }

    onCreateTeamClicked() {
        this.router.navigate(['team-create']);
    }

    private static readonly getPlayerQuery = `query($name: String){
        player(name: $name) {
            id
            name
            imageUrl
            nickname
            nationality
            handedness
            description

            gamePlayers(first: 5) {
              game {
                id
                time
                finished
                points {
                  time
                  against
                  player {
                    id
                    name
                    imageUrl
                  }
                }
                gamePlayers {
                  id
                  time
                  score
                  scoreAgainst
                  side
                  winner
                  ratingDelta
                  player {
                    id
                    name
                    imageUrl
                  }
                }
                gameTeams {
                  id
                  time
                  score
                  scoreAgainst
                  side
                  winner
                  ratingDelta
                  team {
                    id
                    name
                    imageUrl
                  }
                }
                league {
                  id
                  name
                  imageUrl
                }
              }
            }
            
            leaguePlayers {
              rating
              ranking
              league {
                id
                name
                imageUrl
                sport
                description      
              }
            }
            
            teamsConnection(first: 5) {
                edges {
                    node {                    
                        id
                        name
                        imageUrl
                        description
                        players {
                            id
                            name
                            imageUrl
                        }
                    }
                }
                pageInfo {
                    hasNext
                }
            }
        }
    }`;
}
