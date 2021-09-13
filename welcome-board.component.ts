import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth/auth.service';
import { LinkRepositoriesService } from '../../repository/link-repositories/link-repositories.service';
import { RepositoryService } from '../../repository/repository.service';
import * as _ from "underscore";

@Component({
  selector: 'app-welcome-board',
  templateUrl: './welcome-board.component.html',
  styleUrls: ['./welcome-board.component.scss']
})
export class WelcomeBoardComponent implements OnInit {
  organizationOptions: { 'id': number, 'name': string }[];
  userName: string;
  addOrg: { 'icon': string, 'class': string, 'name': string }[] = [{ 'icon': '', 'class': 'em-btn-primary btn-lg text-center', 'name': 'Add Organisation' }];
  selectedItem: { 'id': number, 'name': string };
  routeInfo: ActivatedRouteSnapshot;

  constructor(private repositoryService: RepositoryService, public router: Router, public authService: AuthService, public linkRepositoriesService: LinkRepositoriesService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.routeInfo = this.activatedRoute.snapshot;
    let providerName = (this.routeInfo).queryParams.provider;
    this.getOrganizations(providerName);
    this.userName = this.authService.currentUser;
    this.navigateAuthenticatedUser();
    this.linkRepositoriesService.provider = providerName;

  }

  selectedOrganizations(event) {
    this.selectedItem = event;
  }

  onAddOrg(event) {
    let self = this;
    let seletedOrganisation = _.find(self.organizationOptions, function (o) {
      return o.id === self.selectedItem.id;
    });
    self.router.navigateByUrl(`/repositories/link?provider=${self.linkRepositoriesService.provider}&accountType=${seletedOrganisation.account_type}&login=${seletedOrganisation.name}`);
  }

  navigateAuthenticatedUser() {
    this.repositoryService.getRepositoryCount().subscribe(countResult => {
      let repositoryCount = parseInt(countResult.count);
      if (repositoryCount > 0) { // if repositories are not present then ask user to link repositories
        this.router.navigateByUrl(`/repositories`);
      }
    });
  }

  getOrganizations(provider: string) {
    this.linkRepositoriesService.getProviderOrganizations(provider).subscribe(organizationsData => {
      if (organizationsData.organizationList.length) {
        console.log(organizationsData.organizationList);
        this.organizationOptions = organizationsData.organizationList.map(organisation => ({ id: organisation.databaseId, name: organisation.login, databaseId: organisation.databaseId, account_type: organisation.account_type }));
        this.selectedItem = this.organizationOptions[0];
      }
    });
  }
}
