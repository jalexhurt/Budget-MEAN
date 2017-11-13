var app = angular.module("Budget", []);

app.controller("HomePageController", [
    "$http", "$location", "$window",
    function ($http, $location, $window) {
        //need to load from db
        var s = this;

        this.reload_data = function () {
            $http.post("/get-transactions").then(function (res) {
                s.transactions = res.data;
                s.first_id = res.data[0].id;
                for (var i = 0; i < s.transactions.length; i++) {
                    s.transactions[i].date = s.transactions[i].date.substring(0, 10);
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
                total += s.transactions[i].type == "CREDIT" ? a : -1 * a;
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
        this.toValidDate = function (d) {
            return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
        };
        this.addTransaction = function () {
            console.log(s.date);
            var data = {
                data: [s.toValidDate(s.date), s.description, s.amount, s.type]
            };
            $http.post("/add", data).then(
                function (res) {
                    $("#add-transaction").dialog("close");
                    $("<div>Success!</div>").dialog({
                        modal: true,
                        resizable: false,
                        draggable: false,
                        title: "The transaction was successfully inserted"
                    });
                    s.reload_data();
                },
                function (err) {
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

        this.deleteTransaction = function () {
            var i = parseInt(this.transDelete);
            var removed = this.transactions.splice(i, 1);
            this.load_stats();
            $http.post("/delete-transaction", removed).then(function (res) {
                $("#delete-transaction").dialog("close");
                $("<div>Success!</div>").dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    title: "The transaction was successfully deleted"
                });
                s.reload_data();
            }, function (err) {
                $("#delete-transaction").dialog("close");
                $("<div>Failure!</div>").dialog({
                    modal: true,
                    resizable: false,
                    draggable: false,
                    title: "The transaction failed to be added"
                });
            })
        };

        this.showAddTransaction = function () {
            $("#add-transaction").dialog({
                modal: true,
                resizable: false,
                draggable: false,
                title: "Add Transaction"
            });
        };

        this.showDeleteTransaction = function () {
            $("#delete-transaction").dialog({
                modal: true,
                resizable: false,
                draggable: false,
                title: "Delete Transaction"
            });
        };

        this.editTransaction = function (i) {
            // console.log(i)
            $window.location = $location.protocol() + "://" + $location.host() + "/edit-transaction?id=" + (this.first_id + i - 1);
        };

        this.show_graph = function() {
            var a = [];

            this.transactions.forEach(function(t) {
                a.push(t.amount);
            });
            create_graph(a, "test-id");
        }
    }


]);

app.directive("addTransaction", function () {
    return {
        templateUrl: "html/add-transaction-form.html"
    };
});

app.directive("transactionTable", function () {
    return {
        templateUrl: "html/transaction_table.html"
    };
});

app.directive("deleteTransaction", function () {
    return {
        templateUrl: "html/delete-transaction-form.html"
    };
});

app.controller("createAccountController", function () {
    this.submitForm = function () {
        alert("Submit! Needs Work")
    }
})

/**********************************************************************************
 * GENERAL PURPOSE
 */

function showDialog(id) {
    $('#' + id).dialog({
        modal: true,
        resizable: false,
        draggable: false,
    })
}