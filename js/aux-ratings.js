console.log('Loaded module Auxionize-Rating')

/**
 * Created by Kristian Tachev
 */

angular.module('aux-ratings', []);
// angular.module('aux-ratings').directive('auxRating', function () {
// 	var count = 0;
// 	var template = '<span>\
// 				<span class="rate high" title="{{::$ctrl.rating|number:1}} of {{$ctrl.rates}} rates" ng-if="rates>0">\
// 				<i class="fa" ng-class="star.class" ng-repeat="star in $ctrl.stars" \ style="color: orange">&nbsp;</i>\
// 				<br ng-if="$ctrl.twoLines">\
// 				<span class="number"> {{::(currentRating|number:1)}}\
// 				<span  ng-if="::$ctrl.showRatesCount">({{::rates}})</span>\
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
// 		controllerAs: 'aux$ctrl',
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
angular.module('aux-ratings').component('rateButtonModal', {
	//restrict: 'EA',
	replace: true,
	template: '<button\
	class="btn btn-warning btn-xs"\
	ng-click="$ctrl.rate()" \
	ng-disabled="$ctrl.rated"\
	title="{{$ctrl.hoverText|translate}}"> \
	<i class="fa fa-star"></i>\
	{{$ctrl.hoverText|translate}}\
	</button>',
	bindings: {
		data: '<',
		reference: '<',     // reference to rate
		rateContext: '@',   // channel as a 'buyer' or as a 'seller'
		bid: '<',           // the current bid object
		hoverText: '@',     // button & hover text
		rated: '<',
		callback: '&'      // the function to call once the api call is succesfull
	},
	//controllerAs: 'rateButtonModalCtrl',
	controller: function ($scope, $uibModal, ApiService) {


		var self = this;
		//this.data = $scope.data;
		//this.reference = $scope.reference;
		this.channel = this.rateContext;
		this.bid = (this.bid) ? this.bid : {};
		//this.callback = $scope.callback;

		this.rate = function () {
			console.log('%c this.data: ', 'background: steelblue; color: white', this.data);
			console.log('%c this.reference: ', 'background: steelblue; color: white', this.reference);

			$uibModal.open({
				animation: true,
				template: '<div class="panel panel-default" style="margin-bottom:0;">\
						<div class="panel-heading text-center">\
						<h3 class="panel-title" ng-if="channel===\'winner\'" translate>Rate the winner for this auction</h3>\
						<h3 class="panel-title" ng-if="channel===\'seller\'" translate>Rate the bidder for this auction</h3>\
						<h3 class="panel-title" ng-if="channel===\'buyer\'" translate>Rate the buyer for this auction</h3>\
						</div>\
						<div class="panel-body text-center">\
						<rating-stars user="user" company="company" get-rate="setRate(value)" get-note="setNote(value)" max="5" ></rating-stars>\
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
						</div>',
				size: 'sm',
				//controllerAs: 'modalCtrl',
				controller: ['$scope', '$uibModalInstance', 'currentUser', 'ApiService',
					function ($scope, $uibModalInstance, currentUser, api) {

						$scope.data = self.data;
						$scope.rating = 0;
						$scope.note = '';
						$scope.defaultErrorMessage = 'Your rate cannot be 0!<br>Please correct it or cancel!';
						$scope.channel = self.channel;
						$scope.user = self.reference;
						$scope.company = self.reference;
						$scope.showError = false;

						$scope.setRate = function (value) {
							$scope.rating = value;
						};

						$scope.setNote = function (value) {
							$scope.note = value;
						};

						$scope.rate = function () {
							if ($scope.rating > 0) {
								$scope.showError = false;

								var fromReferenceId = null;
								var toReferenceId = null;

								if (self.channel == 'buyer') {
									fromReferenceId = self.data.reference.id;
									toReferenceId = self.data.buyerReference.id;
								} else {
									if (self.channel == 'winner') self.channel = 'buyer';
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

	}

});

angular.module('aux-ratings').component('ratingStars', {
	//restrict: 'EA',
	replace: true,
	template: '<div class="row text-center">\
		<h5><company-link company="$ctrl.company"></company-link></h5>\
		<h3 style="color:orange;">\
		<uib-rating ng-model="$ctrl.rate"\
		ng-change="$ctrl.getRate({value:$ctrl.rate})"\
		max="$ctrl.max"\
		readonly="$ctrl.isReadOnly"\
		style="outline: none; cursor: pointer;"\
		titles=""\
		on-hover="$ctrl.hoveringOver(value)" on-leave="$ctrl.overStar = $ctrl.rate"\
		rating-states="$ctrl.ratingStates" aria-labelledby="default-rating">\
		</uib-rating>\
		</h3>\
		<div>{{$ctrl.overStar}} / {{$ctrl.max}}</div>\
		<div style="padding: 10px 15px 0 15px;">\
		<textarea name="note" id="" rows="3" translated-placeholder="Note" class="form-control" ng-model="$ctrl.note" ng-change="$ctrl.getNote({value:$ctrl.note})"></textarea>\
		</div>\
		</div>',
	bindings: {
		user: '<',
		company: '<',
		rate: '<',
		note: '<',
		getRate: '&',
		getNote: '&',
		max: '<',
		isReadOnly: '<'
	},
	//controllerAs: 'ratingStarsCtrl',
	controller: ['ApiService', function (api) {
		var self = this;

		self.overStar = 0;
		if (!self.max) self.max = 10;

		self.hoveringOver = function (value) {
			self.overStar = value;
			self.percent = 100 * (value / self.max);
		};

		self.ratingStates = [];
		for (var i = 0; i < self.max; i++) {
			self.ratingStates.push({stateOn: 'fa fa-star', stateOff: 'fa fa-star-o'});
		}
	}]

});

angular.module('aux-ratings').component('addRating', {
	//restrict: 'EA',
	replace: true,
	template: '<form novalidate="novalidate" class="panel panel-ratings" accept-charset="utf-8" ng-show="$ctrl.isRatingsPanelVisible">\
	<div class="panel-heading clearfix">\
	<h4 class="panel-title pull-left">\
	<a href ng-click="$ctrl.toggleVisible()">\
	<span>\
	<i class="fa fa-plus-square" ng-show="!$ctrl.isVisible"></i>\
	<i class="fa fa-minus-square" ng-show="$ctrl.isVisible"></i>\
	</span>\
	<span class="ratings-title" translate>Ratings</span>\
	</a>\
	</h4>\
	<debug-tool object="data"></debug-tool>\
	</div>\
	<div class="panel-body" ng-show="$ctrl.isVisible" style="padding: 0;">\
	<div ng-if="$ctrl.isBuyer" class="references">\
	<table ng-if="$ctrl.winningSellers.length > 0" class="ratings-table">\
	<thead>\
	<tr>\
	<th colspan="2"><translate>Winners</translate></th>\
	</tr>\
	</thead>\
	<tbody>\
	<tr ng-repeat="winner in $ctrl.winningSellers | orderBy:\'id\'" class="winner">\
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
	data="$ctrl.data"\
	reference="winner"\
	hover-text="{{\'Rate winner\'|translate}}"\
	rate-context="winner"\
	callback="$ctrl.refresh(winner)">\
	</rate-button-modal>\
	<loading-icon ng-if="winner.isRefreshing"></loading-icon>\
	</td>\
	</tr>\
	</tbody>\
	</table>\
	<table ng-if="$ctrl.loosingSellers.length > 0" class="ratings-table">\
	<thead>\
	<tr>\
	<th colspan="2"><translate>Other Participants</translate></th>\
	</tr>\
	</thead>\
	<tbody>\
	<tr ng-repeat="loser in $ctrl.loosingSellers | orderBy:\'id\'">\
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
	data="$ctrl.data"\
	reference="loser"\
	hover-text="{{\'Rate seller\'|translate}}"\
	rate-context="seller"\
	callback="$ctrl.refresh(loser)">\
	</rate-button-modal>\
	<loading-icon ng-if="loser.isRefreshing"></loading-icon>\
	</td>\
	</tr>\
	</tbody>\
	</table>\
	</div>\
	<div ng-if="$ctrl.isWinningSeller" class="references">\
	<table class="ratings-table">\
	<thead>\
	<tr>\
	<th colspan="2" translate>Buyer</th>\
	</tr>\
	</thead>\
	<tbody>\
	<tr>\
	<td width="60%"><company-link company="$ctrl.buyerObject"></company-link></td>\
	<td width="40%">\
	<span ng-if="$ctrl.buyerObject.rating.length > 0">\
	<company-rating rates="1" current-rating="$ctrl.buyerObject.rating[0].rate" show-rates-count="false"></company-rating>\
	<div ng-if="$ctrl.buyerObject.rating[0].note" class="rating-note" role="alert">\
	<strong translate>Note</strong>:\
	<quote>{{$ctrl.buyerObject.rating[0].note}}</quote>\
	</div>\
	</span>\
	<rate-button-modal ng-if="$ctrl.buyerObject.rating.length == 0  && !$ctrl.buyerObject.isRefreshing"\
	data="$ctrl.data"\
	reference="$ctrl.buyerObject"\
	hover-text="{{\'Rate buyer\'|translate}}"\
	rate-context="buyer"\
	callback="$ctrl.refresh($ctrl.buyerObject)">\
	</rate-button-modal>\
	<i class="fa fa-spinner fa-pulse" ng-if="$ctrl.buyerObject.isRefreshing"></i>\
	</td>\
	</tr>\
	</tbody>\
	</table>\
	</div>\
	</div>\
	</form>',
	bindings: {
		data: '<' // the auction
	},
	//controllerAs: 'add$ctrl',
	controller: ['ApiService',
		function (api) {
			var self = this;

			//self.data = $scope.data;
			self.isRatingsPanelVisible = false;
			self.isVisible = true;
			self.winningSellers = [];
			self.loosingSellers = [];
			self.buyerObject = {};
			self.isBuyer = this.data.reference && this.data.reference.type == 'buyer';
			self.isWinningSeller = this.data.reference
				&& this.data.reference.type === 'seller'
				&& this.data.reference.AuctionReference.isWinner;

			var prepareDataForUI = function () {
				self.winningSellers = [];
				self.loosingSellers = [];
				self.buyerObject = {};

				if (self.isBuyer) {
					var winningIds = [];

					angular.forEach(self.data.winners, function (val) {
						winningIds.push(val.company.id);
					});

					angular.forEach(self.data.allReferences, function (val) {
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
				else if (self.isWinningSeller) {
					self.buyerObject.isRefreshing = false;
					if (self.data.buyerReference) {
						self.buyerObject = self.data.buyerReference.root.Company;
						self.buyerObject.rating = self.data.buyerReference.ToRatings;
					}
				}

				self.isRatingsPanelVisible = ((self.winningSellers.length > 0) || (self.loosingSellers.length > 0) || self.isWinningSeller);
			};

			prepareDataForUI();

			self.toggleVisible = function () {
				self.isVisible = !self.isVisible;
			};

			self.rate = function (channel, CompanyId, FromReferenceId, ToReferenceId, rate, note) {
				api.auction.rate(channel, CompanyId, FromReferenceId, ToReferenceId, rate, note)
					.then(function () {
						self.data.$reload()
							.then(function () {
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
					.then(function () {
						reference.isRefreshing = false;
						prepareDataForUI();
					});
			};
		}]
});

angular.module('aux-ratings').component('companyRating', {
	//restrict:       'EA',
	replace:        true,
	template:    '<span>\
	<span class="rate high" title="{{::$ctrl.rating|number:1}} of {{$ctrl.rates}} rates" ng-if="$ctrl.rates>0">\
	<i class="fa" ng-class="star.class" ng-repeat="star in $ctrl.stars" style="color: orange">&nbsp;</i>\
	<br ng-if="$ctrl.twoLines">\
	<span class="number"> {{$ctrl.currentRating|number:1}}\
	<span  ng-if="::$ctrl.showRatesCount">({{$ctrl.rates}})</span>\
	</span>\
	</span>\
	<span ng-if="$ctrl.rates==0">\
	<i class="fa fa-star-o" style="color: orange">&nbsp;</i><translate>No ratings</translate>\
	</span>\
	</span>',
	bindings: {
		rates:          '<', // Number of all rates.                         Required
		currentRating:  '<', // Current average rating based on all rates.   Required
		maxRating:      '<', // The rating scale.                            Default: 5
		showRatesCount: '<', // Prints the count of all rates.               Default: true
		twoLines:       '<',
		testCollection: '<'
		// Separates the ui in two lines.               Default: false
	},
	//controllerAs: '$ctrl',
	controller: ['$stateParams',
		function ($stateParams) {
			this.defaultMaxRating = 5;

			this.twoLines = this.twoLines || false;
			this.rating = this.currentRating;
			this.stars =  [];

			this.setStars = function () {
				this.maxRating = this.maxRating || this.defaultMaxRating;
				var fs = true;
				for (var i = 0; i < this.maxRating; i++) {
					var n = (i + 1) % this.rating;
					var c = 'fa-star-o';

					if (i < Math.floor(this.rating) || n > 0 && n <= 0.25) {
						c = 'fa-star';
					}
					else if (isFloat(n) && n > 0.25 && n <= 0.75 && fs) {
						c = 'fa-star-half-o';
						fs = false;
					}
					this.stars[i] = {
						class: c
					};
				}
			};

			this.setStars();

			this.$onChanges = function (changesObj) {
				var firstCheck = (changesObj.currentRating && changesObj.currentRating.currentValue) ? true : false;
				var secondCheck = (changesObj.rates && changesObj.rates.currentValue) ? true : false;
				if(firstCheck){
					this.rating = changesObj.currentRating.currentValue;
				}
				if(secondCheck){
					this.rates = changesObj.rates.currentValue;
				}
				if(firstCheck && secondCheck){
					this.setStars();
				}
			};

			function isFloat(n){
				return n === +n && n !== (n|0);
			}
		}
	]
});