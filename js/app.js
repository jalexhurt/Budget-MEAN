var app = angular.module("Budget", []);

var basic_dialog = {
  modal: true,
  resizable: false,
  draggable: false
};

app.controller("HomePageController", [
  "$http",
  "$location",
  "$window",
  function($http, $location, $window) {
    //need to load from db
    var s = this;
    this.stat_transactions = [];
    this.reload_data = function() {
      $http.post("/get-transactions").then(function(res) {
        s.transactions = res.data;
        s.first_id = res.data[0].id;
        for (var i = 0; i < s.transactions.length; i++) {
          s.transactions[i].date = s.transactions[i].date.substring(0, 10);
          s.transactions[i].amount = s.transactions[i].amount.toFixed(2);
          delete s.transactions[i].id;
        }

        s.load_stats();
      });
    };

    this.load_stats = function() {
      var total = 0;
      var h = -1;
      var unsignedTotal = 0;
      for (var i = 0; i < s.transactions.length; i++) {
        var a = parseFloat(s.transactions[i].amount);
        unsignedTotal += Math.abs(a);
        total += s.transactions[i].type.toUpperCase() == "CREDIT" ? a : -1 * a;
        h = a > h ? a : h;
      }
      s.balance = total;
      s.high = h;
      s.average = unsignedTotal / s.transactions.length;

      if (s.transactions.length == 0) {
        s.balance = s.high = s.average = 0;
      }
    };
    this.reload_data();
    this.toValidDate = function(d) {
      return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    };
    this.addTransaction = function() {
      var data = {
        data: [s.toValidDate(s.date), s.description, s.amount, s.type]
      };
      $http.post("/add", data).then(
        function(res) {
          $("#add-transaction").dialog("close");
          $("<div>Success!</div>").dialog({
            modal: true,
            resizable: false,
            draggable: false,
            title: "The transaction was successfully inserted"
          });
          s.reload_data();
        },
        function(err) {
          $("#add-transaction").dialog("close");
          $("<div>Failure!</div>").dialog({
            modal: true,
            resizable: false,
            draggable: false,
            title: "The transaction failed to be added"
          });
        }
      );
    };

    this.deleteTransaction = function() {
      var i = parseInt(this.transDelete);
      var removed = this.transactions.splice(i, 1);
      this.load_stats();
      $http.post("/delete-transaction", removed).then(
        function(res) {
          $("#delete-transaction").dialog("close");
          $("<div>Success!</div>").dialog({
            modal: true,
            resizable: false,
            draggable: false,
            title: "The transaction was successfully deleted"
          });
          s.reload_data();
        },
        function(err) {
          $("#delete-transaction").dialog("close");
          $("<div>Failure!</div>").dialog({
            modal: true,
            resizable: false,
            draggable: false,
            title: "The transaction failed to be added"
          });
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

    this.showDeleteTransaction = function() {
      $("#delete-transaction").dialog({
        modal: true,
        resizable: false,
        draggable: false,
        title: "Delete Transaction"
      });
    };

    this.editTransaction = function(i) {
      // console.log(i)
      $window.location = "/edit-transaction?id=" + (this.first_id + i - 1);
    };

    this.show_graph = function() {
      var a = [];

      this.transactions.forEach(function(t) {
        a.push(t.amount);
      });
      create_graph(a, "test-id");
    };

    this.submitVisualize = function() {
      this.reload_data();
      var today = new Date();
      var days = 0;
      var num = parseInt(this.num);
      if (this.length == "months") {
        days = num * 30;
      } else if (this.length == "weeks") {
        days = num * 7;
      } else {
        days = num;
      }

      var newDay = new Date();
      while (
        Math.ceil(
          Math.abs(today.getTime() - newDay.getTime()) / (1000 * 3600 * 24)
        ) < days
      ) {
        newDay.setDate(newDay.getDate() - 1);
      }

      var data = [];
      for (var i = 0; i < this.transactions.length; i++) {
        var temp_date = this.transactions[i].date + "";
        var year = parseInt(temp_date.substring(0, 4));
        var month = parseInt(temp_date.substring(5, 7));
        var day = parseInt(temp_date.substring(8));
        var new_date = year + "-" + month + "-" + day;
        var d = Date.parse(new_date);
        if (d >= newDay && d <= today) {
          data.push(parseFloat(this.transactions[i].amount));
        }
      }

      if (data.length > 0) {
        var settings = basic_dialog;
        settings.width = "90%";
        settings.title = "Transaction Statistics";
        settings.position = { my: "center", at: "center top" };
        $("#chart-popup").dialog(basic_dialog);
        this.stat_transactions = data;
        this.getStatistics();
        create_graph(data, "chart");
      } else {
        $("<div>No transactions occurred in the time specified</div>").dialog({
          modal: true,
          draggable: false,
          title: "Not Found",
          resizable: false
        });
      }
    };
    this.stats = [];
    this.getStatistics = function() {
      this.stats = [];
      var amts = this.stat_transactions;

      // average
      var total = 0.0;
      amts.forEach(function(a) {
        total += a;
      });
      this.stats.push({title: "Number", value: amts.length })
      
      var min = amts[0];
      var max = amts[0];
      amts.forEach(function(a) {
        if(a < min) {
          min = a;
        }

        if(a > max) {
          max = a;
        }
      })
      this.stats.push({title: "Minimum", value: min.toFixed(2)})
      this.stats.push({title: "Maximum", value: max.toFixed(2)})
      var avg = total / amts.length;
      this.stats.push({ title: "Average", value: avg.toFixed(2) });

      //median
      amts.sort();
      var median = null;
      if (amts.length % 2 == 0) {
        var half = amts.length / 2;
        median = (amts[half] + amts[half - 1]) / 2;
      } else {
        var half = Math.floor(amts.length / 2);
        median = amts[half];
      }
      this.stats.push({ title: "Median", value: median.toFixed(2) });

      //stddev
      var sum = 0;
      amts.forEach(function(a) {
        sum += Math.pow(a - avg, 2)
      })
      var stddev = Math.sqrt(sum / (amts.length -1))
      this.stats.push({title : "Standard Deviation", value: stddev.toFixed(2)})


    };

    this.submitVisualizeTwoDates = function() {
      var date1 = this.date1;
      var date2 = this.date2;
      this.reload_data();
      var data = [];
      for (var i = 0; i < this.transactions.length; i++) {
        var temp_date = this.transactions[i].date + "";
        var year = parseInt(temp_date.substring(0, 4));
        var month = parseInt(temp_date.substring(5, 7));
        var day = parseInt(temp_date.substring(8));
        var new_date = year + "-" + month + "-" + day;
        var d = Date.parse(new_date);
        if (d >= date1 && d <= date2) {
          data.push(parseFloat(this.transactions[i].amount));
        }
      }

      if (data.length > 0) {
        var settings = basic_dialog;
        settings.width = "90%";
        settings.title = "Transaction Statistics";
        settings.position = { my: "center", at: "center top" };
        $("#chart-popup").dialog(basic_dialog);
        this.stat_transactions = data;
        this.getStatistics();
        create_graph(data, "chart");
      } else {
        $("<div>No transactions occurred in the time specified</div>").dialog({
          modal: true,
          draggable: false,
          title: "Not Found",
          resizable: false
        });
      }
    };
  }
]);

app.directive("addTransaction", function() {
  return {
    templateUrl: "html/add-transaction-form.html"
  };
});

app.directive("transactionTable", function() {
  return {
    templateUrl: "html/transaction_table.html"
  };
});

app.directive("deleteTransaction", function() {
  return {
    templateUrl: "html/delete-transaction-form.html"
  };
});

app.controller("createAccountController", [
  "$http",
  function($http) {
    this.submitForm = function() {
      var username = this.username;
      var password = this.password;
      var confirm = this.confirm;

      $("#create-account").dialog("close");

      if (!username || !password || !confirm || password != confirm) {
        $("<div>Invalid Form!</div>").dialog(basic_dialog);
      } else {
        $http
          .post("/createaccount", { username: username, password: password })
          .then(
            function(res) {
              $("<div>Success!<br>The account was created</div>").dialog(
                basic_dialog
              );
            },
            function(err) {
              $("<div>Error! An error occurred</div>").dialog(basic_dialog);
            }
          );
      }
    };
  }
]);

/**********************************************************************************
 * GENERAL PURPOSE
 */

function showDialog(id) {
  $("#" + id).dialog(basic_dialog);
}
