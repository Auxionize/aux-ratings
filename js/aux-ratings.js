console.log('Loaded module Auxionize-Rating')

/**
 * Created by Kristian Tachev
 */

angular.module('aux-ratings', []);
// angular.module('aux-ratings').directive('auxRating', function () {
// 	var count = 0;
// 	var template = '<span>\
// 				<span class="rate high" title="{{::ratingCtrl.rating|number:1}} of {{ratingCtrl.rates}} rates" ng-if="rates>0">\
// 				<i class="fa" ng-class="star.class" ng-repeat="star in ratingCtrl.stars" \ style="color: orange">&nbsp;</i>\
// 				<br ng-if="ratingCtrl.twoLines">\
// 				<span class="number"> {{::(currentRating|number:1)}}\
// 				<span  ng-if="::ratingCtrl.showRatesCount">({{::rates}})</span>\
// 				</span>\
// 				</span>\
// 				<span ng-if="::(rates==0)">\
// 				<i class="fa fa-star-o" style="color: orange">&nbsp;</i><translate>No ratings</translate>\
// 				</span>';
//
// 	return {
// 		restrict:       'EA',
// 		replace:        true,
// 		template:    template,
// 		scope: {
// 			rates:          '<', // Number of all rates.                         Required
// 			currentRating:  '<', // Current average rating based on all rates.   Required
// 			maxRating:      '<', // The rating scale.                            Default: 5
// 			showRatesCount: '<', // Prints the count of all rates.               Default: true
// 			twoLines:       '<'  // Separates the ui in two lines.               Default: false
// 		},
// 		controllerAs: 'auxRatingCtrl',
// 		controller: ['$scope', '$stateParams',
// 			function ($scope, $stateParams) {
//
// 				console.log('Inside controller');
//
// 				var self = this;
// 				count++;
// 				var defaultMaxRating = 5;
// 				this.showRatesCount =    ($scope.showRatesCount !== undefined) ? $scope.showRatesCount : true;
// 				this.twoLines =     $scope.twoLines || false;
//
// 				this.rates =        $scope.rates;
// 				this.rating =       $scope.currentRating;
// 				this.maxRating =    $scope.maxRating || defaultMaxRating;
// 				this.stars =        [];
//
// 				this.setStars = function (rating, maxRating) {
// 					self.stars = [];
// 					var fs = true;
// 					for(var i=0; i<maxRating; i++) {
// 						var n = (i+1)%rating;
// 						var c = 'fa-star-o';
//
// 						if(i < Math.floor(rating)) { c = 'fa-star'; }
// 						else if (isFloat(n) && n<1 && fs) { c = 'fa-star-half-o'; fs = false; }
//
// 						self.stars[i] = {
// 							class: c
// 						};
// 					}
// 				};
// 				this.setStars($scope.currentRating, this.maxRating);
//
// 				$scope.$watch('currentRating', function () {
// 					self.setStars($scope.currentRating, self.maxRating);
// 				});
//
// 				function isFloat(n){
// 					return n === +n && n !== (n|0);
// 				}
// 			}
// 		]
// 	};
// });
angular.module('aux-ratings').directive('rateButtonModal', function () {
	var template = '<button\
	class="btn btn-warning btn-xs"\
	ng-click="rate()" \
	ng-disabled="rated"\
	title="{{hoverText|translate}}"> \
	<i class="fa fa-star"></i>\
	{{hoverText|translate}}\
	</button>';

	return {
		restrict: 'EA',
		replace: true,
		template: template,
		scope: {
			data: '<',
			reference: '<',     // reference to rate
			rateContext: '@',   // channel as a 'buyer' or as a 'seller'
			bid: '<',           // the current bid object
			hoverText: '@',     // button & hover text
			rated: '<',
			callback: '&',      // the function to call once the api call is succesfull
		},
		controllerAs: 'rateButtonModalCtrl',
		controller: ['$scope', '$uibModal', 'ApiService', function ($scope, $uibModal, api) {

			var self = this;
			this.data = $scope.data;
			this.reference = $scope.reference;
			this.channel = $scope.rateContext;
			this.bid = ($scope.bid) ? $scope.bid : {};
			this.callback = $scope.callback;

			$scope.rate = function () {
				console.log('%c $scope.data: ', 'background: steelblue; color: white', $scope.data);
				console.log('%c $scope.reference: ', 'background: steelblue; color: white', $scope.reference);
				var template = '<div class="panel panel-default" style="margin-bottom:0;">\
						<div class="panel-heading text-center">\
						<h3 class="panel-title" ng-if="channel===\'winner\'" translate>Rate the winner for this auction</h3>\
						<h3 class="panel-title" ng-if="channel===\'seller\'" translate>Rate the bidder for this auction</h3>\
						<h3 class="panel-title" ng-if="channel===\'buyer\'" translate>Rate the buyer for this auction</h3>\
						</div>\
						<div class="panel-body text-center">\
						<rating-stars user="user" company="company" rate="rating" max="5" note="note"></rating-stars>\
						<div class="alert alert-danger animate-if" role="alert" style="margin: 10px 0px 0px 0px;" ng-if="showError && rating==0" bind-html-compile="defaultErrorMessage|translate\"></div>\
						</div>\
						<div class="panel-footer text-center">\
						<button class="btn btn-default" ng-click="close()">\
						<i class="fa fa-times">&nbsp;</i>\
						<translate>Cancel</translate>\
						</button><button class="btn btn-success" ng-click="rate()">\
						<i class="fa fa-star">&nbsp;</i>\
						<translate>Rate</translate>\
						</button>\
						</div>\
						</div>';

				$uibModal.open({
					animation: true,
					template: template,
					size: 'sm',
					controllerAs: 'modalCtrl',
					controller: ['$scope', '$uibModalInstance', 'currentUser', 'ApiService',
						function ($scope, $uibModalInstance, currentUser, api) {

							$scope.data = self.data;
							$scope.rating = 2;
							$scope.note = '';
							$scope.defaultErrorMessage = 'Your rate cannot be 0!<br>Please correct it or cancel!';
							$scope.channel = self.channel;
							$scope.user = self.reference;
							$scope.rating = 0;
							$scope.company = self.reference;
							$scope.showError = false;

							$scope.rate = function () {

								if($scope.rating > 0) {
									$scope.showError = false;

									var fromReferenceId = null;
									var toReferenceId = null;

									if(self.channel == 'buyer') {
										fromReferenceId = self.data.reference.id;
										toReferenceId = self.data.buyerReference.id;
									} else {
										if(self.channel == 'winner') self.channel = 'buyer';
										fromReferenceId = self.data.buyerReference.id;
										toReferenceId = self.reference.toReferenceId;
									}

									api.auction.rate(
										self.channel, self.reference.id,
										fromReferenceId, toReferenceId,
										$scope.rating, $scope.note)
										.then(function (success) {
											console.log('Rate ' + self.channel + ' successful');
											self.callback();
											$uibModalInstance.close();
										}, function (err) {
											console.log('Error: ', err);
										})
									;
								} else {
									$scope.showError = true;
								}
							};

							$scope.close = function () {
								$uibModalInstance.close();
							}
						}
					]
				});
			}

		}]
	}
})

angular.module('aux-ratings').directive('ratingStars', function () {
	// ["{{::(\"One\"|translate)}}\",\"{{::(\"Two\"|translate)}}\",\"{{::(\"Three\"|translate)}}\",\"{{::(\"Four\"|translate)}}\",\"{{::(\"Five\"|translate)}}"]
	var template = '<div class="row text-center">\
		<h5><company-link company="company"></company-link></h5>\
		<h3 style="color:orange;">\
		<uib-rating ng-model="rate"\
		max="max"\
		readonly="isReadOnly"\
		style="outline: none; cursor: pointer;"\
		titles=""\
		on-hover="hoveringOver(value)" on-leave="overStar = rate"\
		rating-states="ratingStates" aria-labelledby="default-rating">\
		</uib-rating>\
		</h3>\
		<div>{{overStar}} / {{max}}</div>\
		<div style="padding: 10px 15px 0 15px;">\
		<textarea name="note" id="" rows="3" translated-placeholder="Note" class="form-control" ng-model="note"></textarea>\
		</div>\
		</div>';

	return {
		restrict: 'EA',
		replace: true,
		template: template,
		scope: {
			user: '<',
			company: '<',
			rate: '=',
			note: '=',
			max: '<',
			isReadOnly: '<'
		},
		controllerAs: 'ratingStarsCtrl',
		controller: ['$scope', 'ApiService', function ($scope, api) {
			var self = this;

			$scope.overStar = 0;
			if(!$scope.max) $scope.max = 10;

			$scope.hoveringOver = function(value) {
				$scope.overStar = value;
				$scope.percent = 100 * (value / $scope.max);
			};

			$scope.ratingStates = [];
			for(var i=0; i<$scope.max; i++) {
				$scope.ratingStates.push({stateOn: 'fa fa-star', stateOff: 'fa fa-star-o'});
			}
		}]
	};
});

angular.module('aux-ratings').directive('addRating', function () {
	var template = '<form novalidate="novalidate" class="panel panel-ratings" accept-charset="utf-8" ng-show="addRatingCtrl.isRatingsPanelVisible">\
	<div class="panel-heading clearfix">\
	<h4 class="panel-title pull-left">\
	<a href ng-click="addRatingCtrl.toggleVisible()">\
	<span>\
	<i class="fa fa-plus-square" ng-show="!addRatingCtrl.isVisible"></i>\
	<i class="fa fa-minus-square" ng-show="addRatingCtrl.isVisible"></i>\
	</span>\
	<span class="ratings-title" translate>Ratings</span>\
	</a>\
	</h4>\
	<debug-tool object="data"></debug-tool>\
	</div>\
	<div class="panel-body" ng-show="addRatingCtrl.isVisible" style="padding: 0;">\
	<div ng-if="addRatingCtrl.isBuyer" class="references">\
	<table ng-if="addRatingCtrl.winningSellers.length > 0" class="ratings-table">\
	<thead>\
	<tr>\
	<th colspan="2"><translate>Winners</translate></th>\
	</tr>\
	</thead>\
	<tbody>\
	<tr ng-repeat="winner in addRatingCtrl.winningSellers | orderBy:\'id\'" class="winner">\
	<td width="60%">\
	<span class="fa-stack aux-icon text-won ng-scope">\
	<i class="fa fa-circle fa-stack-2x"></i>\
	<i class="fa fa-stack-1x fa-inverse fa-trophy"></i>\
	</span>\
	<company-link company="winner"></company-link>\
	</td>\
	<td width="40%" class="rate-n-note">\
	<span ng-if="winner.rating.length > 0">\
	<company-rating rates="1" current-rating="winner.rating[0].rate" show-rates-count="false"></company-rating>\
	<div class="rating-note" role="alert" ng-if="winner.rating[0].note.length>0">\
	<strong translate>Note</strong>:\
	<quote>{{winner.rating[0].note}}</quote>\
	</div>\
	</span>\
	<rate-button-modal ng-if="winner.rating.length == 0 && !winner.isRefreshing"\
	data="addRatingCtrl.data"\
	reference="winner"\
	hover-text="{{\'Rate winner\'|translate}}"\
	rate-context="winner"\
	callback="addRatingCtrl.refresh(winner)">\
	</rate-button-modal>\
	<loading-icon ng-if="winner.isRefreshing"></loading-icon>\
	</td>\
	</tr>\
	</tbody>\
	</table>\
	<table ng-if="addRatingCtrl.loosingSellers.length > 0" class="ratings-table">\
	<thead>\
	<tr>\
	<th colspan="2"><translate>Other Participants</translate></th>\
	</tr>\
	</thead>\
	<tbody>\
	<tr ng-repeat="loser in addRatingCtrl.loosingSellers | orderBy:\'id\'">\
	<td width="60%">\
	<company-link company="loser"></company-link>\
	</td>\
	<td width="40%">\
	<span ng-if="loser.rating.length > 0">\
	<company-rating rates="1" current-rating="loser.rating[0].rate" show-rates-count="false"></company-rating>\
	<div class="rating-note" role="alert" ng-if="loser.rating[0].note.length>0">\
	<strong translate>Note</strong>:\
	<quote>{{loser.rating[0].note}}</quote>\
	</div>\
	</span>\
	<rate-button-modal ng-if="loser.rating.length == 0  && !loser.isRefreshing"\
	data="addRatingCtrl.data"\
	reference="loser"\
	hover-text="{{\'Rate seller\'|translate}}"\
	rate-context="seller"\
	callback="addRatingCtrl.refresh(loser)">\
	</rate-button-modal>\
	<loading-icon ng-if="loser.isRefreshing"></loading-icon>\
	</td>\
	</tr>\
	</tbody>\
	</table>\
	</div>\
	<div ng-if="addRatingCtrl.isWinningSeller" class="references">\
	<table class="ratings-table">\
	<thead>\
	<tr>\
	<th colspan="2" translate>Buyer</th>\
	</tr>\
	</thead>\
	<tbody>\
	<tr>\
	<td width="60%"><company-link company="addRatingCtrl.buyerObject"></company-link></td>\
	<td width="40%">\
	<span ng-if="addRatingCtrl.buyerObject.rating.length > 0">\
	<company-rating rates="1" current-rating="addRatingCtrl.buyerObject.rating[0].rate" show-rates-count="false"></company-rating>\
	<div class="rating-note" role="alert">\
	<strong translate>Note</strong>:\
	<quote>{{addRatingCtrl.buyerObject.rating[0].note}}</quote>\
	</div>\
	</span>\
	<rate-button-modal ng-if="addRatingCtrl.buyerObject.rating.length == 0  && !addRatingCtrl.buyerObject.isRefreshing"\
	data="addRatingCtrl.data"\
	reference="addRatingCtrl.buyerObject"\
	hover-text="{{\'Rate buyer\'|translate}}"\
	rate-context="buyer"\
	callback="addRatingCtrl.refresh(addRatingCtrl.buyerObject)">\
	</rate-button-modal>\
	<i class="fa fa-spinner fa-pulse" ng-if="addRatingCtrl.buyerObject.isRefreshing"></i>\
	</td>\
	</tr>\
	</tbody>\
	</table>\
	</div>\
	</div>\
	</form>';

	return {
		restrict: 'EA',
		replace: true,
		template: template,
		scope: {
			data: '<' // the auction
		},
		controllerAs: 'addRatingCtrl',
		controller: ['$scope', 'ApiService',
			function ($scope, api) {
				var self = this;

				self.data = $scope.data;
				self.isRatingsPanelVisible = false;
				self.isVisible = true;
				self.winningSellers = [];
				self.loosingSellers = [];
				self.buyerObject = {};
				self.isBuyer = $scope.data.reference && $scope.data.reference.type=='buyer';
				self.isWinningSeller = $scope.data.reference
					&& $scope.data.reference.type === 'seller'
					&& $scope.data.reference.AuctionReference.isWinner;

				var prepareDataForUI = function() {
					self.winningSellers = [];
					self.loosingSellers = [];
					self.buyerObject = {};

					if(self.isBuyer) {
						var winningIds = [];

						angular.forEach($scope.data.winners, function(val) {
							winningIds.push(val.company.id);
						});

						angular.forEach($scope.data.allReferences, function(val) {
							var destination = winningIds.indexOf(val.root.Company.id) > -1
								? 'winningSellers'
								: 'loosingSellers';
							var currentCompany = angular.copy(val.root.Company);
							currentCompany.rating = val.ToRatings;
							currentCompany.isRefreshing = false;
							currentCompany.toReferenceId = val.id;
							self[destination].push(currentCompany);
						});
					}
					else if(self.isWinningSeller) {
						self.buyerObject.isRefreshing = false;
						if($scope.data.buyerReference) {
							self.buyerObject = $scope.data.buyerReference.root.Company;
							self.buyerObject.rating = $scope.data.buyerReference.ToRatings;
						}
					}

					self.isRatingsPanelVisible = ((self.winningSellers.length > 0) || (self.loosingSellers.length > 0) || self.isWinningSeller);
				};

				prepareDataForUI();

				self.toggleVisible = function() {
					self.isVisible = !self.isVisible;
				};

				self.rate = function(channel, CompanyId, FromReferenceId, ToReferenceId, rate, note) {
					api.auction.rate(channel, CompanyId, FromReferenceId, ToReferenceId, rate, note)
						.then(function () {
							self.data.$reload()
								.then(function() {
									prepareDataForUI();
								});
						}, function (err) {
							console.log('Err: ', err);
						});
				};

				self.refresh = function (reference) {
					console.log('%c Callback REFRESH: ', 'background: steelblue; color: white');
					reference.isRefreshing = true;
					self.data.$reload()
						.then(function() {
							reference.isRefreshing = false;
							prepareDataForUI();
						});
				};
			}]
	};
});

angular.module('aux-ratings').directive('companyRating', function () {
	var template = '<span>\
	<span class="rate high" title="{{::ratingCtrl.rating|number:1}} of {{ratingCtrl.rates}} rates" ng-if="rates>0">\
	<i class="fa" ng-class="star.class" ng-repeat="star in ratingCtrl.stars" style="color: orange">&nbsp;</i>\
	<br ng-if="ratingCtrl.twoLines">\
	<span class="number"> {{::(currentRating|number:1)}}\
	<span  ng-if="::ratingCtrl.showRatesCount">({{::rates}})</span>\
	</span>\
	</span>\
	<span ng-if="::(rates==0)">\
	<i class="fa fa-star-o" style="color: orange">&nbsp;</i><translate>No ratings</translate>\
	</span>\
	</span>';
	
	return {
		restrict:       'EA',
		replace:        true,
		template:    template,
		scope: {
			rates:          '<', // Number of all rates.                         Required
			currentRating:  '<', // Current average rating based on all rates.   Required
			maxRating:      '<', // The rating scale.                            Default: 5
			showRatesCount: '<', // Prints the count of all rates.               Default: true
			twoLines:       '<'  // Separates the ui in two lines.               Default: false
		},
		controllerAs: 'ratingCtrl',
		controller: ['$scope', '$stateParams',
			function ($scope, $stateParams) {
				var self = this;

				var defaultMaxRating = 5;

				this.showRatesCount =    ($scope.showRatesCount !== undefined) ? $scope.showRatesCount : true;
				this.twoLines =     $scope.twoLines || false;

				this.rates =        $scope.rates;
				this.rating =       $scope.currentRating;
				this.maxRating =    $scope.maxRating || defaultMaxRating;
				this.stars =        [];

				this.setStars = function (rating, maxRating) {
					self.stars = [];
					var fs = true;
					for(var i=0; i<maxRating; i++) {
						var n = (i+1)%rating;
						var c = 'fa-star-o';

						if(i < Math.floor(rating)) { c = 'fa-star'; }
						else if (isFloat(n) && n<1 && fs) { c = 'fa-star-half-o'; fs = false; }

						self.stars[i] = {
							class: c
						};
					}
				};
				this.setStars($scope.currentRating, this.maxRating);

				$scope.$watch('currentRating', function () {
					self.setStars($scope.currentRating, self.maxRating);
				});

				function isFloat(n){
					return n === +n && n !== (n|0);
				}
			}
		]
	};
});