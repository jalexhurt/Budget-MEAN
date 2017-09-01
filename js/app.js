var app = angular.module("Budget", []);

app.controller("HomePageController", function() {
    this.transactions = [
        [1,2,3],
        [4,5,6]
    ]
    this.balance = 50
})

app.directive("addTransaction", function() {
    return {    
        templateUrl: "html/add-transaction-form.html"
    };
})