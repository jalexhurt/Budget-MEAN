var app = angular.module("Budget", []);

app.controller("HomePageController", ['$http', function($http) {
    //need to load from db
    this.transactions = [];
    for(var i =0; i < 100; i ++) {
        this.transactions.push([i,i+1, i+2]);
        i = i+2;
    }
        
    this.balance = 50;
    this.average = 10;
    this.high = 100;

    this.addTransaction = function() {
        $http.post("/add", this).then(function(res) {
            alert("Success");
        }, function(err) {
            alert(err);
        })
    }
    this.showAddTransaction = function() {
        $("#add-transaction").dialog({
            modal:true,
            resizable: false,
            draggable: false,
            title: "Add Transaction"
        });
    }
}])

app.directive("addTransaction", function() {
    return {    
        templateUrl: "html/add-transaction-form.html"
    };
})