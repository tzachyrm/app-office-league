import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {AuthService} from './services/auth.service';
import {ImageService} from './services/image.service';
import {Router, NavigationStart} from '@angular/router';
import {PageTitleService} from './services/page-title.service';

@Component({
    selector: 'office-league',
    templateUrl: './app.component.html',
    styleUrls: ['app.component.less']
})
export class AppComponent {
    logoUrl: string;
    isPlayingGame: boolean;
    playerImage: string;
    private pageTitle: string;
    private topLevelPage: boolean;

    constructor(private auth: AuthService, private pageTitleService: PageTitleService, private location: Location, private router: Router) {
        this.logoUrl = ImageService.logoUrl();
        this.isPlayingGame = new RegExp('/games/.*/game-play').test(location.path());
        let user = auth.getUser();
        this.playerImage = !!user ? ImageService.forPlayer(user.playerName) : ImageService.playerDefault();

        this.pageTitleService.subscribeTitle(title => this.pageTitle = title).resetTitle();

        this.topLevelPage = this.isTopLevelPage(this.router.url);

        router.events
            .filter(event => event instanceof NavigationStart)
            .subscribe((event: NavigationStart) => {
                this.isPlayingGame = new RegExp('/games/.*/game-play').test(event.url);
                this.topLevelPage = this.isTopLevelPage(event.url);
                this.pageTitleService.resetTitle();
            });
    }

    private isTopLevelPage(url: string): boolean {
        return url.match(/\//g).length <= 1;
    }
}