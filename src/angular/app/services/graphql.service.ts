import {Injectable} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Observable} from 'rxjs';
import {Team} from '../../graphql/schemas/Team';
import {Game} from '../../graphql/schemas/Game';
import {League} from '../../graphql/schemas/League';
import {Player} from '../../graphql/schemas/Player';
import {CryptoService} from './crypto.service';
import {XPCONFIG} from '../app.config';

@Injectable()
export class GraphQLService {

    private url = XPCONFIG.graphQlUrl;
    game: Game;
    team: Team;
    league: League;
    player: Player;

    constructor(private http: Http, private cryptoService: CryptoService) {
    }

    post(query: string, variables?: {[key: string]: any}): Promise<any> {
        var body = JSON.stringify({query: query, variables: variables});
        var hash = this.cryptoService.sha1(body);
        return this.http.post(this.url + '?etag=' + hash, body)
            .map(this.extractData)
            .catch(this.handleError)
            .toPromise();
    }

    private extractData(res: Response) {
        let json = res.json();
        return json.data || {};
    }

    private handleError(error: Response | any) {
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }

}