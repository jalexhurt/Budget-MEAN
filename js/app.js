var app = angular.module("Budget", []);

app.controller("HomePageController", [
  "$http",
  function($http) {
    //need to load from db
    var s = this;
    $http.post("/get-transactions").then(function(res) {
      s.transactions = res.data;
      for (var i = 0; i < s.transactions.length; i++) {
        s.transactions[i].date = s.transactions[i].date.substring(0, 10);
      }

      var total = 0;
      var h = -1;
      var unsignedTotal = 0;
      for (var i = 0; i < s.transactions.length; i++) {
        var a = parseFloat(s.transactions[i].amount);
        unsignedTotal += Math.abs(a);
        total += s.transactions[i].type == "CREDIT" >= 0 ? a : -1 * a;
        h = a > h ? a : h;
      }
      s.balance = total;
      s.high = h;
      s.average = unsignedTotal / s.transactions.length;
    });

    this.addTransaction = function() {
      $http.post("/add", this).then(
        function(res) {
          alert("Success");
        },
        function(err) {
          alert(err);
        }
      );
    };
    this.showAddTransaction = function() {
      $("#add-transaction").dialog({
        modal: true,
        resizable: false,
        draggable: false,
        title: "Add Transaction"
      });
    };
  }
]);

app.directive("addTransaction", function() {
  return {
    templateUrl: "html/add-transaction-form.html"
  };
});
