import {Component, OnInit, Input, Output, OnChanges, SimpleChanges, SimpleChange, EventEmitter, ElementRef} from '@angular/core';
import {Player} from '../../../graphql/schemas/Player';
import {GraphQLService} from '../../services/graphql.service';

@Component({
    selector: 'player-select',
    templateUrl: 'player-select.component.html',
    styleUrls: ['player-select.component.less'],
    host: {
        '(document:click)': 'handlePageClick($event)',
        '(document:keydown)': 'handleKeyboardEvent($event)',
    },
})
export class PlayerSelectComponent implements OnInit, OnChanges {

    @Input() leagueIds: string[];
    @Input() enabled: boolean;
    @Input() excludePlayerIds: {[id: string]: boolean} = {};
    @Output() playerSelected: EventEmitter<Player> = new EventEmitter<Player>();
    players: Player[] = [];
    private selectedPlayer: Player;
    private ready: boolean;

    constructor(private graphQLService: GraphQLService, private elementRef: ElementRef) {
    }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        let enabledChange = changes['enabled'];
        let leagueIdsChange = changes['leagueIds'];
        if ((enabledChange && enabledChange.currentValue) || (leagueIdsChange && leagueIdsChange.currentValue)) {
            this.loadPlayers();
        } else {
            this.players = [];
            this.ready = false;
        }
    }

    private loadPlayers() {
        if (this.leagueIds.length === 0) {
            return;
        }
        this.graphQLService.post(PlayerSelectComponent.GetPlayersQuery, {leagueIds: this.leagueIds, first: -1, sort: 'name ASC'}).then(
            data => {
                if (data.leagues) {
                    let leaguePlayers = [];
                    data.leagues.forEach((league) => leaguePlayers.push(...league.leaguePlayers));
                    this.players =
                        leaguePlayers.filter(lp => !this.excludePlayerIds[lp.player.id]) .map(lp => Player.fromJson(lp.player));
                }
                this.ready = true;
            });
    }

    onPlayerClicked(player: Player) {
        this.selectedPlayer = player;
        this.notifySelected();
    }

    private notifySelected() {
        this.playerSelected.emit(this.selectedPlayer);
    }

    handlePageClick(event) {
        if (!this.ready) {
            return;
        }

        let clickedComponent = event.target;
        let inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);
        if (!inside) {
            this.cancel();
        }
    }

    handleKeyboardEvent(event) {
        if (this.ready && event.keyCode === 27) {
            this.cancel();
        }
    }

    private cancel() {
        this.selectedPlayer = null;
        this.notifySelected();
    }

    private static readonly GetPlayersQuery = `query ($leagueIds: [ID], $first:Int, $sort: String) {
        leagues(ids: $leagueIds) {
            leaguePlayers(first: $first, sort: $sort) {
                player {
                    id
                    name
                    nickname
                    nationality
                    handedness
                    description
                }
            }
        }
    }`;
}